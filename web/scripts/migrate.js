#!/usr/bin/env node
/**
 * Fambul Fund - Production Database Migration Runner
 * Executes web/lib/schema.sql against PostgreSQL (Neon, Supabase, RDS).
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

// Load local .env if available
try {
  const envPath = path.resolve(__dirname, "../../.env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [k, ...v] = trimmed.split("=");
        if (!process.env[k.trim()]) {
          process.env[k.trim()] = v.join("=").trim().replace(/^["']|["']$/g, "");
        }
      }
    }
  }
} catch (e) {
  // Ignore env file errors
}

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ ERROR: DATABASE_URL environment variable is required to run migrations.");
  console.error("Usage: DATABASE_URL='postgresql://...' node web/scripts/migrate.js");
  process.exit(1);
}

const isLocal = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");

const pool = new Pool({
  connectionString: dbUrl,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

async function runMigration() {
  const schemaPath = path.resolve(__dirname, "../lib/schema.sql");
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Schema file not found at ${schemaPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, "utf-8");
  console.log("🚀 Starting database schema migration on PostgreSQL...");
  console.log(`📍 Target host: ${new URL(dbUrl.replace(/^postgres:\/\//, "http://")).host}`);

  const client = await pool.connect();
  try {
    const startTime = Date.now();
    await client.query(sql);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Schema migration successfully executed in ${duration}s!`);
    console.log("   Tables created: users, osusu_groups, group_members, wallets, wallet_envelopes,");
    console.log("                   wallet_transactions, ledger_entries, loans, payout_batches,");
    console.log("                   payout_lines, events, sms_logs");
  } catch (err) {
    console.error("❌ Migration failed with error:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
