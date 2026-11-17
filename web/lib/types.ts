/**
 * Fambul Fund Core Schema & Domain Models
 * Supporting Sierra Leone Osusu informal groups, agri-wallets, payouts, and microfinance.
 */

export type Role = "farmer" | "leader" | "buyer" | "lender" | "admin";
export type Language = "en" | "krio";
export type LedgerSource = "voice" | "text" | "ussd";
export type PayoutStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
export type LoanStatus = "ACTIVE" | "PENDING_APPROVAL" | "REPAID" | "DEFAULTED";
export type MobileMoneyProvider = "Orange Money" | "Afrimoney" | "QMoney" | "Monime";

export interface User {
  id: string;
  name: string;
  phoneNumber: string; // e.g. +23276123456
  role: Role;
  language: Language;
  district: string;    // Bo, Kenema, Kailahun, Kambia, Port Loko, Tonkolili
  chiefdom: string;
  village: string;
  avatarUrl?: string;
  pinHash?: string;
  createdAt: string;
}

export interface Farm {
  id: string;
  userId: string;
  cropTypes: string[]; // Rice, Cassava, Cocoa, Oil Palm, Cashew, Vegetables
  acreage: number;
  latitude: number;
  longitude: number;
  ndviScore: number;
  ndviStatus: string;
  photoUrl?: string;
  createdAt: string;
}

export interface OsusuGroup {
  id: string;
  name: string;
  code: string;
  district: string;
  chiefdom: string;
  leaderId: string;
  leaderName: string;
  memberCount: number;
  womenLedPct: number;
  cycleFrequencyDays: number; // 7 (weekly) or 30 (monthly)
  currentCycle: number;
  totalCycles: number;
  shareAmountSLE: number;    // e.g. 50 SLE or 100 SLE
  potAmountSLE: number;
  totalPoolSavedSLE: number;
  creditScore: number;       // 0 - 100
  tier: "A" | "B" | "C" | "D";
  nextPotTurnDate: string;
  nextRecipientId: string;
  nextRecipientName: string;
  potAdvanceAllowed: boolean;
  rainCoverActive: boolean;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  name: string;
  phoneNumber: string;
  memberNumber: string; // e.g. M-01, M-02
  potTurnOrder: number;
  onTimePaymentRate: number; // 0 - 100%
  totalContributedSLE: number;
  walletBalanceSLE: number;
  hasActiveLoan: boolean;
  activeLoanBalanceSLE: number;
  isLeader: boolean;
}

export interface ContributionCycle {
  id: string;
  groupId: string;
  cycleNumber: number;
  dueDate: string;
  targetPotSLE: number;
  collectedPotSLE: number;
  recipientMemberId: string;
  recipientMemberName: string;
  status: "OPEN" | "COMPLETED" | "DEFAULTED";
}

export interface Contribution {
  id: string;
  groupId: string;
  cycleId: string;
  memberId: string;
  memberName: string;
  amountSLE: number;
  source: LedgerSource;
  paidAt: string;
  status: "PAID" | "LATE" | "PENDING";
  proxyRecordedByLeader?: boolean;
}

export interface LedgerEntry {
  id: string;
  userId: string;
  farmerName: string;
  crop: string;
  entryType: "sale" | "expense" | "harvest";
  quantity: number;
  unit: string;
  amountSLE: number;
  source: LedgerSource;
  location: string;
  verifiedByBuyer: boolean;
  confirmedByFarmer: boolean;
  rawVoiceNote?: string;
  createdAt: string;
}

export interface Buyer {
  id: string;
  name: string;
  type: "Cocoa Cooperative" | "Rice Aggregator" | "Export Terminal";
  district: string;
  contactName: string;
  contactPhone: string;
  totalPaidOutSLE: number;
  activeContractsCount: number;
}

export interface Purchase {
  id: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  crop: string;
  quantityMetricTons: number;
  grossAmountSLE: number;
  batchNumber: string;
  createdAt: string;
}

export interface PayoutLine {
  id: string;
  farmerId: string;
  farmerName: string;
  phoneNumber: string;
  groupName: string;
  crop: string;
  grossAmountSLE: number;
  loanRepaymentSLE: number;
  osusuContributionSLE: number;
  platformFeeSLE: number; // 1%
  netPayoutSLE: number;
  provider: MobileMoneyProvider;
  status: PayoutStatus;
  txReference?: string;
  failureReason?: string;
}

export interface Payout {
  id: string;
  buyerId: string;
  buyerName: string;
  crop: string;
  totalGrossSLE: number;
  totalNetPayoutSLE: number;
  totalLoanRepaymentsSLE: number;
  totalOsusuContributionsSLE: number;
  totalPlatformFeeSLE: number;
  lineCount: number;
  status: PayoutStatus;
  lines: PayoutLine[];
  executedAt: string;
}

export interface WalletEnvelope {
  id: string;
  name: "Ag Inputs" | "School Fees" | "Emergency" | "Osusu Reserve" | "Liquid Balance";
  balanceSLE: number;
  targetSLE: number;
  lockedUntil?: string;
  color: string;
}

export interface Wallet {
  id: string;
  userId: string;
  phoneNumber: string;
  availableBalanceSLE: number;
  lockedEnvelopesBalanceSLE: number;
  envelopes: WalletEnvelope[];
  recentTransactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amountSLE: number;
  type: "CREDIT" | "DEBIT";
  category: "HARVEST_PAYOUT" | "OSUSU_CONTRIBUTION" | "LOAN_REPAYMENT" | "POT_ADVANCE" | "INSURANCE_PAYOUT" | "TRANSFER";
  description: string;
  reference: string;
  createdAt: string;
}

export interface Lender {
  id: string;
  name: string;
  type: "Commercial Bank" | "Microfinance Institution (MFI)" | "Impact Fund";
  totalPortfolioSLE: number;
  activeBorrowersCount: number;
  par30Pct: number;
  defaultRatePct: number;
}

export interface Loan {
  id: string;
  lenderId: string;
  lenderName: string;
  groupId: string;
  groupName: string;
  farmerId: string;
  farmerName: string;
  principalAmountSLE: number;
  interestRatePct: number;
  totalRepayableSLE: number;
  repaidAmountSLE: number;
  status: LoanStatus;
  repaymentAtSource: boolean; // Repaid automatically via buyer harvest split
  purpose: "Input Financing" | "Seedlings & Fertilizer" | "Pot Advance Bridge" | "Equipment";
  disbursedAt: string;
  dueDate: string;
}

export interface Repayment {
  id: string;
  loanId: string;
  farmerId: string;
  farmerName: string;
  amountSLE: number;
  source: "buyer_split" | "ussd_self_pay" | "pwa_manual";
  payoutRef?: string;
  paidAt: string;
}

export interface GroupScoreHistory {
  id: string;
  groupId: string;
  score: number;
  tier: "A" | "B" | "C" | "D";
  calculatedAt: string;
}

export interface InsurancePolicy {
  id: string;
  groupId: string;
  groupName: string;
  policyType: "Rain-Check Parametric Drought Cover";
  season: "2026 Wet & Lean Season";
  microPremiumSLE: number; // 5 SLE per cycle
  coverageLimitPerMemberSLE: number; // 400 SLE
  rainfallThresholdMmMonth: number; // < 30 mm/mo trigger
  status: "ACTIVE" | "TRIGGERED" | "EXPIRED";
}

export interface WeatherEvent {
  id: string;
  district: string;
  rainfallMm: number;
  droughtTriggered: boolean;
  date: string;
  payoutExecuted: boolean;
  affectedFarmersCount: number;
}
