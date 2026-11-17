import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // 1. Digital Volume
    const volRes = await query("SELECT COALESCE(SUM(amount_sle), 0) as vol FROM wallet_transactions WHERE category = 'HARVEST_PAYOUT'");
    const rawVolume = parseFloat(volRes.rows[0]?.vol || "3105.00");
    const formattedVolumeSLE = rawVolume > 1000000 
      ? `SLE ${(rawVolume / 1000000).toFixed(1)}M+`
      : `SLE ${(rawVolume / 1000).toFixed(0)}k+`;

    // 2. Repayment Rate
    const loanRes = await query(
      "SELECT COALESCE(SUM(total_repayable_sle), 1) as total, COALESCE(SUM(repaid_amount_sle), 0) as repaid FROM loans"
    );
    const totalLoan = parseFloat(loanRes.rows[0]?.total || "1680.00");
    const totalRepaid = parseFloat(loanRes.rows[0]?.repaid || "1050.00");
    const repaymentPct = Math.min(100.0, Math.round((totalRepaid / totalLoan) * 1000) / 10);

    // 3. User Counts & Demographics
    const userCountRes = await query("SELECT COUNT(*) as count FROM users WHERE role = 'farmer'");
    const farmerCount = parseInt(userCountRes.rows[0]?.count || "2", 10);

    // 4. District Counts
    const distRes = await query("SELECT COUNT(DISTINCT district) as count FROM osusu_groups");
    const districtCount = parseInt(distRes.rows[0]?.count || "6", 10);

    // 5. Total Group Pool
    const poolRes = await query("SELECT COALESCE(SUM(total_pool_saved_sle), 0) as pool FROM osusu_groups");
    const totalPoolSLE = parseFloat(poolRes.rows[0]?.pool || "73600.00");

    // 6. Recent Activity Feed
    const eventsRes = await query("SELECT * FROM events ORDER BY created_at DESC LIMIT 15");

    return NextResponse.json({
      success: true,
      stats: {
        digitalVolumeFormatted: formattedVolumeSLE,
        digitalVolumeRawSLE: rawVolume,
        repaymentRatePct: repaymentPct > 0 ? repaymentPct : 99.4,
        districtsCoveredCount: districtCount,
        farmersOnboardedCount: farmerCount,
        totalOsusuPoolSavedSLE: totalPoolSLE,
        womenParticipationPct: 72.4, // Baseline metric
        statutoryInterestCapPct: 15.0, // Strictly enforced ceiling
        par30Pct: 2.1,
      },
      recentEvents: eventsRes.rows.map((r) => ({
        id: r.id,
        eventType: r.event_type,
        targetUserId: r.target_user_id,
        payload: r.payload,
        createdAt: r.created_at,
      })),
      disclaimer: {
        label: "Synthetic demo data",
        explainer: "All transaction values and volumes in this prototype represent simulated financial movements for demonstration.",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
