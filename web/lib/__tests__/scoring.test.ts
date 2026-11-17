import { describe, it, expect } from "vitest";
import {
  SCORING_CONFIG,
  calculateGroupScore,
  calculateRecommendedLoanLimit,
} from "../scoring.config";

describe("Transparent Scoring Config & Model (v0)", () => {
  it("weights sum up to exactly 1.0 (100%)", () => {
    const weights = SCORING_CONFIG.weights;
    const sum =
      weights.contributionConsistency +
      weights.repaymentHistory +
      weights.salesRegularity +
      weights.groupTenureStability +
      weights.ledgerCompleteness;
    expect(Number(sum.toFixed(4))).toBe(1.0);
    expect(weights.contributionConsistency).toBe(0.35);
    expect(weights.repaymentHistory).toBe(0.25);
    expect(weights.salesRegularity).toBe(0.20);
    expect(weights.groupTenureStability).toBe(0.10);
    expect(weights.ledgerCompleteness).toBe(0.10);
  });

  it("calculates high tier (Tier A) score accurately", () => {
    const result = calculateGroupScore({
      contributionConsistency: 95,
      repaymentHistory: 90,
      salesRegularity: 85,
      groupTenureStability: 80,
      ledgerCompleteness: 80,
    });

    // 95*0.35 (33.25) + 90*0.25 (22.5) + 85*0.20 (17.0) + 80*0.10 (8.0) + 80*0.10 (8.0) = 88.75 -> 88.8
    expect(result.totalScore).toBe(88.8);
    expect(result.tier).toBe("A");
    expect(result.breakdown).toHaveLength(5);
    expect(result.maxInterestRate).toBeLessThanOrEqual(15.0);
    expect(result.disclaimer).toContain("Heuristic Model v0");
  });

  it("assigns Tier D to underperforming groups", () => {
    const result = calculateGroupScore({
      contributionConsistency: 35,
      repaymentHistory: 30,
      salesRegularity: 40,
      groupTenureStability: 30,
      ledgerCompleteness: 20,
    });

    expect(result.totalScore).toBeLessThan(50);
    expect(result.tier).toBe("D");
  });

  it("derives recommended loan limit and caps interest rate at 15%", () => {
    // Prime group with score 88.8
    const loan = calculateRecommendedLoanLimit(88.8, 6000, 3000);
    expect(loan.isEligible).toBe(true);
    expect(loan.recommendedLimit).toBeGreaterThan(1500);
    expect(loan.interestRatePct).toBeLessThanOrEqual(15.0);
    expect(loan.interestRatePct).toBeGreaterThanOrEqual(11.5);
    expect(loan.tenorMonths).toBe(6);

    // Ineligible group
    const ineligible = calculateRecommendedLoanLimit(42.0, 5000, 1500);
    expect(ineligible.isEligible).toBe(false);
    expect(ineligible.recommendedLimit).toBe(0);
  });
});

describe("Responsible Finance 4-Way Payout Split & Guardrails", () => {
  it("enforces exact 4-way split invariant: gross == fee + loan + osusu + net", async () => {
    const { calculateResponsibleSplit } = await import("../db");
    
    // Test case 1: Standard harvest sale
    const split1 = calculateResponsibleSplit(4500, 900, 450);
    expect(split1.platformFeeSLE).toBe(45); // 1%
    expect(split1.loanRepaymentSLE).toBe(900);
    expect(split1.osusuContributionSLE).toBe(450);
    expect(split1.netPayoutSLE).toBe(3105);
    const sum1 = split1.platformFeeSLE + split1.loanRepaymentSLE + split1.osusuContributionSLE + split1.netPayoutSLE;
    expect(sum1).toBe(4500);
    expect(split1.repaymentCapApplied).toBe(false);

    // Test case 2: Heavy debt triggering 40% responsible finance cap
    const split2 = calculateResponsibleSplit(1000, 800, 100);
    // 40% cap of 1000 = 400 max loan deduction
    expect(split2.loanRepaymentSLE).toBe(400);
    expect(split2.repaymentCapApplied).toBe(true);
    expect(split2.capRuleExplainer).toContain("Responsible finance guard applied");
    const sum2 = split2.platformFeeSLE + split2.loanRepaymentSLE + split2.osusuContributionSLE + split2.netPayoutSLE;
    expect(sum2).toBe(1000);
    expect(split2.netPayoutSLE).toBeGreaterThan(0);
  });

  it("handles resilient database query fallback without crashing", async () => {
    const { query } = await import("../db");
    const res = await query("SELECT * FROM users WHERE id = $1", ["usr-farmer-01"]);
    expect(res.rows).toHaveLength(1);
    expect(res.rows[0].name).toBe("Aminata Kamara");
    expect(res.rows[0].role).toBe("farmer");
  });
});
