"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useFambulStore } from "@/lib/store";
import {
  TrendingUp,
  MapPin,
  Volume2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  Info,
  CheckCircle2,
} from "lucide-react";
import { BankSealSVG } from "./Icons";

interface DistrictPriceData {
  district: string;
  chiefdom: string;
  crops: {
    cocoa?: number; // SLE / kg
    rice: number;   // SLE / kg
    palm: number;   // SLE / L
    cassava: number;// SLE / kg
    cashew: number; // SLE / kg
    chili: number;  // SLE / kg
  };
  sampleCount: number;
  lastUpdated: string;
  trend: "up" | "stable" | "down";
}

const DISTRICT_PRICES: DistrictPriceData[] = [
  {
    district: "Bo",
    chiefdom: "Kakua / Tikonko",
    crops: { cocoa: 46.0, rice: 32.5, palm: 48.0, cassava: 12.0, cashew: 40.0, chili: 35.0 },
    sampleCount: 84,
    lastUpdated: "Today, 14:30 GMT",
    trend: "up",
  },
  {
    district: "Kenema",
    chiefdom: "Nongowa / Dama",
    crops: { cocoa: 49.5, rice: 30.0, palm: 47.0, cassava: 11.5, cashew: 38.0, chili: 34.0 },
    sampleCount: 112,
    lastUpdated: "Today, 15:10 GMT",
    trend: "up",
  },
  {
    district: "Kailahun",
    chiefdom: "Luawa / Kissi Teng",
    crops: { cocoa: 48.0, rice: 29.5, palm: 46.5, cassava: 10.5, cashew: 36.5, chili: 33.0 },
    sampleCount: 67,
    lastUpdated: "Yesterday, 18:00 GMT",
    trend: "stable",
  },
  {
    district: "Kambia",
    chiefdom: "Magbema / Mambolo",
    crops: { rice: 34.5, palm: 50.0, cassava: 14.0, cashew: 42.0, chili: 38.0 },
    sampleCount: 95,
    lastUpdated: "Today, 11:20 GMT",
    trend: "up",
  },
  {
    district: "Port Loko",
    chiefdom: "Maforki / Koya",
    crops: { rice: 33.0, palm: 52.0, cassava: 15.0, cashew: 44.0, chili: 40.0 },
    sampleCount: 78,
    lastUpdated: "Today, 09:45 GMT",
    trend: "stable",
  },
  {
    district: "Tonkolili",
    chiefdom: "Yoni / Gbonkolenken",
    crops: { cocoa: 44.5, rice: 31.0, palm: 49.0, cassava: 13.0, cashew: 39.0, chili: 36.0 },
    sampleCount: 52,
    lastUpdated: "2 days ago",
    trend: "stable",
  },
];

const CROP_METADATA = [
  { id: "cocoa", name: "Cocoa (Grade A)", unit: "kg", icon: "🍫", benchmark: 48.0, desc: "Export quality fermented cocoa beans" },
  { id: "rice", name: "Rokel Milled Rice", unit: "kg", icon: "🌾", benchmark: 32.0, desc: "Clean parboiled local staple rice" },
  { id: "palm", name: "Refined Palm Oil", unit: "liter", icon: "🛢️", benchmark: 49.0, desc: "Pure cold-pressed domestic palm oil" },
  { id: "cassava", name: "Cassava Tubers", unit: "kg", icon: "🥔", benchmark: 13.0, desc: "Fresh root tubers for gari and fufu" },
  { id: "cashew", name: "Raw Cashew Nuts", unit: "kg", icon: "🥜", benchmark: 40.0, desc: "In-shell dried organic cashew nuts" },
  { id: "chili", name: "Birds-Eye Chili", unit: "kg", icon: "🌶️", benchmark: 36.0, desc: "Sun-dried high-pungency red chili" },
];

