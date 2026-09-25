"""FastAPI routes for the Sentinel application."""

import json
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, HTTPException
from typing import List, Dict, Any
from backend.models import CaseResponse, EvidenceItem, TimelineStep, Recommendation, MemoryCase, InvestigationRequest
from backend.agent.graph import agent_executor

router = APIRouter()

# Global memory to store mock/active cases for the demo
ACTIVE_CASES = {
    "HHG-003": {
        "id": "HHG-003", "trigger": "Customer report", "customer": "CUS-48129", 
        "transaction": "TXN-908174", "probability": 0.89, "verdict": "Fraud", 
        "pattern": "CNP · new device", "exposure": 18420.0, "status": "Awaiting Approval", 
        "nextAction": "BLOCK_CARD", "opened": "9 min ago"
    }
}

@router.get("/cases", response_model=List[CaseResponse])
def list_cases():
    return list(ACTIVE_CASES.values())

@router.get("/cases/{case_id}", response_model=CaseResponse)
def get_case(case_id: str):
    return ACTIVE_CASES.get(case_id, ACTIVE_CASES["HHG-003"])

@router.post("/cases/{case_id}/investigate")
def run_investigation(case_id: str, request: InvestigationRequest | None = None):
    """Trigger the LangGraph agent for a case."""
    # Keep the demo defaults when the endpoint is called without a request body.
    case = request if request is not None else InvestigationRequest(
        case_id=case_id,
        flagged_txn_id="TXN-908174",
        customer_id="CUS-48129",
        card_id="CARD-9241",
    )

    if case.case_id != case_id:
        return {"status": "Error", "detail": "Path case_id must match body case_id"}

    if case_id not in ACTIVE_CASES:
        ACTIVE_CASES[case_id] = {
            "id": case_id,
            "trigger": case.trigger_text or case.analyst_notes or case.trigger_type or "Submitted test case",
            "customer": case.customer_id,
            "transaction": case.flagged_txn_id,
            "probability": case.risk_score if case.risk_score is not None else 0.2,
            "verdict": "Fraud" if case.outcome == "confirmed_fraud" else "Uncertain",
            "pattern": case.pattern or "Pending investigation",
            "exposure": case.exposure_usd or 0.0,
            "status": "Investigating",
            "nextAction": "INVESTIGATE",
            "opened": case.opened_at or "just now",
        }

    try:
        from sentinel.investigator import investigate_case

        answer = investigate_case(case.model_dump())
        cases_dir = Path(__file__).resolve().parents[2] / "cases"
        cases_dir.mkdir(exist_ok=True)
        (cases_dir / f"{case_id}.json").write_text(
            json.dumps(answer, indent=2), encoding="utf-8"
        )
        generated_case = answer["case"]
        ACTIVE_CASES[case_id].update({
            "probability": generated_case["fraud_probability"],
            "verdict": generated_case["verdict"].title(),
            "pattern": generated_case["pattern"],
            "exposure": generated_case["exposure_usd"],
            "status": "Closed" if generated_case["status"] != "open" else "Investigating",
            "nextAction": answer["next_best_actions"]["final"][0]["action"] if answer["next_best_actions"]["final"] else "MONITOR_CARD",
        })
        return {
            "status": "Complete",
            "result": ACTIVE_CASES[case_id]["nextAction"],
            "answer": answer,
        }
    except Exception as exc:
        failure = str(exc).lower()
        if ("secret" in failure and "invalid" in failure) or "authentication failed" in failure:
            detail = "TigerGraph rejected TG_SECRET. Set a valid graph secret in .env and restart the backend."
        elif "tg_host" in failure or "tg_secret" in failure:
            detail = "TigerGraph is not configured. Set TG_HOST and TG_SECRET in .env and restart the backend."
        else:
            detail = "Investigation failed. Check the backend logs for details."
        raise HTTPException(status_code=503, detail=detail) from exc

    initial_state = {
        "case_id": case_id,
        "transaction_id": case.flagged_txn_id,
        "customer_id": case.customer_id,
        "card_id": case.card_id,
        "trigger_type": case.trigger_type,
        "trigger_text": case.trigger_text,
        "risk_score": case.risk_score,
        "pattern": case.pattern,
        "analyst_notes": case.analyst_notes,
        "messages": [],
    }
    
    # Run agent synchronously for simplicity in API (SSE could be used for streaming)
    result = agent_executor.invoke(initial_state)
    
    # Update our global memory with results
    if case_id in ACTIVE_CASES:
        ACTIVE_CASES[case_id]["probability"] = result.get("probability", 0.0)
        ACTIVE_CASES[case_id]["nextAction"] = result.get("recommended_action", "BLOCK_CARD")
        ACTIVE_CASES[case_id]["status"] = result.get("status", "Awaiting Approval")
        
    return {"status": "Complete", "result": result.get("recommended_action")}

# --- Mocked endpoints for UI Data that rely on the exact mock JSON shape for the demo ---

@router.get("/cases/{case_id}/evidence", response_model=List[EvidenceItem])
def get_evidence(case_id: str):
    return [
        {"id":"EV-102","type":"NEW DEVICE","finding":"Device not previously associated with this card.","source":"get_card_device_profile","entities":["DEV-72A","CARD-9241"],"impact":"+0.73 LR","before":0.38,"after":0.61,"time":"10:42:18"},
        {"id":"EV-103","type":"GRAPH LINK","finding":"Device connects to three confirmed fraud cases.","source":"expand_entity_neighbors","entities":["DEV-72A","CC-188","CC-204"],"impact":"+1.14 LR","before":0.61,"after":0.78,"time":"10:42:31"},
        {"id":"EV-104","type":"CUSTOMER DENIAL","finding":"Customer denied authorizing the flagged transaction.","source":"VERIFY_WITH_CUSTOMER","entities":["CUS-48129","TXN-908174"],"impact":"+1.52 LR","before":0.78,"after":0.89,"time":"10:46:03"}
    ]

@router.get("/cases/{case_id}/timeline", response_model=List[TimelineStep])
def get_timeline(case_id: str):
    return [
        {"title":"Scope Investigation","status":"Complete","finding":"Flagged transaction, card, customer, and adjacent entities scoped.","source":"get_alert_context","time":"10:41:52","delta":"0.20"},
        {"title":"Device Analysis","status":"Complete","finding":"First-seen device with sparse identity history.","source":"get_card_device_profile","time":"10:42:18","delta":"0.38 → 0.61"},
        {"title":"Evidence Request","status":"Complete","finding":"Customer verification returned: transaction denied.","source":"VERIFY_WITH_CUSTOMER","time":"10:46:03","delta":"0.78 → 0.89"},
        {"title":"Final Decision","status":"Active","finding":"Recommend blocking card through L2 approval route.","source":"policy_engine R3","time":"10:46:09"}
    ]

@router.get("/cases/{case_id}/recommendations")
def get_recommendations(case_id: str):
    return {
        "initial": {"action":"VERIFY_WITH_CUSTOMER","reason":"High graph risk, but customer intent was not yet established.","rule":"R7 · Evidence threshold","route":"Auto","status":"Completed"},
        "final": {"action":"BLOCK_CARD","reason":"Customer denial confirms unauthorized use and materially increases fraud probability.","rule":"R3 · Confirmed card fraud","route":"L2","status":"Awaiting approval"}
    }
