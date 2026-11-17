import { NextRequest, NextResponse } from "next/server";
import { query, executeDoubleEntry, emitEvent } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const auth = verifyToken(token);

    const body = await req.json();
    const loanId = body.loanId;
    if (!loanId) {
      return NextResponse.json({ error: "Missing loanId" }, { status: 400 });
    }

    // Lookup loan
    const loanRes = await query("SELECT * FROM loans WHERE id = $1", [loanId]);
    if (loanRes.rows.length === 0) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }
    const loan = loanRes.rows[0];

    // Update loan status to ACTIVE
    await query("UPDATE loans SET status = 'ACTIVE' WHERE id = $1", [loanId]);

    const principal = parseFloat(loan.principal_amount_sle);

    // Double-entry CREDIT into farmer wallet
    const doubleEntryResult = await executeDoubleEntry({
      userId: loan.farmer_id,
      amountSLE: principal,
      entryType: "CREDIT",
      category: loan.purpose.includes("Advance") ? "POT_ADVANCE" : "HARVEST_PAYOUT",
      counterparty: loan.lender_name,
      description: `Disbursal of loan facility: ${loan.purpose}`,
    });

    // Send SMS to farmer
    const uRes = await query("SELECT phone FROM users WHERE id = $1", [loan.farmer_id]);
    const phone = uRes.rows[0]?.phone || "+23276123456";
    const smsMsg = `Fambul Fund: Loan facility of SLE ***.00 approved by ${loan.lender_name}! Credited to wallet via Orange Money. Ref: DISB-${Math.floor(
      Math.random() * 9000 + 1000
    )}.`;

    await query("INSERT INTO sms_logs (id, recipient, message, category) VALUES ($1, $2, $3, $4)", [
      `sms-${Date.now()}`,
      phone,
      smsMsg,
      "LOAN_DISBURSAL",
    ]);

    const eventName = loan.purpose.includes("Advance") ? "advance.approved" : "loan.approved";
    await emitEvent(eventName, "ALL", {
      loanId,
      farmerId: loan.farmer_id,
      farmerName: loan.farmer_name,
      principalAmountSLE: principal,
      newAvailableBalanceSLE: doubleEntryResult.availableBalanceSLE,
    });

    await emitEvent("sms.sent", loan.farmer_id, {
      recipient: phone,
      message: smsMsg,
      category: "LOAN_DISBURSAL",
    });

    return NextResponse.json({
      success: true,
      loanId,
      status: "ACTIVE",
      disbursedAmountSLE: principal,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
