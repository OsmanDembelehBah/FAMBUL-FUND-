import { NextResponse } from "next/server";
import { getDbStatus } from "@/lib/db";
import { serverConfig } from "@/lib/config";

export async function GET() {
  const dbStatus = getDbStatus();

  return NextResponse.json({
    status: "healthy",
    service: "web",
    environment: serverConfig.nodeEnv,
    database: {
      mode: dbStatus.mode,
      poolActive: dbStatus.poolActive,
      configured: dbStatus.hasConnectionString,
    },
    redis: {
      configured: Boolean(serverConfig.redisUrl),
      isUpstash: serverConfig.redisUrl.includes("upstash.io"),
    },
    microservices: {
      ussdGatewayConfigured: Boolean(serverConfig.ussdGatewayUrl),
      intelligenceServiceConfigured: Boolean(serverConfig.intelligenceServiceUrl),
    },
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
}
