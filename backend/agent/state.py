"""State definition for LangGraph agent."""

from typing import TypedDict, Annotated, List, Dict, Any
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    """The state of the fraud investigation agent."""
    messages: Annotated[list[BaseMessage], add_messages]
    
    # Case Details
    case_id: str
    transaction_id: str
    customer_id: str
    card_id: str
    trigger_text: str
    risk_score: float
    
    # Investigation Findings
    evidence_ledger: List[Dict[str, Any]]
    probability: float
    pattern: str
    
    # Final Decision
    customer_denied: bool
    recommended_action: str
    approval_route: str
    policy_rule: str
    
    # Status tracking
    status: str
    current_stage: str
