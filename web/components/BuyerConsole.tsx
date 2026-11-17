"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useFambulStore } from "@/lib/store";
import { PayoutLine } from "@/lib/types";
import {
  OrangeMoneySVG,
  AfrimoneySVG,
  QMoneySVG,
  MonimeRailSVG,
  CheckCircleSVG,
  RadarSVG,
  BankSealSVG,
  ArrowRightSVG,
} from "./Icons";
import {
  FileSpreadsheet,
  AlertTriangle,
  Play,
  RotateCcw,
  Receipt,
  Download,
  Building2,
  DollarSign,
  ShieldCheck,
  Send,
  CheckCircle2,
} from "lucide-react";
import { ReceiptModal } from "./ReceiptModal";

export const BuyerConsole: React.FC = () => {
  const { payoutLines, executeBuyerPayoutBatch, retryFailedPayoutLine, sendSMS } = useFambulStore();
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PayoutLine | null>(null);
  const [radarNotified, setRadarNotified] = useState(false);

  // Calculations
  const totalGross = payoutLines.reduce((acc, l) => acc + l.grossAmountSLE, 0);
  const totalRepayments = payoutLines.reduce((acc, l) => acc + l.loanRepaymentSLE, 0);
  const totalOsusu = payoutLines.reduce((acc, l) => acc + l.osusuContributionSLE, 0);
  const totalFees = payoutLines.reduce((acc, l) => acc + l.platformFeeSLE, 0);
  const totalNet = payoutLines.reduce((acc, l) => acc + l.netPayoutSLE, 0);

  const handleRunBatch = () => {
    setIsExecuting(true);
    setTimeout(() => {
      executeBuyerPayoutBatch();
      setIsExecuting(false);
    }, 1200);
  };

  const handleNotifyAgents = () => {
    sendSMS(
      "+23276999888",
      "LIQUIDITY RADAR: Rokel Grain payout scheduled. Expected cash-out demand at Bo Tikonko kiosk is SLE 3,200 on Friday. Please pre-position float.",
      "RADAR_ALERT"
    );
    setRadarNotified(true);
    setTimeout(() => setRadarNotified(false), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto my-6 px-4 space-y-6">
      {/* Header Banner (Monime Style) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0180FF] uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-[#0180FF]" />
            <span>Certified Aggregator Payout Rail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B]">
            Rokel River Grain Aggregators Ltd
          </h1>
          <p className="text-xs text-slate-500">
            Harvest Batch #ROK-2026-B4 · Kambia & Bo Districts · Automatic Repayment-at-Source
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunBatch}
            disabled={isExecuting}
            className="flex items-center gap-2 bg-[#0180FF] hover:bg-[#0066FF] text-white px-6 py-3.5 rounded-2xl font-bold text-xs shadow-md shadow-blue-500/20 transition active:scale-95 disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-white" />
                <span>Executing Telecom Rails...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white text-white" />
                <span>Execute 4-Way Split Payout</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Aggregate KPI Cards (Monime High-Contrast Styling) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">1. Gross Purchase</span>
          <p className="text-xl font-bold text-slate-900 mt-1 font-mono">
            SLE {totalGross.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500">Total farmer sales</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-150 shadow-sm">
          <span className="text-[10px] text-[#0180FF] uppercase font-bold tracking-wider">2. Loan Repay</span>
          <p className="text-xl font-bold text-[#0180FF] mt-1 font-mono">
            -SLE {totalRepayments.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500">Auto-deducted for Bank</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-150 shadow-sm">
          <span className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider">3. Osusu Savings</span>
          <p className="text-xl font-bold text-emerald-700 mt-1 font-mono">
            -SLE {totalOsusu.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500">Auto-split to Osusu Pot</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-150 shadow-sm">
          <span className="text-[10px] text-amber-700 uppercase font-bold tracking-wider">4. Rail Fee (1%)</span>
          <p className="text-xl font-bold text-amber-700 mt-1 font-mono">
            -SLE {totalFees.toFixed(1)}
          </p>
          <span className="text-[10px] text-slate-500">Monime switch fee</span>
        </div>

        <div className="bg-[#0B132B] text-white p-4 rounded-2xl shadow-md col-span-2 md:col-span-1">
          <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Net Farmer Payout</span>
          <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">
            SLE {totalNet.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">Direct mobile money</span>
        </div>
      </div>

      {/* Batch Split Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#0180FF]" />
            <h3 className="font-bold text-slate-900 text-sm">
              Batch Disbursement Split Breakdown (5 Verified Smallholders)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono text-[11px]">
            Formula: Gross - Loan - Osusu - 1% Fee = Net Wallet
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Farmer / Group</th>
                <th className="py-3.5 px-4">Phone / Provider</th>
                <th className="py-3.5 px-4 text-right">Gross (SLE)</th>
                <th className="py-3.5 px-4 text-right text-[#0180FF]">Loan Repay</th>
                <th className="py-3.5 px-4 text-right text-emerald-700">Osusu</th>
                <th className="py-3.5 px-4 text-right text-slate-400">Fee (1%)</th>
                <th className="py-3.5 px-4 text-right text-slate-900 font-bold">Net Payout</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payoutLines.map((line) => (
                <tr key={line.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{line.farmerName}</p>
                    <p className="text-[10px] text-slate-500">{line.groupName}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <p className="text-slate-700">{line.phoneNumber}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {line.provider === "Orange Money" && <OrangeMoneySVG size={14} />}
                      {line.provider === "Afrimoney" && <AfrimoneySVG size={14} />}
                      {line.provider === "QMoney" && <QMoneySVG size={14} />}
                      <span className="text-[10px] text-slate-600 font-medium">{line.provider}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-900">
                    SLE {line.grossAmountSLE.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-[#0180FF] font-semibold font-mono">
                    -SLE {line.loanRepaymentSLE.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-700 font-semibold font-mono">
                    -SLE {line.osusuContributionSLE.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400 font-mono">
                    -SLE {line.platformFeeSLE.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-700 text-sm font-mono">
                    SLE {line.netPayoutSLE.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {line.status === "SUCCESS" && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        <CheckCircleSVG size={12} className="text-emerald-600" /> Settled
                      </span>
                    )}
                    {line.status === "FAILED" && (
                      <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> Inactive SIM
                      </span>
                    )}
                    {line.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-medium">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {line.status === "FAILED" ? (
                      <button
                        onClick={() => retryFailedPayoutLine(line.id)}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm transition"
                      >
                        Retry Line
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedReceipt(line)}
                        className="text-[#0180FF] hover:text-[#0066FF] font-bold text-[11px] flex items-center gap-1 mx-auto"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Voucher</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* G2 Innovation: Payout-Day Liquidity Radar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden relative border border-slate-200 flex-shrink-0 shadow-sm">
              <Image src="/gifs/radar-scan.gif" alt="Radar Scan" fill unoptimized className="object-cover" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wide">
                <RadarSVG size={16} />
                <span>G2 Innovation Layer</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Payout-Day Liquidity Radar (Rural Agent Float Pre-Positioning)
              </h3>
              <p className="text-xs text-slate-500">
                Predicts rural agent cash float demand 48 hours prior to payout execution to prevent empty agent drawers.
              </p>
            </div>
          </div>

          <button
            onClick={handleNotifyAgents}
            className="flex items-center gap-2 bg-[#0B132B] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow whitespace-nowrap active:scale-95"
          >
            <Send className="w-3.5 h-3.5 text-[#0180FF]" />
            <span>Pre-Position Float Notice</span>
          </button>
        </div>

        {radarNotified && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Float dispatch notices sent to 4 rural telecom kiosks in Bo Tikonko and Pendembu.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Agent Kadiatu (Bo Tikonko)</span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">High Demand</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Expected Cash-Out: SLE 3,200</p>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-amber-500 h-full w-[85%]" />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Agent Mohamed (Pendembu)</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Adequate</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Expected Cash-Out: SLE 1,800</p>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full w-[45%]" />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Agent Foday (Hangha Kiosk)</span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Pre-Funded</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Expected Cash-Out: SLE 950</p>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#0180FF] h-full w-[30%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Certified Digital Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          farmerName={selectedReceipt.farmerName}
          buyerName="Rokel River Grain Aggregators Ltd. (Bo Division)"
          crop={selectedReceipt.crop || "Grade-A Harvest Crop"}
          kg={Math.round(selectedReceipt.grossAmountSLE / 30)}
          grossSLE={selectedReceipt.grossAmountSLE}
          loanDeductionSLE={selectedReceipt.loanRepaymentSLE}
          osusuDeductionSLE={selectedReceipt.osusuContributionSLE}
          feeSLE={selectedReceipt.platformFeeSLE}
          netSLE={selectedReceipt.netPayoutSLE}
          refCode={selectedReceipt.txReference || "ROK-TX-PENDING"}
        />
      )}
    </div>
  );
};
