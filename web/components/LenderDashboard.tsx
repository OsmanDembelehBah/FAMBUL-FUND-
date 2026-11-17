"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useFambulStore } from "@/lib/store";
import {
  BankSealSVG,
  ChartGrowSVG,
  CheckCircleSVG,
  WalletSVG,
  OsusuGroupSVG,
  ArrowRightSVG,
} from "./Icons";
import {
  Landmark,
  ShieldCheck,
  TrendingUp,
  Activity,
  CheckCircle2,
  PieChart as PieIcon,
  Search,
  Sparkles,
  FileText,
} from "lucide-react";
import { RegulatoryReportModal } from "./RegulatoryReportModal";

export const LenderDashboard: React.FC = () => {
  const { groups, loans, ledgerEntries, approveLoan } = useFambulStore();
  const [selectedGroup, setSelectedGroup] = useState(groups[0]);
  const [approvalNotif, setApprovalNotif] = useState(false);
  const [showRegulatoryModal, setShowRegulatoryModal] = useState(false);

  // Aggregate stats
  const totalDisbursed = loans.reduce((acc, l) => acc + l.principalAmountSLE, 0);
  const totalRepaid = loans.reduce((acc, l) => acc + l.repaidAmountSLE, 0);
  const totalOutstanding = totalDisbursed - totalRepaid;

  const handleApprove = (loanId: string) => {
    approveLoan(loanId);
    setApprovalNotif(true);
    setTimeout(() => setApprovalNotif(false), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto my-6 px-4 space-y-6">
      {/* Top Banner (Monime Style) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0180FF] uppercase tracking-wider">
            <Landmark className="w-4 h-4 text-[#0180FF]" />
            <span>Partner Bank & MFI Portfolio Underwriting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] mt-1">
            Partner Rural Development Bank
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Agricultural Osusu Micro-lending Facility · 15% Statutory Interest Ceiling Enforced
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowRegulatoryModal(true)}
            className="flex items-center gap-2 bg-[#0B132B] hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl font-bold text-xs shadow-sm transition"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Bank of SL Regulatory Dossier</span>
          </button>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl shadow-sm">
            <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="text-xs font-bold text-emerald-900">Realtime Feed Active</span>
          </div>
        </div>
      </div>

      {approvalNotif && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Agricultural Input Facility Approved! Capital credited to farmer wallet on Orange Money.</span>
        </div>
      )}

      {/* Portfolio KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Disbursed</span>
          <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
            SLE {totalDisbursed.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#0180FF] font-semibold">↑ 100% Repayment-at-Source</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Repaid to Date</span>
          <p className="text-2xl font-extrabold font-mono text-emerald-600 mt-1">
            SLE {totalRepaid.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">Deducted at harvest payout</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Outstanding</span>
          <p className="text-2xl font-extrabold font-mono text-amber-600 mt-1">
            SLE {totalOutstanding.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">Covered by harvest contracts</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">PAR30 (Portfolio Risk)</span>
          <p className="text-2xl font-extrabold font-mono text-emerald-600 mt-1">
            2.1%
          </p>
          <span className="text-[11px] text-slate-400">Benchmark &lt; 5.0%</span>
        </div>
      </div>

      {/* Two Column Layout: Osusu Credit Profiles & Live Repayment Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Group Credit Risk Radar & Profiles */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Osusu Group Creditworthiness & Limits
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select group to review config-driven scoring breakdown and 1-click approve loans.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-full">
                6 Groups
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {groups.map((grp) => (
                <div
                  key={grp.id}
                  onClick={() => setSelectedGroup(grp)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    selectedGroup.id === grp.id
                      ? "border-[#0180FF] bg-blue-50/40 shadow-sm ring-1 ring-[#0180FF]"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{grp.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {grp.district} · {grp.memberCount} members
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        grp.tier === "A"
                          ? "bg-emerald-100 text-emerald-800"
                          : grp.tier === "B"
                          ? "bg-blue-100 text-blue-800"
                          : grp.tier === "C"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {grp.creditScore} (Tier {grp.tier})
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-600">
                    <span>Pool: SLE {grp.totalPoolSavedSLE.toLocaleString()}</span>
                    <span className="font-bold text-[#0180FF] font-mono">
                      Limit: SLE {Math.round(grp.totalPoolSavedSLE * 0.7).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Group In-Depth Loan Facility Card */}
            {selectedGroup && (
              <div className="mt-6 p-5 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-[#0180FF] uppercase font-bold tracking-wider">
                      Recommended Loan Facility
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">
                      {selectedGroup.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-mono font-extrabold text-[#0180FF]">
                      SLE {Math.round(selectedGroup.totalPoolSavedSLE * 0.7).toLocaleString()}
                    </span>
                    <p className="text-[10px] text-slate-500">At 12.0% p.a. (6 mo tenor)</p>
                  </div>
                </div>

                {/* Animated Credit Score Gauge GIF */}
                <div className="relative rounded-2xl overflow-hidden h-36 bg-[#0B132B] border border-slate-700 shadow-sm flex items-center justify-center">
                  <Image
                    src="/gifs/credit-score-gauge.gif"
                    alt="5-Factor Credit Scoring Model"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-blue-150 text-center">
                    <span className="text-[10px] text-slate-400">Contribution Rate</span>
                    <p className="font-bold text-slate-800">95% on-time</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-150 text-center">
                    <span className="text-[10px] text-slate-400">Repayment-at-Source</span>
                    <p className="font-bold text-emerald-700">Contracted</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-150 text-center">
                    <span className="text-[10px] text-slate-400">Statutory Rate</span>
                    <p className="font-bold text-[#0180FF]">12.0% (&lt;15% cap)</p>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => handleApprove("ln-01")}
                    className="w-full bg-[#0180FF] hover:bg-[#0066FF] text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow shadow-blue-500/20"
                  >
                    <CheckCircleSVG size={15} />
                    <span>1-Click Approve Loan Facility</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Live Repayment Feed & Ledger Events */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-[#0180FF]" />
              <h3 className="font-bold text-slate-900 text-sm">
                Live Repayment Feed
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              Real-time audit log syncing entries from USSD, voice, and buyer harvest splits.
            </p>

            <div className="space-y-3">
              {loans.map((loan) => (
                <div
                  key={loan.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 text-xs space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{loan.farmerName}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {loan.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Facility: {loan.purpose}</span>
                    <span>Rate: {loan.interestRatePct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div
                      className="bg-[#0180FF] h-full"
                      style={{
                        width: `${Math.min(100, (loan.repaidAmountSLE / loan.totalRepayableSLE) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Repaid: SLE {loan.repaidAmountSLE}</span>
                    <span>Total: SLE {loan.totalRepayableSLE}</span>
                  </div>
                </div>
              ))}

              {/* Recent Ledger Entries Feed */}
              <div className="pt-3 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Recent Farm Activity Ledger:
                </span>
                <div className="mt-2 space-y-2">
                  {ledgerEntries.slice(0, 3).map((entry) => (
                    <div
                      key={entry.id}
                      className="text-[11px] p-2.5 rounded-xl bg-white border border-slate-200 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-slate-800">
                          {entry.farmerName}: {entry.quantity} {entry.unit} {entry.crop}
                        </span>
                        <p className="text-[10px] text-slate-400 capitalize">
                          {entry.entryType} · source: {entry.source}
                        </p>
                      </div>
                      <span className="font-bold font-mono text-[#0180FF]">
                        {entry.amountSLE > 0 ? `SLE ${entry.amountSLE}` : "Harvest"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Regulatory Sandbox Assessment Modal */}
      <RegulatoryReportModal
        isOpen={showRegulatoryModal}
        onClose={() => setShowRegulatoryModal(false)}
      />
    </div>
  );
};
