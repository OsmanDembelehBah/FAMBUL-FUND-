"""
Fambul Fund Scoring Configuration (v0 heuristic)
Transparent, config-driven credit scoring model.
This heuristic v0 is to be calibrated with real repayment data during the pilot.
"""

SCORING_WEIGHTS = {
    # 1. On-time contribution rate across the last 6 Osusu cycles (0-100)
    "contribution_consistency": 0.35,
    # 2. Historical repayment on in-group advances and external bank/MFI loans (0-100)
    "repayment_history": 0.25,
    # 3. Regularity and stability of sales verified by certified aggregator buyers (0-100)
    "sales_regularity": 0.20,
    # 4. Age of group and member retention stability (0-100)
    "group_tenure_stability": 0.10,
    # 5. Farm record frequency: entries logged per member per month via voice/USSD/app (0-100)
    "ledger_completeness": 0.10,
}

# Verify weights sum to exactly 1.0 (100%)
assert abs(sum(SCORING_WEIGHTS.values()) - 1.0) < 1e-6, "Weights must sum to 1.0"

TIER_THRESHOLDS = {
    "A": 80.0,  # Prime tier: eligible for maximum borrowing & lowest rates (up to 12%)
    "B": 65.0,  # Standard tier: eligible for standard loans (14%)
    "C": 50.0,  # Watch tier: eligible for Pot Advance with group co-guarantee (15%)
    "D": 0.0,   # High risk / uncalibrated: requires 3 months of consistent ledger logs
}

DISCLAIMER_TEXT = (
    "Transparent Heuristic Model v0: This group credit score is calculated using deterministic "
    "weights and will be continuously calibrated with verified pilot repayment data. "
    "All decisions remain fully auditable by group members and partner lenders."
)
