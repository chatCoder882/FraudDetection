"""The agent's hands: one Python wrapper per installed GSQL query.

Every call is recorded in a QueryLog and every result carries the exact
invocation string that produced it. That string becomes the `ref` on an evidence
item in the answer file, so an analyst reading a case can re-run any single line
of it. Build the citation once, here, and explainability is free everywhere else.

These wrappers return facts. No wrapper decides whether something is fraud; that
belongs to the ledger and the policy engine, which are unit-testable.
"""
from __future__ import annotations

import time
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from statistics import quantiles
from typing import Any


@dataclass
class ToolResult:
    """What one graph call produced, with its citation already formed."""

    tool: str
    ref: str
    data: dict[str, Any]
    entity_ids: list[str] = field(default_factory=list)
    elapsed_s: float = 0.0

    def get(self, key: str, default=None):
        return self.data.get(key, default)


@dataclass
class QueryLog:
    """Every graph call made during one investigation."""

    calls: list[ToolResult] = field(default_factory=list)

    def record(self, result: ToolResult) -> ToolResult:
        self.calls.append(result)
        return result

    @property
    def count(self) -> int:
        return len(self.calls)

    @property
    def total_seconds(self) -> float:
        return sum(c.elapsed_s for c in self.calls)

    def refs(self) -> list[str]:
        return [c.ref for c in self.calls]


def _fmt_ref(name: str, params: dict[str, Any]) -> str:
    inner = ", ".join(f"{k}={v}" for k, v in params.items())
    return f"query:{name}({inner})"


def _flatten(raw: list[dict]) -> dict[str, Any]:
    """TigerGraph returns a list of single-key blocks; merge into one dict."""
    out: dict[str, Any] = {}
    for block in raw or []:
        for key, value in block.items():
            out[key] = value
    return out


def _normalize_live_attributes(value: Any) -> Any:
    """Keep wrapper results stable across the old and live graph schemas."""
    if isinstance(value, list):
        return [_normalize_live_attributes(item) for item in value]
    if not isinstance(value, dict):
        return value

    normalized = {
        key: _normalize_live_attributes(item)
        for key, item in value.items()
    }
    for key, item in list(normalized.items()):
        if "." in key:
            normalized.setdefault(key.split(".")[-1], item)
    aliases = {
        "amount": "amt",
        "product_cd": "product",
        "id15_device": "device_new",
        "id23_proxy": "proxy_flag",
        "id34_match": "match_status",
    }
    for source, target in aliases.items():
        if source in normalized and target not in normalized:
            normalized[target] = normalized[source]
    for key, item in list(normalized.items()):
        if "." in key:
            prefix, source = key.rsplit(".", 1)
            target = aliases.get(source)
            if target:
                normalized.setdefault(f"{prefix}.{target}", item)
    for key in ("addr1", "addr2"):
        if key in normalized and normalized[key] not in (None, ""):
            try:
                normalized[key] = f"{float(normalized[key]):.1f}"
            except (TypeError, ValueError):
                pass
    if "attributes" in normalized and isinstance(normalized["attributes"], dict):
        normalized["attributes"].setdefault("device_key", "")
    if "bank_closed_cases" in normalized:
        normalized.setdefault("sentinel_cases", [])
    return normalized


