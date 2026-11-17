# Fambul Fund - Production Deployment Guide

This guide provides end-to-end, production-grade instructions for deploying the **Fambul Fund** fintech platform. It covers serverless PostgreSQL on **Neon** or **Supabase**, high-throughput caching on **Upstash Redis**, containerized always-on backend services on **Render** (or **Railway**), and the Next.js web application and API on **Vercel**.

---

## 1. Architecture Topology

```
                         [ Telephony / USSD / Mobile Network ]
                                          │
                                          ▼
[ Vercel CDN & Serverless Edge ] ───► [ USSD Gateway (Go) ] ──► [ Upstash Redis ]
  - Next.js 16 Web Dashboard            (Render / Railway)        (Session Lockouts & Cache)
  - Farmer PWA & USSD Simulator                   │
  - Aggregator Payout Engine                      ▼
  - Unified /api Endpoints             [ Intelligence Service (FastAPI) ]
           │                            (Credit Scoring & Sentinel-2 NDVI)
           │
           ▼
[ Neon / Supabase PostgreSQL ]
  - Double-Entry Ledger Tables
  - Osusu Group Records & Envelopes
  - Audit Events & Batch Payouts
```

| Service | Technology | Target Host | Port | Health Endpoint |
| :--- | :--- | :--- | :--- | :--- |
| **Web Dashboard & API** | Next.js 16, React 19, TypeScript | **Vercel** | 3000 / 443 | `/health` or `/api/health` |
| **USSD Gateway** | Go 1.22, Docker (Multi-stage) | **Render / Railway** | 8080 | `/health` & `/healthz` |
| **Intelligence Service** | Python 3.11, FastAPI, Uvicorn | **Render / Railway** | 8000 | `/health` & `/healthz` |
| **Database** | PostgreSQL 16 (Serverless) | **Neon** or **Supabase** | 5432 / 6543 | `SELECT 1;` |
| **Cache & Event Bus** | Serverless Redis | **Upstash** | 6379 | `PING` |

---

## 2. Environment Variables Quick Reference

Configure these environment variables in your deployment environments. **No localhost defaults are used in production.**

| Variable Name | Required By | Description / Example Format |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Vercel | Production URL: `https://fambul-fund.vercel.app` |
| `DATABASE_URL` | Vercel, Migrations | PostgreSQL URI: `postgresql://user:pass@ep-xyz.eu-central-1.aws.neon.tech/fambul_fund?sslmode=require` |
| `REDIS_URL` | Vercel, USSD Gateway | Redis URI: `rediss://default:pass@eu2-xyz.upstash.io:6379` |
| `JWT_SECRET` | Vercel | Random 64-character hex key (e.g. `openssl rand -hex 32`) |
| `USSD_GATEWAY_URL` | Vercel | URL of deployed Go service: `https://fambul-fund-ussd-gateway.onrender.com` |
| `INTELLIGENCE_SERVICE_URL` | Vercel | URL of Python service: `https://fambul-fund-intelligence-service.onrender.com` |
| `PORT` | Render / Railway / Local | Microservice listening port (`8080` for Go, `8000` for Python) |
| `ENVIRONMENT` | All Services | Set to `production` |
| `ALLOWED_ORIGINS` | Go & Python Services | Allowed CORS origin (e.g. `https://fambul-fund.vercel.app` or `*`) |

---

## 3. Step 1: Database Provisioning (Neon or Supabase)

