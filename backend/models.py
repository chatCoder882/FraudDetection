"""Pydantic models matching the frontend TypeScript types exactly."""

from pydantic import BaseModel
from typing import List, Optional, Literal, Tuple

CaseStatus = Literal["New", "Investigating", "Awaiting Evidence", "Awaiting Approval", "Action Required", "Closed"]
Verdict = Literal["Fraud", "Legitimate", "Uncertain"]
ApprovalRoute = Literal["Auto", "L1", "L2", "Human"]

class CaseResponse(BaseModel):
    id: str
    trigger: str
    customer: str
    transaction: str
    probability: float
    verdict: Verdict
    pattern: str
    exposure: float
    status: CaseStatus
    nextAction: str
    opened: str


class InvestigationRequest(BaseModel):
    case_id: str
    opened_at: Optional[str] = None
    trigger_type: Optional[str] = None
    trigger_text: Optional[str] = None
    flagged_txn_id: str
    card_id: str
    customer_id: str
    risk_score: Optional[float] = None
    closed_at: Optional[str] = None
    outcome: Optional[str] = None
    pattern: Optional[str] = None
    txn_ids: Optional[str] = None
    exposure_usd: Optional[float] = None
    connected_card_ids: Optional[str] = None
    actions_taken: Optional[str] = None
    report_filed: Optional[str] = None
    analyst_notes: Optional[str] = None

class EvidenceItem(BaseModel):
    id: str
    type: str
    finding: str
    source: str
    entities: List[str]
    impact: str
    before: float
    after: float
    time: str

class TimelineStep(BaseModel):
    title: str
    status: Literal["Complete", "Active", "Pending"]
    finding: str
    source: str
    time: str
    delta: Optional[str] = None

class Recommendation(BaseModel):
    action: str
    reason: str
    rule: str
    route: ApprovalRoute
    status: str

# Audit tuple: [timestamp, actor, event, change, source]
AuditEntry = Tuple[str, str, str, str, str]

class MemoryCase(BaseModel):
    id: str
    outcome: str
    pattern: str
    exposure: str
    similarity: str
    reason: str
    action: str

class DashboardMetrics(BaseModel):
    # This is a placeholder for actual dashboard metric responses if needed as a structured object
    pass
