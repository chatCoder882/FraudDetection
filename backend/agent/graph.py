"""LangGraph workflow for the investigation lifecycle."""

import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage
from langgraph.graph import StateGraph, END
from backend.agent.state import AgentState
from backend.agent.tools import (
    get_transaction_details, get_card_baseline, 
    get_card_device_profile, verify_with_customer, retrieve_similar_cases
)
from backend.agent.policy import evaluate_policy
from backend.config import settings
from langgraph.prebuilt import ToolNode

tools = [
    get_transaction_details, 
    get_card_baseline, 
    get_card_device_profile, 
    verify_with_customer,
    retrieve_similar_cases
]

llm_with_tools = None
if settings.GOOGLE_API_KEY:
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-pro",
        google_api_key=settings.GOOGLE_API_KEY,
        temperature=0,
    )
    llm_with_tools = llm.bind_tools(tools)

def init_investigation(state: AgentState):
    """TRIGGER & SCOPE: Initialize the case."""
    msg = f"Investigate transaction {state['transaction_id']} for customer {state['customer_id']} on card {state['card_id']}."
    if state.get("trigger_text"):
        msg += f" Trigger: {state['trigger_text']}"
    initial_probability = state.get("risk_score")
    return {
        "messages": [HumanMessage(content=msg)],
        "current_stage": "SCOPE",
        "probability": initial_probability if initial_probability is not None else 0.2,
        "evidence_ledger": []
    }

def gather_evidence(state: AgentState):
    """EVIDENCE: Let LLM decide which tools to call to gather data."""
    if llm_with_tools is None:
        # Keep the local demo usable without requiring an external LLM key.
        return {
            "messages": [AIMessage(content="Deterministic demo evidence collected.")],
            "current_stage": "EVIDENCE",
            "evidence_ledger": [{
                "id": "EV-DEMO-001",
                "type": "DEVICE PROFILE",
                "finding": "Demo device profile collected for the submitted card.",
                "source": "get_card_device_profile",
                "entities": [state["card_id"]],
                "impact": "+0.58 LR",
                "before": state.get("probability", 0.2),
                "after": 0.78,
                "time": "now",
            }],
        }

    messages = state['messages']
    from backend.agent.prompts import SYSTEM_PROMPT
    if not any(isinstance(m, SystemMessage) for m in messages):
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + messages
        
    response = llm_with_tools.invoke(messages)
    return {"messages": [response], "current_stage": "EVIDENCE"}

def check_customer(state: AgentState):
    """REQUEST: If uncertain, verify with customer."""
    # For demo, we simulate a customer verification request tool call if probability is somewhat high
    # In a full flow, LLM might do this, but we force it here for the HHG-003 story.
    
    # We simulate discovering new device -> graph links -> prob=0.78
    prob = 0.78 
    
    response = verify_with_customer.invoke({
        "customer_id": state["customer_id"], 
        "transaction_id": state["transaction_id"]
    })
    
    evidence = state.get('evidence_ledger', [])
    evidence.append({
        "id": "EV-104", "type": "CUSTOMER DENIAL", 
        "finding": response, "source": "VERIFY_WITH_CUSTOMER", 
        "impact": "+1.52 LR", "before": prob, "after": 0.89, "time": "10:46:03"
    })
    
    return {
        "probability": 0.89,
        "customer_denied": "DENIED" in response,
        "evidence_ledger": evidence,
        "current_stage": "REQUEST"
    }

def apply_policy(state: AgentState):
    """POLICY: Apply deterministic rules to make final decision."""
    prob = state.get("probability", 0.0)
    denied = state.get("customer_denied", False)
    
    action, route, rule = evaluate_policy(prob, state.get("evidence_ledger", []), denied)
    
    return {
        "recommended_action": action,
        "approval_route": route,
        "policy_rule": rule,
        "status": "Awaiting Approval" if route in ["L1", "L2"] else "Closed",
        "current_stage": "POLICY"
    }

# Build the Graph
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("init", init_investigation)
workflow.add_node("gather_evidence", gather_evidence)
workflow.add_node("tools", ToolNode(tools))
workflow.add_node("check_customer", check_customer)
workflow.add_node("apply_policy", apply_policy)

# Add edges
workflow.set_entry_point("init")
workflow.add_edge("init", "gather_evidence")

# Conditional routing from gather_evidence
def route_tools(state: AgentState):
    last_msg = state["messages"][-1]
    if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
        return "tools"
    return "check_customer"

workflow.add_conditional_edges("gather_evidence", route_tools, {"tools": "tools", "check_customer": "check_customer"})
workflow.add_edge("tools", "gather_evidence")
workflow.add_edge("check_customer", "apply_policy")
workflow.add_edge("apply_policy", END)

# Compile
agent_executor = workflow.compile()
