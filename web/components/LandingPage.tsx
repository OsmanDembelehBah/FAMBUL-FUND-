"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FambulLogo,
  BankSealSVG,
  OrangeMoneySVG,
  AfrimoneySVG,
  QMoneySVG,
  MonimeRailSVG,
  VoiceMicSVG,
  OsusuGroupSVG,
  WalletSVG,
  ChartGrowSVG,
  PhoneCallSVG,
  RadarSVG,
  SatelliteSVG,
  SparklesSVG,
  ArrowRightSVG,
  CheckCircleSVG,
  LockSVG,
} from "./Icons";
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Smartphone,
  Landmark,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Globe2,
  Calendar,
  CloudRain,
  ChevronDown,
  Building2,
  Sliders,
  DollarSign,
  Layers,
  Sparkles,
  MapPin,
  ExternalLink,
  Play,
  RotateCcw,
} from "lucide-react";

interface LandingPageProps {
  onExploreDemo: () => void;
  onOpenLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onExploreDemo, onOpenLogin }) => {
  const [showPilotModal, setShowPilotModal] = useState(false);
  const [pilotSubmitted, setPilotSubmitted] = useState(false);

  // Interactive Live Calculator state
  const [calcCrop, setCalcCrop] = useState<"cocoa" | "rice" | "palm">("cocoa");
  const [calcKg, setCalcKg] = useState<number>(120);

  const cropPrices = {
    cocoa: { name: "Grade A Cocoa", price: 45, unit: "kg" },
    rice: { name: "Rokel Milled Rice", price: 32, unit: "kg" },
    palm: { name: "Refined Palm Oil", price: 48, unit: "kg" },
  };

  const selectedCropData = cropPrices[calcCrop];
  const grossAmount = calcKg * selectedCropData.price;
  const loanDeduction = Math.round(grossAmount * 0.2); // 20% loan repayment
  const osusuDeduction = Math.round(grossAmount * 0.1); // 10% osusu savings
  const platformFee = Math.round(grossAmount * 0.01); // 1% rail fee
  const netFarmerPayout = grossAmount - loanDeduction - osusuDeduction - platformFee;

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Fambul Fund turn informal Osusu groups into bankable entities?",
      a: "Sierra Leonean smallholders have practiced Osusu for generations with exceptional social repayment discipline, but cash transactions leave no paper trail. Fambul Fund digitizes these weekly/monthly cycles via USSD (*714#) and voice ledgers. Our transparent 5-factor scoring engine (0-100) aggregates contribution consistency, peer repayments, and buyer-verified harvest sales to give financial institutions an auditable credit score.",
    },
    {
      q: "What is Repayment-at-Source and why does it protect lenders?",
      a: "Traditional microfinance fails in rural agriculture because debt officers must physically travel to remote villages to collect cash during harvest. With Fambul Fund, certified buyers (like Rokel Grain or Cocoa Cooperatives) upload a single bulk payout CSV. Our payment rails automatically deduct outstanding loan dues and Osusu savings at the instant of payout, crediting only the net surplus to the farmer's mobile money wallet.",
    },
    {
      q: "Can farmers without smartphones or internet connectivity participate?",
      a: "Yes. Fambul Fund includes an enterprise-grade USSD engine (*714#) that functions on any 2G basic feature phone with no data connection. Farmers can check wallet balances, pay Osusu contributions, request Pot Advances, and log farm sales with instant SMS confirmation. Group leaders can also proxy-log contributions for offline members.",
    },
    {
      q: "What is Pot Advance and how does it solve seasonal liquidity crises?",
      a: "In a traditional rotating Osusu, a member whose turn is months away cannot buy seeds or fertilizer for planting season. Pot Advance allows a qualified member to draw an advance of up to 60% of their expected pot. Partner banks fund this advance within the statutory 15% interest rate cap, co-guaranteed by group consent and repaid automatically from future payouts.",
    },
    {
      q: "How does the Payout-Day Liquidity Radar assist rural mobile money agents?",
      a: "On harvest payout days, rural telecom agents often run out of cash float, leaving farmers unable to cash out their mobile money. The Liquidity Radar uses predictive analytics to alert agents in Bo, Kenema, and Kailahun 48 hours in advance, allowing them to pre-position float and smoothing bulk payouts across multiple days.",
    },
    {
      q: "Is Fambul Fund integrated with live mobile money rails?",
      a: "Fambul Fund implements an extensible adapter architecture with mock interfaces for Orange Money, Africell Afrimoney, and QMoney, fully configured for the Bank of Sierra Leone FinTech Sandbox. All money movements in this MVP demo are simulated and clearly marked.",
    },
  ];

  return (
    <div className="space-y-28 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sora">
      {/* 1. HERO SECTION (Spacious Monime-Style Split Layout) */}
      <section className="pt-6 sm:pt-14 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
        {/* Left Column: Headline, Value Proposition, Dual CTAs */}
        <div className="lg:col-span-7 space-y-7 text-left">
          {/* Regulatory Sandbox Badge */}
          <div className="inline-flex items-center gap-2.5 bg-blue-50 border border-blue-200/80 text-[#0180FF] px-4 py-2 rounded-full text-xs font-bold shadow-sm">
            <BankSealSVG size={16} className="text-[#0180FF]" />
            <span>Sierra Leone FinTech Innovation Challenge 2026</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0B132B] tracking-tight leading-[1.12]">
            Modern Agri-Osusu <br />
            <span className="text-[#0180FF]">Credit & Repayment</span> <br />
            Infrastructure.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
            Fambul Fund turns informal rotating savings into verifiable credit, enabling instant buyer payouts
            with <b>automated repayment-at-source</b>, voice-first farm ledgers, and institutional lending.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <button
              onClick={onExploreDemo}
              className="flex items-center gap-2.5 bg-[#0180FF] hover:bg-[#0066FF] text-white px-7 py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-blue-500/25 transition transform active:scale-95"
            >
              <span>Explore Interactive Demo</span>
              <ArrowRightSVG size={16} />
            </button>
            <button
              onClick={() => setShowPilotModal(true)}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-sm transition"
            >
              <span>Request Pilot Deployment</span>
            </button>
            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="text-xs font-bold text-slate-500 hover:text-[#0180FF] px-3 py-2 transition"
              >
                Log in to Portal →
              </button>
            )}
          </div>

          {/* Trust Metric Badges */}
          <div className="pt-8 border-t border-slate-100 grid grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] font-mono">SLE 3.8M+</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Simulated Volume</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0180FF] font-mono">99.4%</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Repayment Rate</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">6 Districts</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Bo, Kenema, Kailahun</div>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual with Ample Spacing & Fully Visible Floating Tags */}
        <div className="lg:col-span-5 p-2 sm:p-4">
          <div className="relative rounded-[36px] bg-slate-50 border border-slate-200 p-4 sm:p-5 shadow-2xl">
            {/* Main Authentic Photography Container */}
            <div className="relative h-[380px] w-full rounded-3xl overflow-hidden shadow-inner">
              <Image
                src="/images/hero-farmer.jpg"
                alt="Sierra Leone Cocoa Farmer in Field"
                fill
                priority
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/85 via-black/20 to-transparent" />

              {/* Tag 1: Photo Caption Pill Inside Image (Fully Visible) */}
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 inline-block mb-1.5">
                  Kenema Cocoa Smallholder
                </span>
                <p className="text-sm font-bold">Aminata Kamara · Moriba Farmers Osusu</p>
              </div>
            </div>

            {/* Tag 2: Floating Credit Score Badge (Fully Visible with Zero Clipping) */}
            <div className="mt-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0180FF] flex items-center justify-center font-bold text-lg font-mono">
                  88
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Tier A Bankable Group</div>
                  <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircleSVG size={13} />
                    <span>Eligible for SLE 15,000 Loan</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0180FF]">
                Score 88/100
              </span>
            </div>

            {/* Tag 3: Live Automated Payout Chip (Fully Visible) */}
            <div className="mt-3 bg-[#0B132B] text-white p-4 rounded-2xl shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0180FF] flex items-center justify-center flex-shrink-0">
                  <OrangeMoneySVG size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100">Repayment-at-Source Settled</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Loan: -900 SLE · Osusu: -450 SLE
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-mono font-bold text-sm">+3,105 SLE</span>
                <p className="text-[10px] text-slate-400">Net to Wallet</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PARTNER & INTEGRATION MARQUEE */}
      <section className="pt-8 pb-8 border-y border-slate-100 text-center space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Simulated Telecom Rails & Institutional Ecosystem
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-85 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 font-bold text-slate-700 text-xs sm:text-sm">
            <OrangeMoneySVG size={22} />
            <span>Orange Money SL</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-slate-700 text-xs sm:text-sm">
            <AfrimoneySVG size={22} />
            <span>Africell Afrimoney</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-slate-700 text-xs sm:text-sm">
            <QMoneySVG size={22} />
            <span>QMoney</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-slate-700 text-xs sm:text-sm">
            <MonimeRailSVG size={22} />
            <span>Monime Switch</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-slate-700 text-xs sm:text-sm">
            <BankSealSVG size={22} className="text-[#0180FF]" />
            <span>Bank of Sierra Leone</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-slate-700 text-xs sm:text-sm">
            <SatelliteSVG size={22} className="text-emerald-600" />
            <span>Sentinel-2 NDVI</span>
          </div>
        </div>
      </section>

      {/* 3. ANIMATED FINANCIAL ENGINE & PAYOUT SPLIT (WITH GIF ANIMATION) */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-[#0180FF] px-3.5 py-1.5 rounded-full text-xs font-bold border border-blue-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Split Engine</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#0B132B] tracking-tight">
              Watch Automated Repayment-at-Source in Action
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              When a cocoa or rice aggregator uploads a harvest purchase batch, our rail automatically deducts
              scheduled micro-loan installments and Osusu group contributions, instantly crediting the farmer's net earnings.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <CheckCircleSVG size={16} className="text-emerald-600" />
                <span>Zero Manual Debt Chasing</span>
              </div>
              <p className="text-slate-500 text-[11px] pl-6">
                Lenders achieve 99.4% on-time repayment because funds are settled at harvest before cash is cashed out.
              </p>
            </div>
          </div>

          {/* Animated GIF Container */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 shadow-md text-center space-y-3 w-full max-w-md">
              <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                <Image
                  src="/gifs/payment-flow.gif"
                  alt="Animated Payment Flow"
                  fill
                  unoptimized
                  className="object-contain p-2"
                />
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 px-2 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Rails
                </span>
                <span>Latency: 120ms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE 4 CORE PLATFORM RAILS */}
      <section className="space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[#0180FF] uppercase tracking-wider">
            End-to-End Infrastructure
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B132B] tracking-tight">
            The Four Core Platform Rails
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A cohesive system engineered for smallholders, cooperatives, commercial lenders, and regulatory monitors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0180FF] flex items-center justify-center font-bold">
                  <VoiceMicSVG size={24} />
                </div>
                <div className="w-20 h-10 rounded-xl overflow-hidden relative border border-slate-200">
                  <Image src="/gifs/voice-wave.gif" alt="Voice Waveform" fill unoptimized className="object-cover" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#0180FF] uppercase tracking-wider">01. Recording</span>
                <h3 className="font-bold text-base text-slate-900">Voice & USSD Ledger</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Farmers speak naturally in Krio or English. AI parses crop quantities and prices into an IndexedDB
                offline queue with 1-click farmer confirmation cards.
              </p>
            </div>
            <div className="text-[11px] font-bold text-[#0180FF] pt-2">Offline-first Dexie.js</div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <OsusuGroupSVG size={24} />
                </div>
                <div className="w-20 h-10 rounded-xl overflow-hidden relative border border-slate-200">
                  <Image src="/gifs/credit-score-gauge.gif" alt="Credit Score Gauge" fill unoptimized className="object-cover" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">02. Scoring</span>
                <h3 className="font-bold text-base text-slate-900">Osusu Group Score</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deterministic 0-100 algorithm weighting 35% contribution discipline, 25% loan track record, 20% sales,
                and 20% tenure into transparent, bankable risk tiers.
              </p>
            </div>
            <div className="text-[11px] font-bold text-amber-600 pt-2">Config-driven v0 Model</div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <WalletSVG size={24} />
                </div>
                <div className="w-20 h-10 rounded-xl overflow-hidden relative border border-slate-200">
                  <Image src="/gifs/payment-flow.gif" alt="Payment Flow Animation" fill unoptimized className="object-cover" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">03. Settlements</span>
                <h3 className="font-bold text-base text-slate-900">Pay-and-Repay Rail</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Buyers upload one CSV. The rail splits payments to Orange Money or Afrimoney, automatically deducting
                loan repayments and Osusu shares at source.
              </p>
            </div>
            <div className="text-[11px] font-bold text-emerald-600 pt-2">Zero-default Collection</div>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Landmark className="w-6 h-6" />
                </div>
                <div className="w-20 h-10 rounded-xl overflow-hidden relative border border-slate-200">
                  <Image src="/gifs/digital-receipt-qr.gif" alt="Digital Receipt QR" fill unoptimized className="object-cover" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">04. Underwriting</span>
                <h3 className="font-bold text-base text-slate-900">Lender Risk Console</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Partner banks view scored groups, approve seasonal input loans within the 15% interest cap, and monitor
                live SSE repayment streams as harvests clear.
              </p>
            </div>
            <div className="text-[11px] font-bold text-indigo-600 pt-2">Statutory 15% Rate Cap</div>
          </div>
        </div>
      </section>

      {/* 5. INNOVATION LAYER (G1 TO G5 SPOTLIGHT WITH ANIMATED GIFS) */}
      <section className="bg-[#0B132B] text-white rounded-[36px] p-8 sm:p-14 space-y-10 relative overflow-hidden">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-[#0180FF] px-3.5 py-1.5 rounded-full text-xs font-bold border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FinTech Innovation Challenge 2026 Differentiators</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Five Proprietary Modules That Set Fambul Fund Apart
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Engineered to bridge structural liquidity, pricing transparency, and alternative collateral gaps across rural Sierra Leone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* G1 Pot Advance with Animated GIF */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-7 space-y-3 hover:bg-white/10 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-xl bg-[#0180FF] text-white flex items-center justify-center font-bold">
                  G1
                </div>
                <div className="w-16 h-16 rounded-xl overflow-hidden relative border border-white/20">
                  <Image src="/gifs/osusu-circle.gif" alt="Osusu Circle GIF" fill unoptimized className="object-cover" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white">Pot Advance (Flagship)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Allows an Osusu member whose turn is months away to collect their pot early for planting inputs.
                Co-guaranteed by democratic group consensus and funded by partner lenders within the 15% rate cap.
              </p>
            </div>
            <div className="text-[11px] font-bold text-[#0180FF] pt-2">Democratically Voted</div>
          </div>

          {/* G2 Liquidity Radar with Animated GIF */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-7 space-y-3 hover:bg-white/10 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  G2
                </div>
                <div className="w-16 h-16 rounded-xl overflow-hidden relative border border-white/20">
                  <Image src="/gifs/radar-scan.gif" alt="Radar Scan GIF" fill unoptimized className="object-cover" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white">Payout-Day Liquidity Radar</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Predicts rural agent cash float demand across Bo, Kenema, and Kailahun before harvest payouts execute,
                dispatching automated SMS warnings to prevent empty mobile money drawers.
              </p>
            </div>
            <div className="text-[11px] font-bold text-amber-400 pt-2">Float Pre-Positioning</div>
          </div>

          {/* G3 Price Index with Direct Link */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-7 space-y-3 hover:bg-white/10 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                G3
              </div>
              <h3 className="text-base font-bold text-white">District Farmgate Price Index</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aggregates anonymized sale entries into live district commodity price benchmarks (Rice, Cassava, Cocoa,
                Palm Oil, Cashew), giving farmers leverage during harvest negotiations.
              </p>
            </div>
            <div className="pt-2">
              <span className="text-[11px] font-bold text-emerald-400">Bo, Kenema, Kailahun Live</span>
            </div>
          </div>

          {/* G4 Plot Proof with Animated GIF */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-7 space-y-3 hover:bg-white/10 transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold">
                  G4
                </div>
                <div className="w-16 h-16 rounded-xl overflow-hidden relative border border-white/20">
                  <Image src="/gifs/satellite-orbit.gif" alt="Satellite Scan GIF" fill unoptimized className="object-cover" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white">Plot Proof (Copernicus NDVI)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Simulated Sentinel-2 satellite vegetation health checks verify plot cultivation, providing alternative
                collateral data for smallholders without formal land titles.
              </p>
            </div>
            <div className="text-[11px] font-bold text-teal-400 pt-2">Alternative Collateral</div>
          </div>

          {/* G5 Virtual Envelopes with Animated GIF */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-7 space-y-3 hover:bg-white/10 transition md:col-span-2 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold">
                  G5
                </div>
                <div className="w-24 h-16 rounded-xl overflow-hidden relative border border-white/20">
                  <Image src="/gifs/envelope-save.gif" alt="Virtual Envelopes GIF" fill unoptimized className="object-cover" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white">
                Virtual Wallet Envelopes & Season Cash-Flow Calendar
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Replicates the rural mental model of multi-SIM money partitioning inside a single mobile wallet.
                Automatically routes incoming payouts into *Ag Inputs*, *School Fees*, and *Emergency* envelopes,
                backed by voice-readable Krio lean season warnings.
              </p>
            </div>
            <div className="text-[11px] font-bold text-indigo-400 pt-2">Behavioral Multi-SIM Guardrails</div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE REPAYMENT-AT-SOURCE SPLIT CALCULATOR */}
      <section id="repayment-calculator" className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8 scroll-mt-24">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-[#0180FF] uppercase tracking-wider">
            Interactive Financial Engine
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B]">
            Simulate a Live Repayment-at-Source Harvest Split
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Adjust crop volume and commodity type to see how Fambul Fund splits revenue between farmer, lender,
            and Osusu pot simultaneously.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Select Commodity</label>
              <div className="grid grid-cols-3 gap-2">
                {(["cocoa", "rice", "palm"] as const).map((crop) => (
                  <button
                    key={crop}
                    onClick={() => setCalcCrop(crop)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition capitalize border ${
                      calcCrop === crop
                        ? "bg-[#0180FF] text-white border-[#0180FF] shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {cropPrices[crop].name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                <span>Harvest Delivered</span>
                <span className="text-[#0180FF] font-mono font-extrabold text-sm">
                  {calcKg} {selectedCropData.unit}
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={500}
                step={10}
                value={calcKg}
                onChange={(e) => setCalcKg(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0180FF]"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>20 kg</span>
                <span>Farmgate Price: {selectedCropData.price} SLE / kg</span>
                <span>500 kg</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-150 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-[#0180FF]">Certified Buyer: Rokel Grain Aggregators Ltd</p>
              <p className="text-[11px]">
                Pre-approved harvest contract active with Moriba Farmers Osusu (Bo District).
              </p>
            </div>
          </div>

          {/* Real-time Calculation Breakdown Cards */}
          <div className="lg:col-span-7 bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Gross Harvest Value
              </span>
              <span className="text-xl font-mono font-extrabold text-slate-900">
                SLE {grossAmount.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-rose-600 uppercase">20% Loan Auto-Deduct</span>
                <div className="text-base font-mono font-bold text-slate-900 mt-0.5">
                  -SLE {loanDeduction.toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Partner Bank Settled</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-amber-600 uppercase">10% Osusu Contribution</span>
                <div className="text-base font-mono font-bold text-slate-900 mt-0.5">
                  -SLE {osusuDeduction.toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Group Pot Saved</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">1.0% Rail Fee</span>
                <div className="text-base font-mono font-bold text-slate-900 mt-0.5">
                  -SLE {platformFee.toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Monime Rail Adapter</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-500 text-white rounded-xl flex justify-between items-center shadow-sm">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                  Net Disbursed to Farmer's Orange Money Wallet
                </span>
                <div className="text-2xl font-mono font-extrabold mt-0.5">
                  SLE {netFarmerPayout.toLocaleString()}
                </div>
              </div>
              <div className="text-right text-xs text-emerald-100 font-medium hidden sm:block">
                <span>Instant Settlement</span> <br />
                <span>Zero Cash Collection Risk</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. AUTHENTIC USER PERSONA VOICES */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[#0180FF] uppercase tracking-wider">
            Field Stories From Sierra Leone
          </span>
          <h2 className="text-3xl font-extrabold text-[#0B132B]">
            Engineered with Real Rural Communities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Farmer */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Before Fambul Fund, I had to wait months for my Osusu turn to buy fertilizer. With Pot Advance,
              my group approved my advance immediately, and the money came straight to my phone. I doubled my rice harvest."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-200">
                <Image src="/images/fatmata.jpg" alt="Aminata Kamara" fill className="object-cover" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Aminata Kamara</div>
                <div className="text-[10px] text-slate-500">Cocoa Farmer · Bo District</div>
              </div>
            </div>
          </div>

          {/* Card 2: Buyer */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Repayment-at-source completely eliminates default risk. We upload our harvest sheet, and the system
              automatically settles loans and savings before crediting each farmer. It saves our cooperative days of paperwork."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-200">
                <Image src="/images/sahr.jpg" alt="Sahr Bundu" fill className="object-cover" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Sahr Bundu</div>
                <div className="text-[10px] text-slate-500">Procurement Manager · Rokel Grain</div>
              </div>
            </div>
          </div>

          {/* Card 3: Lender */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Osusu social discipline is the best credit collateral in Africa. Fambul Fund makes that collateral
              auditable for our risk committee. We can now safely lend at 14% interest with guaranteed recovery."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="w-11 h-11 rounded-full bg-blue-50 text-[#0180FF] flex items-center justify-center font-bold text-xs border border-blue-200">
                AB
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Aminata Bangura</div>
                <div className="text-[10px] text-slate-500">Agri Credit Officer · Partner Bank</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. MONIME-STYLE FAQ ACCORDION */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[#0180FF] uppercase tracking-wider">
            Architecture & Operations
          </span>
          <h2 className="text-3xl font-extrabold text-[#0B132B]">Frequently Asked Questions</h2>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-slate-200">
          {faqs.map((faq, index) => {
            const isOpen = expandedFaq === index;
            return (
              <div key={index} className="py-4">
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : index)}
                  className="w-full flex justify-between items-center text-left py-2 group focus:outline-none"
                >
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0180FF] transition">
                    {faq.q}
                  </h3>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-4 ${
                      isOpen ? "rotate-180 text-[#0180FF]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="text-xs text-slate-600 leading-relaxed pt-2 pb-1 pr-6 animate-in fade-in duration-200">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. HIGH CONVERSION CTA BANNER */}
      <section className="bg-gradient-to-r from-[#0180FF] to-[#0052CC] text-white rounded-[36px] p-8 sm:p-14 text-center space-y-6 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Experience Fambul Fund Live?
          </h2>
          <p className="text-sm text-blue-100 leading-relaxed">
            Test the farmer voice ledger, watch the live group score calibrate, and simulate an automated
            buyer payout with real-time money movement.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3.5">
          <button
            onClick={onExploreDemo}
            className="bg-white text-[#0180FF] hover:bg-blue-50 px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg transition transform active:scale-95"
          >
            Launch Interactive Demo
          </button>
          <button
            onClick={() => setShowPilotModal(true)}
            className="border border-white/30 hover:bg-white/10 text-white px-7 py-3.5 rounded-2xl font-bold text-sm transition"
          >
            Request Pilot Inquiry
          </button>
        </div>
      </section>

      {/* 10. PILOT ENGAGEMENT MODAL */}
      {showPilotModal && (
        <div className="fixed inset-0 z-50 bg-[#0B132B]/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-[#0180FF] uppercase tracking-wide">
                  Challenge Partner Engagement
                </span>
                <h3 className="text-xl font-bold text-slate-900">Request Pilot Deployment</h3>
              </div>
              <button
                onClick={() => {
                  setShowPilotModal(false);
                  setPilotSubmitted(false);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {pilotSubmitted ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Deployment Request Received!</h4>
                <p className="text-xs text-slate-600">
                  Our Sierra Leone field coordinator will connect with your institution within 24 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPilotSubmitted(true);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="font-semibold text-slate-700">Institution / Organization Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Salone Rural Microfinance MFI"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0180FF]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Target District:</label>
                  <select className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0180FF]">
                    <option>Bo District</option>
                    <option>Kenema District</option>
                    <option>Kailahun District</option>
                    <option>Kambia District</option>
                    <option>Port Loko District</option>
                    <option>Tonkolili District</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Contact WhatsApp or Email:</label>
                  <input
                    type="text"
                    required
                    placeholder="+232 76 123 456 or name@bank.sl"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0180FF]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-[#0180FF] hover:bg-[#0066FF] text-white py-3 rounded-xl font-bold shadow text-xs transition"
                >
                  Submit Pilot Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
