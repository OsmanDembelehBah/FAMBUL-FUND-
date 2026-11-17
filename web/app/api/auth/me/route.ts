import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");

    const auth = verifyToken(token);
    const userId = auth ? auth.userId : "usr-farmer-01"; // Default fallback to Aminata

    // Fetch user details
    const userRes = await query("SELECT * FROM users WHERE id = $1", [userId]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const user = userRes.rows[0];

    // Fetch wallet & envelopes
    const walletRes = await query("SELECT * FROM wallets WHERE user_id = $1", [userId]);
    let wallet = walletRes.rows[0];
    let envelopes: any[] = [];
    if (wallet) {
      const envRes = await query("SELECT * FROM wallet_envelopes WHERE wallet_id = $1", [wallet.id]);
      envelopes = envRes.rows;
    }

    // Fetch Osusu Group & Members
    const groupMemberRes = await query(
      `SELECT gm.*, g.name as group_name, g.credit_score, g.tier, g.cycle_number, g.target_pot_sle, g.total_pool_saved_sle
      FROM group_members gm
      JOIN osusu_groups g ON gm.group_id = g.id
      WHERE gm.user_id = $1`,
      [userId]
    );

    // Fetch Loans
    const loansRes = await query(
      "SELECT * FROM loans WHERE farmer_id = $1 OR lender_id = $1 ORDER BY disbursed_at DESC",
      [userId]
    );

    // Fetch Recent Activity
    const txRes = await query(
      "SELECT * FROM wallet_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
      [userId]
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        phone: user.phone,
        email: user.email,
        district: user.district,
        village: user.village,
        language: user.language,
      },
      wallet: wallet
        ? {
            id: wallet.id,
            availableBalanceSLE: parseFloat(wallet.available_balance_sle),
            lockedEnvelopesBalanceSLE: parseFloat(wallet.locked_envelopes_balance_sle),
            envelopes: envelopes.map((e) => ({
              id: e.id,
              name: e.name,
              allocationPct: parseFloat(e.allocation_pct),
              balanceSLE: parseFloat(e.balance_sle),
              targetSLE: parseFloat(e.target_sle),
            })),
          }
        : null,
      group: groupMemberRes.rows[0]
        ? {
            id: groupMemberRes.rows[0].group_id,
            name: groupMemberRes.rows[0].group_name,
            creditScore: parseFloat(groupMemberRes.rows[0].credit_score),
            tier: groupMemberRes.rows[0].tier,
            cycleNumber: groupMemberRes.rows[0].cycle_number,
            targetPotSLE: parseFloat(groupMemberRes.rows[0].target_pot_sle),
            totalPoolSavedSLE: parseFloat(groupMemberRes.rows[0].total_pool_saved_sle),
            memberNumber: groupMemberRes.rows[0].member_number,
            turnDate: groupMemberRes.rows[0].turn_date,
            turnOrder: groupMemberRes.rows[0].pot_turn_order,
          }
        : null,
      loans: loansRes.rows.map((l) => ({
        id: l.id,
        lenderName: l.lender_name,
        farmerName: l.farmer_name,
        principalAmountSLE: parseFloat(l.principal_amount_sle),
        interestRatePct: parseFloat(l.interest_rate_pct),
        totalRepayableSLE: parseFloat(l.total_repayable_sle),
        repaidAmountSLE: parseFloat(l.repaid_amount_sle),
        status: l.status,
        purpose: l.purpose,
        repaymentAtSource: l.repayment_at_source,
      })),
      recentTransactions: txRes.rows,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
