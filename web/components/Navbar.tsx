"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFambulStore } from "@/lib/store";
import { Role } from "@/lib/types";
import { FambulLogo, LogInSVG, LogOutSVG } from "./Icons";
import {
  Smartphone,
  Briefcase,
  Landmark,
  BarChart3,
  Globe,
  ChevronDown,
  Menu,
  X,
  TrendingUp,
  Radar,
  Satellite,
  CloudRain,
  DollarSign,
  Compass,
  Layers,
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onStartDemo: () => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onStartDemo,
  onOpenLogin,
}) => {
  const {
    currentLanguage,
    setLanguage,
    isAuthenticated,
    currentUser,
    logout,
  } = useFambulStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  const productsRef = useRef<HTMLDivElement>(null);
  const solutionsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (productsRef.current && !productsRef.current.contains(event.target as Node)) {
        setProductsOpen(false);
      }
      if (solutionsRef.current && !solutionsRef.current.contains(event.target as Node)) {
        setSolutionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const productItems = [
    {
      id: "farmer",
      title: "Farmer App",
      desc: "Voice ledger, Osusu pot turn, virtual envelopes & offline sync",
      icon: Smartphone,
      badge: "Mobile PWA",
    },
    {
      id: "buyer",
      title: "Buyer Console",
      desc: "4-way automated repayment-at-source payout rail & digital vouchers",
      icon: Briefcase,
      badge: "Aggregator",
    },
    {
      id: "lender",
      title: "Lender Console",
      desc: "15% statutory capped risk scoring, group limits & live repayments",
      icon: Landmark,
      badge: "Bank & MFI",
    },
    {
      id: "ussd",
      title: "USSD Simulator (*714#)",
      desc: "2G feature-phone offline engine with encrypted PIN & SMS",
      icon: Smartphone,
      badge: "2G GSM",
    },
    {
      id: "prices",
      title: "G3 Farmgate Prices",
      desc: "Live district commodity price matrix & farmer arbitrage optimizer",
      icon: BarChart3,
      badge: "Real-Time",
    },
  ];

  const solutionItems = [
    {
      id: "farmer",
      title: "G1 Pot Advance",
      desc: "Early access to rotating Osusu turn before planting season",
      icon: TrendingUp,
    },
    {
      id: "buyer",
      title: "G2 Liquidity Radar",
      desc: "Predictive rural agent cash float pre-positioning across districts",
      icon: Radar,
    },
    {
      id: "prices",
      title: "G3 Farmgate Price Index",
      desc: "Transparent district commodity pricing benchmarks for cocoa, rice, palm",
      icon: BarChart3,
    },
    {
      id: "farmer",
      title: "G4 Plot Proof (Sentinel-2)",
      desc: "Satellite NDVI vegetation health checks for alternative collateral",
      icon: Satellite,
    },
    {
      id: "farmer",
      title: "G5 Virtual Envelopes",
      desc: "Behavioral multi-SIM wallet budgeting & 12-month season calendar",
      icon: Layers,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-150 font-sora">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Brand: Logo & Wordmark ONLY (Monime Style) */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => {
            setActiveTab("landing");
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          <FambulLogo size={36} />
          <span className="text-xl font-bold tracking-tight text-gray-900 font-sora">
            Fambul<span className="text-[#0180FF]">Fund</span>
          </span>
        </div>

        {/* Center Navigation (Monime Spacing: space-x-8) */}
        <nav className="hidden lg:flex items-center space-x-8">
          {/* Products Dropdown */}
          <div className="relative" ref={productsRef}>
            <button
              onClick={() => {
                setProductsOpen(!productsOpen);
                setSolutionsOpen(false);
              }}
              className="flex items-center space-x-1.5 focus:outline-none text-gray-600 hover:text-black font-medium text-sm transition"
            >
              <span>Products</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  productsOpen ? "rotate-180 text-black" : ""
                }`}
              />
            </button>

            {productsOpen && (
              <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1.5">
                  Platform Core Surfaces
                </div>
                {productItems.map((p) => {
                  const Icon = p.icon;
                  const isActive = activeTab === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveTab(p.id);
                        setProductsOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl transition flex items-start gap-3 ${
                        isActive ? "bg-blue-50 text-[#0180FF]" : "hover:bg-gray-50 text-gray-800"
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-700 mt-0.5 flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900">{p.title}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                            {p.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{p.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Solutions Dropdown */}
          <div className="relative" ref={solutionsRef}>
            <button
              onClick={() => {
                setSolutionsOpen(!solutionsOpen);
                setProductsOpen(false);
              }}
              className="flex items-center space-x-1.5 focus:outline-none text-gray-600 hover:text-black font-medium text-sm transition"
            >
              <span>Solutions</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  solutionsOpen ? "rotate-180 text-black" : ""
                }`}
              />
            </button>

            {solutionsOpen && (
              <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1.5">
                  5 Innovation Modules
                </div>
                {solutionItems.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.title}
                      onClick={() => {
                        setActiveTab(s.id);
                        setSolutionsOpen(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl transition flex items-start gap-3 hover:bg-gray-50 text-gray-800"
                    >
                      <div className="p-2 rounded-lg bg-blue-50 text-[#0180FF] mt-0.5 flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">{s.title}</div>
                        <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{s.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Farmgate Prices */}
          <button
            onClick={() => setActiveTab("prices")}
            className={`font-medium text-sm transition ${
              activeTab === "prices" ? "text-[#0180FF] font-bold" : "text-gray-600 hover:text-black"
            }`}
          >
            Farmgate Prices
          </button>

          {/* Impact & ESG */}
          <button
            onClick={() => setActiveTab("impact")}
            className={`font-medium text-sm transition ${
              activeTab === "impact" ? "text-[#0180FF] font-bold" : "text-gray-600 hover:text-black"
            }`}
          >
            Impact & ESG
          </button>

          {/* Calculator */}
          <button
            onClick={() => {
              setActiveTab("landing");
              if (typeof window !== "undefined") {
                const el = document.getElementById("repayment-calculator");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="font-medium text-sm text-gray-600 hover:text-black transition"
          >
            Calculator
          </button>
        </nav>

        {/* Right Side Actions (Clean & Perfectly Aligned) */}
        <div className="flex items-center space-x-5">
          {/* Language Switcher */}
          <div className="hidden sm:flex rounded-lg bg-gray-100 p-0.5 border border-gray-200 text-xs">
            <button
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                currentLanguage === "en"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("krio")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                currentLanguage === "krio"
                  ? "bg-[#0180FF] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Krio
            </button>
          </div>

          {/* Authentication & CTA */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200">
                <div className="w-6 h-6 rounded-full bg-[#0180FF] text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="text-xs font-bold text-gray-900 max-w-[100px] truncate">
                  {currentUser.name.split(" ")[0]}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Log out"
              >
                <LogOutSVG size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={onOpenLogin}
                className="text-sm font-semibold text-gray-700 hover:text-[#0180FF] transition px-3 py-2 cursor-pointer"
              >
                Log in
              </button>
              <button
                onClick={() => setActiveTab("farmer")}
                className="bg-[#0180FF] hover:bg-[#0066FF] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm shadow-blue-500/20 transition active:scale-95 cursor-pointer"
              >
                Launch App
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 px-6 py-4 bg-white space-y-3 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2">
            {productItems.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveTab(p.id);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 p-2.5 rounded-xl text-xs font-semibold bg-gray-50 text-gray-800 text-left"
                >
                  <Icon className="w-4 h-4 text-[#0180FF]" />
                  <span className="truncate">{p.title}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => {
                setActiveTab("impact");
                setMobileMenuOpen(false);
              }}
              className="text-xs font-semibold text-gray-700"
            >
              Impact & ESG
            </button>
            <button
              onClick={() => {
                onStartDemo();
                setMobileMenuOpen(false);
              }}
              className="text-xs font-bold text-[#0180FF] bg-blue-50 px-3 py-1.5 rounded-lg"
            >
              Guided Demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
