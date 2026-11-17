"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useFambulStore } from "@/lib/store";
import {
  PhoneCallSVG,
  BankSealSVG,
  CheckCircleSVG,
  LockSVG,
} from "./Icons";
import {
  Phone,
  PhoneOff,
  Delete,
  Terminal,
  MessageSquare,
  ShieldCheck,
  Code2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const USSDSimulator: React.FC = () => {
  const { smsInbox } = useFambulStore();

  const [phoneNumber, setPhoneNumber] = useState("+23276123456");
  const [sessionId, setSessionId] = useState(`sess-${Date.now()}`);
  const [sessionInputPath, setSessionInputPath] = useState("");
  const [currentScreenText, setCurrentScreenText] = useState(
    "Fambul Fund GSM Gateway\nDial *714# to begin."
  );
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [keypadInput, setKeypadInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Raw inspector logs
  const [lastRequest, setLastRequest] = useState<any>(null);
  const [lastResponse, setLastResponse] = useState<string>("");
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [showDevPanel, setShowDevPanel] = useState(true);

  // Send request to real USSD endpoint
  const sendUSSDRequest = async (text: string) => {
    setIsLoading(true);
    const start = performance.now();

    const payload = {
      sessionId,
      phoneNumber,
      text,
      serviceCode: "*714#",
    };
    setLastRequest(payload);

    try {
      const res = await fetch("/api/ussd/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.text();
      const end = performance.now();
      setLatencyMs(Math.round(end - start));
      setLastResponse(data);

      const isCON = data.startsWith("CON ");
      const isEND = data.startsWith("END ");
      const cleanText = data.replace(/^(CON |END )/, "");

      setCurrentScreenText(cleanText);

      if (isEND) {
        setIsSessionActive(false);
        setSessionInputPath("");
      } else if (isCON) {
        setIsSessionActive(true);
      }
    } catch (err) {
      setCurrentScreenText("Error: Network connection timeout.\nPlease try again later.");
      setIsSessionActive(false);
    } finally {
      setIsLoading(false);
      setKeypadInput("");
    }
  };

  const handleDialInitial = () => {
    const newSess = `sess-${Date.now()}`;
    setSessionId(newSess);
    setSessionInputPath("");
    sendUSSDRequest("");
  };

  const handleKeypadPress = (val: string) => {
    setKeypadInput((prev) => prev + val);
  };

  const handleClear = () => {
    setKeypadInput((prev) => prev.slice(0, -1));
  };

  const handleSendInput = () => {
    if (!keypadInput.trim()) return;

    const nextPath = sessionInputPath
      ? `${sessionInputPath}*${keypadInput.trim()}`
      : keypadInput.trim();

    setSessionInputPath(nextPath);
    sendUSSDRequest(nextPath);
  };

  const handleEndCall = () => {
    setIsSessionActive(false);
    setCurrentScreenText("Call ended.\nDial *714# to start again.");
    setKeypadInput("");
    setSessionInputPath("");
  };

  return (
    <div className="max-w-6xl mx-auto my-6 px-4 space-y-6">
      {/* Top Banner (Monime Style) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#0180FF] uppercase tracking-wider">
            Rural 2G Feature Phone Channel (Offline First)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] mt-1">
            USSD *714# Phone Simulator
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hardware feature-phone frame communicating live with <code className="font-mono bg-slate-100 text-[#0180FF] px-1.5 py-0.5 rounded">POST /api/ussd/callback</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">SIM Subscriber:</span>
          <select
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              handleEndCall();
            }}
            className="text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0180FF]"
          >
            <option value="+23276123456">+23276123456 (Aminata Kamara - Farmer)</option>
            <option value="+23277987654">+23277987654 (Sorie Mansaray - Leader)</option>
            <option value="+23278555111">+23278555111 (Fatmata Bangura - Kailahun)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Feature Phone on Left, SMS Inbox & Dev Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Realistic Feature Phone Hardware Frame */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-[320px] bg-[#0B132B] rounded-[48px] p-5 shadow-2xl border-4 border-slate-700 phone-frame text-white space-y-4">
            {/* Top Ear Speaker & Brand Mark */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-14 h-1.5 bg-slate-900 rounded-full" />
              <span className="text-[10px] tracking-widest uppercase font-mono text-[#0180FF] font-bold">
                FAMBUL-GSM
              </span>
            </div>

            {/* Monochrome Green USSD LCD Screen */}
            <div className="bg-[#8EBF9B] rounded-2xl p-3.5 border-4 border-slate-800 shadow-inner text-[#062211] font-mono text-xs min-h-[180px] flex flex-col justify-between">
              {/* Screen Status Bar */}
              <div className="flex justify-between items-center text-[10px] border-b border-[#062211]/20 pb-1 mb-2 font-bold">
                <span>Orange SL 2G</span>
                <span>{isLoading ? "Connecting..." : "●●●● 100%"}</span>
              </div>

              {/* Screen Body */}
              <div className="whitespace-pre-line leading-relaxed font-semibold flex-1 overflow-y-auto">
                {currentScreenText}
              </div>

              {/* Bottom Current Keypad Input */}
              {isSessionActive && (
                <div className="mt-2 pt-1 border-t border-[#062211]/30 flex justify-between items-center">
                  <span className="text-[11px] font-bold">Input: {keypadInput || "_"}</span>
                  <span className="text-[10px] opacity-80">Press SEND</span>
                </div>
              )}
            </div>

            {/* Hardware Keypad */}
            <div className="space-y-2 pt-1">
              {/* Primary Call / End / Action Keys */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={isSessionActive ? handleSendInput : handleDialInitial}
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow active:translate-y-0.5 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{isSessionActive ? "SEND" : "DIAL *714#"}</span>
                </button>
                <button
                  onClick={handleEndCall}
                  className="bg-rose-700 hover:bg-rose-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow active:translate-y-0.5 transition"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>END</span>
                </button>
              </div>

              {/* 12-Button Numeric Matrix */}
              <div className="grid grid-cols-3 gap-2 text-sm font-bold font-mono">
                {[
                  { k: "1", sub: "" },
                  { k: "2", sub: "abc" },
                  { k: "3", sub: "def" },
                  { k: "4", sub: "ghi" },
                  { k: "5", sub: "jkl" },
                  { k: "6", sub: "mno" },
                  { k: "7", sub: "pqrs" },
                  { k: "8", sub: "tuv" },
                  { k: "9", sub: "wxyz" },
                  { k: "*", sub: "" },
                  { k: "0", sub: "+" },
                  { k: "#", sub: "" },
                ].map((btn) => (
                  <button
                    key={btn.k}
                    onClick={() => handleKeypadPress(btn.k)}
                    className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white py-2 rounded-xl flex flex-col items-center justify-center shadow-sm active:translate-y-0.5 transition border border-slate-700/60"
                  >
                    <span className="text-sm leading-none">{btn.k}</span>
                    {btn.sub && <span className="text-[8px] text-slate-400 font-sans">{btn.sub}</span>}
                  </button>
                ))}
              </div>

              {/* Navigation Quick Keys (0: Back, 00: Home, Clear) */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
                <button
                  onClick={() => {
                    setKeypadInput("0");
                    const next = sessionInputPath ? `${sessionInputPath}*0` : "0";
                    setSessionInputPath(next);
                    sendUSSDRequest(next);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 py-2 rounded-xl text-slate-300"
                >
                  0: Back
                </button>
                <button
                  onClick={() => {
                    setKeypadInput("00");
                    const next = sessionInputPath ? `${sessionInputPath}*00` : "00";
                    setSessionInputPath(next);
                    sendUSSDRequest(next);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 py-2 rounded-xl text-[#0180FF] font-bold"
                >
                  00: Home
                </button>
                <button
                  onClick={handleClear}
                  className="bg-slate-800 hover:bg-slate-700 py-2 rounded-xl text-slate-300 flex items-center justify-center"
                >
                  <Delete className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: SMS Inbox & Developer Raw Inspector */}
        <div className="lg:col-span-7 space-y-4">
          {/* Animated 2G USSD Dialing Telemetry */}
          <div className="relative rounded-3xl overflow-hidden h-36 bg-[#0B132B] border border-slate-700 shadow-sm flex items-center justify-center">
            <Image
              src="/gifs/ussd-dial.gif"
              alt="2G GSM USSD Engine Dialing *714#"
              fill
              unoptimized
              className="object-cover opacity-95"
            />
          </div>

          {/* SMS Inbox Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#0180FF]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Simulated SMS Inbox ({smsInbox.length})
                </h3>
              </div>
              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                Masked Sensitive Data
              </span>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {smsInbox.map((sms) => (
                <div
                  key={sms.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1 hover:border-[#0180FF] transition"
                >
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-[#0180FF]">From: Fambul Fund</span>
                    <span className="font-mono">{new Date(sms.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">{sms.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Developer Raw Payload Inspector */}
          <div className="bg-[#0B132B] text-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setShowDevPanel(!showDevPanel)}
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#0180FF]" />
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Raw USSD Telephony Inspector
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {latencyMs > 0 && (
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                    {latencyMs}ms
                  </span>
                )}
                {showDevPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {showDevPanel && (
              <div className="space-y-3 pt-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Latest Request Payload:</span>
                  <pre className="bg-black/50 p-3 rounded-2xl mt-1 text-emerald-400 overflow-x-auto text-[11px]">
                    {lastRequest
                      ? JSON.stringify(lastRequest, null, 2)
                      : "Dial *714# on keypad to trigger request..."}
                  </pre>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Gateway String Response:</span>
                  <pre className="bg-black/50 p-3 rounded-2xl mt-1 text-blue-300 overflow-x-auto text-[11px] whitespace-pre-line">
                    {lastResponse || "Awaiting gateway transmission..."}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
