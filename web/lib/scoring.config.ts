/**
 * Fambul Fund Scoring Model (Transparent, Config-Driven v0)
 *
 * Weights and deterministic scoring formulation for Osusu groups and individual farmers.
 * Calibrated for Sierra Leone agricultural micro-finance.
 */

export interface ScoringWeights {
  contributionConsistency: number; // 35%
  repaymentHistory: number;         // 25%
  salesRegularity: number;          // 20%
  groupTenureStability: number;     // 10%
  ledgerCompleteness: number;       // 10%
}

export const SCORING_CONFIG: {
  weights: ScoringWeights;
  statutoryMaxInterestRate: number; // 15.0% statutory ceiling
  tiers: {
    A: { minScore: number; maxInterestRate: number; label: string; maxTenorMonths: number };
    B: { minScore: number; maxInterestRate: number; label: string; maxTenorMonths: number };
    C: { minScore: number; maxInterestRate: number; label: string; maxTenorMonths: number };
    D: { minScore: number; maxInterestRate: number; label: string; maxTenorMonths: number };
  };
  heuristicDisclaimer: string;
} = {
  weights: {
    contributionConsistency: 0.35,
    repaymentHistory: 0.25,
    salesRegularity: 0.20,
    groupTenureStability: 0.10,
    ledgerCompleteness: 0.10,
  },
  statutoryMaxInterestRate: 15.0,
  tiers: {
    A: { minScore: 80, maxInterestRate: 12.0, label: "Prime (Tier A)", maxTenorMonths: 6 },
    B: { minScore: 65, maxInterestRate: 14.0, label: "Standard (Tier B)", maxTenorMonths: 4 },
    C: { minScore: 50, maxInterestRate: 15.0, label: "Watch / Co-guaranteed (Tier C)", maxTenorMonths: 3 },
    D: { minScore: 0,  maxInterestRate: 15.0, label: "Uncalibrated / High Risk (Tier D)", maxTenorMonths: 0 },
  },
  heuristicDisclaimer:
    "Heuristic Model v0: This transparent score is computed from historical Osusu cycles, buyer-verified sales, and ledger consistency. It will be calibrated with real repayment data during the pilot.",
};

export interface GroupScoreInput {
  contributionConsistency: number; // 0 - 100
  repaymentHistory: number;         // 0 - 100
  salesRegularity: number;          // 0 - 100
  groupTenureStability: number;     // 0 - 100
  ledgerCompleteness: number;       // 0 - 100
}

export interface ScoreBreakdownItem {
  name: string;
  weightPct: number;
  rawScore: number;
  weightedPoints: number;
  explainer: string;
}

export interface GroupScoreResult {
  totalScore: number;
  tier: "A" | "B" | "C" | "D";
  tierLabel: string;
  maxInterestRate: number;
  maxTenorMonths: number;
  breakdown: ScoreBreakdownItem[];
  disclaimer: string;
}

/**
 * Calculates deterministic 0-100 group credit score from the 5 pillars.
 */
