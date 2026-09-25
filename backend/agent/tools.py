"""TigerGraph queries and tool functions for the LangGraph agent."""

from typing import List, Dict, Any, Optional
from langchain_core.tools import tool
from backend.tigergraph.connection import tg_conn
import json

@tool
def get_transaction_details(transaction_id: str) -> str:
    """Get details for a specific transaction by its ID (e.g. TXN-908174)."""
    try:
        # In a real scenario, this would query TG: tg_conn.getVertices("Transaction", transaction_id)
        # For the hackathon, we simulate the expected response based on the dataset if TG is empty or doesn't have it
        return json.dumps({
            "v_id": transaction_id,
            "v_type": "Transaction",
            "attributes": {
                "amount": 8920.0 if transaction_id == "TXN-908174" else 240.0,
                "time": "10:38 UTC",
                "is_digital": True
            }
        })
    except Exception as e:
        return f"Error retrieving transaction: {str(e)}"

@tool
def get_card_baseline(card_id: str) -> str:
    """Get the spending baseline for a card by its ID (e.g. CARD-9241)."""
    try:
        # Mocking TG response
        return json.dumps({
            "card_id": card_id,
            "median_amount": 184.0,
            "first_seen": "2024-03-12",
            "total_transactions": 128
        })
    except Exception as e:
        return f"Error retrieving card baseline: {str(e)}"

@tool
def get_card_device_profile(card_id: str) -> str:
    """Get the devices associated with a card (e.g. CARD-9241)."""
    try:
        # tg_conn.getNeighbors("Card", card_id, "Device")
        return json.dumps({
            "devices": [
                {"id": "DEV-72A", "first_seen": "today", "linked_fraud_cases": 3}
            ]
        })
    except Exception as e:
        return f"Error retrieving device profile: {str(e)}"

@tool
def verify_with_customer(customer_id: str, transaction_id: str) -> str:
    """Simulate requesting verification from a customer. Use this when uncertainty is high (0.5 < p < 0.8)."""
    if transaction_id == "TXN-908174":
        return "Customer Response: DENIED. Customer states they did not authorize this transaction."
    return "Customer Response: APPROVED. Customer confirms they made this transaction."

@tool
def retrieve_similar_cases(pattern: str) -> str:
    """Retrieve historical cases with a similar pattern from the graph."""
    if "new device" in pattern.lower():
        return json.dumps({
            "similar_cases": 12,
            "confirmed_fraud": 10,
            "top_matches": ["CC-204", "CC-188"]
        })
    return json.dumps({"similar_cases": 0})
