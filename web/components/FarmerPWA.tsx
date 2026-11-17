"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useFambulStore } from "@/lib/store";
import { translations } from "@/lib/i18n";
import {
  VoiceMicSVG,
  OsusuGroupSVG,
  WalletSVG,
  BankSealSVG,
  RadarSVG,
  SatelliteSVG,
  SparklesSVG,
  CheckCircleSVG,
  ArrowRightSVG,
} from "./Icons";
import {
  Mic,
  MicOff,
  Volume2,
  Calendar,
  CloudRain,
  ShieldCheck,
  TrendingUp,
  MapPin,
  RefreshCw,
  ChevronRight,
  Layers,
  Sparkles,
  Receipt,
  FileCheck,
  Users,
} from "lucide-react";
import { PotAdvanceModal } from "./PotAdvanceModal";
import { EnvelopeManagerModal } from "./EnvelopeManagerModal";
import { ReceiptModal } from "./ReceiptModal";

export const FarmerPWA: React.FC = () => {
  const {
    currentLanguage,
    currentUser,
    wallet,
    groups,
    loans,
    insurancePolicy,
    isOfflineSimulated,
    addLedgerEntry,
    addOfflineLedgerEntry,
    syncOfflineQueue,
    payOsusuContribution,
    requestPotAdvance,
    triggerDroughtParametricPayout,
  } = useFambulStore();

  const t = translations[currentLanguage];
  const group = groups[0];
  const activeLoan = loans[0];

  // Voice Ledger States
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [parsedCandidate, setParsedCandidate] = useState<any>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [offlineCount, setOfflineCount] = useState(0);

  // Audio Readout state (TTS)
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Active Tab inside PWA: "home" | "osusu" | "envelopes" | "plot"
  const [pwaTab, setPwaTab] = useState<"home" | "osusu" | "envelopes" | "plot">("home");

  // Show score breakdown modal
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showPotAdvanceModal, setShowPotAdvanceModal] = useState(false);
  const [showEnvelopeModal, setShowEnvelopeModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Voice Preset triggers for realistic demo
  const krioVoicePreset = "A sel 5 bag rays tide na Bo maket fɔ 250 Leone";
  const englishVoicePreset = "Harvested 15 bags of cassava today in Tikonko village";

  const handleSimulateVoice = (sampleText: string) => {
    setIsRecording(true);
    setVoiceText(sampleText);
    setTimeout(() => {
      setIsRecording(false);
      handleParseVoice(sampleText);
    }, 900);
  };

  const handleParseVoice = async (text: string) => {
    setIsParsing(true);
    try {
      const res = await fetch("/api/voice/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription: text }),
      });
      const data = await res.json();
      setParsedCandidate(data);
    } catch {
      // Fallback local parser
      setParsedCandidate({
        crop: "Rice",
        quantity: 5,
        unit: "bags",
        amountSLE: 250,
        entryType: "sale",
        location: "Bo",
        confidence: 0.95,
        farmerConfirmationRequired: true,
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmCandidate = async () => {
    if (!parsedCandidate) return;

    if (isOfflineSimulated) {
      await addOfflineLedgerEntry({
        entryType: parsedCandidate.entryType,
        crop: parsedCandidate.crop,
        quantity: parsedCandidate.quantity,
        unit: parsedCandidate.unit,
        amountSLE: parsedCandidate.amountSLE,
        location: parsedCandidate.location,
        rawVoiceNote: voiceText,
      });
      setOfflineCount((prev) => prev + 1);
      setSaveSuccessMsg(t.savedOfflineChip);
    } else {
      addLedgerEntry({
        userId: currentUser.id,
        crop: parsedCandidate.crop,
        entryType: parsedCandidate.entryType,
        quantity: parsedCandidate.quantity,
        unit: parsedCandidate.unit,
        amountSLE: parsedCandidate.amountSLE,
        source: "voice",
        location: parsedCandidate.location,
        verifiedByBuyer: true,
        confirmedByFarmer: true,
        rawVoiceNote: voiceText,
      });
      setSaveSuccessMsg(
        currentLanguage === "krio"
          ? "Sakses! Lɛdja dɔn sev and grup skɔ dɔn fresh."
          : "Success! Record saved to ledger. Credit score refreshed."
      );
    }

    setParsedCandidate(null);
    setVoiceText("");
    setTimeout(() => setSaveSuccessMsg(""), 4000);
  };

  const handleTextToSpeech = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 bg-[#0B132B] rounded-[48px] p-3 shadow-2xl border border-slate-700/60">
      {/* Smartphone Inner Screen */}
      <div className="bg-[#FAFCFE] rounded-[40px] overflow-hidden flex flex-col min-h-[790px] border border-slate-200">
        {/* Dynamic Island / Speaker Pill */}
        <div className="bg-[#0B132B] pt-2.5 pb-2 text-center">
          <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto" />
        </div>

        {/* Top Mobile Bar (Monime Style) */}
        <div className="bg-[#0B132B] px-6 pt-3 pb-5 text-white">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#0180FF]">
                <Image
                  src="/images/fatmata.jpg"
                  alt={currentUser.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">{currentUser.name}</h2>
                <p className="text-[11px] text-slate-400">
                  {currentUser.village}, {currentUser.district} · {currentUser.phoneNumber}
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                handleTextToSpeech(
                  currentLanguage === "krio"
                    ? `Kushe Aminata. Yu walet balans na ${wallet.availableBalanceSLE} Leone. Yu Osusu turn na 24 Novemba.`
                    : `Welcome Aminata. Your wallet balance is ${wallet.availableBalanceSLE} New Leones. Your next Osusu turn is November 24th.`
                )
              }
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#0180FF] transition"
              title="Listen to audio readout"
            >
              <Volume2 className={`w-4 h-4 text-white ${isSpeaking ? "animate-bounce text-[#0180FF]" : ""}`} />
            </button>
          </div>

          {/* Wallet Balance Card (Monime Gradient) */}
          <div className="bg-gradient-to-br from-[#0180FF] to-[#0052CC] rounded-3xl p-5 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] text-blue-100 uppercase font-semibold tracking-wider">
                  {t.availableBalance}
                </p>
                <h1 className="text-3xl font-extrabold font-mono mt-0.5 tracking-tight">
                  SLE {wallet.availableBalanceSLE.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </h1>
              </div>
              <button
                onClick={() => setShowScoreModal(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition border border-white/30"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>{group?.creditScore || 88.8}</span>
                <span className="text-[10px] text-amber-200">Tier A</span>
              </button>
            </div>

            <div className="mt-3.5 pt-3 border-t border-white/20 flex justify-between items-center text-xs text-blue-100 font-medium">
              <span>
                🔒 {t.lockedEnvelopes}: <b>SLE {wallet.lockedEnvelopesBalanceSLE}</b>
              </span>
              <button
                onClick={() => setShowReceiptModal(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 transition"
              >
                <FileCheck className="w-3 h-3 text-emerald-300" />
                <span>View Receipt</span>
              </button>
            </div>
          </div>
        </div>

        {/* Offline Sync Banner if active */}
        {isOfflineSimulated && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex justify-between items-center text-xs text-amber-900">
            <span className="font-semibold text-[11px]">⚠️ Simulated Offline Mode Active</span>
            <button
              onClick={() => syncOfflineQueue()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-800 text-white font-bold text-[10px] shadow"
            >
              <RefreshCw className="w-3 h-3" /> Sync Now ({offlineCount})
            </button>
          </div>
        )}

        {/* Internal Segmented Tabs (Monime Style) */}
        <div className="p-2 bg-slate-100/80 mx-4 mt-3 rounded-2xl flex text-xs font-bold">
          <button
            onClick={() => setPwaTab("home")}
            className={`flex-1 py-2 rounded-xl text-center transition ${
              pwaTab === "home"
                ? "bg-white text-[#0180FF] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.recordActivity}
          </button>
          <button
            onClick={() => setPwaTab("osusu")}
            className={`flex-1 py-2 rounded-xl text-center transition ${
              pwaTab === "osusu"
                ? "bg-white text-[#0180FF] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.nextPotTurn}
          </button>
          <button
            onClick={() => setPwaTab("envelopes")}
            className={`flex-1 py-2 rounded-xl text-center transition ${
              pwaTab === "envelopes"
                ? "bg-white text-[#0180FF] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Envelopes
          </button>
          <button
            onClick={() => setPwaTab("plot")}
            className={`flex-1 py-2 rounded-xl text-center transition ${
              pwaTab === "plot"
                ? "bg-white text-[#0180FF] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            NDVI Plot
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {saveSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircleSVG size={18} className="text-emerald-600 flex-shrink-0" />
              <span className="font-medium">{saveSuccessMsg}</span>
            </div>
          )}

          {/* TAB 1: Voice Ledger Recording */}
          {pwaTab === "home" && (
            <div className="space-y-4">
              <div className="text-center py-1">
                <h3 className="text-base font-bold text-slate-900">{t.voiceLedger}</h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xs mx-auto">
                  {currentLanguage === "krio"
                    ? "Tɔch mikrofon fɔ tɔk wetin yu sel, avɛst, ɔ spɛnd na farm."
                    : "Speak naturally in Krio or English to log sales, expenses, and harvests."}
                </p>
              </div>

              {/* Big Mic Button with Blue Glow */}
              <div className="flex flex-col items-center justify-center my-3">
                <button
                  onClick={() => handleSimulateVoice(krioVoicePreset)}
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-95 ${
                    isRecording
                      ? "bg-rose-600 text-white animate-pulse shadow-rose-500/50"
                      : "bg-[#0180FF] hover:bg-[#0066FF] text-white shadow-blue-500/30 hover:shadow-blue-500/50"
                  }`}
                  title="Tap to speak in Krio or English"
                >
                  {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </button>
                <span className="text-xs text-slate-500 mt-2 font-semibold">
                  {isRecording ? t.listening : t.tapToSpeak}
                </span>

                {isRecording && (
                  <div className="w-52 h-10 rounded-xl overflow-hidden relative mx-auto mt-2 border border-[#0180FF]/40 shadow-sm">
                    <Image src="/gifs/voice-wave.gif" alt="Sound Waveform" fill unoptimized className="object-cover" />
                  </div>
                )}
              </div>

              {/* Quick Demo Voice Presets */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                  Demo Voice Presets:
                </span>
                <div className="mt-2 flex flex-col gap-2">
                  <button
                    onClick={() => handleSimulateVoice(krioVoicePreset)}
                    className="text-left text-xs bg-white p-2.5 rounded-xl border border-slate-200 hover:border-[#0180FF] transition flex items-center justify-between group"
                  >
                    <span className="italic text-slate-700 font-medium">"{krioVoicePreset}"</span>
                    <span className="text-[10px] bg-blue-50 text-[#0180FF] px-2 py-0.5 rounded-full font-bold">
                      Krio Sale
                    </span>
                  </button>
                  <button
                    onClick={() => handleSimulateVoice(englishVoicePreset)}
                    className="text-left text-xs bg-white p-2.5 rounded-xl border border-slate-200 hover:border-[#0180FF] transition flex items-center justify-between group"
                  >
                    <span className="italic text-slate-700 font-medium">"{englishVoicePreset}"</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                      Harvest
                    </span>
                  </button>
                </div>
              </div>

              {/* AI Confirmation Card */}
              {parsedCandidate && (
                <div className="bg-blue-50/60 border-2 border-[#0180FF] rounded-2xl p-4 shadow-sm animate-in fade-in space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0180FF]">
                      <SparklesSVG size={16} />
                      <span>AI Extracted Record</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      95% Match
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-blue-150">
                      <span className="text-slate-400 text-[10px] font-medium">Crop:</span>
                      <p className="font-bold text-slate-800">{parsedCandidate.crop}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-blue-150">
                      <span className="text-slate-400 text-[10px] font-medium">Quantity:</span>
                      <p className="font-bold text-slate-800">
                        {parsedCandidate.quantity} {parsedCandidate.unit}
                      </p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-blue-150">
                      <span className="text-slate-400 text-[10px] font-medium">Amount:</span>
                      <p className="font-bold text-[#0180FF] font-mono">SLE {parsedCandidate.amountSLE}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-blue-150">
                      <span className="text-slate-400 text-[10px] font-medium">Type / Location:</span>
                      <p className="font-bold capitalize text-slate-800">
                        {parsedCandidate.entryType} · {parsedCandidate.location}
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] text-blue-900 bg-blue-100/50 p-2.5 rounded-xl">
                    ⚠️ <b>Guardrail:</b> Every entry requires farmer confirmation before affecting your score.
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleConfirmCandidate}
                      className="flex-1 bg-[#0180FF] hover:bg-[#0066FF] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow shadow-blue-500/20"
                    >
                      <CheckCircleSVG size={15} />
                      <span>{t.confirmRecord}</span>
                    </button>
                    <button
                      onClick={() => setParsedCandidate(null)}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-100"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Osusu & Pot Advance */}
          {pwaTab === "osusu" && (
            <div className="space-y-4">
              {/* Rotating Osusu Pot Circle GIF */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 h-36 flex items-center justify-center shadow-sm">
                <Image
                  src="/gifs/osusu-circle.gif"
                  alt="Rotating Osusu Pot Animation"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-[#0180FF] font-bold uppercase tracking-wider">
                      Rotating Osusu Group
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{group?.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      12 members · Tikonko, Bo · Weekly: SLE 100
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                    Turn #6 of 12
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Target Pot:</span>
                    <p className="font-bold font-mono text-slate-800">SLE 1,200.00</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Your Turn Date:</span>
                    <p className="font-bold text-[#0180FF]">24 Nov 2026 (7 days)</p>
                  </div>
                </div>

                <button
                  onClick={() => payOsusuContribution(100)}
                  className="w-full mt-3 bg-[#0180FF] hover:bg-[#0066FF] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow shadow-blue-500/20 transition"
                >
                  <ArrowRightSVG size={14} />
                  <span>{t.payContribution} (SLE 100)</span>
                </button>
              </div>

              {/* G1 Innovation: Pot Advance Card */}
              <div className="border border-blue-200 bg-blue-50/50 rounded-3xl p-4 shadow-sm space-y-2.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#0180FF]" />
                    <h4 className="font-bold text-xs text-[#0B132B] uppercase tracking-wide">
                      G1. Pot Advance (Flagship)
                    </h4>
                  </div>
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                    Pre-Approved
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Need planting funds before your 24 Nov turn? Collect your pot advance early, funded by partner
                  bank and auto-deducted on harvest payout.
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => setShowPotAdvanceModal(true)}
                    className="w-full bg-[#0180FF] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#0066FF] transition shadow flex items-center justify-center gap-1.5"
                  >
                    <Users className="w-4 h-4" />
                    <span>Request Pot Advance (With Group Vote)</span>
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => requestPotAdvance(400)}
                      className="flex-1 bg-white border border-slate-300 text-slate-700 py-1.5 rounded-xl text-[11px] font-bold hover:bg-slate-50 transition"
                    >
                      Instant SLE 400
                    </button>
                    <button
                      onClick={() => requestPotAdvance(800)}
                      className="flex-1 bg-white border border-slate-300 text-slate-700 py-1.5 rounded-xl text-[11px] font-bold hover:bg-slate-50 transition"
                    >
                      Instant SLE 800
                    </button>
                  </div>
                </div>
              </div>

              {/* Rain-Check Parametric Insurance */}
              <div className="border border-slate-200 bg-slate-50 rounded-3xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                    <CloudRain className="w-4 h-4 text-[#0180FF]" />
                    <span>Rain-Check Parametric Cover</span>
                  </div>
                  <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                    ACTIVE
                  </span>
                </div>
                {/* Weather radar GIF */}
                <div className="relative rounded-2xl overflow-hidden h-24 border border-slate-200 bg-slate-900">
                  <Image
                    src="/gifs/rain-check.gif"
                    alt="Rain-Check Weather Telemetry"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <p className="text-xs text-slate-600">
                  Micro-premium: SLE 5/cycle. Trigger: Bo rainfall &lt; 30mm/mo. Instant relief: SLE 400.
                </p>
                <button
                  onClick={() => triggerDroughtParametricPayout()}
                  className="w-full text-xs font-bold py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center gap-1.5 shadow"
                >
                  <CloudRain className="w-3.5 h-3.5" />
                  <span>Simulate Satellite Drought Trigger (SLE 400)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: G5 Innovation - Envelopes & Season Calendar */}
          {pwaTab === "envelopes" && (
            <div className="space-y-4">
              {/* Virtual Envelopes Animation GIF */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 h-36 flex items-center justify-center shadow-sm">
                <Image
                  src="/gifs/envelope-save.gif"
                  alt="Virtual Envelopes Auto-Allocation"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="text-center">
                <h3 className="text-base font-bold text-slate-900">
                  G5. Virtual Wallet Envelopes
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ring-fenced sub-wallets preventing distress spending during lean season.
                </p>
              </div>

              <button
                onClick={() => setShowEnvelopeModal(true)}
                className="w-full py-2.5 rounded-2xl bg-[#0180FF] hover:bg-[#0066FF] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow shadow-blue-500/20"
              >
                <Layers className="w-4 h-4" />
                <span>Open Envelope Allocator & Season Runway</span>
              </button>

              <div className="space-y-2.5">
                {wallet.envelopes.map((env) => (
                  <div
                    key={env.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-800">{env.name}</span>
                      <div className="w-32 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-[#0180FF]"
                          style={{ width: `${Math.min(100, (env.balanceSLE / env.targetSLE) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-xs font-mono text-[#0180FF]">SLE {env.balanceSLE}</span>
                      <p className="text-[10px] text-slate-400">Target: SLE {env.targetSLE}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Season Calendar Nudge */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>November Agricultural Nudge</span>
                </div>
                <p className="text-xs text-amber-950 italic leading-relaxed">
                  {currentLanguage === "krio"
                    ? '"Novemba na peak harvest! Certified buyers de pay direct na yu mobile money, and yu input loans go settle wantem."'
                    : '"November is peak harvest. Certified buyers settle input loans at source, transferring surplus directly to your wallet."'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: G4 Innovation - Plot Proof & Satellite NDVI */}
          {pwaTab === "plot" && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-base font-bold text-slate-900">
                  G4. Plot Proof & Satellite NDVI
                </h3>
                <p className="text-xs text-slate-500">
                  Sentinel-2 multispectral vegetation index verifying plot cultivation.
                </p>
              </div>

              <div className="border border-emerald-200 bg-emerald-50/50 rounded-3xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Bo Plot #BO-418 (2.5 Acres)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded font-mono font-bold">
                    NDVI 0.74
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vegetation Health:</span>
                    <span className="font-bold text-emerald-700">Vigorous Healthy Rice</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">GPS Coordinates:</span>
                    <span className="font-mono text-slate-700">7.964° N, 11.738° W</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Constellation:</span>
                    <span className="text-slate-700">Copernicus Sentinel-2B</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Satellite vegetation density verifies active planting, providing alternative credit collateral
                  for farmers without formal land registry deeds.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Credit Score Modal */}
        {showScoreModal && (
          <div className="fixed inset-0 z-50 bg-[#0B132B]/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-[#0180FF] uppercase tracking-wide">
                    Transparent Heuristic v0
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">Group Credit Score Explainer</h3>
                </div>
                <button
                  onClick={() => setShowScoreModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-4xl font-mono font-extrabold text-[#0180FF]">88.8</span>
                <span className="text-slate-400 text-lg"> / 100</span>
                <div className="mt-1.5">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                    Tier A (Prime Bankable Group)
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex justify-between">
                  <span>1. On-time Osusu Cycles (35% weight)</span>
                  <b className="font-mono">95% → 33.3 pts</b>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex justify-between">
                  <span>2. Repayment History (25% weight)</span>
                  <b className="font-mono">90% → 22.5 pts</b>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex justify-between">
                  <span>3. Buyer-Verified Sales (20% weight)</span>
                  <b className="font-mono">85% → 17.0 pts</b>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex justify-between">
                  <span>4. Group Tenure & Size (10% weight)</span>
                  <b className="font-mono">80% → 8.0 pts</b>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex justify-between">
                  <span>5. Ledger Completeness (10% weight)</span>
                  <b className="font-mono">80% → 8.0 pts</b>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-[11px] text-blue-950 leading-relaxed">
                <b>Statutory Guardrail:</b> Recommended borrowing limit is SLE 4,800.00 at 12.0% annual interest
                (strictly compliant with Sierra Leone's 15% statutory ceiling).
              </div>

              <button
                onClick={() => setShowScoreModal(false)}
                className="w-full bg-[#0180FF] hover:bg-[#0066FF] text-white py-3 rounded-xl text-xs font-bold transition shadow"
              >
                Close Explainer
              </button>
            </div>
          </div>
        )}

        {/* G1 Pot Advance Democratic Voting Modal */}
        <PotAdvanceModal
          isOpen={showPotAdvanceModal}
          onClose={() => setShowPotAdvanceModal(false)}
        />

        {/* G5 Virtual Envelope Allocator & Season Calendar Modal */}
        <EnvelopeManagerModal
          isOpen={showEnvelopeModal}
          onClose={() => setShowEnvelopeModal(false)}
        />

        {/* Certified Digital Harvest Receipt Modal */}
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
        />
      </div>
    </div>
  );
};
