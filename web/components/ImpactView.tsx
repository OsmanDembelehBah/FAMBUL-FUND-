"use client";

import React, { useState } from "react";
import { useFambulStore } from "@/lib/store";
import {
  BankSealSVG,
  ChartGrowSVG,
  OsusuGroupSVG,
  RadarSVG,
  SparklesSVG,
  ArrowRightSVG,
} from "./Icons";
import {
  BarChart3,
  Users,
  Award,
  TrendingUp,
  Download,
  Printer,
  Compass,
  MapPin,
  AlertCircle,
  Activity,
  Layers,
} from "lucide-react";

export const ImpactView: React.FC = () => {
  const { groups } = useFambulStore();
  const [activeTab, setActiveTab] = useState<"kpi" | "liquidity" | "prices">("kpi");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto my-6 px-4 space-y-6">
      {/* Top Banner (Monime Style) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#0180FF] uppercase tracking-wider">
            UNCDF & Muzambiringa Challenge Metrics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] mt-1">
            Impact, ESG & Financial Inclusion
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sierra Leone Rural Transformation Dashboard · Measuring Real Economic Mobility
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-[#0B132B] hover:bg-slate-800 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow transition active:scale-95"
        >
          <Printer className="w-3.5 h-3.5 text-[#0180FF]" />
          <span>Export 1-Page Grant PDF</span>
        </button>
      </div>

      {/* Primary 4 Impact Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0180FF]">
            <Users className="w-4 h-4 text-[#0180FF]" />
            <span>Women Smallholders</span>
          </div>
          <p className="text-3xl font-extrabold font-mono text-slate-900 mt-2">72.4%</p>
          <p className="text-[11px] text-slate-500 mt-1">Majority women-led Osusu groups across 6 districts</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>First-Time Formal Credit</span>
          </div>
          <p className="text-3xl font-extrabold font-mono text-emerald-600 mt-2">68.5%</p>
          <p className="text-[11px] text-slate-500 mt-1">Bankable track record built from rotating savings</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>Digital Volume Converted</span>
          </div>
          <p className="text-3xl font-extrabold font-mono text-slate-900 mt-2">SLE 797,000</p>
          <p className="text-[11px] text-slate-500 mt-1">Shifted from physical cash jars to mobile money</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Farm Records Frequency</span>
          </div>
          <p className="text-3xl font-extrabold font-mono text-indigo-600 mt-2">4.8 / mo</p>
          <p className="text-[11px] text-slate-500 mt-1">Average USSD/Voice entries per farmer</p>
        </div>
      </div>

      {/* Sub Navigation: Impact KPIs, Liquidity Radar, Farmgate Price Index */}
      <div className="flex border border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm text-xs font-bold">
        <button
          onClick={() => setActiveTab("kpi")}
          className={`flex-1 py-2.5 rounded-xl transition ${
            activeTab === "kpi"
              ? "bg-[#0180FF] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          District Demographics
        </button>
        <button
          onClick={() => setActiveTab("liquidity")}
          className={`flex-1 py-2.5 rounded-xl transition ${
            activeTab === "liquidity"
              ? "bg-[#0180FF] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          G2. Liquidity Radar
        </button>
        <button
          onClick={() => setActiveTab("prices")}
          className={`flex-1 py-2.5 rounded-xl transition ${
            activeTab === "prices"
              ? "bg-[#0180FF] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          G3. Farmgate Price Index
        </button>
      </div>

      {/* TAB 1: District Demographics Table */}
      {activeTab === "kpi" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-4">
          <h3 className="font-bold text-slate-900 text-base">
            Pilot Geographic Distribution (6 Sierra Leone Districts)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Group Name</th>
                  <th className="py-3.5 px-4">District / Chiefdom</th>
                  <th className="py-3.5 px-4">Members</th>
                  <th className="py-3.5 px-4">Women %</th>
                  <th className="py-3.5 px-4">Primary Crops</th>
                  <th className="py-3.5 px-4 text-right">Pool Saved (SLE)</th>
                  <th className="py-3.5 px-4 text-center">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {groups.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{g.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {g.district} · {g.chiefdom}
                    </td>
                    <td className="py-3.5 px-4 font-mono">{g.memberCount}</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">{g.womenLedPct}%</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {g.district === "Bo"
                        ? "Rice, Cassava"
                        : g.district === "Kailahun"
                        ? "Cocoa, Palm Oil"
                        : g.district === "Kenema"
                        ? "Oil Palm, Cashew"
                        : "Vegetables, Rice"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold font-mono text-[#0180FF]">
                      SLE {g.totalPoolSavedSLE.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                        {g.creditScore} (Tier {g.tier})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: G2 Innovation - Payout-Day Liquidity Radar */}
      {activeTab === "liquidity" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div>
            <span className="text-[10px] font-bold text-[#0180FF] uppercase tracking-wider">
              G2 Innovation Differentiator
            </span>
            <h3 className="font-bold text-slate-900 text-lg mt-0.5">
              Payout-Day Liquidity Radar
            </h3>
            <p className="text-xs text-slate-500">
              Forecasting rural telecom agent physical cash float shortfalls on scheduled harvest payout days.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                agent: "Pendembu Central Mini-Mart",
                district: "Kailahun",
                float: "SLE 8,000",
                expected: "SLE 36,270",
                shortfall: "SLE 28,270",
                risk: "CRITICAL",
                action: "Dispatch liquidity van from Kenema regional branch on 21 Nov at 08:00 GMT.",
              },
              {
                agent: "Pa Morlai Tele-Kiosk",
                district: "Bo",
                float: "SLE 15,000",
                expected: "SLE 24,960",
                shortfall: "SLE 9,960",
                risk: "MODERATE",
                action: "Notify regional aggregator super-agent to double float allocation.",
              },
              {
                agent: "Rokupr River Bank Agency",
                district: "Kambia",
                float: "SLE 6,500",
                expected: "SLE 15,210",
                shortfall: "SLE 8,710",
                risk: "MODERATE",
                action: "Split farmer payout batches across two morning tranches.",
              },
            ].map((node, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{node.agent}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        node.risk === "CRITICAL"
                          ? "bg-rose-100 text-rose-800 border border-rose-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}
                    >
                      {node.risk} SHORTFALL
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {node.district} District · Float: {node.float} · Expected Cashout: {node.expected}
                  </p>
                  <p className="text-slate-700 italic mt-1.5 font-medium">⚡ Action: {node.action}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Projected Gap:</span>
                  <p className="font-mono font-bold text-rose-600 text-base">{node.shortfall}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: G3 Innovation - Farmgate Price Index */}
      {activeTab === "prices" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              G3 Innovation Differentiator
            </span>
            <h3 className="font-bold text-slate-900 text-lg mt-0.5">
              Anonymized Farmgate Price Index
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated from verified Voice Ledger and buyer payout transactions to give farmers price transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {[
              { crop: "Cocoa Beans", benchmark: "SLE 88.0 / kg", delta: "+4.2%", sample: "42 sales in Kailahun/Kenema" },
              { crop: "Milled Rice", benchmark: "SLE 46.5 / kg", delta: "+1.8%", sample: "78 sales in Bo/Kambia" },
              { crop: "Cassava Tubers", benchmark: "SLE 24.5 / kg", delta: "-0.5%", sample: "35 sales in Port Loko" },
              { crop: "Crude Palm Oil", benchmark: "SLE 68.0 / tin", delta: "+3.1%", sample: "29 sales in Kenema" },
            ].map((p, i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
                <span className="text-slate-500 font-medium">{p.crop}</span>
                <p className="text-lg font-bold font-mono text-[#0180FF] mt-1">{p.benchmark}</p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                  <span className="text-emerald-700 font-bold">{p.delta} this week</span>
                  <span>{p.sample}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
