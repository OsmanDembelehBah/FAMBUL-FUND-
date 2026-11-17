import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { transcription } = await req.json();
    if (!transcription) {
      return NextResponse.json({ error: "Missing transcription" }, { status: 400 });
    }

    const text = transcription.toLowerCase().trim();

    let entryType: "sale" | "expense" | "harvest" = "sale";
    if (
      text.includes("spent") ||
      text.includes("spɛnd") ||
      text.includes("pay") ||
      text.includes("buy") ||
      text.includes("bai") ||
      text.includes("fertilizer") ||
      text.includes("seed")
    ) {
      entryType = "expense";
    } else if (
      text.includes("harvest") ||
      text.includes("avɛst") ||
      text.includes("kot") ||
      text.includes("pick")
    ) {
      entryType = "harvest";
    }

    let crop = "Rice";
    if (text.includes("cassava") || text.includes("kasada") || text.includes("gari")) crop = "Cassava";
    else if (text.includes("cocoa") || text.includes("koko")) crop = "Cocoa";
    else if (text.includes("palm") || text.includes("pam")) crop = "Oil Palm";
    else if (text.includes("cashew") || text.includes("kashu")) crop = "Cashew";
    else if (text.includes("fertilizer") || text.includes("seeds")) crop = "Inputs";

    let unit = "bags";
    if (text.includes("basket") || text.includes("baskit")) unit = "baskets";
    else if (text.includes("tin")) unit = "tins";
    else if (text.includes("kg") || text.includes("kilo")) unit = "kg";

    // Extract quantity
    const qtyMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:bag|baskit|basket|tin|kg|kilo|pan)?/);
    const quantity = qtyMatch ? parseFloat(qtyMatch[1]) : 1;

    // Extract amount
    const amtMatches = Array.from(text.matchAll(/(?:fɔ|for|sle|leone|cost)?\s*(\d{2,6})/g));
    let amount = 0;
    if (amtMatches.length > 0) {
      const nums = amtMatches.map((m: any) => parseFloat(m[1]));
      const filtered = nums.filter((n) => n !== quantity);
      amount = filtered.length > 0 ? Math.max(...filtered) : nums[nums.length - 1];
    }

    return NextResponse.json({
      rawText: transcription,
      entryType,
      crop,
      quantity,
      unit,
      amountSLE: amount,
      location: text.includes("kailahun") ? "Kailahun" : text.includes("kenema") ? "Kenema" : "Bo",
      confidence: 0.95,
      farmerConfirmationRequired: true,
      explainer: `Parsed ${entryType} of ${quantity} ${unit} of ${crop} for SLE ${amount.toLocaleString()} (Needs your confirmation).`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
