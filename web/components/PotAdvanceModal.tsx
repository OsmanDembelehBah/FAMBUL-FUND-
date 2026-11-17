"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useFambulStore } from "@/lib/store";
import {
  X,
  TrendingUp,
  CheckCircle2,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Smartphone,
  AlertCircle,
  Clock,
} from "lucide-react";
import { BankSealSVG } from "./Icons";

interface PotAdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Voter {
  name: string;
  role: string;
  avatar: string;
  status: "pending" | "voted_yes" | "voted_no";
}

export const PotAdvanceModal: React.FC<PotAdvanceModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, groups, requestPotAdvance } = useFambulStore();
  const group = groups[0];

  const [amount, setAmount] = useState<number>(1000);
  const [step, setStep] = useState<"configure" | "voting" | "approved">("configure");
  const [voters, setVoters] = useState<Voter[]>([
    { name: "Sahr Bundu", role: "Co-guarantor · Bo", avatar: "/images/sahr.jpg", status: "pending" },
    { name: "Fatmata Tarawally", role: "Treasurer · Tikonko", avatar: "/images/fatmata.jpg", status: "pending" },
    { name: "Mohamed Kamara", role: "Secretary · Gbo-Kakua", avatar: "/images/hero-farmer.jpg", status: "pending" },
    { name: "Mariama Sesay", role: "Elder · Moriba", avatar: "/images/fatmata.jpg", status: "pending" },
  ]);

  if (!isOpen) return null;

  const maxPotLimit = 1800; // 60% of expected pot
  const feeSLE = Math.round(amount * 0.02); // 2% flat within statutory 15% cap
  const totalRepayable = amount + feeSLE;

  const handleStartVoting = () => {
    setStep("voting");
    // Simulate real-time votes arriving sequentially
    voters.forEach((_, idx) => {
      setTimeout(() => {
        setVoters((prev) =>
          prev.map((v, i) => (i === idx ? { ...v, status: "voted_yes" } : v))
        );
      }, 700 * (idx + 1));
    });

    // Final approval after all 4 vote
    setTimeout(() => {
      requestPotAdvance(amount);
      setStep("approved");
    }, 700 * 5);
  };

  const handleReset = () => {
    setStep("configure");
    setVoters(voters.map((v) => ({ ...v, status: "pending" })));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[32px] max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 font-sora">
        {/* Header */}
        <div className="bg-[#0B132B] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0180FF] mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>G1 Flagship Innovation</span>
          </div>
          <h2 className="text-xl font-extrabold">Pot Advance — Draw Turn Early</h2>
          <p className="text-xs text-slate-400 mt-1">
            Collect up to 60% of your expected Osusu pot before planting season starts.
          </p>
        </div>

        {/* Content based on step */}
        <div className="p-6 space-y-6">
          {step === "configure" && (
            <div className="space-y-5">
              {/* Advance Amount Selector */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                  <span>Advance Amount Needed</span>
                  <span className="text-2xl font-extrabold font-mono text-[#0180FF]">
                    SLE {amount.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={400}
                  max={maxPotLimit}
                  step={100}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0180FF]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>SLE 400 Min</span>
                  <span>Max Limit (60% Cap): SLE {maxPotLimit}</span>
                </div>
              </div>

              {/* Loan Terms Summary */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Borrower:</span>
                  <span className="font-bold text-slate-900">{currentUser.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Osusu Group:</span>
                  <span className="font-bold text-slate-900">{group?.name} (Tier A)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Statutory Interest (Flat 2%):</span>
                  <span className="font-mono font-bold text-emerald-600">+SLE {feeSLE}.00</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Repayable:</span>
                  <span className="font-mono font-extrabold text-[#0B132B]">SLE {totalRepayable}.00</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-500">
                  <span>Repayment Rail:</span>
                  <span className="font-semibold text-slate-700">Auto-deducted from next harvest payout</span>
                </div>
              </div>

              {/* Group Co-Guarantee Notice */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <span>
                  Requires <b>75% democratic group consent</b> from {group?.name} members before partner bank
                  disbursal.
                </span>
              </div>

              <button
                onClick={handleStartVoting}
                className="w-full py-3.5 rounded-2xl bg-[#0180FF] hover:bg-[#0066FF] text-white font-bold text-sm shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2"
              >
                <span>Request Group Co-Guarantee Vote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === "voting" && (
            <div className="space-y-5 text-center py-2">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0180FF] text-xs font-bold animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Real-Time USSD & PWA Voting in Progress</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Polling {group?.name} Members
                </h3>
                <p className="text-xs text-slate-500">
                  Each member reviews your SLE {amount} Pot Advance request
                </p>
              </div>

              {/* Voting member cards */}
              <div className="space-y-2 text-left">
                {voters.map((voter) => (
                  <div
                    key={voter.name}
                    className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-300 relative overflow-hidden">
                        <Image src={voter.avatar} alt={voter.name} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{voter.name}</div>
                        <div className="text-[11px] text-slate-500">{voter.role}</div>
                      </div>
                    </div>

                    {voter.status === "voted_yes" ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 animate-pulse">
                        Awaiting vote...
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "approved" && (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900">
                  Pot Advance Approved & Disbursed!
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  <b>100% group quorum achieved.</b> Partner MFI has credited <b>SLE {amount}.00</b> directly
                  to your mobile wallet.
                </p>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-xs text-emerald-900 text-left space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Credit Amount:</span>
                  <span className="font-bold">+SLE {amount}.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Disbursed via:</span>
                  <span>Orange Money SL</span>
                </div>
                <div className="flex justify-between">
                  <span>SMS Confirmation:</span>
                  <span>Sent to {currentUser.phoneNumber}</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3.5 rounded-2xl bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-sm shadow transition"
              >
                Back to Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
