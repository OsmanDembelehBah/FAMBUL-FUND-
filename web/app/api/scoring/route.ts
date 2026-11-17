import { NextRequest, NextResponse } from "next/server";
import { calculateGroupScore, calculateRecommendedLoanLimit } from "@/lib/scoring.config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      contributionConsistency = 95,
      repaymentHistory = 90,
      salesRegularity = 85,
      groupTenureStability = 80,
      ledgerCompleteness = 80,
      avgSeasonalNetIncome = 6000,
      groupSavingsPool = 3000,
    } = body;

    const scoreResult = calculateGroupScore({
      contributionConsistency,
      repaymentHistory,
      salesRegularity,
      groupTenureStability,
      ledgerCompleteness,
    });

    const loanLimit = calculateRecommendedLoanLimit(
      scoreResult.totalScore,
      avgSeasonalNetIncome,
      groupSavingsPool
    );

    return NextResponse.json({
      score: scoreResult,
      loanLimit,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
