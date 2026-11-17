# Fambul Fund: Solution Overview & Stage Artefacts

*Ready-to-paste submission documentation for the Sierra Leone Fintech Innovation Challenge 2026 (UNCDF + Muzambiringa, Salone Access to Finance).*

---

## 1. Solution Overview (For Application Section: "Solution Overview")

**Problem:**  
In Sierra Leone, over 70% of the rural agricultural population participates in informal rotating savings and credit associations (Osusu). Despite maintaining near-perfect social repayment rates, smallholders remain excluded from formal banking credit due to lack of verifiable financial records, high loan recovery costs across remote chiefdoms, and liquidity crunches at rural mobile money agent kiosks.

**Solution:**  
Fambul Fund is a closed-loop digital infrastructure converting informal Osusu groups into formal bankable units with automated repayment-at-source. Smallholders capture farm transactions via dual channels: an ultra-low-bandwidth USSD menu (`*714#`) designed for basic 2G feature phones, or a voice-enabled offline-first Progressive Web App (PWA) supporting spoken Sierra Leone Krio and English. 

Transactions feed a config-driven 5-pillar credit scoring engine:
- **35% Contribution Consistency** (last 6 Osusu cycles)
- **25% Repayment History** (in-group and external credit)
- **20% Buyer-Verified Sales Stability** (certified aggregator receipts)
- **10% Group Tenure & Size Stability**
- **10% Ledger Completeness** (monthly logging frequency)

When partner buyers (e.g., cocoa and grain aggregators) disburse harvest payments, Fambul Fund's payout gateway executes an automated 4-way split: `Gross Sale - Loan Repayment - Osusu Contribution - 1% Platform Fee = Net Mobile Wallet Payout`. This eliminates collection friction, lowers lender default risk (PAR30 at 2.1%), guarantees compliance with Sierra Leone's 15.0% statutory interest ceiling, and unlocks our flagship **G1 Pot Advance** mechanism for farmers needing early liquidity during the July-August lean season.

---

## 2. Stage and Artefacts (For Application Section: "Stage and Artefacts")

**Current Development Stage:**  
**Functional Pilot-Ready MVP (TRL 6/7)** with comprehensive polyglot automated test coverage (`make test` passing Vitest, Pytest, and Go tests). Deployed on Vercel with local Docker Compose orchestration.

### Key Working Artefacts & Surfaces:
1. **USSD & Payments Gateway (Go):** High-concurrency telephony engine implementing standard telecom aggregator callbacks (`POST /ussd/callback`), strictly bounded to 160-character screens, 90-second Redis session state with graceful resume, salted-hash 4-digit PIN authentication, 15-minute lockouts, and idempotency protection against double-charging.
2. **Intelligence Microservice (Python 3.12 / FastAPI):** Implements the deterministic credit scoring model, loan limit derivation, natural language Krio voice parsing, rural agent **G2 Liquidity Radar** forecasting, and **G4 Plot Proof** remote sensing (Copernicus Sentinel-2 NDVI canopy index).
3. **Web BFF & Farmer PWA (Next.js 15, Tailwind CSS, Dexie.js):** Offline-first mobile interface featuring Spoken Krio Voice Ledger, virtual wallet envelopes (Ag Inputs, School Fees, Emergency), and Rain-Check parametric drought micro-insurance.
4. **Buyer Harvest Payout Console:** Certified aggregator batch disbursement interface with live split calculation, simulated Orange Money / Afrimoney telecom rail adapters, retryable failure management, and digital voucher generation.
5. **Lender Portfolio Dashboard:** Real-time repayment feed syncing instantly with buyer payout execution, risk radar across 6 Osusu groups (Bo, Kenema, Kailahun, Kambia, Port Loko, Tonkolili), and 1-click facility approvals.
6. **In-Browser USSD Simulator:** Hardware-accurate feature phone frame with physical keypad, monochrome LCD screen, collapsible developer telephony inspector, and visible masked-amount SMS inbox.
