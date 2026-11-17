import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { query, emitEvent } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const seedPath = path.join(process.cwd(), "lib", "seed.sql");
    const sql = fs.readFileSync(seedPath, "utf-8");

    await query(sql);

    // Emit reset event
    await emitEvent("system.reset", "ALL", {
      message: "Demo database reset to clean baseline",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Database and demo state reset successfully to clean initial seed",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
