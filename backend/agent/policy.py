"""Deterministic policy engine for action routing."""

from typing import Dict, Any, Tuple

def evaluate_policy(probability: float, evidence: list[dict], customer_denied: bool) -> Tuple[str, str, str]:
    """
    Evaluates policy based on probability and evidence.
    Returns (Action, Route, Rule_Matched).
        """
    
    # R3: Confirmed card fraud
    if probability >= 0.8 and customer_denied:
        return "BLOCK_CARD", "L2", "R3 · Confirmed card fraud"
        
    # R9: High risk, filing threshold
    if probability >= 0.8:
        return "FILE_REPORT", "Human", "R9 · SAR filing threshold"
        
    # R7: Evidence sufficiency (needs more info)
    if 0.5 <= probability < 0.8:
        return "VERIFY_WITH_CUSTOMER", "Auto", "R7 · Evidence threshold"
        
    # R1: Low risk
    if probability < 0.3:
        return "ALLOW_TRANSACTION", "Auto", "R1 · Low-risk allow"
        
    # Default fallback
    return "MONITOR_ACCOUNT", "Auto", "R10 · Default monitoring"
