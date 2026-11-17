"""
Core deterministic scoring engine for Osusu groups and individual farmers.
"""

from typing import Dict, Any, List
from scoring_config import SCORING_WEIGHTS, TIER_THRESHOLDS, DISCLAIMER_TEXT


def calculate_group_score(
    contribution_consistency: float,
    repayment_history: float,
    sales_regularity: float,
    group_tenure: float,
    ledger_completeness: float,
) -> Dict[str, Any]:
    """
    Computes a 0-100 creditworthiness score from the 5 transparent weighted pillars.
    """
    # Clamp inputs to [0, 100]
    c_score = max(0.0, min(100.0, float(contribution_consistency)))
    r_score = max(0.0, min(100.0, float(repayment_history)))
    s_score = max(0.0, min(100.0, float(sales_regularity)))
    t_score = max(0.0, min(100.0, float(group_tenure)))
    l_score = max(0.0, min(100.0, float(ledger_completeness)))

    # Compute weighted components
    c_contrib = c_score * SCORING_WEIGHTS["contribution_consistency"]
    r_contrib = r_score * SCORING_WEIGHTS["repayment_history"]
    s_contrib = s_score * SCORING_WEIGHTS["sales_regularity"]
    t_contrib = t_score * SCORING_WEIGHTS["group_tenure_stability"]
    l_contrib = l_score * SCORING_WEIGHTS["ledger_completeness"]

    total_score = round(c_contrib + r_contrib + s_contrib + t_contrib + l_contrib, 1)

    # Determine Tier
    tier = "D"
    if total_score >= TIER_THRESHOLDS["A"]:
        tier = "A"
    elif total_score >= TIER_THRESHOLDS["B"]:
        tier = "B"
    elif total_score >= TIER_THRESHOLDS["C"]:
        tier = "C"

    # Explainer bullets for UI transparency panel
    explainer_bullets: List[str] = [
        f"Contribution Consistency ({c_score:.0f}/100 × 35%): Contributed {c_contrib:.1f} pts. Based on on-time rate over last 6 cycles.",
        f"Repayment History ({r_score:.0f}/100 × 25%): Contributed {r_contrib:.1f} pts. Evaluates timely loan settlements.",
        f"Buyer Sales Regularity ({s_score:.0f}/100 × 20%): Contributed {s_contrib:.1f} pts. Grounded in buyer-verified aggregator receipts.",
        f"Group Tenure & Size ({t_score:.0f}/100 × 10%): Contributed {t_contrib:.1f} pts. Rewards stable membership history.",
        f"Ledger Completeness ({l_score:.0f}/100 × 10%): Contributed {l_contrib:.1f} pts. Reflects regular farm logging via USSD/Voice.",
    ]

    return {
        "final_score": total_score,
        "tier": tier,
        "weights": SCORING_WEIGHTS,
        "components": {
            "contribution_consistency": {"raw": c_score, "weighted": round(c_contrib, 1)},
            "repayment_history": {"raw": r_score, "weighted": round(r_contrib, 1)},
            "sales_regularity": {"raw": s_score, "weighted": round(s_contrib, 1)},
            "group_tenure_stability": {"raw": t_score, "weighted": round(t_contrib, 1)},
            "ledger_completeness": {"raw": l_score, "weighted": round(l_contrib, 1)},
        },
        "explainer_bullets": explainer_bullets,
        "disclaimer": DISCLAIMER_TEXT,
    }


def calculate_loan_limit(
    score: float,
    avg_seasonal_net_income: float,
    group_savings_pool: float,
) -> Dict[str, Any]:
    """
    Recommended loan limit = f(score, avg seasonal net income, group savings pool).
    Enforces the statutory 15% annual interest rate ceiling.
    """
    if score < TIER_THRESHOLDS["C"]:
        return {
            "recommended_loan_limit": 0.0,
            "max_borrowing_capacity": 0.0,
            "interest_rate_pct": 0.0,
            "tenor_months": 0,
            "eligible": False,
            "reason": "Group score must reach at least 50.0 (Tier C) to unlock external borrowing.",
        }

    score_ratio = score / 100.0

    # Capacity derived from net agricultural cashflow (max 40% debt-service ratio)
    income_capacity = avg_seasonal_net_income * 0.40 * score_ratio
    # Pool leverage: borrowing backed up to 35% of group Osusu collective savings
    pool_leverage = group_savings_pool * 0.35 * score_ratio

    recommended_limit = round(income_capacity + pool_leverage, 0)

    # Prime groups (Tier A) unlock lower interest rates down to 11.5%, capped at 15.0%
    interest_rate = round(max(11.5, 15.0 - (score - 65.0) * 0.15), 1)
    interest_rate = min(15.0, interest_rate)

    tenor = 6 if score >= TIER_THRESHOLDS["A"] else 4

    return {
        "recommended_loan_limit": recommended_limit,
        "max_borrowing_capacity": round(recommended_limit * 1.25, 0),
        "interest_rate_pct": interest_rate,
        "tenor_months": tenor,
        "eligible": True,
        "formula_explainer": (
            f"Limit SLE {recommended_limit:,.0f} calculated from 40% seasonal income capacity "
            f"(SLE {income_capacity:,.0f}) + 35% group savings pool leverage (SLE {pool_leverage:,.0f}) "
            f"scaled by credit score multiplier ({score_ratio:.2f})."
        ),
    }
