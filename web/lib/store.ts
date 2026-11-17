"use client";

import { useState, useEffect } from "react";
import Dexie, { Table } from "dexie";
import {
  User,
  OsusuGroup,
  GroupMember,
  Wallet,
  LedgerEntry,
  Loan,
  PayoutLine,
  InsurancePolicy,
  Role,
  Language,
} from "./types";
import {
  SEED_USERS,
  SEED_GROUPS,
  SEED_MEMBERS,
  SEED_WALLET,
  SEED_LOANS,
  SEED_LEDGER_ENTRIES,
  SEED_PAYOUT_BATCH,
  SEED_INSURANCE_POLICY,
} from "./seed-data";
import { calculateGroupScore, calculateRecommendedLoanLimit } from "./scoring.config";

// Dexie Offline Database for Farmer PWA
export interface OfflineQueueItem {
  id?: number;
  entryType: "sale" | "expense" | "harvest";
  crop: string;
  quantity: number;
  unit: string;
  amountSLE: number;
  location: string;
  rawVoiceNote?: string;
  timestamp: string;
  synced: boolean;
}

class FambulOfflineDatabase extends Dexie {
  ledgerQueue!: Table<OfflineQueueItem, number>;

  constructor() {
    super("FambulFundOfflineDB");
    this.version(1).stores({
      ledgerQueue: "++id, entryType, crop, timestamp, synced",
    });
  }
}

export const offlineDB = typeof window !== "undefined" ? new FambulOfflineDatabase() : null;

export interface SMSItem {
  id: string;
  recipient: string;
  message: string;
  timestamp: string;
  category: string;
}

// Global in-memory broadcast channel for live reactive updates across tabs/components
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

// Initial Singleton State
const state = {
  isAuthenticated: false,
  currentRole: "farmer" as Role,
  currentLanguage: "krio" as Language,
  currentUser: SEED_USERS[0],
  wallet: { ...SEED_WALLET },
  groups: [...SEED_GROUPS],
  members: [...SEED_MEMBERS],
  loans: [...SEED_LOANS],
  ledgerEntries: [...SEED_LEDGER_ENTRIES],
  payoutLines: [...SEED_PAYOUT_BATCH],
  insurancePolicy: { ...SEED_INSURANCE_POLICY },
  smsInbox: [
    {
      id: "sms-init-01",
      recipient: "+23276123456",
      message: "Fambul Fund: Welcome Aminata! Dial *714# anytime to check wallet or Osusu status.",
      timestamp: "2026-11-16T12:00:00Z",
      category: "SYSTEM",
    },
    {
      id: "sms-init-02",
      recipient: "+23276123456",
      message: "Fambul Fund: Harvest payout of SLE ***.00 credited from Rokel Grain. Ref: PAY-8921.",
      timestamp: "2026-11-10T14:21:00Z",
      category: "HARVEST_PAYOUT",
    },
  ] as SMSItem[],
  isOfflineSimulated: false,
};

