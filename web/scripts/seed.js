#!/usr/bin/env node
/**
 * Fambul Fund - Production Database Seed Runner
 * Executes web/lib/seed.sql against PostgreSQL (Neon, Supabase, RDS).
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
  console.error("❌ ERROR: DATABASE_URL environment variable is required to seed database.");
  console.error("Usage: DATABASE_URL='postgresql://...' node web/scripts/seed.js");
  process.exit(1);
}

const isLocal = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");

const pool = new Pool({
  connectionString: dbUrl,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

async function runSeed() {
  const seedPath = path.resolve(__dirname, "../lib/seed.sql");
  if (!fs.existsSync(seedPath)) {
    console.error(`❌ Seed file not found at ${seedPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(seedPath, "utf-8");
  console.log("🌱 Seeding Fambul Fund database with initial production datasets...");
  console.log(`📍 Target host: ${new URL(dbUrl.replace(/^postgres:\/\//, "http://")).host}`);

  const client = await pool.connect();
  try {
    const startTime = Date.now();
    await client.query(sql);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Database seed successfully applied in ${duration}s!`);

    const usersCount = await client.query("SELECT COUNT(*) FROM users");
    const groupsCount = await client.query("SELECT COUNT(*) FROM osusu_groups");
    const loansCount = await client.query("SELECT COUNT(*) FROM loans");
    const batchesCount = await client.query("SELECT COUNT(*) FROM payout_batches");

    console.log(`📊 Current Database Record Counts:`);
    console.log(`   - Users:          ${usersCount.rows[0].count}`);
    console.log(`   - Osusu Groups:   ${groupsCount.rows[0].count}`);
    console.log(`   - Active Loans:   ${loansCount.rows[0].count}`);
    console.log(`   - Payout Batches: ${batchesCount.rows[0].count}`);
  } catch (err) {
    console.error("❌ Seed failed with error:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
