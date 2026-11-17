import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { lines } = await req.json();
    if (!Array.isArray(lines)) {
      return NextResponse.json({ error: "Invalid lines array" }, { status: 400 });
    }

    const processed = lines.map((line: any, idx: number) => {
      const gross = Number(line.grossAmountSLE) || 0;
      const loanDue = Number(line.loanRepaymentSLE) || 0;
      const osusuDue = Number(line.osusuContributionSLE) || 0;

      // 1. 1% platform fee
      const fee = Math.round(gross * 0.01 * 100) / 100;
      let avail = gross - fee;

      // 2. Loan repayment
      const repay = Math.min(loanDue, Math.max(0, avail));
      avail -= repay;

      // 3. Osusu contribution
      const osusu = Math.min(osusuDue, Math.max(0, avail));
      avail -= osusu;

      // 4. Net farmer payout
      const net = Math.max(0, Math.round(avail * 100) / 100);

      // Simulate failure on row 2 if requested
      if (idx === 1 && line.status === "PENDING") {
        return {
          ...line,
          platformFeeSLE: fee,
          loanRepaymentSLE: repay,
          osusuContributionSLE: osusu,
          netPayoutSLE: net,
          status: "FAILED",
          failureReason: "Subscriber wallet temporarily inactive (retryable)",
        };
      }

      const txRef = line.provider === "Afrimoney"
        ? `AFRI-SL-${Math.floor(Math.random() * 900000 + 100000)}`
        : `OM-SL-${Math.floor(Math.random() * 900000 + 100000)}`;

      return {
        ...line,
        platformFeeSLE: fee,
        loanRepaymentSLE: repay,
        osusuContributionSLE: osusu,
        netPayoutSLE: net,
        status: "SUCCESS",
        txReference: txRef,
      };
    });

    return NextResponse.json({
      success: true,
      lines: processed,
      executedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
