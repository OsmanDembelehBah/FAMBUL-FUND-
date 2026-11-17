import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { query } from "@/lib/db";
import { generateToken } from "@/lib/auth";

function hashString(val: string): string {
  return crypto.createHash("sha256").update(val).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { demoRole, phone, pin, email, password } = body;

    let user: any = null;

    // 1. One-click Demo Login
    if (demoRole) {
      let targetId = "usr-farmer-01";
      if (demoRole === "farmer-01" || demoRole === "farmer") targetId = "usr-farmer-01";
      else if (demoRole === "farmer-02") targetId = "usr-farmer-02";
      else if (demoRole === "leader") targetId = "usr-leader-01";
      else if (demoRole === "buyer") targetId = "usr-buyer-01";
      else if (demoRole === "lender") targetId = "usr-lender-01";
      else if (demoRole === "admin") targetId = "usr-admin-01";

      const res = await query("SELECT * FROM users WHERE id = $1", [targetId]);
      if (res.rows.length > 0) {
        user = res.rows[0];
      }
    }

    // 2. Phone + PIN Login (Farmer / Leader)
    if (!user && phone && pin) {
      const pinHash = hashString(pin);
      const res = await query(
        "SELECT * FROM users WHERE phone = $1 AND pin_hash = $2",
        [phone, pinHash]
      );
      if (res.rows.length > 0) {
        user = res.rows[0];
      } else {
        return NextResponse.json(
          { error: "Invalid phone number or 4-digit PIN" },
          { status: 401 }
        );
      }
    }

    // 3. Email + Password Login (Buyer / Lender / Admin)
    if (!user && email && password) {
      const passHash = hashString(password);
      const res = await query(
        "SELECT * FROM users WHERE email = $1 AND password_hash = $2",
        [email.toLowerCase().trim(), passHash]
      );
      if (res.rows.length > 0) {
        user = res.rows[0];
      } else {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Missing login credentials" }, { status: 400 });
    }

    // Generate Bearer token
    const token = generateToken(user.id, user.role);

    return NextResponse.json({
      success: true,
      token,
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
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
