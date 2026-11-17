"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { FarmerPWA } from "@/components/FarmerPWA";
import { BuyerConsole } from "@/components/BuyerConsole";
import { LenderDashboard } from "@/components/LenderDashboard";
import { USSDSimulator } from "@/components/USSDSimulator";
import { ImpactView } from "@/components/ImpactView";
import { FarmgatePriceIndex } from "@/components/FarmgatePriceIndex";
import { LandingPage } from "@/components/LandingPage";
import { GuidedDemoModal } from "@/components/GuidedDemoModal";
import { LoginModal } from "@/components/LoginModal";
import { FambulLogo, BankSealSVG, MonimeRailSVG } from "@/components/Icons";
import { Role } from "@/lib/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        setActiveTab(tabParam);
      }
      if (params.get("login") === "true") {
        setIsLoginModalOpen(true);
      }
      if (params.get("demo") === "true") {
        setIsDemoModalOpen(true);
      }
    }
  }, []);

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      url.searchParams.delete("login");
      url.searchParams.delete("demo");
      window.history.replaceState(null, "", url.toString());
    }
  };

  const handleLoginSuccess = (role: Role) => {
    if (role === "farmer" || role === "leader") {
      handleSelectTab("farmer");
    } else if (role === "buyer") {
      handleSelectTab("buyer");
    } else if (role === "lender") {
      handleSelectTab("lender");
    } else if (role === "admin") {
      handleSelectTab("impact");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFCFE] text-[#0F172A] flex flex-col font-sans selection:bg-[#0180FF]/20">
      {/* Top Universal Navbar (Monime Style) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        onStartDemo={() => setIsDemoModalOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main View Port */}
      <main className="flex-1 pb-16">
        {activeTab === "farmer" && <FarmerPWA />}
        {activeTab === "buyer" && <BuyerConsole />}
        {activeTab === "lender" && <LenderDashboard />}
        {activeTab === "ussd" && <USSDSimulator />}
        {activeTab === "impact" && <ImpactView />}
        {activeTab === "prices" && <FarmgatePriceIndex />}
        {activeTab === "landing" && (
          <LandingPage
            onExploreDemo={() => handleSelectTab("farmer")}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        )}
      </main>

      {/* Interactive Guided Demo Tour Modal */}
      <GuidedDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        setActiveTab={handleSelectTab}
      />

      {/* Floating Guided Tour Button for Challenge Judges */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsDemoModalOpen(true)}
          className="bg-[#0B132B] hover:bg-slate-800 text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center space-x-2 border border-slate-700/80 transition-all transform hover:scale-105 active:scale-95 text-xs font-semibold"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Challenge Guided Tour</span>
        </button>
      </div>

      {/* Authentication / Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Modern Monime-Inspired Multi-Column Footer */}
      <footer className="bg-[#0B132B] text-white border-t border-slate-800 pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Top Row: Brand & Multi-Column Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <FambulLogo size={36} />
                <span className="text-xl font-bold tracking-tight text-white">
                  Fambul<span className="text-[#0180FF]">Fund</span>
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Fambul Fund turns informal Osusu rotating savings into transparent, bankable credit units
                for smallholder farmers across Bo, Kenema, Kailahun, and beyond.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <BankSealSVG size={14} className="text-[#0180FF]" />
                <span>Licensed in Bank of Sierra Leone FinTech Sandbox</span>
              </div>
            </div>

            {/* Col 2: Products */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Platform Rails</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => setActiveTab("farmer")} className="hover:text-white transition">Voice Farm Ledger</button></li>
                <li><button onClick={() => setActiveTab("farmer")} className="hover:text-white transition">Osusu Group Score</button></li>
                <li><button onClick={() => setActiveTab("buyer")} className="hover:text-white transition">Pay-and-Repay Rail</button></li>
                <li><button onClick={() => setActiveTab("lender")} className="hover:text-white transition">Lender Console</button></li>
                <li><button onClick={() => setActiveTab("ussd")} className="hover:text-white transition">USSD Phone *714#</button></li>
              </ul>
            </div>

            {/* Col 3: Innovation Layer */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Innovation Layer</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => setActiveTab("farmer")} className="hover:text-white transition">G1 Pot Advance</button></li>
                <li><button onClick={() => setActiveTab("buyer")} className="hover:text-white transition">G2 Liquidity Radar</button></li>
                <li><button onClick={() => setActiveTab("impact")} className="hover:text-white transition">G3 Farmgate Price Index</button></li>
                <li><button onClick={() => setActiveTab("farmer")} className="hover:text-white transition">G4 Plot Proof (NDVI)</button></li>
                <li><button onClick={() => setActiveTab("farmer")} className="hover:text-white transition">G5 Virtual Envelopes</button></li>
              </ul>
            </div>

            {/* Col 4: Compliance & Challenge */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Challenge 2026</h4>
              <ul className="space-y-2 text-slate-400">
                <li><span>UNCDF & Muzambiringa</span></li>
                <li><span>Salone Access to Finance (EU)</span></li>
                <li><span>Max 15% Interest Rate Ceiling</span></li>
                <li><span>Simulated Telecom Rails</span></li>
                <li><button onClick={() => setIsLoginModalOpen(true)} className="text-[#0180FF] hover:underline font-bold">Judge Log In</button></li>
              </ul>
            </div>
          </div>

          {/* Bottom Disclaimers */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-400">
            <div>
              © 2026 Fambul Fund. Built for the Sierra Leone FinTech Innovation Challenge.
            </div>
            <div className="text-center md:text-right max-w-xl text-[10px] text-slate-400 leading-tight">
              <b>REGULATORY DISCLAIMER:</b> All transactions, money movements, and Osusu participant data are synthetic sandbox simulations.
              Not affiliated with real commercial banks. Designed in compliance with Bank of Sierra Leone sandbox standards.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