export const fambulStore = {
  getState() {
    return state;
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  login(role: Role, phone?: string, name?: string) {
    state.isAuthenticated = true;
    state.currentRole = role;
    if (role === "farmer") {
      state.currentUser = SEED_USERS[0];
    } else if (role === "leader") {
      state.currentUser = SEED_USERS[1];
    } else if (role === "buyer") {
      state.currentUser = {
        id: "byr-usr-01",
        name: name || "Sahr Bundu (Rokel Aggregators)",
        phoneNumber: phone || "+23277900200",
        role: "buyer",
        language: "en",
        district: "Bo",
        chiefdom: "Kakua",
        village: "Bo Town",
        createdAt: "2026-05-01T00:00:00Z",
      };
    } else if (role === "lender") {
      state.currentUser = {
        id: "lnd-usr-01",
        name: name || "Aminata Bangura (Partner Bank)",
        phoneNumber: phone || "+23276800100",
        role: "lender",
        language: "en",
        district: "Freetown",
        chiefdom: "Western Urban",
        village: "Central Freetown",
        createdAt: "2026-05-01T00:00:00Z",
      };
    } else if (role === "admin") {
      state.currentUser = {
        id: "adm-usr-01",
        name: name || "David Mansaray (UNCDF / Bank of SL)",
        phoneNumber: phone || "+23279999000",
        role: "admin",
        language: "en",
        district: "Freetown",
        chiefdom: "Western Area",
        village: "Tower Hill",
        createdAt: "2026-01-01T00:00:00Z",
      };
    }
    notify();
  },

  logout() {
    state.isAuthenticated = false;
    notify();
  },

  setRole(role: Role) {
    state.currentRole = role;
    if (role === "farmer") state.currentUser = SEED_USERS[0];
    else if (role === "leader") state.currentUser = SEED_USERS[1];
    else if (role === "buyer") state.currentUser = SEED_USERS[0]; // representative
    notify();
  },

  setLanguage(lang: Language) {
    state.currentLanguage = lang;
    notify();
  },

  toggleOfflineSimulation(enabled: boolean) {
    state.isOfflineSimulated = enabled;
    notify();
  },

  sendSMS(recipient: string, message: string, category: string) {
    const item: SMSItem = {
      id: `sms-${Date.now()}`,
      recipient,
      message,
      timestamp: new Date().toISOString(),
      category,
    };
    state.smsInbox = [item, ...state.smsInbox];
    notify();
    return item;
  },

  addLedgerEntry(entry: Omit<LedgerEntry, "id" | "createdAt" | "farmerName">) {
    const newEntry: LedgerEntry = {
      ...entry,
      id: `led-${Date.now()}`,
      farmerName: state.currentUser.name,
      createdAt: new Date().toISOString(),
    };
    state.ledgerEntries = [newEntry, ...state.ledgerEntries];

    // Recompute credit score for Gbo-Kakua Osusu
    const group = state.groups[0];
    if (group) {
      // Adding ledger entries boosts ledger completeness
      const newScore = Math.min(99.0, Number((group.creditScore + 0.4).toFixed(1)));
      group.creditScore = newScore;
    }

    notify();
    return newEntry;
  },

  async addOfflineLedgerEntry(entry: Omit<OfflineQueueItem, "id" | "synced" | "timestamp">) {
    if (offlineDB) {
      const item: OfflineQueueItem = {
        ...entry,
        timestamp: new Date().toISOString(),
        synced: !state.isOfflineSimulated,
      };
      await offlineDB.ledgerQueue.add(item);
    }
    if (!state.isOfflineSimulated) {
      this.addLedgerEntry({
        userId: state.currentUser.id,
        crop: entry.crop,
        entryType: entry.entryType,
        quantity: entry.quantity,
        unit: entry.unit,
        amountSLE: entry.amountSLE,
        source: "voice",
        location: entry.location,
        verifiedByBuyer: false,
        confirmedByFarmer: true,
        rawVoiceNote: entry.rawVoiceNote,
      });
    }
    notify();
  },

  async syncOfflineQueue() {
    if (!offlineDB) return 0;
    const unsynced = await offlineDB.ledgerQueue.where("synced").equals(0).toArray();
    for (const item of unsynced) {
      this.addLedgerEntry({
        userId: state.currentUser.id,
        crop: item.crop,
        entryType: item.entryType,
        quantity: item.quantity,
        unit: item.unit,
        amountSLE: item.amountSLE,
        source: "voice",
        location: item.location,
        verifiedByBuyer: false,
        confirmedByFarmer: true,
        rawVoiceNote: item.rawVoiceNote,
      });
      if (item.id) {
        await offlineDB.ledgerQueue.update(item.id, { synced: true });
      }
    }
    state.isOfflineSimulated = false;
    notify();
    return unsynced.length;
  },

  payOsusuContribution(amountSLE: number, memberName: string = "Aminata Kamara") {
    state.wallet.availableBalanceSLE = Math.max(0, state.wallet.availableBalanceSLE - amountSLE);
    const group = state.groups[0];
    if (group) {
      group.totalPoolSavedSLE += amountSLE;
      group.creditScore = Math.min(99.0, Number((group.creditScore + 0.3).toFixed(1)));
    }
    this.sendSMS(
      state.currentUser.phoneNumber,
      `Fambul Fund: Contribution of SLE ***.00 paid to ${group?.name}. New bal: SLE ***.00. Ref: OSU-${Math.floor(
        Math.random() * 9000 + 1000
      )}.`,
      "OSUSU_CONTRIBUTION"
    );
    notify();
  },

  repayLoan(amountSLE: number) {
    const loan = state.loans[0];
    if (loan) {
      loan.repaidAmountSLE += amountSLE;
      if (loan.repaidAmountSLE >= loan.totalRepayableSLE) {
        loan.status = "REPAID";
      }
    }
    state.wallet.availableBalanceSLE = Math.max(0, state.wallet.availableBalanceSLE - amountSLE);
    this.sendSMS(
      state.currentUser.phoneNumber,
      `Fambul Fund: Loan repayment of SLE ***.00 received. Balance reduced. Ref: LNR-${Math.floor(
        Math.random() * 9000 + 1000
      )}.`,
      "LOAN_REPAYMENT"
    );
    notify();
  },

  requestPotAdvance(amountSLE: number) {
    state.wallet.availableBalanceSLE += amountSLE;
    const fee = Math.round(amountSLE * 0.02);
    // Add loan record for advance
    const advanceLoan: Loan = {
      id: `ln-adv-${Date.now()}`,
      lenderId: "lnd-02",
      lenderName: "Salone Community Microfinance (MFI)",
      groupId: state.groups[0].id,
      groupName: state.groups[0].name,
      farmerId: state.currentUser.id,
      farmerName: state.currentUser.name,
      principalAmountSLE: amountSLE,
      interestRatePct: 2.0,
      totalRepayableSLE: amountSLE + fee,
      repaidAmountSLE: 0,
      status: "ACTIVE",
      repaymentAtSource: true,
      purpose: "Pot Advance Bridge",
      disbursedAt: new Date().toISOString(),
      dueDate: "2026-12-15T00:00:00Z",
    };
    state.loans = [advanceLoan, ...state.loans];
    this.sendSMS(
      state.currentUser.phoneNumber,
      `Fambul Fund: Pot Advance of SLE ***.00 credited. Auto-deducts next harvest. Ref: ADV-${Math.floor(
        Math.random() * 9000 + 1000
      )}.`,
      "POT_ADVANCE"
    );
    notify();
  },

  executeBuyerPayoutBatch() {
    // Executes 4-way split logic for all lines in the batch
    state.payoutLines = state.payoutLines.map((line, index) => {
      // Simulate 1 retryable failure on row 2 if not already resolved
      if (index === 1 && line.status === "PENDING") {
        return {
          ...line,
          status: "FAILED" as const,
          failureReason: "Subscriber wallet temporarily inactive (retryable)",
        };
      }

      // Successful lines
      const updatedLine: PayoutLine = {
        ...line,
        status: "SUCCESS" as const,
        txReference: `${line.provider === "Orange Money" ? "OM-SL" : "AFRI-SL"}-${Math.floor(
          Math.random() * 900000 + 100000
        )}`,
      };

      // If line is for Aminata Kamara, credit wallet and reduce loan
      if (line.farmerId === "usr-01") {
        state.wallet.availableBalanceSLE += updatedLine.netPayoutSLE;
        const loan = state.loans.find((l) => l.farmerId === "usr-01");
        if (loan && updatedLine.loanRepaymentSLE > 0) {
          loan.repaidAmountSLE = Math.min(loan.totalRepayableSLE, loan.repaidAmountSLE + updatedLine.loanRepaymentSLE);
          if (loan.repaidAmountSLE >= loan.totalRepayableSLE) {
            loan.status = "REPAID";
          }
        }
      }

      return updatedLine;
    });

    // Notify lender dashboard and farmer SMS
    this.sendSMS(
      "+23276123456",
      "Fambul Fund: Harvest payout received! Gross: SLE ***. Loan auto-repaid: SLE ***. Net deposited to wallet: SLE ***.",
      "HARVEST_PAYOUT"
    );
    notify();
  },

  retryFailedPayoutLine(lineId: string) {
    state.payoutLines = state.payoutLines.map((l) => {
      if (l.id === lineId) {
        return {
          ...l,
          status: "SUCCESS" as const,
          failureReason: undefined,
          txReference: `OM-SL-RETRY-${Math.floor(Math.random() * 90000 + 10000)}`,
        };
      }
      return l;
    });
    notify();
  },

  approveLoan(loanId: string) {
    const loan = state.loans.find((l) => l.id === loanId);
    if (loan) {
      loan.status = "ACTIVE";
      notify();
    }
  },

  triggerDroughtParametricPayout() {
    state.insurancePolicy.status = "TRIGGERED";
    // Disburse 400 SLE to all 12 group members instantly
    state.wallet.availableBalanceSLE += 400;
    this.sendSMS(
      "+23276123456",
      "RAIN-CHECK ALERT: Satellite verified rainfall <30mm in Bo District. Parametric drought relief of SLE ***.00 paid into wallet.",
      "INSURANCE_PAYOUT"
    );
    notify();
  },
};

export function useFambulStore() {
  const [data, setData] = useState(() => fambulStore.getState());

  useEffect(() => {
    return fambulStore.subscribe(() => {
      setData({ ...fambulStore.getState() });
    });
  }, []);

  return {
    ...data,
    setRole: fambulStore.setRole,
    login: fambulStore.login.bind(fambulStore),
    logout: fambulStore.logout.bind(fambulStore),
    setLanguage: fambulStore.setLanguage,
    toggleOfflineSimulation: fambulStore.toggleOfflineSimulation,
    addLedgerEntry: fambulStore.addLedgerEntry.bind(fambulStore),
    addOfflineLedgerEntry: fambulStore.addOfflineLedgerEntry.bind(fambulStore),
    syncOfflineQueue: fambulStore.syncOfflineQueue.bind(fambulStore),
    payOsusuContribution: fambulStore.payOsusuContribution.bind(fambulStore),
    repayLoan: fambulStore.repayLoan.bind(fambulStore),
    requestPotAdvance: fambulStore.requestPotAdvance.bind(fambulStore),
    executeBuyerPayoutBatch: fambulStore.executeBuyerPayoutBatch.bind(fambulStore),
    retryFailedPayoutLine: fambulStore.retryFailedPayoutLine.bind(fambulStore),
    approveLoan: fambulStore.approveLoan.bind(fambulStore),
    triggerDroughtParametricPayout: fambulStore.triggerDroughtParametricPayout.bind(fambulStore),
    sendSMS: fambulStore.sendSMS.bind(fambulStore),
  };
}
