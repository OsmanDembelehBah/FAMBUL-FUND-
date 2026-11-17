"""
G2 Innovation: Payout-Day Liquidity Radar
Forecasts rural agent physical cash-out demand by village to prevent cash float depletion on harvest payout days.
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta

RURAL_AGENT_NODES = [
    {
        "agent_id": "AGT-BO-01",
        "agent_name": "Pa Morlai Tele-Kiosk",
        "location": "Tikonko Road, Bo Town",
        "district": "Bo",
        "daily_float_sle": 15000.0,
        "coop_farmers_count": 86,
        "scheduled_payout_sle": 32000.0,
        "payout_date": "2026-11-20",
    },
    {
        "agent_id": "AGT-KAI-04",
        "agent_name": "Pendembu Central Mini-Mart",
        "location": "Pendembu Market Square",
        "district": "Kailahun",
        "daily_float_sle": 8000.0,
        "coop_farmers_count": 124,
        "scheduled_payout_sle": 46500.0,
        "payout_date": "2026-11-21",
    },
    {
        "agent_id": "AGT-KEN-09",
        "agent_name": "Hangha Junction Mobile Shop",
        "location": "Hangha Road, Kenema",
        "district": "Kenema",
        "daily_float_sle": 22000.0,
        "coop_farmers_count": 92,
        "scheduled_payout_sle": 28000.0,
        "payout_date": "2026-11-22",
    },
    {
        "agent_id": "AGT-KAM-02",
        "agent_name": "Rokupr Port Agency",
        "location": "Rokupr River Bank, Kambia",
        "district": "Kambia",
        "daily_float_sle": 6500.0,
        "coop_farmers_count": 78,
        "scheduled_payout_sle": 19500.0,
        "payout_date": "2026-11-23",
    },
    {
        "agent_id": "AGT-PL-05",
        "agent_name": "Lunsar Community Center Agent",
        "location": "Lunsar Central, Port Loko",
        "district": "Port Loko",
        "daily_float_sle": 12000.0,
        "coop_farmers_count": 64,
        "scheduled_payout_sle": 14000.0,
        "payout_date": "2026-11-24",
    },
]


def forecast_liquidity_radar() -> Dict[str, Any]:
    """
    Computes liquidity pressure across all rural points, flagging critical float shortfalls.
    """
    radar_nodes = []
    total_shortfall = 0.0
    critical_nodes_count = 0

    for node in RURAL_AGENT_NODES:
        float_sle = node["daily_float_sle"]
        payout_sle = node["scheduled_payout_sle"]
        farmers = node["coop_farmers_count"]

        # Expected cash-out is typically 75% of digital payout within 48h
        expected_cashout = payout_sle * 0.78
        net_gap = expected_cashout - float_sle

        if net_gap > 10000:
            risk = "CRITICAL"
            critical_nodes_count += 1
            total_shortfall += net_gap
            rebalance_action = (
                f"Dispatch liquidity van from {node['district']} central hub 24h before {node['payout_date']}. "
                f"Split farmer payout batches across 2 morning tranches."
            )
            sms_alert = (
                f"ALERT Fambul Fund Radar: {node['agent_name']} in {node['location']} expects SLE {expected_cashout:,.0f} "
                f"cash-out on {node['payout_date']}. Float shortfall SLE {net_gap:,.0f}. Pre-funding requested."
            )
        elif net_gap > 0:
            risk = "MODERATE"
            total_shortfall += net_gap
            rebalance_action = "Notify regional aggregator super-agent to double float allocation."
            sms_alert = (
                f"NOTICE: {node['agent_name']} cash-out surge expected on {node['payout_date']}. "
                f"Estimated liquidity needed: SLE {expected_cashout:,.0f}."
            )
        else:
            risk = "BALANCED"
            rebalance_action = "Standard local liquidity sufficient."
            sms_alert = ""

        radar_nodes.append({
            **node,
            "expected_cashout_sle": round(expected_cashout, 0),
            "float_shortfall_sle": round(max(0.0, net_gap), 0),
            "liquidity_risk": risk,
            "demand_smoothing_recommendation": rebalance_action,
            "agent_sms_alert": sms_alert,
        })

    return {
        "status": "active",
        "forecast_timestamp": datetime.utcnow().isoformat() + "Z",
        "nodes": radar_nodes,
        "summary": {
            "critical_shortfalls_count": critical_nodes_count,
            "aggregate_shortfall_sle": round(total_shortfall, 0),
            "demand_smoothing_active": True,
            "explanation": (
                "Liquidity Radar synchronizes buyer digital payout execution with telecom super-agent cash delivery. "
                "This prevents rural farmers from facing empty agent drawers when redeeming digital mobile money into paper cash."
            ),
        },
    }
