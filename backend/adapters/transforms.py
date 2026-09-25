"""Data adapters mapping TigerGraph output to UI expected models."""

from backend.models import CaseResponse, EvidenceItem, TimelineStep, Recommendation, MemoryCase

def adapt_case(tg_data: dict, agent_state: dict) -> CaseResponse:
    """Transform raw data into a UI CaseResponse."""
    return CaseResponse(
        id=agent_state.get("case_id", "HHG-000"),
        trigger=tg_data.get("trigger", "Risk score"),
        customer=agent_state.get("customer_id", "Unknown"),
        transaction=agent_state.get("transaction_id", "Unknown"),
        probability=agent_state.get("probability", 0.0),
        verdict="Fraud" if agent_state.get("probability", 0) >= 0.8 else ("Legitimate" if agent_state.get("probability", 0) < 0.5 else "Uncertain"),
        pattern=agent_state.get("pattern", "Discovered pattern"),
        exposure=float(tg_data.get("amount", 0.0)),
        status=agent_state.get("status", "New"),
        nextAction=agent_state.get("recommended_action", "INVESTIGATE"),
        opened="Just now"
    )
