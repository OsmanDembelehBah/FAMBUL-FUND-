import { NextRequest, NextResponse } from "next/server";
import { query, emitEvent } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const auth = verifyToken(token);

    const body = await req.json();
    const userId = body.userId || auth?.userId || "usr-farmer-01";
    const amountSLE = parseFloat(body.amountSLE || "600");
    const isAdvance = body.isAdvance || false;

    const uRes = await query("SELECT name, phone FROM users WHERE id = $1", [userId]);
    const farmerName = uRes.rows[0]?.name || "Aminata Kamara";

    const id = `ln-${isAdvance ? "adv-" : ""}${Date.now()}`;
    const feePct = isAdvance ? 2.0 : 12.0; // Strictly within 15% statutory ceiling
    const totalRepayable = amountSLE + Math.round((amountSLE * (feePct / 100)) * 100) / 100;
    const purpose = isAdvance ? "Pot Advance Bridge" : (body.purpose || "Seed & Fertilizer");

    await query(
      `INSERT INTO loans 
      (id, lender_id, lender_name, group_id, farmer_id, farmer_name, principal_amount_sle, interest_rate_pct, total_repayable_sle, repaid_amount_sle, status, repayment_at_source, purpose, disbursed_at, due_date)
      VALUES ($1, 'usr-lender-01', 'Partner Rural Development Bank', 'grp-01', $2, $3, $4, $5, $6, 0.00, $7, true, $8, NOW(), NOW() + INTERVAL '60 days')`,
      [id, userId, farmerName, amountSLE, feePct, totalRepayable, isAdvance ? "PENDING" : "PENDING", purpose]
    );

    const eventName = isAdvance ? "advance.requested" : "loan.requested";
    await emitEvent(eventName, "ALL", {
      loanId: id,
      farmerId: userId,
      farmerName,
      principalAmountSLE: amountSLE,
      totalRepayableSLE: totalRepayable,
      purpose,
      isAdvance,
    });

    return NextResponse.json({
      success: true,
      loan: {
        id,
        farmerName,
        principalAmountSLE: amountSLE,
        totalRepayableSLE: totalRepayable,
        status: "PENDING",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