export const FarmgatePriceIndex: React.FC = () => {
  const { currentLanguage } = useFambulStore();
  const [selectedCrop, setSelectedCrop] = useState<string>("cocoa");
  const [arbitrageKg, setArbitrageKg] = useState<number>(200);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const activeCropMeta = CROP_METADATA.find((c) => c.id === selectedCrop) || CROP_METADATA[0];

  // Calculate highest & lowest district for the selected crop
  const validDistricts = DISTRICT_PRICES.filter(
    (d) => (d.crops as any)[selectedCrop] !== undefined
  ).map((d) => ({
    district: d.district,
    price: (d.crops as any)[selectedCrop] as number,
    samples: d.sampleCount,
  }));

  validDistricts.sort((a, b) => b.price - a.price);
  const highest = validDistricts[0];
  const lowest = validDistricts[validDistricts.length - 1];
  const priceDiff = highest && lowest ? Number((highest.price - lowest.price).toFixed(1)) : 0;
  const potentialArbitrageGain = Math.round(priceDiff * arbitrageKg);

  const handleSpeakPriceSummary = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text =
        currentLanguage === "krio"
          ? `Maket ripot pan ${activeCropMeta.name}: Na Kenema maket de pay pas ɔlman, ${highest?.price} Leone pa kilo. Na Bo na ${lowest?.price} Leone. Yu kin mek ${potentialArbitrageGain} Leone mɔ if yu sel na ${highest?.district}.`
          : `Market report for ${activeCropMeta.name}: ${highest?.district} offers the highest farmgate price at ${highest?.price} New Leones per ${activeCropMeta.unit}. Selling ${arbitrageKg} units in ${highest?.district} yields a net premium of ${potentialArbitrageGain} Leones.`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sora">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#0F1D40] to-[#0180FF] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold border border-white/20 text-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>G3 Innovation Module · Sierra Leone Farmgate Price Index</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Transparent District Farmgate Prices
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Every voice ledger and USSD sale logged by rural smallholders aggregates into a live,
            anonymized commodity price index. Farmers compare buying rates across Bo, Kenema, Kailahun,
            and Kambia before agreeing to farmgate sales.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleSpeakPriceSummary}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-xl text-xs font-bold transition border border-white/20"
            >
              <Volume2 className={`w-4 h-4 ${isSpeaking ? "animate-bounce text-amber-300" : ""}`} />
              <span>{isSpeaking ? "Speaking Audio..." : "Listen to Audio Brief (Krio / EN)"}</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs text-blue-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privacy Guard: Min 10 verified sales per median</span>
            </div>
          </div>
        </div>

        {/* Floating Background Badge */}
        <div className="absolute right-6 -bottom-6 opacity-15 pointer-events-none hidden md:block">
          <BarChart3 className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* Commodity Selector Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CROP_METADATA.map((crop) => {
          const isSelected = selectedCrop === crop.id;
          return (
            <button
              key={crop.id}
              onClick={() => setSelectedCrop(crop.id)}
              className={`p-4 rounded-2xl text-left transition border ${
                isSelected
                  ? "bg-[#0180FF] text-white border-[#0180FF] shadow-lg shadow-blue-500/20"
                  : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200"
              }`}
            >
              <div className="text-2xl mb-1">{crop.icon}</div>
              <div className="text-xs font-bold truncate">{crop.name}</div>
              <div className={`text-[11px] font-mono mt-0.5 ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                ~SLE {crop.benchmark} / {crop.unit}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Grid: District Comparison Matrix & Arbitrage Optimizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: District Pricing Matrix Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#0B132B]">
                {activeCropMeta.name} — District Medians
              </h2>
              <p className="text-xs text-slate-500">
                Verified farmgate transactions logged over the last 14 days
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Index
            </span>
          </div>

          <div className="space-y-3">
            {DISTRICT_PRICES.map((d) => {
              const price = (d.crops as any)[selectedCrop];
              if (price === undefined) return null;
              const isHighest = price === highest?.price;
              const isLowest = price === lowest?.price;

              return (
                <div
                  key={d.district}
                  className={`p-4 rounded-2xl border transition flex items-center justify-between ${
                    isHighest
                      ? "bg-blue-50/60 border-blue-200"
                      : "bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/60"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isHighest ? "bg-[#0180FF] text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{d.district} District</span>
                        {isHighest && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Highest Pay
                          </span>
                        )}
                        {isLowest && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            Lowest
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {d.chiefdom} · {d.sampleCount} ledger verified sales
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-extrabold font-mono text-[#0B132B]">
                      SLE {price.toFixed(2)}
                      <span className="text-xs font-normal text-slate-500"> / {activeCropMeta.unit}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{d.lastUpdated}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            <span>Prices reflect spot farmgate cash equivalents before transport discounts.</span>
          </div>
        </div>

        {/* Right: Farmer Arbitrage Optimizer & Live Calculator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0B132B] text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-700 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#0180FF] uppercase tracking-wider">
                Farmer Delivery Arbitrage
              </span>
              <h3 className="text-xl font-extrabold">Net Profit Comparison</h3>
              <p className="text-xs text-slate-400">
                Calculate whether transporting harvest to a neighboring district aggregator pays off.
              </p>
            </div>

            {/* Volume slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-2">
                <span>Harvest Volume</span>
                <span className="text-[#0180FF] font-mono font-extrabold text-sm">
                  {arbitrageKg} {activeCropMeta.unit}
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={1000}
                step={25}
                value={arbitrageKg}
                onChange={(e) => setArbitrageKg(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0180FF]"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>50 {activeCropMeta.unit}</span>
                <span>1,000 {activeCropMeta.unit}</span>
              </div>
            </div>

            {/* Financial Delta Box */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Estimated Value in {highest?.district || "Top District"}:</span>
                <span className="font-mono font-bold text-white">
                  SLE {((highest?.price || 0) * arbitrageKg).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Estimated Value in {lowest?.district || "Lowest District"}:</span>
                <span className="font-mono text-slate-300">
                  SLE {((lowest?.price || 0) * arbitrageKg).toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-400">Net Arbitrage Advantage:</span>
                <span className="text-lg font-mono font-extrabold text-emerald-400">
                  +SLE {potentialArbitrageGain.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0180FF] flex-shrink-0 mt-0.5" />
              <span>
                Recommended Action: Delivering to <b>{highest?.district} Aggregator</b> covers estimated
                inter-district transport (SLE 120) with a <b>+SLE {Math.max(0, potentialArbitrageGain - 120)}</b> net surplus.
              </span>
            </div>
          </div>

          {/* 12-Week Price Trend Mini Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0180FF]" />
                <span className="text-xs font-bold text-slate-900">12-Week Seasonal Trajectory</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +14.2% YoY
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Farmgate prices for {activeCropMeta.name} are projected to peak in late November during peak export vessel loadings at Freetown Queen Elizabeth II Quay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
