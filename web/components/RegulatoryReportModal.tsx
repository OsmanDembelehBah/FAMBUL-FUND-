"use client";

import React from "react";
import { X, Printer, ShieldCheck, CheckCircle2, FileText, Download, Building2 } from "lucide-react";
import { BankSealSVG } from "./Icons";

interface RegulatoryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegulatoryReportModal: React.FC<RegulatoryReportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[32px] max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 font-sora max-h-[92vh] overflow-y-auto">
        {/* Institutional Header Banner */}
        <div className="bg-[#0B132B] text-white p-6 sm:p-7 relative border-b border-slate-700">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <BankSealSVG size={32} className="text-amber-400" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#0180FF] block">
                FinTech Regulatory Sandbox Compliance Dossier
              </span>
              <h2 className="text-xl font-extrabold text-white">
                Bank of Sierra Leone & UNCDF Impact Assessment
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Official evaluation report for the Sierra Leone FinTech Innovation Challenge 2026 (Salone Access to Finance).
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-2xl font-extrabold text-[#0B132B] font-mono">72.4%</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Women Smallholders (SDG 5)</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center">
              <div className="text-2xl font-extrabold text-[#0180FF] font-mono">99.4%</div>
              <div className="text-[11px] font-semibold text-slate-600 mt-0.5">Repayment-at-Source Rate</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="text-2xl font-extrabold text-emerald-600 font-mono">15.0%</div>
              <div className="text-[11px] font-semibold text-slate-600 mt-0.5">Statutory Rate Cap Compliant</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              <div className="text-2xl font-extrabold text-amber-700 font-mono">14,290</div>
              <div className="text-[11px] font-semibold text-slate-600 mt-0.5">2G USSD Sessions (*714#)</div>
            </div>
          </div>

          {/* Compliance Covenants */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
              1. Regulatory Covenants & Consumer Protection
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Truth-in-Lending Capped Pricing: </span>
                  All agri-loans and Pot Advances strictly adhere to the Bank of Sierra Leone statutory 15% annual cap. Zero hidden loan application or penalty fees.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Farmer Data Sovereignty: </span>
                  Voice notes and harvest sales records remain 100% farmer-owned. Credit scores are portable across participating commercial banks and MFIs.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Illiterate Farmer Inclusivity: </span>
                  Full bilingual Voice Ledger and USSD audio prompts in Krio and English ensure zero barriers for semi-literate rural women.
                </div>
              </div>
            </div>
          </div>

          {/* District Osusu Pilot Audit Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
              2. Participating Pilot Osusu Groups (6 Districts)
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Osusu Group</th>
                    <th className="p-2.5">District</th>
                    <th className="p-2.5">Primary Crop</th>
                    <th className="p-2.5">Members</th>
                    <th className="p-2.5">Credit Score</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-bold">Gbo-Kakua Osusu</td>
                    <td className="p-2.5">Bo</td>
                    <td className="p-2.5">Cocoa & Rice</td>
                    <td className="p-2.5">12 (75% W)</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-600">88.8</td>
                    <td className="p-2.5 text-emerald-700 font-semibold">Tier A Prime</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Nongowa Farmers Union</td>
                    <td className="p-2.5">Kenema</td>
                    <td className="p-2.5">Export Cocoa</td>
                    <td className="p-2.5">15 (80% W)</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-600">86.4</td>
                    <td className="p-2.5 text-emerald-700 font-semibold">Tier A Prime</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Luawa Women Savings</td>
                    <td className="p-2.5">Kailahun</td>
                    <td className="p-2.5">Coffee & Cashew</td>
                    <td className="p-2.5">14 (100% W)</td>
                    <td className="p-2.5 font-mono font-bold text-blue-600">79.2</td>
                    <td className="p-2.5 text-blue-700 font-semibold">Tier B Strong</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Scarcies River Rice Osusu</td>
                    <td className="p-2.5">Kambia</td>
                    <td className="p-2.5">Paddy Rice</td>
                    <td className="p-2.5">11 (64% W)</td>
                    <td className="p-2.5 font-mono font-bold text-blue-600">74.5</td>
                    <td className="p-2.5 text-blue-700 font-semibold">Tier B Strong</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Maforki Cassava Union</td>
                    <td className="p-2.5">Port Loko</td>
                    <td className="p-2.5">Cassava Gari</td>
                    <td className="p-2.5">10 (60% W)</td>
                    <td className="p-2.5 font-mono font-bold text-amber-600">62.0</td>
                    <td className="p-2.5 text-amber-700 font-semibold">Tier C Developing</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Yoni Oil Palm Cooperative</td>
                    <td className="p-2.5">Tonkolili</td>
                    <td className="p-2.5">Oil Palm</td>
                    <td className="p-2.5">8 (62% W)</td>
                    <td className="p-2.5 font-mono font-bold text-amber-600">58.4</td>
                    <td className="p-2.5 text-amber-700 font-semibold">Tier C Developing</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 rounded-2xl bg-[#0180FF] hover:bg-[#0066FF] text-white font-bold text-xs shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Regulatory Dossier (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
