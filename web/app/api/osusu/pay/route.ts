import { NextRequest, NextResponse } from "next/server";
import { query, executeDoubleEntry, recalculateGroupScore, emitEvent } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const auth = verifyToken(token);

    const body = await req.json();
    const userId = body.userId || auth?.userId || "usr-farmer-01";
    const amountSLE = parseFloat(body.amountSLE || "100");
    const groupId = body.groupId || "grp-01";

    // 1. Double-entry debit from wallet
    const doubleEntryResult = await executeDoubleEntry({
      userId,
      amountSLE,
      entryType: "DEBIT",
      category: "OSUSU_CONTRIBUTION",
      counterparty: "Gbo-Kakua Osusu",
      description: `Weekly Osusu contribution of SLE ${amountSLE.toFixed(2)}`,
    });

    // 2. Update group pool
    await query(
      "UPDATE osusu_groups SET total_pool_saved_sle = total_pool_saved_sle + $1 WHERE id = $2",
      [amountSLE, groupId]
    );

    // 3. Recalculate score live
    const scoreResult = await recalculateGroupScore(groupId);

    // 4. Send SMS
    const uRes = await query("SELECT phone, name FROM users WHERE id = $1", [userId]);
    const phone = uRes.rows[0]?.phone || "+23276123456";
    const smsMsg = `Fambul Fund: Contribution of SLE ***.00 paid to Gbo-Kakua Osusu. New bal: SLE ***.00. Ref: OSU-${Math.floor(
      Math.random() * 9000 + 1000
    )}.`;
    await query("INSERT INTO sms_logs (id, recipient, message, category) VALUES ($1, $2, $3, $4)", [
      `sms-${Date.now()}`,
      phone,
      smsMsg,
      "OSUSU_CONTRIBUTION",
    ]);

    await emitEvent("contribution.paid", "ALL", {
      userId,
      memberName: uRes.rows[0]?.name || "Aminata Kamara",
      amountSLE,
      groupId,
      newAvailableBalanceSLE: doubleEntryResult.availableBalanceSLE,
      newGroupScore: scoreResult?.creditScore,
    });

    await emitEvent("sms.sent", userId, {
      recipient: phone,
      message: smsMsg,
      category: "OSUSU_CONTRIBUTION",
    });

    return NextResponse.json({
      success: true,
      availableBalanceSLE: doubleEntryResult.availableBalanceSLE,
      newGroupScore: scoreResult?.creditScore,
      tier: scoreResult?.tier,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
