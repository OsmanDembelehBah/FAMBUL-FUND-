"""
G5 Innovation: Seasonal Cash Flow & Agro-Calendar Forecasting for Sierra Leone
Models agricultural cash inflows, lean seasons, and automated envelope allocations.
"""

from typing import Dict, Any, List

SEASONS_SL = [
    {"month": "Jan", "phase": "Post-Harvest Surplus", "net_cash_sle": 1800, "is_lean": False, "recommended_action": "Lock funds in School Fees Envelope"},
    {"month": "Feb", "phase": "Tree Crops Peak (Cocoa)", "net_cash_sle": 2400, "is_lean": False, "recommended_action": "Osusu Pot Payout Distribution"},
    {"month": "Mar", "phase": "Land Preparation", "net_cash_sle": 400, "is_lean": False, "recommended_action": "Pre-order certified seeds"},
    {"month": "Apr", "phase": "Pre-Planting Clearing", "net_cash_sle": -250, "is_lean": False, "recommended_action": "Lock Ag Inputs Envelope"},
    {"month": "May", "phase": "Planting Season Outlay", "net_cash_sle": -650, "is_lean": False, "recommended_action": "Draw down Ag Inputs Envelope"},
    {"month": "Jun", "phase": "Germination & Weeding", "net_cash_sle": -500, "is_lean": False, "recommended_action": "Apply micro-fertilizer"},
    {"month": "Jul", "phase": "Lean Season Peak (Hungry Month)", "net_cash_sle": -1100, "is_lean": True, "recommended_action": "Pot Advance eligible to bridge staple deficit"},
    {"month": "Aug", "phase": "Lean Season Maintenance", "net_cash_sle": -950, "is_lean": True, "recommended_action": "Monitor crop canopy via NDVI Plot Proof"},
    {"month": "Sep", "phase": "Early Harvest & Green Rice", "net_cash_sle": 650, "is_lean": False, "recommended_action": "Early farmgate sales aggregation"},
    {"month": "Oct", "phase": "Main Staple Harvest (Rice)", "net_cash_sle": 3200, "is_lean": False, "recommended_action": "Repayment-at-source triggered by buyer"},
    {"month": "Nov", "phase": "Harvest Payouts Peak", "net_cash_sle": 3800, "is_lean": False, "recommended_action": "Auto-split into virtual wallet envelopes"},
    {"month": "Dec", "phase": "Holiday & Cocoa Harvest", "net_cash_sle": 2900, "is_lean": False, "recommended_action": "Osusu celebration pot release"},
]


def get_seasonal_forecast(current_month: str = "Nov") -> Dict[str, Any]:
    """
    Returns monthly agro-cashflow curve and timely voice nudge advice.
    """
    return {
        "jurisdiction": "Sierra Leone (Eastern & Southern Agro-ecological Zones)",
        "current_month": current_month,
        "timeline": SEASONS_SL,
        "active_recommendations": {
            "en": "November is peak harvest aggregation. Certified buyer payouts will automatically settle your input loan and Osusu share, transferring the net surplus into your mobile wallet.",
            "krio": "Novemba na taim we avɛst dɔn ripe! We buyer pay yu moni, kɔmpin loan go kɔt wantem wantem, and di balans go enta yu fone walet.",
        },
        "envelope_guidance": {
            "ag_inputs_pct": 30,
            "school_fees_pct": 25,
            "emergency_reserve_pct": 15,
            "osusu_pot_pct": 20,
            "liquid_spending_pct": 10,
        },
    }
