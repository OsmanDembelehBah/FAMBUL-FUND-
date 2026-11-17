"use client";

import React, { useState } from "react";
import { useFambulStore } from "@/lib/store";
import { Role } from "@/lib/types";
import {
  FambulLogo,
  BankSealSVG,
  LockSVG,
  LogInSVG,
  CheckCircleSVG,
  WalletSVG,
  OsusuGroupSVG,
} from "./Icons";
import { X, Smartphone, Building2, Landmark, ShieldCheck, ArrowRight, UserCheck } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: Role) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { login } = useFambulStore();

  const [selectedRole, setSelectedRole] = useState<Role>("farmer");
  const [phoneNumber, setPhoneNumber] = useState("+232 76 123 456");
  const [pin, setPin] = useState("1234");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const quickProfiles = [
    {
      role: "farmer" as Role,
      name: "Aminata Kamara",
      title: "Cocoa Smallholder & Osusu Member",
      location: "Tikonko, Bo District",
      phone: "+232 76 123 456",
      avatar: "/images/fatmata.jpg",
      icon: Smartphone,
      destTab: "farmer",
    },
    {
      role: "buyer" as Role,
      name: "Sahr Bundu",
      title: "Procurement Manager, Rokel Grain",
      location: "Bo & Kambia Depot",
      phone: "+232 77 900 200",
      avatar: "/images/sahr.jpg",
      icon: Building2,
      destTab: "buyer",
    },
    {
      role: "lender" as Role,
      name: "Aminata Bangura",
      title: "Agri Portfolio Officer, Partner Bank",
      location: "Freetown Headquarters",
      phone: "+232 76 800 100",
      avatar: "/images/fatmata.jpg",
      icon: Landmark,
      destTab: "lender",
    },
    {
      role: "admin" as Role,
      name: "David Mansaray",
      title: "FinTech Innovation Officer, UNCDF / Bank of SL",
      location: "Regulatory Sandbox Office",
      phone: "+232 79 999 000",
      avatar: "/images/sahr.jpg",
      icon: ShieldCheck,
      destTab: "impact",
    },
  ];

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    const profile = quickProfiles.find((p) => p.role === role);
    if (profile) {
      setPhoneNumber(profile.phone);
    }
  };

  const handleQuickLogin = (p: typeof quickProfiles[0]) => {
    setIsSubmitting(true);
    setTimeout(() => {
      login(p.role, p.phone, p.name);
      setIsSubmitting(false);
      setSuccessNotice(true);
      setTimeout(() => {
        setSuccessNotice(false);
        onLoginSuccess(p.role);
        onClose();
      }, 700);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const profile = quickProfiles.find((p) => p.role === selectedRole);
    setTimeout(() => {
      login(selectedRole, phoneNumber, profile?.name || "Verified User");
      setIsSubmitting(false);
      setSuccessNotice(true);
      setTimeout(() => {
        setSuccessNotice(false);
        onLoginSuccess(selectedRole);
        onClose();
      }, 700);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B132B]/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white max-w-xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
          <FambulLogo size={42} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fambul Fund Access</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#0180FF] border border-blue-200 px-2 py-0.5 rounded-full">
                Sandbox Mode
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Sign in with your registered phone number or select a demo role
            </p>
          </div>
        </div>

        {successNotice ? (
          <div className="py-12 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircleSVG size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Authentication Successful!</h3>
            <p className="text-xs text-slate-500">
              Routing you to your dedicated platform workspace...
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-6">
            {/* Quick Demo Persona Pickers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Instant Demo Access (Recommended for Judges)
                </span>
                <span className="text-[11px] text-[#0180FF] font-medium">1-Click Sign-in</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {quickProfiles.map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedRole === p.role;
                  return (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => handleQuickLogin(p)}
                      className={`text-left p-3 rounded-2xl border transition flex items-center gap-3 group ${
                        isSelected
                          ? "border-[#0180FF] bg-blue-50/50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#0180FF]/10 text-[#0180FF] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate flex items-center justify-between">
                          <span>{p.name}</span>
                          <span className="text-[10px] text-slate-400 capitalize">{p.role}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{p.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold text-[10px] tracking-wider">
                  Or Log In with Mobile Number & PIN
                </span>
              </div>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select System Role
                </label>
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-medium">
                  {(["farmer", "buyer", "lender", "admin"] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleSelect(r)}
                      className={`py-1.5 rounded-lg capitalize text-center transition ${
                        selectedRole === r
                          ? "bg-white text-[#0180FF] font-bold shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+232 76 123 456"
                    className="w-full pl-3 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0180FF] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    4-Digit Security PIN
                  </label>
                  <span className="text-[11px] text-slate-400">Default: 1234</span>
                </div>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full tracking-widest text-center py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0180FF] focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0180FF] hover:bg-[#0066FF] text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Authenticating on Mobile Rail...</span>
                ) : (
                  <>
                    <LogInSVG size={16} />
                    <span>Enter Fambul Fund Portal</span>
                  </>
                )}
              </button>
            </form>

            {/* Compliance Badge */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400 border-t border-slate-100">
              <BankSealSVG size={14} className="text-emerald-600" />
              <span>Simulated Bank of Sierra Leone FinTech Sandbox Authentication</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