def _add_card_baseline(data: dict[str, Any]) -> dict[str, Any]:
    """Rebuild baseline fields when the live graph stores raw card history."""
    rows = data.get("transactions")
    cards = data.get("card")
    if not isinstance(rows, list) or not isinstance(cards, list) or not rows:
        return data
    amounts = [row["attributes"]["amt"] for row in rows if row.get("attributes", {}).get("amt") is not None]
    if not amounts:
        return data
    amounts.sort()
    q95 = quantiles(amounts, n=100, method="inclusive")[94] if len(amounts) > 1 else amounts[0]
    baseline = cards[0].setdefault("attributes", {})
    median = amounts[len(amounts) // 2] if len(amounts) % 2 else (
        amounts[len(amounts) // 2 - 1] + amounts[len(amounts) // 2]
    ) / (1 if len(amounts) % 2 else 2)
    baseline.update({
        "n_txns": len(rows),
        "n_online": sum(row.get("attributes", {}).get("channel") == "online" for row in rows),
        "n_in_person": sum(row.get("attributes", {}).get("channel") == "in_person" for row in rows),
        "median_amt": median,
        "p95_amt": q95,
        "max_amt": amounts[-1],
    })
    baseline["median_amt"] = float(
        Decimal(str(baseline["median_amt"])).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    )
    return data


class GraphTools:
    """Sixteen named questions the agent can ask the graph."""

    def __init__(self, conn, log: QueryLog | None = None):
        self.conn = conn
        self.log = log or QueryLog()

    # -- plumbing ------------------------------------------------------------

    #: Parameters declared VERTEX<T> in GSQL. pyTigerGraph's installed-query
    #: API requires `(vertex_id, vertex_type)` for these values.
    VERTEX_PARAMS = {
        "t_in": "Transaction",
        "c_in": "Card",
        "d_in": "DeviceProfile",
        "r_in": "BillingRegion",
        "e_in": "EmailDomain",
    }

    def _run(self, name: str, params: dict[str, Any], entity_ids: list[str] | None = None,
             ref_params: dict[str, Any] | None = None) -> ToolResult:
        wire = {
            k: ((v, self.VERTEX_PARAMS[k]) if k in self.VERTEX_PARAMS else v)
            for k, v in params.items()
        }
        t0 = time.time()
        raw = self.conn.runInstalledQuery(name, wire, timeout=120_000)
        result = ToolResult(
            tool=name,
            ref=_fmt_ref(name, ref_params or params),
            data=_normalize_live_attributes(_flatten(raw)),
            entity_ids=entity_ids or [],
            elapsed_s=time.time() - t0,
        )
        if name == "card_baseline":
            result.data = _add_card_baseline(result.data)
        return self.log.record(result)

    # -- 1-3: the alert and what normal looks like ---------------------------

    def txn_detail(self, txn_id: str) -> ToolResult:
        return self._run("txn_detail", {"t_in": txn_id}, [txn_id],
                         {"txn_id": txn_id})

    def card_baseline(self, card_id: str) -> ToolResult:
        return self._run("card_baseline", {"c_in": card_id}, [card_id],
                         {"card_id": card_id})

    def card_window(self, card_id: str, center: str, hours: int = 72) -> ToolResult:
        return self._run("card_window", {"c_in": card_id, "center": center, "hours": hours},
                         [card_id], {"card_id": card_id, "center": center, "hours": hours})

    # -- 4-7: the pattern detectors ------------------------------------------

    def card_testing_probe(self, card_id: str, center: str, small_amt: float = 5.0) -> ToolResult:
        return self._run("card_testing_probe",
                         {"c_in": card_id, "center": center, "small_amt": small_amt},
                         [card_id],
                         {"card_id": card_id, "center": center, "small_amt": small_amt})

    def region_novelty(self, card_id: str, region: str, as_of: str) -> ToolResult:
        """Novelty as of a moment, never over the whole file. See LOADING.md."""
        graph_region = region[:-2] if region.endswith(".0") else region
        return self._run("region_novelty",
                         {"c_in": card_id, "region": graph_region, "as_of": as_of},
                         [card_id, region],
                         {"card_id": card_id, "region": region, "as_of": as_of})

    def amount_band_probe(self, card_id: str, amt: float, as_of: str,
                          tol: float = 0.5) -> ToolResult:
        return self._run("amount_band_probe",
                         {"c_in": card_id, "amt": amt, "tol": tol, "as_of": as_of},
                         [card_id],
                         {"card_id": card_id, "amt": amt, "tol": tol, "as_of": as_of})

    def device_novelty(self, txn_id: str) -> ToolResult:
        return self._run("device_novelty", {"t_in": txn_id}, [txn_id], {"txn_id": txn_id})

    # -- 8-11: connections between cards -------------------------------------

    def device_neighbors(self, device_key: str, center: str, days: int = 30) -> ToolResult:
        return self._run("device_neighbors",
                         {"d_in": device_key, "center": center, "days": days},
                         [device_key],
                         {"device_key": device_key, "center": center, "days": days})

    def region_cluster(self, region: str, win_from: str, win_to: str, base_from: str,
                       base_to: str, risk_thresh: float = 0.7) -> ToolResult:
        """Always against a matched baseline window; a raw count proves nothing."""
        graph_region = region[:-2] if region.endswith(".0") else region
        return self._run("region_cluster",
                 {"r_in": graph_region, "win_from": win_from, "win_to": win_to,
                          "base_from": base_from, "base_to": base_to,
                          "risk_thresh": risk_thresh},
                         [region],
                         {"region": region, "window": f"{win_from}..{win_to}",
                          "baseline": f"{base_from}..{base_to}", "risk_thresh": risk_thresh})

    def email_cluster(self, domain: str, center: str, days: int = 30,
                      risk_thresh: float = 0.7) -> ToolResult:
        return self._run("email_cluster",
                         {"e_in": domain, "center": center, "days": days,
                          "risk_thresh": risk_thresh},
                         [domain],
                         {"domain": domain, "center": center, "days": days})

    def ring_expand(self, card_id: str, center: str, days: int = 30,
                    max_device_cards: int = 20) -> ToolResult:
        """Cards linked by a *specific* shared device.

        max_device_cards excludes generic browser fingerprints. Without it this
        returns a phantom ring for almost any card that has ever been used
        online. See docs/HAND_INVESTIGATION.md.
        """
        result = self._run("ring_expand",
                         {"c_in": card_id, "center": center, "days": days,
                          "max_device_cards": max_device_cards},
                         [card_id],
                         {"card_id": card_id, "center": center, "days": days,
                          "max_device_cards": max_device_cards})
        devices = result.data.get("devices_used", [])
        specific = []
        connected: dict[str, dict[str, Any]] = {}
        for device in devices:
            device_id = device.get("v_id")
            if not device_id:
                continue
            neighbors = self.device_neighbors(device_id, center, days).data
            cards = neighbors.get("cards_on_device", [])
            if len(cards) <= max_device_cards:
                specific.append(device)
                for card in cards:
                    card_id_value = card.get("v_id")
                    if card_id_value and card_id_value != card_id:
                        connected[card_id_value] = card
        result.data["identifying_devices"] = specific
        result.data["devices_specific_enough"] = len(specific)
        result.data["connected_cards"] = list(connected.values())
        return result

    # -- 12-13: behaviour over time ------------------------------------------

    def recurring_charge_probe(self, card_id: str, amt: float, product: str = "",
                               tol: float = 0.5) -> ToolResult:
        return self._run("recurring_charge_probe",
                         {"c_in": card_id, "amt": amt, "tol": tol, "product": product},
                         [card_id],
                         {"card_id": card_id, "amt": amt, "product": product})

    def velocity_probe(self, card_id: str, center: str, hours: int = 48) -> ToolResult:
        return self._run("velocity_probe", {"c_in": card_id, "center": center, "hours": hours},
                         [card_id], {"card_id": card_id, "center": center, "hours": hours})

    # -- 14-16: memory --------------------------------------------------------

    def customer_case_history(self, customer_id: str) -> ToolResult:
        """Includes the denial track record: how often this customer was right."""
        return self._run("customer_case_history", {"customer_id": customer_id},
                         [customer_id], {"customer_id": customer_id})

    def similar_prior_cases(self, pattern: str = "", amt_lo: float = 0.0,
                            amt_hi: float = 1e9, outcome: str = "", k: int = 10) -> ToolResult:
        return self._run("similar_prior_cases",
                         {"pattern_in": pattern, "amt_lo": amt_lo, "amt_hi": amt_hi,
                          "outcome_in": outcome, "k": k},
                         [],
                         {"pattern": pattern or "any", "exposure": f"{amt_lo}..{amt_hi}",
                          "outcome": outcome or "any", "k": k})

    def case_memory_for_card(self, card_id: str) -> ToolResult:
        """Bank closed cases AND cases Sentinel itself wrote earlier in the run."""
        return self._run("case_memory_for_card", {"c_in": card_id}, [card_id],
                         {"card_id": card_id})


TOOL_NAMES = [
    "txn_detail", "card_baseline", "card_window", "card_testing_probe", "region_novelty",
    "amount_band_probe", "device_novelty", "device_neighbors", "region_cluster",
    "email_cluster", "ring_expand", "recurring_charge_probe", "velocity_probe",
    "customer_case_history", "similar_prior_cases", "case_memory_for_card",
]
