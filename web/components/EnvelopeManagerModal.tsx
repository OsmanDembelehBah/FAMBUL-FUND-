"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useFambulStore } from "@/lib/store";
import {
  X,
  Layers,
  Calendar,
  Volume2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
} from "lucide-react";

interface EnvelopeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnvelopeManagerModal: React.FC<EnvelopeManagerModalProps> = ({ isOpen, onClose }) => {
  const { wallet, currentLanguage } = useFambulStore();

  const [inputPct, setInputPct] = useState<number>(35);
  const [schoolPct, setSchoolPct] = useState<number>(25);
  const [emergencyPct, setEmergencyPct] = useState<number>(20);
  const [osusuPct, setOsusuPct] = useState<number>(20);

  const [transferSuccess, setTransferSuccess] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalPct = inputPct + schoolPct + emergencyPct + osusuPct;

  const handleAudioNudge = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text =
        currentLanguage === "krio"
          ? "Kushe Aminata! Notis fɔ sizn: Hangri sizn de kam pan Julai to Ɔgɔst. Ektra moni go na yu Emɛjɛnsi Bag so yu famili nɔ go sɔfa bifo Maket sizn rich."
          : "Attention Aminata. Lean season forecast: July and August represent the annual cash-flow gap. We recommend keeping at least 20 percent allocated to your Emergency envelope to cover food and household needs before the November cocoa harvest.";

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleQuickSave = (envelopeName: string) => {
    setTransferSuccess(`SLE 150 successfully locked into ${envelopeName}!`);
    setTimeout(() => setTransferSuccess(""), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[32px] max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 font-sora max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#0B132B] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0180FF] mb-1">
            <Layers className="w-4 h-4" />
            <span>G5 Behavioral Innovation</span>
          </div>
          <h2 className="text-xl font-extrabold">Virtual Envelopes & Season Calendar</h2>
          <p className="text-xs text-slate-400 mt-1">
            Replicate multi-SIM budgeting in one wallet. Harvest payouts auto-partition into protected goals.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Animated Envelope GIF Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 h-32 flex items-center justify-center">
            <Image
              src="/gifs/envelope-save.gif"
              alt="Virtual Envelopes Animation"
              fill
              unoptimized
              className="object-cover opacity-90"
            />
          </div>

          {/* Envelope Allocation Controls */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">
                Incoming Payout Auto-Split Percentages
              </h3>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  totalPct === 100
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                Total: {totalPct}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Envelope 1 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-emerald-700">🌱 Seed & Inputs</span>
                  <span className="font-mono">{inputPct}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={60}
                  step={5}
                  value={inputPct}
                  onChange={(e) => setInputPct(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-emerald-600"
                />
                <button
                  onClick={() => handleQuickSave("Seed & Inputs")}
                  className="w-full py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold transition flex items-center justify-center gap-1"
                >
                  <Lock className="w-3 h-3" /> Quick Add SLE 150
                </button>
              </div>

              {/* Envelope 2 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#0180FF]">🎒 School Fees</span>
                  <span className="font-mono">{schoolPct}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  step={5}
                  value={schoolPct}
                  onChange={(e) => setSchoolPct(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-[#0180FF]"
                />
                <button
                  onClick={() => handleQuickSave("School Fees")}
                  className="w-full py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-[#0180FF] text-[11px] font-bold transition flex items-center justify-center gap-1"
                >
                  <Lock className="w-3 h-3" /> Quick Add SLE 150
                </button>
              </div>

              {/* Envelope 3 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-amber-700">🛡️ Emergency Reserve</span>
                  <span className="font-mono">{emergencyPct}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={40}
                  step={5}
                  value={emergencyPct}
                  onChange={(e) => setEmergencyPct(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-amber-600"
                />
                <button
                  onClick={() => handleQuickSave("Emergency Reserve")}
                  className="w-full py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition flex items-center justify-center gap-1"
                >
                  <Lock className="w-3 h-3" /> Quick Add SLE 150
                </button>
              </div>

              {/* Envelope 4 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-purple-700">🤝 Osusu Share</span>
                  <span className="font-mono">{osusuPct}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={40}
                  step={5}
                  value={osusuPct}
                  onChange={(e) => setOsusuPct(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-purple-600"
                />
                <button
                  onClick={() => handleQuickSave("Osusu Share")}
                  className="w-full py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 text-[11px] font-bold transition flex items-center justify-center gap-1"
                >
                  <Lock className="w-3 h-3" /> Quick Add SLE 150
                </button>
              </div>
            </div>

            {transferSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{transferSuccess}</span>
              </div>
            )}
          </div>

          {/* 12-Month Season Cash-Flow Runway */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Calendar className="w-4 h-4" />
                  <span>Sierra Leone Season Cash-Flow Timeline</span>
                </div>
                <p className="text-xs text-slate-300">
                  Predictive lean season alert (Bo, Kenema, Kailahun)
                </p>
              </div>
              <button
                onClick={handleAudioNudge}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 transition"
                title="Listen to audio warning"
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? "animate-bounce text-[#0180FF]" : ""}`} />
              </button>
            </div>

            {/* Months bar */}
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 text-center font-mono text-[10px]">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                (m, idx) => {
                  const isLean = idx === 6 || idx === 7; // Jul, Aug
                  const isPlanting = idx === 4 || idx === 5; // May, Jun
                  const isHarvest = idx === 10 || idx === 11 || idx === 0; // Nov, Dec, Jan

                  let bg = "bg-slate-800 text-slate-400";
                  if (isLean) bg = "bg-red-500/30 text-red-300 border border-red-500/50 font-bold";
                  if (isPlanting) bg = "bg-blue-500/30 text-blue-300 border border-blue-500/50";
                  if (isHarvest) bg = "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-bold";

                  return (
                    <div key={m} className={`p-1.5 rounded-lg ${bg}`}>
                      {m}
                    </div>
                  );
                }
              )}
            </div>

            <div className="text-[11px] text-slate-300 flex items-start gap-2 pt-1">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <b>July–August Hunger Gap:</b> Inflow drops by ~82%. Ensure SLE 600 is pre-locked in Emergency Reserve by June 30.
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-[#0180FF] hover:bg-[#0066FF] text-white font-bold text-sm shadow transition"
          >
            Save Envelope Settings
          </button>
        </div>
      </div>
    </div>
  );
};
