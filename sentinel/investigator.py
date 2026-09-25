"""Generate a policy-compliant answer for one submitted alert."""
from __future__ import annotations

import json
import time
from datetime import datetime
from typing import Any

from sentinel.policy import CaseState, Recommendation, decide, sar_reason, should_file_report
from sentinel.tools import GraphTools, QueryLog


def _attrs(result: Any, key: str = "txn") -> dict[str, Any]:
    rows = result.get(key, [])
    return rows[0].get("attributes", {}) if rows else {}


def _recommendations(state: CaseState) -> list[dict[str, str]]:
    return [item.as_dict() for item in decide(state)]


def investigate_case(request: dict[str, Any]) -> dict[str, Any]:
    """Investigate one alert using graph facts and the deterministic policy."""
    started = time.perf_counter()
    log = QueryLog()
    from sentinel import config

    graph = GraphTools(config.connect(verbose=False), log)
    case_id = request["case_id"]
    txn_id = request["flagged_txn_id"]
    card_id = request["card_id"]
    customer_id = request["customer_id"]
    txn_result = graph.txn_detail(txn_id)
    txn = _attrs(txn_result)
    amount = float(txn.get("amt", request.get("amount_usd") or 0.0))
    channel = txn.get("channel", "")
    region = str(txn.get("addr1", ""))
    risk = float(request.get("risk_score") if request.get("risk_score") is not None else txn.get("risk_score", 0.5))
    baseline = graph.card_baseline(card_id)
    card = _attrs(baseline, "card")
    region_result = graph.region_novelty(card_id, region, request.get("opened_at", txn.get("ts", "")))
    band_result = graph.amount_band_probe(card_id, amount, request.get("opened_at", txn.get("ts", "")))
    history = graph.customer_case_history(customer_id)
    prior = graph.similar_prior_cases(amt_lo=max(0, amount * 0.5), amt_hi=amount * 1.5, k=5)

    device_new = str(txn.get("device_new", "")).lower() == "new"
    recurring = int(band_result.get("prior_charges_in_band", 0) or 0) >= 5
    trigger_type = request.get("trigger_type", "risk_score")
    customer_response = "denied" if trigger_type == "customer_report" else None
    pattern = "card_not_present_new_device" if channel == "online" and device_new else (
        "card_not_present_fraud" if channel == "online" else "none"
    )
    probability = min(0.99, max(0.05, risk))
    if customer_response == "denied":
        probability = max(probability, 0.86)
    if recurring:
        probability = min(probability, 0.35)
    verdict = "fraud" if probability >= 0.70 and not recurring else ("legitimate" if recurring and probability <= 0.30 else "uncertain")
    evidence = [
        {"claim": f"Flagged transaction {txn_id} is ${amount:.2f}, channel {channel or 'unknown'}, risk score {risk:.2f}.", "source": "graph", "ref": f"query:txn_detail(txn_id={txn_id})", "entity_ids": [txn_id, card_id]},
        {"claim": f"Card history contains {card.get('n_txns', 'available')} transactions; amount-band history contains {band_result.get('prior_charges_in_band', 0)} prior matches.", "source": "graph", "ref": f"query:card_baseline(card_id={card_id})", "entity_ids": [card_id]},
        {"claim": f"Billing region {region} has {region_result.get('prior_txns_in_region', 0)} prior transactions before the alert.", "source": "graph", "ref": f"query:region_novelty(card_id={card_id}, region={region})", "entity_ids": [card_id, region]},
    ]
    if customer_response:
        evidence.append({"claim": "Customer report was treated as a denial of the flagged transaction.", "source": "customer", "ref": "input:trigger_text", "entity_ids": [customer_id]})
    independent = 2 if channel == "online" or recurring else 1
    shared = bool(history.get("confirmed_fraud_cases", 0) and pattern != "none")
    state = CaseState(
        fraud_probability=probability, exposure_usd=abs(amount), verdict=verdict,
        trigger_type=trigger_type, customer_response=customer_response,
        independent_signals=independent, pattern=pattern, recurring_match=recurring,
        shared_origin=shared, shared_origin_kind="customer history and graph evidence" if shared else "",
        other_customer_fraud=False,
    )
    initial_state = CaseState(**{**state.__dict__, "customer_response": None})
    initial = _recommendations(initial_state)
    final = _recommendations(state)
    sar_file = should_file_report(state)
    affected = [] if verdict == "legitimate" else [txn_id]
    final_names = {item["action"] for item in final}
    answer = {
        "case_id": case_id,
        "case": {
            "status": "closed_fraud" if verdict == "fraud" else ("closed_legitimate" if verdict == "legitimate" else "open"),
            "verdict": verdict, "fraud_probability": probability, "pattern": pattern,
            "pattern_description": "", "affected_txn_ids": affected,
            "first_suspicious_txn_id": txn_id if affected else "", "connected_card_ids": [],
            "connected_device_profiles": [], "exposure_usd": abs(amount) if affected else 0.0,
            "evidence": evidence, "similar_prior_cases": [row.get("v_id", "") for row in prior.get("cases", []) if row.get("v_id")],
            "summary": f"Investigated {txn_id} for customer {customer_id} using transaction, card baseline, region, and closed-case evidence.",
            "written_to_graph": False, "graph_case_id": "",
        },
        "evidence_requests": ([{"type": "customer_validation", "asked_after_step": log.count, "assumed_response": "Customer denied the flagged transaction based on the submitted customer report."}] if trigger_type == "customer_report" else ([{"type": "customer_validation", "asked_after_step": log.count, "assumed_response": "Customer response was not provided; case remains unresolved."}] if customer_response is None and verdict == "uncertain" else [])),
        "next_best_actions": {"initial": initial, "final": final, "what_changed": "Customer report evidence changed the final recommendation." if customer_response else "nothing"},
        "sar": {"file": sar_file, "reason": sar_reason(state), "narrative": (f"Customer {customer_id} used card {card_id} for transaction {txn_id} on {str(txn.get('ts', request.get('opened_at', '')))}. The transaction amount was ${amount:.2f} and the assessed fraud probability was {probability:.2f}. Graph analysis compared the transaction with card history, billing region, amount history, and closed investigations. The activity was assessed under the bank fraud policy. The final action set includes {', '.join(sorted(final_names))}." if sar_file else ""), "subjects": [customer_id, card_id, txn_id] if sar_file else [], "total_amount_usd": abs(amount) if sar_file else 0, "activity_dates": [str(txn.get("ts", request.get("opened_at", "")))[:10], str(txn.get("ts", request.get("opened_at", "")))[:10]] if sar_file else []},
        "stop_reason": "Customer report settled the initial question." if customer_response else "Evidence collected; no customer response was available.",
        "tool_calls": log.count, "tokens": 0, "latency_s": round(time.perf_counter() - started, 3),
    }
    return answer