export function calculateGroupScore(input: GroupScoreInput): GroupScoreResult {
  const clamp = (val: number) => Math.max(0, Math.min(100, val));

  const c = clamp(input.contributionConsistency);
  const r = clamp(input.repaymentHistory);
  const s = clamp(input.salesRegularity);
  const t = clamp(input.groupTenureStability);
  const l = clamp(input.ledgerCompleteness);

  const w = SCORING_CONFIG.weights;

  const cPts = Number((c * w.contributionConsistency).toFixed(1));
  const rPts = Number((r * w.repaymentHistory).toFixed(1));
  const sPts = Number((s * w.salesRegularity).toFixed(1));
  const tPts = Number((t * w.groupTenureStability).toFixed(1));
  const lPts = Number((l * w.ledgerCompleteness).toFixed(1));

  const totalScore = Number((cPts + rPts + sPts + tPts + lPts).toFixed(1));

  let tier: "A" | "B" | "C" | "D" = "D";
  if (totalScore >= SCORING_CONFIG.tiers.A.minScore) tier = "A";
  else if (totalScore >= SCORING_CONFIG.tiers.B.minScore) tier = "B";
  else if (totalScore >= SCORING_CONFIG.tiers.C.minScore) tier = "C";

  const tierMeta = SCORING_CONFIG.tiers[tier];

  const breakdown: ScoreBreakdownItem[] = [
    {
      name: "Contribution Consistency",
      weightPct: w.contributionConsistency * 100,
      rawScore: c,
      weightedPoints: cPts,
      explainer: `On-time contribution rate over last 6 cycles (${c}% on-time).`,
    },
    {
      name: "Repayment History",
      weightPct: w.repaymentHistory * 100,
      rawScore: r,
      weightedPoints: rPts,
      explainer: `Settlement record for past inputs and group pot advances (${r}% settled on time).`,
    },
    {
      name: "Buyer-Verified Sales",
      weightPct: w.salesRegularity * 100,
      rawScore: s,
      weightedPoints: sPts,
      explainer: `Aggregated sales receipts from certified grain and cocoa buyers (${s}% consistency).`,
    },
    {
      name: "Group Tenure & Size Stability",
      weightPct: w.groupTenureStability * 100,
      rawScore: t,
      weightedPoints: tPts,
      explainer: `Group operational lifespan and member retention rate (${t}/100 stability score).`,
    },
    {
      name: "Ledger Completeness",
      weightPct: w.ledgerCompleteness * 100,
      rawScore: l,
      weightedPoints: lPts,
      explainer: `Average farm entries logged per member monthly via USSD and voice (${l}% target met).`,
    },
  ];

  return {
    totalScore,
    tier,
    tierLabel: tierMeta.label,
    maxInterestRate: tierMeta.maxInterestRate,
    maxTenorMonths: tierMeta.maxTenorMonths,
    breakdown,
    disclaimer: SCORING_CONFIG.heuristicDisclaimer,
  };
}

export interface LoanLimitResult {
  recommendedLimit: number;
  maxBorrowingCapacity: number;
  interestRatePct: number;
  tenorMonths: number;
  isEligible: boolean;
  explainer: string;
}

/**
 * Recommended loan limit = f(score, avg seasonal net income, group savings pool)
 */
export function calculateRecommendedLoanLimit(
  score: number,
  avgSeasonalNetIncome: number,
  groupSavingsPool: number
): LoanLimitResult {
  if (score < SCORING_CONFIG.tiers.C.minScore) {
    return {
      recommendedLimit: 0,
      maxBorrowingCapacity: 0,
      interestRatePct: 0,
      tenorMonths: 0,
      isEligible: false,
      explainer: "Group score is below 50.0 (Tier C). At least 3 months of consistent records needed.",
    };
  }

  const scoreMultiplier = score / 100;
  // Maximum 40% seasonal debt-to-income capacity
  const incomeCapacity = avgSeasonalNetIncome * 0.40 * scoreMultiplier;
  // Leverage up to 35% of group rotating savings pool
  const poolLeverage = groupSavingsPool * 0.35 * scoreMultiplier;

  const rawLimit = Math.round(incomeCapacity + poolLeverage);
  const recommendedLimit = Math.max(250, rawLimit);
  const maxCapacity = Math.round(recommendedLimit * 1.25);

  // Interest rate inversely proportional to score, strictly bounded within 11.5% - 15.0% ceiling
  let interestRate = 15.0 - (score - 65) * 0.15;
  interestRate = Math.min(15.0, Math.max(11.5, Math.round(interestRate * 10) / 10));

  const tenorMonths = score >= SCORING_CONFIG.tiers.A.minScore ? 6 : 4;

  return {
    recommendedLimit,
    maxBorrowingCapacity: maxCapacity,
    interestRatePct: interestRate,
    tenorMonths,
    isEligible: true,
    explainer: `Limit of SLE ${recommendedLimit.toLocaleString()} determined by 40% seasonal income (SLE ${Math.round(
      incomeCapacity
    ).toLocaleString()}) + 35% Osusu savings leverage (SLE ${Math.round(
      poolLeverage
    ).toLocaleString()}) multiplied by score index (${scoreMultiplier.toFixed(2)}).`,
  };
}
