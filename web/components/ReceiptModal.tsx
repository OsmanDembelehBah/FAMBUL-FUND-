"use client";

import React from "react";
import Image from "next/image";
import { X, Printer, CheckCircle2, ShieldCheck, Download } from "lucide-react";
import { BankSealSVG } from "./Icons";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmerName?: string;
  buyerName?: string;
  crop?: string;
  kg?: number;
  grossSLE?: number;
  loanDeductionSLE?: number;
  osusuDeductionSLE?: number;
  feeSLE?: number;
  netSLE?: number;
  refCode?: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  farmerName = "Aminata Kamara",
  buyerName = "Rokel Grain Aggregators Ltd. (Bo Hub)",
  crop = "Grade-A Organic Cocoa",
  kg = 150,
  grossSLE = 4500,
  loanDeductionSLE = 900,
  osusuDeductionSLE = 450,
  feeSLE = 45,
  netSLE = 3105,
  refCode = "ROK-PAY-2026-9921",
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[32px] max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 font-sora">
        {/* Top Header Banner */}
        <div className="bg-[#0B132B] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <BankSealSVG size={28} className="text-amber-400" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#0180FF] block">
                Bank of Sierra Leone Sandbox
              </span>
              <h2 className="text-lg font-extrabold text-white">Certified Harvest Receipt</h2>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-2">
            Ref: {refCode} · Timestamp: 2026-11-17 14:45 GMT
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Animated QR Code & Verification Banner */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900">Cryptographic Proof</div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SHA-256 Tamper-Proof</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Hash: a7f9b8c2...4e1d9</p>
            </div>
            <div className="w-20 h-20 relative rounded-xl overflow-hidden border border-slate-300">
              <Image
                src="/gifs/digital-receipt-qr.gif"
                alt="Tamper-proof QR Code"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </div>

          {/* Transaction Metadata */}
          <div className="space-y-2 text-xs border-y border-slate-100 py-3">
            <div className="flex justify-between text-slate-600">
              <span>Smallholder Farmer:</span>
              <span className="font-bold text-slate-900">{farmerName} (Gbo-Kakua Osusu)</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Certified Buyer:</span>
              <span className="font-bold text-slate-900">{buyerName}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivered Commodity:</span>
              <span className="font-bold text-slate-900">
                {kg} kg {crop}
              </span>
            </div>
          </div>

          {/* Financial 4-Way Split Breakdown */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-700 font-semibold">
              <span>Gross Harvest Value:</span>
              <span className="font-mono font-bold text-slate-900">SLE {grossSLE.toLocaleString()}.00</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>— Input Loan Auto-Repaid:</span>
              <span className="font-mono font-semibold">-SLE {loanDeductionSLE.toLocaleString()}.00</span>
            </div>
            <div className="flex justify-between text-amber-700">
              <span>— Osusu Monthly Share Saved:</span>
              <span className="font-mono font-semibold">-SLE {osusuDeductionSLE.toLocaleString()}.00</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>— Clearing & Aggregator Fee (1%):</span>
              <span className="font-mono">-SLE {feeSLE.toLocaleString()}.00</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
              <span className="font-bold text-slate-900">Net Mobile Wallet Payout:</span>
              <span className="font-mono font-extrabold text-emerald-600 text-base">
                SLE {netSLE.toLocaleString()}.00
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono text-right">
              Rail: Orange Money SL · Auth ID: OM-SL-89214
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 rounded-2xl bg-[#0180FF] hover:bg-[#0066FF] text-white font-bold text-xs shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
