import crypto from "crypto";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET environment variable is required in production");
    }
    return "fambul_fund_salone_fintech_challenge_2026_super_secret_jwt_key";
  }
  return secret;
}

export function generateToken(userId: string, role: string): string {
  const payload = `${userId}:${role}:${Date.now()}`;
  const sig = crypto
    .createHmac("sha256", getJwtSecret())
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64");
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId, role, timestamp, sig] = decoded.split(":");
    if (!userId || !role || !timestamp || !sig) return null;

    const payload = `${userId}:${role}:${timestamp}`;
    const expectedSig = crypto
      .createHmac("sha256", getJwtSecret())
      .update(payload)
      .digest("hex");

    if (sig !== expectedSig) return null;
    return { userId, role };
  } catch {
    return null;
  }
}
