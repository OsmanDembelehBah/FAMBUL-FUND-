import { NextRequest, NextResponse } from "next/server";
import { query, executeDoubleEntry, calculateResponsibleSplit, recalculateGroupScore, emitEvent } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const batchId = body.batchId || "batch-01";
    const customLines = body.lines; // optional weighbridge lines override

    // 1. Fetch batch lines from DB or use provided weighbridge lines
    let lines: any[] = [];
    if (customLines && Array.isArray(customLines) && customLines.length > 0) {
      lines = customLines;
    } else {
      const res = await query("SELECT * FROM payout_lines WHERE batch_id = $1 ORDER BY id", [batchId]);
      lines = res.rows.map((r) => ({
        id: r.id,
        batchId: r.batch_id,
        farmerId: r.farmer_id,
        farmerName: r.farmer_name,
        phoneNumber: r.phone_number,
        crop: r.crop,
        quantityKg: parseFloat(r.quantity_kg),
        pricePerKg: parseFloat(r.price_per_kg),
        grossAmountSLE: parseFloat(r.gross_amount_sle),
        loanRepaymentSLE: parseFloat(r.loan_repayment_sle),
        osusuContributionSLE: parseFloat(r.osusu_contribution_sle),
        platformFeeSLE: parseFloat(r.platform_fee_sle),
        netPayoutSLE: parseFloat(r.net_payout_sle),
        provider: r.provider,
        status: r.status,
      }));
    }

    // 2. Emit payout.initiated
    await emitEvent("payout.initiated", "ALL", {
      batchId,
      lineCount: lines.length,
      totalGrossSLE: lines.reduce((acc, l) => acc + l.grossAmountSLE, 0),
    });

    const settledLines: any[] = [];

    // 3. Process lines in sequence with live status transitions
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Emit processing event
      await emitEvent("payout.line.processing", "ALL", {
        lineId: line.id,
        farmerId: line.farmerId,
        farmerName: line.farmerName,
        index: i,
        status: "PROCESSING",
      });

      // Deliberately simulate 1 retryable failure on row 2 if it's PENDING
      if (i === 1 && line.status === "PENDING" && !body.isRetry) {
        await query(
          "UPDATE payout_lines SET status = 'FAILED', failure_reason = $1 WHERE id = $2",
          ["Subscriber wallet temporarily inactive (retryable network timeout)", line.id]
        );
        line.status = "FAILED";
        line.failureReason = "Subscriber wallet temporarily inactive (retryable network timeout)";

        await emitEvent("payout.line.failed", "ALL", {
          lineId: line.id,
          farmerId: line.farmerId,
          farmerName: line.farmerName,
          reason: line.failureReason,
        });

        settledLines.push(line);
        continue;
      }

      // Calculate Responsible Split with 40% cap guard
      const split = calculateResponsibleSplit(
        line.grossAmountSLE,
        line.loanRepaymentSLE,
        line.osusuContributionSLE,
        0.40 // 40% Responsible Finance Cap
      );

      const txRef = `${line.provider === "Orange Money" ? "OM-SL" : "AFRI-SL"}-${Math.floor(
        Math.random() * 900000 + 100000
      )}`;

      // Double-entry Wallet Operations for farmer
      // A. Credit Gross Payout
      await executeDoubleEntry({
        userId: line.farmerId,
        amountSLE: split.grossAmountSLE,
        entryType: "CREDIT",
        category: "HARVEST_PAYOUT",
        counterparty: "Rokel River Grain Aggregators Ltd",
        description: `Harvest delivery settlement: ${line.quantityKg}kg ${line.crop}`,
      });

      // B. Debit Loan Repayment if > 0
      if (split.loanRepaymentSLE > 0) {
        await executeDoubleEntry({
          userId: line.farmerId,
          amountSLE: split.loanRepaymentSLE,
          entryType: "DEBIT",
          category: "LOAN_REPAYMENT",
          counterparty: "Partner Rural Development Bank",
          description: `Repayment-at-source harvest deduction (Capped at 40%)`,
        });

        // Update active loan in DB
        await query(
          `UPDATE loans 
          SET repaid_amount_sle = LEAST(total_repayable_sle, repaid_amount_sle + $1),
              status = CASE WHEN repaid_amount_sle + $1 >= total_repayable_sle THEN 'REPAID' ELSE 'ACTIVE' END
          WHERE farmer_id = $2 AND status = 'ACTIVE'`,
          [split.loanRepaymentSLE, line.farmerId]
        );

        // Emit lender repayment event
        await emitEvent("repayment.deducted", "ALL", {
          farmerId: line.farmerId,
          farmerName: line.farmerName,
          repaymentSLE: split.loanRepaymentSLE,
          lenderName: "Partner Rural Development Bank",
          capApplied: split.repaymentCapApplied,
        });
      }

      // C. Debit Osusu Contribution if > 0
      if (split.osusuContributionSLE > 0) {
        await executeDoubleEntry({
          userId: line.farmerId,
          amountSLE: split.osusuContributionSLE,
          entryType: "DEBIT",
          category: "OSUSU_CONTRIBUTION",
          counterparty: "Gbo-Kakua Osusu",
          description: `Automatic Osusu cycle savings deducted at source`,
        });

        await query(
          "UPDATE osusu_groups SET total_pool_saved_sle = total_pool_saved_sle + $1 WHERE id = 'grp-01'",
          [split.osusuContributionSLE]
        );
      }

      // D. Debit 1% Platform Fee
      if (split.platformFeeSLE > 0) {
        await executeDoubleEntry({
          userId: line.farmerId,
          amountSLE: split.platformFeeSLE,
          entryType: "DEBIT",
          category: "FEE_DEDUCTION",
          counterparty: "Monime Clearing Rail",
          description: `1.0% telecom clearing & platform processing fee`,
        });
      }

      // Update payout_line in DB
      await query(
        `UPDATE payout_lines 
        SET status = 'SETTLED', tx_reference = $1, loan_repayment_sle = $2, osusu_contribution_sle = $3, platform_fee_sle = $4, net_payout_sle = $5
        WHERE id = $6`,
        [txRef, split.loanRepaymentSLE, split.osusuContributionSLE, split.platformFeeSLE, split.netPayoutSLE, line.id]
      );

      // Send SMS
      const smsMsg = `Fambul Fund: Harvest payout received! Gross: SLE ***. Loan auto-repaid: SLE ***. Net deposited to wallet: SLE ***. Ref: ${txRef}`;
      await query("INSERT INTO sms_logs (id, recipient, message, category) VALUES ($1, $2, $3, $4)", [
        `sms-${Date.now()}-${i}`,
        line.phoneNumber,
        smsMsg,
        "HARVEST_PAYOUT",
      ]);

      // Emit settled line & SMS events
      await emitEvent("payout.line.settled", "ALL", {
        lineId: line.id,
        farmerId: line.farmerId,
        farmerName: line.farmerName,
        grossSLE: split.grossAmountSLE,
        loanDeductionSLE: split.loanRepaymentSLE,
        osusuDeductionSLE: split.osusuContributionSLE,
        feeSLE: split.platformFeeSLE,
        netSLE: split.netPayoutSLE,
        txReference: txRef,
        repaymentCapApplied: split.repaymentCapApplied,
        capExplainer: split.capRuleExplainer,
      });

      await emitEvent("sms.sent", line.farmerId, {
        recipient: line.phoneNumber,
        message: smsMsg,
        category: "HARVEST_PAYOUT",
      });

      settledLines.push({
        ...line,
        status: "SETTLED",
        txReference: txRef,
        loanRepaymentSLE: split.loanRepaymentSLE,
        osusuContributionSLE: split.osusuContributionSLE,
        platformFeeSLE: split.platformFeeSLE,
        netPayoutSLE: split.netPayoutSLE,
        repaymentCapApplied: split.repaymentCapApplied,
      });
    }

    // 4. Update batch and recalculate group score
    await query("UPDATE payout_batches SET status = 'SETTLED' WHERE id = $1", [batchId]);
    const scoreRes = await recalculateGroupScore("grp-01");

    return NextResponse.json({
      success: true,
      batchId,
      lines: settledLines,
      newGroupScore: scoreRes?.creditScore,
      tier: scoreRes?.tier,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
