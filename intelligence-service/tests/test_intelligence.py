"""
Pytest suite for Fambul Fund Intelligence Service.
Validates scoring weights, loan limits, voice parsing, liquidity radar, and satellite NDVI.
"""

import pytest
from scoring_config import SCORING_WEIGHTS, TIER_THRESHOLDS
from scoring_engine import calculate_group_score, calculate_loan_limit
from voice_parser import parse_voice_note
from liquidity_radar import forecast_liquidity_radar
from satellite_adapter import assess_plot_ndvi


def test_scoring_weights_sum_to_one():
    assert abs(sum(SCORING_WEIGHTS.values()) - 1.0) < 1e-6
    assert SCORING_WEIGHTS["contribution_consistency"] == 0.35
    assert SCORING_WEIGHTS["repayment_history"] == 0.25
    assert SCORING_WEIGHTS["sales_regularity"] == 0.20
    assert SCORING_WEIGHTS["group_tenure_stability"] == 0.10
    assert SCORING_WEIGHTS["ledger_completeness"] == 0.10


def test_group_scoring_calculation():
    # Test High-performing group (e.g. Gbo-Kakua Osusu)
    res = calculate_group_score(
        contribution_consistency=95.0,
        repayment_history=90.0,
        sales_regularity=85.0,
        group_tenure=80.0,
        ledger_completeness=80.0,
    )
    # Expected: 95*0.35 + 90*0.25 + 85*0.20 + 80*0.10 + 80*0.10
    # = 33.25 + 22.5 + 17.0 + 8.0 + 8.0 = 88.75 -> 88.8
    assert res["final_score"] == 88.8
    assert res["tier"] == "A"
    assert len(res["explainer_bullets"]) == 5
    assert "disclaimer" in res


def test_group_scoring_weak_group():
    res = calculate_group_score(
        contribution_consistency=40.0,
        repayment_history=40.0,
        sales_regularity=40.0,
        group_tenure=40.0,
        ledger_completeness=40.0,
    )
    assert res["final_score"] == 40.0
    assert res["tier"] == "D"


def test_loan_limit_formula_and_ceiling():
    # Ineligible score (< 50)
    ineligible = calculate_loan_limit(score=45.0, avg_seasonal_net_income=5000.0, group_savings_pool=2000.0)
    assert ineligible["eligible"] is False
    assert ineligible["recommended_loan_limit"] == 0.0

    # Eligible prime score (88.8)
    eligible = calculate_loan_limit(score=88.8, avg_seasonal_net_income=6000.0, group_savings_pool=3000.0)
    assert eligible["eligible"] is True
    assert eligible["recommended_loan_limit"] > 0
    # Must enforce 15% ceiling
    assert eligible["interest_rate_pct"] <= 15.0
    assert eligible["interest_rate_pct"] >= 11.5


def test_voice_parser_krio_sale():
    krio_note = "A sel 5 bag rays tide na Bo maket fɔ 250 Leone"
    parsed = parse_voice_note(krio_note)
    assert parsed["entry_type"] == "sale"
    assert parsed["crop"] == "Rice"
    assert parsed["quantity"] == 5.0
    assert parsed["amount"] == 250.0
    assert parsed["location"] == "Bo"
    assert parsed["farmer_confirmation_required"] is True


def test_voice_parser_english_expense():
    english_note = "Paid 80 SLE for fertilizer and seeds in Kenema"
    parsed = parse_voice_note(english_note)
    assert parsed["entry_type"] == "expense"
    assert parsed["crop"] == "Inputs"
    assert parsed["amount"] == 80.0
    assert parsed["farmer_confirmation_required"] is True


def test_liquidity_radar_forecast():
    radar = forecast_liquidity_radar()
    assert radar["status"] == "active"
    assert len(radar["nodes"]) >= 5
    assert any(n["location"].startswith("Pendembu") for n in radar["nodes"])
    assert radar["summary"]["critical_shortfalls_count"] >= 1


def test_satellite_plot_ndvi():
    # Kenema coordinate
    ndvi_result = assess_plot_ndvi(lat=8.115, lon=-11.187, crop="Cocoa")
    assert 0.0 <= ndvi_result["ndvi_value"] <= 1.0
    assert ndvi_result["plot_verified"] is True
    assert "health_status" in ndvi_result
