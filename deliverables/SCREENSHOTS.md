# 📸 Fambul Fund: 8 High-Resolution Screenshots (Monime Design Revamp)

All 8 screenshots were captured directly from the live running web application (`http://localhost:3000`) with Monime-inspired design system (`#0180FF` vibrant electric blue, `#0B132B` deep obsidian navy, clean modern sans-serif typography, crisp SVG vector icons, real Sierra Leone agricultural photography, and interactive login functionality).

---

### Screenshot 1: High-Profile Monime-Style Landing Page & Hero
- **File:** `deliverables/screenshot-01-landing-hero.png`
- **Surface:** `Overview / Landing Page` (`http://localhost:3000`)
- **Key Visual Elements:**
  - Spacious Monime-style header (`h-20`) with Fambul Fund logo, Bank of Sierra Leone sandbox badge, navigation links, Language switcher (EN/Krio), Guided Demo button, and functional **"Log in"** button.
  - Split-screen Hero featuring an authentic Sierra Leone cocoa farmer with floating glassmorphic cards:
    - Tier A Bankable credit score badge (`88/100`)
    - Instant automated repayment-at-source notification (`SLE 4,500` gross → `SLE 900` loan + `SLE 450` Osusu → `SLE 3,105` net to Orange Money)
  - Integrated partner marquee: Orange Money SL, Africell Afrimoney, QMoney, Monime Rails, Bank of Sierra Leone Sandbox, Copernicus Sentinel-2.

---

### Screenshot 2: Interactive Pay-and-Repay Split Calculator & FAQ
- **File:** `deliverables/screenshot-02-landing-calculator.png`
- **Surface:** `Landing Page Lower Section` (`http://localhost:3000`)
- **Key Visual Elements:**
  - Interactive commodity selector: Grade A Cocoa (45 SLE/kg), Rokel Milled Rice (32 SLE/kg), Refined Palm Oil (48 SLE/kg).
  - Dynamic harvest delivery slider (20 kg to 500 kg) with real-time 4-way financial split calculation:
    - 20% Loan Auto-Deduct
    - 10% Osusu Contribution
    - 1.0% Monime Rail Fee
    - 69% Net Mobile Wallet Payout.
  - Field stories from Bo and Kenema smallholders.
  - Expandable Monime-style FAQ accordion answering key regulatory and operational questions.
  - Multi-column Monime dark footer (`#0B132B`) with sandbox disclaimer.

---

### Screenshot 3: Interactive Multi-Persona Login Modal
- **File:** `deliverables/screenshot-03-login-modal.png`
- **Surface:** `Login Modal` (`http://localhost:3000?login=true`)
- **Key Visual Elements:**
  - Glassmorphic modal with Bank of Sierra Leone sandbox badge.
  - 1-Click Instant Demo Access for challenge judges:
    - **Aminata Kamara** (Cocoa Smallholder & Osusu Member, Bo)
    - **Sahr Bundu** (Procurement Manager, Rokel Grain Aggregators)
    - **Aminata Bangura** (Agri Portfolio Officer, Partner Bank)
    - **David Mansaray** (FinTech Innovation Officer, UNCDF / Bank of SL)
  - Phone number and 4-digit PIN authentication form with masked security dots.
  - Direct routing into the user's authenticated workspace with profile chip in navbar.

---

### Screenshot 4: Farmer Smartphone PWA — Wallet Balance & Osusu Turn
- **File:** `deliverables/screenshot-04-farmer-wallet-pwa.png`
- **Surface:** `Farmer PWA` (`http://localhost:3000?tab=farmer`)
- **Key Visual Elements:**
  - Sleek modern smartphone frame with dynamic speaker island.
  - Aminata Kamara profile photo and audio readout button (TTS in Krio/English).
  - Monime gradient electric blue wallet card: `SLE 1,250.00` available with `SLE 650.00` in virtual envelopes.
  - Credit Score Pill: `88.8 (Tier A)` pre-approved for `SLE 4,800.00` facility.
  - Next Pot Turn: `24 Nov 2026 (7 days remaining)`.
  - Offline sync status bar and segmented control tabs (*Record*, *Osusu*, *Envelopes*, *NDVI Plot*).

---

### Screenshot 5: Impact, ESG & Geographic Transformation Dashboard
- **File:** `deliverables/screenshot-05-impact-and-esg.png`
- **Surface:** `Impact & ESG View` (`http://localhost:3000?tab=impact`)
- **Key Visual Elements:**
  - Four primary challenge metrics: **72.4% Women Smallholders**, **68.5% First-Time Credit**, **SLE 797,000 Digital Volume**, and **4.8 records/month frequency**.
  - District Demographics across 6 Sierra Leone districts (Bo, Kenema, Kailahun, Kambia, Port Loko, Tonkolili).
  - G2 Liquidity Radar showing rural telecom agent cash float gaps.
  - G3 District Farmgate Price Index benchmarking cocoa, rice, cassava, and palm oil.
  - Export 1-Page Grant PDF button.

---

