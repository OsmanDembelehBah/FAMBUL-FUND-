import { NextRequest, NextResponse } from "next/server";
import { query, executeDoubleEntry, calculateResponsibleSplit, recalculateGroupScore, emitEvent } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lineId = body.lineId;
    if (!lineId) {
      return NextResponse.json({ error: "Missing lineId" }, { status: 400 });
    }

    const res = await query("SELECT * FROM payout_lines WHERE id = $1", [lineId]);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Line not found" }, { status: 404 });
    }
    const line = res.rows[0];

    if (line.status === "SETTLED") {
      return NextResponse.json({
        success: true,
        message: "Line already settled (idempotent)",
        line,
      });
    }

    const gross = parseFloat(line.gross_amount_sle);
    const loan = parseFloat(line.loan_repayment_sle);
    const osusu = parseFloat(line.osusu_contribution_sle);

    const split = calculateResponsibleSplit(gross, loan, osusu, 0.40);
    const txRef = `AFRI-SL-RETRY-${Math.floor(Math.random() * 900000 + 100000)}`;

    // Double-entry execution
    await executeDoubleEntry({
      userId: line.farmer_id,
      amountSLE: split.grossAmountSLE,
      entryType: "CREDIT",
      category: "HARVEST_PAYOUT",
      counterparty: "Rokel River Grain Aggregators Ltd",
      description: `Harvest delivery settlement (Retry): ${line.quantity_kg}kg ${line.crop}`,
      idempotencyKey: `retry-${line.id}-${line.retry_count + 1}`,
    });

    if (split.loanRepaymentSLE > 0) {
      await executeDoubleEntry({
        userId: line.farmer_id,
        amountSLE: split.loanRepaymentSLE,
        entryType: "DEBIT",
        category: "LOAN_REPAYMENT",
        counterparty: "Partner Rural Development Bank",
        description: `Repayment-at-source harvest deduction (Capped at 40%)`,
        idempotencyKey: `retry-loan-${line.id}-${line.retry_count + 1}`,
      });

      await query(
        `UPDATE loans 
        SET repaid_amount_sle = LEAST(total_repayable_sle, repaid_amount_sle + $1)
        WHERE farmer_id = $2 AND status = 'ACTIVE'`,
        [split.loanRepaymentSLE, line.farmer_id]
      );
    }

    // Update line in DB
    await query(
      `UPDATE payout_lines 
      SET status = 'SETTLED', failure_reason = NULL, tx_reference = $1, retry_count = retry_count + 1
      WHERE id = $2`,
      [txRef, lineId]
    );

    const smsMsg = `Fambul Fund: Retry successful! Harvest payout of SLE ***.00 deposited to Afrimoney wallet. Ref: ${txRef}`;
    await query("INSERT INTO sms_logs (id, recipient, message, category) VALUES ($1, $2, $3, $4)", [
      `sms-${Date.now()}`,
      line.phone_number,
      smsMsg,
      "HARVEST_PAYOUT",
    ]);

    await emitEvent("payout.line.settled", "ALL", {
      lineId,
      farmerId: line.farmer_id,
      farmerName: line.farmer_name,
      grossSLE: split.grossAmountSLE,
      loanDeductionSLE: split.loanRepaymentSLE,
      osusuDeductionSLE: split.osusuContributionSLE,
      feeSLE: split.platformFeeSLE,
      netSLE: split.netPayoutSLE,
      txReference: txRef,
      isRetry: true,
    });

    await emitEvent("sms.sent", line.farmer_id, {
      recipient: line.phone_number,
      message: smsMsg,
      category: "HARVEST_PAYOUT",
    });

    await recalculateGroupScore("grp-01");

    return NextResponse.json({
      success: true,
      lineId,
      status: "SETTLED",
      txReference: txRef,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
