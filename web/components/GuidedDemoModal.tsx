"use client";

import React, { useState } from "react";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  PhoneCall,
  Mic,
  Briefcase,
  Landmark,
  Sparkles,
  X,
} from "lucide-react";
import { FambulLogo, CheckCircleSVG, ArrowRightSVG } from "./Icons";

interface GuidedDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
}

export const GuidedDemoModal: React.FC<GuidedDemoModalProps> = ({
  isOpen,
  onClose,
  setActiveTab,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: "Step 1: Farmer Records Sale / Pays Osusu (USSD or Voice)",
      tab: "ussd",
      description:
        "Open the USSD Phone Simulator and dial *714#. Navigate to '4. Record' to record a sale of 10 bags of rice for SLE 450, or pay an Osusu contribution of SLE 100. Watch the raw telemetry logs.",
      actionLabel: "Go to USSD Simulator",
      icon: PhoneCall,
    },
    {
      step: 2,
      title: "Step 2: Voice Ledger & Transparent Credit Scoring",
      tab: "farmer",
      description:
        "Switch to the Farmer PWA. Test the spoken Krio voice note preset. Click the group score badge (88.8 Tier A) to view the 5 transparent weighted pillars (35% consistency, 25% repayment, 20% sales).",
      actionLabel: "Go to Farmer PWA",
      icon: Mic,
    },
    {
      step: 3,
      title: "Step 3: Certified Aggregator 4-Way Split Payout",
      tab: "buyer",
      description:
        "Navigate to the Buyer Payout Console (Rokel Grain). Click 'Execute 4-Way Split Payout'. Watch Gross proceeds automatically deduct loan repayments, Osusu shares, and 1% fee, sending net mobile money to farmers.",
      actionLabel: "Go to Buyer Console",
      icon: Briefcase,
    },
    {
      step: 4,
      title: "Step 4: Real-time Lender Settlement & SMS Delivery",
      tab: "lender",
      description:
        "Review the Lender Dashboard. The loan repayment has settled live without manual chasing, portfolio PAR30 remains at 2.1%, and masked SMS confirmations are logged in the USSD SMS inbox.",
      actionLabel: "Go to Lender Dashboard",
      icon: Landmark,
    },
  ];

  const current = steps[currentStep - 1];
  const Icon = current.icon;

  const handleNavigate = () => {
    setActiveTab(current.tab);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B132B]/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0180FF] flex items-center justify-center font-bold">
              <Compass className="w-5 h-5 text-[#0180FF]" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#0180FF] uppercase tracking-wider">
                Judge Evaluation Tour
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                End-to-End Financial Loop
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Dots */}
        <div className="flex items-center gap-2">
          {steps.map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`h-2 rounded-full transition-all ${
                currentStep === s.step
                  ? "w-8 bg-[#0180FF]"
                  : currentStep > s.step
                  ? "w-2 bg-emerald-500"
                  : "w-2 bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Current Step Content */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0180FF] text-white flex items-center justify-center text-xs font-bold">
              {current.step}
            </div>
            <h4 className="font-bold text-xs text-slate-900">{current.title}</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{current.description}</p>

          <button
            onClick={handleNavigate}
            className="w-full mt-2 bg-[#0180FF] hover:bg-[#0066FF] text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow shadow-blue-500/20"
          >
            <span>{current.actionLabel}</span>
            <ArrowRightSVG size={14} />
          </button>
        </div>

        {/* Navigation Next/Prev */}
        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
          <button
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => prev - 1)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Previous Step
          </button>

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="flex items-center gap-1 text-xs font-bold text-[#0180FF] hover:text-[#0066FF]"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700"
            >
              Finish Tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
