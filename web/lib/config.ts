/**
 * Centralized production-ready environment configuration.
 * Strictly avoids localhost defaults in production environments.
 */

const isProd = process.env.NODE_ENV === "production";

export const serverConfig = {
  isProduction: isProd,
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),

  // Public API URL for client-side fetches and webhooks
  apiUrl: process.env.NEXT_PUBLIC_API_URL || (isProd ? "" : "http://localhost:3000"),

  // Primary PostgreSQL Database Connection (Neon / Supabase / AWS RDS)
  databaseUrl: process.env.DATABASE_URL || (isProd ? "" : "postgresql://macbookpro@localhost:5432/fambul_fund"),

  // Redis Store & PubSub (Upstash Redis)
  redisUrl: process.env.REDIS_URL || (isProd ? "" : "redis://localhost:6379"),

  // Cryptographic Authentication Secret
  jwtSecret: process.env.JWT_SECRET || (isProd ? "" : "fambul_fund_salone_fintech_challenge_2026_super_secret_jwt_key"),

  // Microservice Integrations
  ussdGatewayUrl: process.env.USSD_GATEWAY_URL || (isProd ? "" : "http://localhost:8080"),
  intelligenceServiceUrl: process.env.INTELLIGENCE_SERVICE_URL || (isProd ? "" : "http://localhost:8000"),
};
