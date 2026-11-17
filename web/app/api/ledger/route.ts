import { NextRequest, NextResponse } from "next/server";
import { query, emitEvent, recalculateGroupScore } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const auth = verifyToken(token);

    const userId = auth?.userId;
    let res;
    if (userId && auth?.role === "farmer") {
      res = await query("SELECT * FROM ledger_entries WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
    } else {
      res = await query("SELECT * FROM ledger_entries ORDER BY created_at DESC LIMIT 50");
    }

    return NextResponse.json({
      success: true,
      entries: res.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        farmerName: r.farmer_name,
        crop: r.crop,
        entryType: r.entry_type,
        quantity: parseFloat(r.quantity),
        unit: r.unit,
        amountSLE: parseFloat(r.amount_sle),
        source: r.source,
        location: r.location,
        verifiedByBuyer: r.verified_by_buyer,
        confirmedByFarmer: r.confirmed_by_farmer,
        rawVoiceNote: r.raw_voice_note,
        createdAt: r.created_at,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const auth = verifyToken(token);

    const body = await req.json();
    const userId = body.userId || auth?.userId || "usr-farmer-01";

    // Lookup user name
    const uRes = await query("SELECT name FROM users WHERE id = $1", [userId]);
    const farmerName = uRes.rows[0]?.name || "Aminata Kamara";

    const id = `led-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const crop = body.crop || "Rice";
    const entryType = body.entryType || "sale";
    const quantity = parseFloat(body.quantity || "1");
    const unit = body.unit || "bags";
    const amountSLE = parseFloat(body.amountSLE || "0");
    const source = body.source || "voice";
    const location = body.location || "Bo";
    const rawVoiceNote = body.rawVoiceNote || "";

    const insertRes = await query(
      `INSERT INTO ledger_entries 
      (id, user_id, farmer_name, crop, entry_type, quantity, unit, amount_sle, source, location, verified_by_buyer, confirmed_by_farmer, raw_voice_note)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, true, $11)
      RETURNING *`,
      [id, userId, farmerName, crop, entryType, quantity, unit, amountSLE, source, location, rawVoiceNote]
    );

    const newEntry = insertRes.rows[0];

    // Emit live event
    await emitEvent("ledger.created", "ALL", {
      entry: {
        id: newEntry.id,
        userId: newEntry.user_id,
        farmerName: newEntry.farmer_name,
        crop: newEntry.crop,
        entryType: newEntry.entry_type,
        quantity: parseFloat(newEntry.quantity),
        unit: newEntry.unit,
        amountSLE: parseFloat(newEntry.amount_sle),
        source: newEntry.source,
        location: newEntry.location,
        createdAt: newEntry.created_at,
      },
    });

    // Recalculate score live from real DB
    const scoreResult = await recalculateGroupScore("grp-01");

    return NextResponse.json({
      success: true,
      entry: newEntry,
      newGroupScore: scoreResult?.creditScore,
      tier: scoreResult?.tier,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
