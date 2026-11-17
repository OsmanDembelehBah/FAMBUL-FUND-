"""
FastAPI Intelligence Service for Fambul Fund.
Provides transparent credit scoring, loan limit derivation, voice parsing,
seasonal cash-flow forecasting, liquidity radar, and satellite NDVI assessment.
"""

import os
import time
import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

from scoring_engine import calculate_group_score, calculate_loan_limit
from voice_parser import parse_voice_note
from liquidity_radar import forecast_liquidity_radar
from satellite_adapter import assess_plot_ndvi
from season_forecast import get_seasonal_forecast

start_time = time.time()
ENVIRONMENT = os.getenv("ENVIRONMENT", os.getenv("NODE_ENV", "production"))
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [o.strip() for o in allowed_origins_raw.split(",") if o.strip()]

app = FastAPI(
    title="Fambul Fund Intelligence Service",
    description="Deterministic credit scoring, voice ledger parsing, and rural liquidity forecasting for Sierra Leone Osusu groups.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GroupScoreRequest(BaseModel):
    contribution_consistency: float = Field(..., ge=0.0, le=100.0, description="On-time contribution rate last 6 cycles (35%)")
    repayment_history: float = Field(..., ge=0.0, le=100.0, description="Repayment rate on loans (25%)")
    sales_regularity: float = Field(..., ge=0.0, le=100.0, description="Buyer-verified sales volume stability (20%)")
    group_tenure: float = Field(..., ge=0.0, le=100.0, description="Group age and member retention (10%)")
    ledger_completeness: float = Field(..., ge=0.0, le=100.0, description="Ledger entries logged per member per month (10%)")


class LoanLimitRequest(BaseModel):
    score: float = Field(..., ge=0.0, le=100.0)
    avg_seasonal_net_income: float = Field(..., gt=0.0)
    group_savings_pool: float = Field(..., ge=0.0)


class VoiceParseRequest(BaseModel):
    transcription: str = Field(..., min_length=2, description="Natural language farmer voice note (Krio or English)")


class PlotNDVIRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    crop: Optional[str] = "Rice"


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "intelligence-service",
        "environment": ENVIRONMENT,
        "uptime_sec": int(time.time() - start_time),
        "runtime": "Python 3.11 / FastAPI",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }


@app.get("/healthz")
def healthz():
    return health()


@app.post("/score/group")
def score_group(req: GroupScoreRequest):
    return calculate_group_score(
        req.contribution_consistency,
        req.repayment_history,
        req.sales_regularity,
        req.group_tenure,
        req.ledger_completeness,
    )


@app.post("/score/loan-limit")
def loan_limit(req: LoanLimitRequest):
    return calculate_loan_limit(
        req.score,
        req.avg_seasonal_net_income,
        req.group_savings_pool,
    )


@app.post("/voice/parse")
def voice_parse(req: VoiceParseRequest):
    return parse_voice_note(req.transcription)


@app.get("/forecast/liquidity-radar")
def liquidity_radar():
    return forecast_liquidity_radar()


@app.get("/forecast/season")
def season_forecast(month: str = "Nov"):
    return get_seasonal_forecast(month)


@app.post("/satellite/ndvi")
def plot_ndvi(req: PlotNDVIRequest):
    return assess_plot_ndvi(req.latitude, req.longitude, req.crop or "Rice")