### Option A: Neon (Recommended for Serverless Autoscaling)
1. Sign in to [Neon Console](https://console.neon.tech/).
2. Create a new project named `fambul-fund`.
3. Select region **AWS Frankfurt (`eu-central-1`)** for optimal latency to West Africa and European hosting hubs.
4. Neon will provide your connection string:
   ```text
   postgresql://fambul_owner:SECRET_PASS@ep-proud-dawn-123456.eu-central-1.aws.neon.tech/fambul_fund?sslmode=require
   ```
5. Save this as your `DATABASE_URL`.

### Option B: Supabase
1. Sign in to [Supabase](https://supabase.com/).
2. Create a new project named `fambul-fund`.
3. Go to **Project Settings** -> **Database**.
4. Under **Connection string**, select **URI** and choose **Transaction Pooler** (Port 6543, ideal for serverless deployments on Vercel):
   ```text
   postgres://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```
5. Save this as your `DATABASE_URL`.

---

## 4. Step 2: Running Migrations and Seed Data in Production

Fambul Fund includes automated zero-dependency migration and seed runners located in `web/scripts/`.

### Method A: Automated NPM / Make Commands (Recommended)

Set `DATABASE_URL` in your shell and run:

```bash
# 1. Export your production PostgreSQL connection string
export DATABASE_URL="postgresql://user:password@ep-xyz.eu-central-1.aws.neon.tech/fambul_fund?sslmode=require"

# 2. Run DDL schema migration (creates users, groups, wallets, ledger, payout tables)
npm --prefix web run db:migrate
# Or using the root Makefile:
make db-migrate

# 3. Seed baseline production reference data (Osusu groups, demo accounts, envelopes)
npm --prefix web run db:seed
# Or using the root Makefile:
make db-seed
```

### Method B: Using `psql` Directly

If you have the PostgreSQL client installed:

```bash
# Execute Schema DDL
psql "$DATABASE_URL" -f web/lib/schema.sql

# Execute Initial Production Seed
psql "$DATABASE_URL" -f web/lib/seed.sql
```

### Verification
Verify that tables and seed data are populated:

```bash
psql "$DATABASE_URL" -c "SELECT COUNT(*) AS total_users FROM users;"
psql "$DATABASE_URL" -c "SELECT id, name, credit_score, tier FROM osusu_groups;"
```

---

## 5. Step 3: Serverless Redis Setup (Upstash)

1. Sign in to [Upstash Console](https://console.upstash.com/).
2. Create a new database named `fambul-fund-cache`.
3. Select region **AWS Frankfurt (`eu-central-1`)**.
4. Choose **TLS: Enabled**.
5. Copy the **Node.js / Go Redis URL**:
   ```text
   rediss://default:YOUR_PASSWORD@eu2-sample-endpoint.upstash.io:6379
   ```
6. Save this as your `REDIS_URL`.

---

## 6. Step 4: Deploying Backend Microservices (Render / Railway)

### Option A: Render Blueprints (`render.yaml`) - Recommended

The repository includes a root [`render.yaml`](file:///Users/macbookpro/Documents/Fambul%20Fund/render.yaml) blueprint that configures both services as **always-on** (`standard` plan) Docker instances with pre-configured health checks:

1. Connect your GitHub repository to [Render](https://dashboard.render.com/).
2. Click **New +** -> **Blueprint**.
3. Select your repository. Render automatically reads `render.yaml` and defines:
   - `fambul-fund-ussd-gateway` (Go multi-stage container)
   - `fambul-fund-intelligence-service` (Python FastAPI container)
4. Fill in the synchronized environment variables in the Render dashboard:
   - `REDIS_URL`: Paste your Upstash connection string.
   - `ALLOWED_ORIGINS`: Set to your Vercel domain or `*`.
5. Click **Apply**.
6. Render builds and provisions both services. Once live, copy their public URLs:
   - `https://fambul-fund-ussd-gateway.onrender.com`
   - `https://fambul-fund-intelligence-service.onrender.com`

### Option B: Railway Deployment

If deploying to [Railway](https://railway.app/):

1. Create a **New Project** -> **Deploy from GitHub repo**.
2. **Service 1 (USSD Gateway)**:
   - Root Directory: `ussd-gateway`
   - Dockerfile: Auto-detected (`ussd-gateway/Dockerfile`)
   - Variables: `PORT=8080`, `ENVIRONMENT=production`, `REDIS_URL=...`
3. **Service 2 (Intelligence Service)**:
   - Root Directory: `intelligence-service`
   - Dockerfile: Auto-detected (`intelligence-service/Dockerfile`)
   - Variables: `PORT=8000`, `ENVIRONMENT=production`
4. Generate public domains for both services under their **Networking** tabs.

---

## 7. Step 5: Frontend & API Deployment (Vercel)

1. Sign in to [Vercel](https://vercel.com/) and click **Add New...** -> **Project**.
2. Select your `Fambul Fund` repository.
3. Configure the project settings:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `web` (or leave as root; the repo contains both root and web `vercel.json` configurations).
   - **Build Command:** `next build --webpack`
   - **Output Directory:** `.next`
4. Add the following **Environment Variables** in the Vercel dashboard:

| Variable | Recommended Production Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | `https://your-fambul-fund-domain.vercel.app` |
| `DATABASE_URL` | Neon or Supabase connection string (`...sslmode=require`) |
| `REDIS_URL` | Upstash Redis connection string (`rediss://...`) |
| `JWT_SECRET` | 64-character random hex string (`openssl rand -hex 32`) |
| `USSD_GATEWAY_URL` | `https://fambul-fund-ussd-gateway.onrender.com` |
| `INTELLIGENCE_SERVICE_URL` | `https://fambul-fund-intelligence-service.onrender.com` |

5. Click **Deploy**. Vercel will build the Next.js frontend and register all 24 static and dynamic API routes.

---

## 8. Step 6: Post-Deployment Smoke Tests & Health Checks

Once deployed, run these commands to verify all services are healthy and operational:

### 1. Verify Web Health Endpoint
```bash
curl -s https://your-fambul-fund-domain.vercel.app/health | jq .
```
Expected output:
```json
{
  "status": "healthy",
  "service": "web",
  "environment": "production",
  "database": {
    "mode": "postgresql",
    "poolActive": true,
    "configured": true
  },
  "redis": {
    "configured": true,
    "isUpstash": true
  },
  "microservices": {
    "ussdGatewayConfigured": true,
    "intelligenceServiceConfigured": true
  },
  "version": "1.0.0"
}
```

### 2. Verify Go USSD Gateway Health
```bash
curl -s https://fambul-fund-ussd-gateway.onrender.com/health | jq .
```
Expected output:
```json
{
  "status": "healthy",
  "service": "ussd-gateway",
  "environment": "production",
  "redis_status": "configured"
}
```

### 3. Verify Python Intelligence Service Health
```bash
curl -s https://fambul-fund-intelligence-service.onrender.com/health | jq .
```
Expected output:
```json
{
  "status": "healthy",
  "service": "intelligence-service",
  "environment": "production",
  "runtime": "Python 3.11 / FastAPI"
}
```

### 4. Test USSD Telco Webhook
Simulate an incoming USSD dial (*714#) from an Orange / Africell subscriber in Sierra Leone:
```bash
curl -X POST https://your-fambul-fund-domain.vercel.app/api/ussd/callback \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-live-1", "phoneNumber": "+23276123456", "text": ""}'
```
Expected response:
```text
CON Welkam na Fambul Fund
1. Mi Osusu
2. Mi Wallet
3. Rekod Maket Sel
4. Kolekt Pot Advance
5. Mo opshɔn...
```

### 5. Test Voice Ledger Parser (Krio NLP)
```bash
curl -X POST https://your-fambul-fund-domain.vercel.app/api/voice/parse \
  -H "Content-Type: application/json" \
  -d '{"transcription": "A sel 150 kilo cocoa na Bo maket fɔ 4500 leone"}' | jq .
```

### 6. Test Batch Payout Execution (4-Way Split & Responsible Finance)
```bash
curl -X POST https://your-fambul-fund-domain.vercel.app/api/payout/execute \
  -H "Content-Type: application/json" \
  -d '{"batchId": "batch-01"}' | jq .
```

---

## 9. Security & Production Checklist

- [x] **Git Privacy**: `.env` and `.env*.local` are strictly ignored in `.gitignore`. No credentials or secret keys are committed to version control.
- [x] **No Localhost Defaults in Production**: All microservices and database clients strictly rely on environment variables in production, avoiding silent fallback to `localhost`.
- [x] **Resilience & Fallback**: In the event of temporary database networking interrupts, `web/lib/db.ts` falls back gracefully to a high-fidelity in-memory seed store rather than crashing the client interface.
- [x] **Always-On Microservices**: Render/Railway configurations run USSD and Python microservices on persistent tiers, eliminating cold-boot delays on mobile telco USSD timeouts (15–30s telco deadline).
- [x] **Double-Entry Ledger Invariants**: All harvest distributions adhere to the statutory 4-way split invariant (`gross == fee + loan + osusu + net`) and the 40% responsible debt ceiling.