### Screenshot 6: Certified Buyer Payout Console & 4-Way Split
- **File:** `deliverables/screenshot-06-buyer-payout-console.png`
- **Surface:** `Buyer Console` (`http://localhost:3000?tab=buyer`)
- **Key Visual Elements:**
  - Certified Aggregator Console (Rokel River Grain Aggregators Ltd).
  - 5-KPI aggregate bar: Gross Purchase, Loan Repay, Osusu Savings, Rail Fee (1%), and Net Farmer Payout.
  - Interactive table showing 5 verified smallholders across Orange Money, Afrimoney, and QMoney.
  - "Execute 4-Way Split Payout" button with real-time status settlement.
  - G2 Liquidity Radar agent notification module dispatching float warnings to rural kiosks.

---

### Screenshot 7: Partner Bank & MFI Underwriting Console
- **File:** `deliverables/screenshot-07-lender-dashboard.png`
- **Surface:** `Lender Dashboard` (`http://localhost:3000?tab=lender`)
- **Key Visual Elements:**
  - Commercial Bank portfolio console: Total Disbursed (`SLE 22,000`), Total Repaid (`SLE 14,200`), and PAR30 (`2.1%`).
  - Osusu Group Credit Risk Radar ranking 6 groups (Tiers A to D).
  - 1-Click Loan Facility Approval strictly bounded within the 15% statutory interest rate ceiling.
  - Live real-time SSE repayment audit stream updating instantly upon buyer payouts.

---

### Screenshot 8: In-Browser USSD Phone Simulator (*714#)
- **File:** `deliverables/screenshot-08-ussd-phone-simulator.png`
- **Surface:** `USSD Phone Simulator` (`http://localhost:3000?tab=ussd`)
- **Key Visual Elements:**
  - Realistic feature-phone hardware frame with monochrome green LCD screen and 12-key matrix.
  - Direct connection to live `POST /api/ussd/callback` endpoint with session state machine.
  - Animated 2G GSM dialing telemetry banner (`ussd-dial.gif`).
  - Simulated SMS Inbox displaying masked transaction confirmations.
  - Raw USSD Telephony Inspector displaying JSON request payload and gateway string response with sub-millisecond latency.

---

### Additional Innovation Modules & Interactive Surfaces

#### 9. G3 Farmgate Price Index & Farmer Arbitrage Optimizer
- **Surface:** `Farmgate Prices` (`http://localhost:3000?tab=prices`)
- **Key Visual Elements:**
  - Live district commodity matrix across all 6 agricultural districts: Bo, Kenema, Kailahun, Kambia, Port Loko, Tonkolili.
  - 6 crop benchmarks: Grade-A Cocoa, Rokel Milled Rice, Refined Palm Oil, Cassava, Cashew, and Birds-Eye Chili.
  - Farmer Delivery Arbitrage Optimizer with interactive harvest volume slider calculating net profit delta between districts.
  - Audio voice readout in Sierra Leone Krio and English.
  - Minimum 10-sale privacy threshold guardrail.

#### 10. G1 Pot Advance Democratic Member Voting Engine
- **Surface:** `Pot Advance Modal` (`Farmer PWA → Request Pot Advance`)
- **Key Visual Elements:**
  - Interactive advance amount slider (SLE 400 - SLE 1,800, max 60% pot cap).
  - Real-time simulated voting quorum across 4 Osusu members (Sahr Bundu, Fatmata Tarawally, Mohamed Kamara, Mariama Sesay).
  - Instant partner bank loan facility disbursal to mobile wallet upon 100% consensus.

#### 11. G5 Virtual Envelope Allocator & Season Cash-Flow Runway
- **Surface:** `Envelope Manager Modal` (`Farmer PWA → Envelopes`)
- **Key Visual Elements:**
  - Interactive percentage auto-split sliders for *Seed & Inputs*, *School Fees*, *Emergency*, and *Osusu*.
  - 1-click Quick Lock transfer buttons (+SLE 150).
  - 12-month Sierra Leone agricultural cash-flow runway highlighting the July-August hunger gap with audio Krio warning.
  - Animated virtual envelopes auto-partitioning GIF (`envelope-save.gif`).

#### 12. Certified Bank of Sierra Leone Sandbox Harvest Receipt
- **Surface:** `Receipt Modal` (`Buyer Console & Farmer PWA`)
- **Key Visual Elements:**
  - Official Bank of Sierra Leone FinTech Sandbox seal and ref code.
  - Animated cryptographic QR code verification badge (`digital-receipt-qr.gif`).
  - Full 4-way financial split itemization (Gross, Loan Repaid, Osusu Pot, Platform Fee, Net to Mobile Wallet).
  - 1-click Print / PDF Export functionality.

#### 13. Institutional FinTech Regulatory Sandbox Dossier
- **Surface:** `Regulatory Dossier Modal` (`Lender Dashboard → Bank of SL Dossier`)
- **Key Visual Elements:**
  - Official assessment brief for UNCDF, EU Salone Access to Finance, and Bank of Sierra Leone.
  - Executive KPI summary: 72.4% women smallholders, 99.4% repayment-at-source rate, 15.0% statutory cap enforcement.
  - District Osusu pilot audit table across 6 groups in Bo, Kenema, Kailahun, Kambia, Port Loko, and Tonkolili.
  - 1-click Print / PDF Dossier button.
