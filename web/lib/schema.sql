-- Fambul Fund Database Schema (PostgreSQL)
-- Supports real-time event broadcasting, double-entry ledger, multi-role auth

DROP TABLE IF EXISTS sms_logs CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS payout_lines CASCADE;
DROP TABLE IF EXISTS payout_batches CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS ledger_entries CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS wallet_envelopes CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS osusu_groups CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users & Authentication
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    phone VARCHAR(32) UNIQUE,
    email VARCHAR(128) UNIQUE,
    pin_hash VARCHAR(128),
    password_hash VARCHAR(128),
    name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL, -- 'farmer', 'leader', 'buyer', 'lender', 'admin'
    district VARCHAR(64),
    chiefdom VARCHAR(64),
    village VARCHAR(64),
    language VARCHAR(16) DEFAULT 'krio',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Osusu Groups
CREATE TABLE osusu_groups (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    district VARCHAR(64) NOT NULL,
    cycle_number INT DEFAULT 6,
    target_pot_sle NUMERIC(12, 2) DEFAULT 1200.00,
    total_pool_saved_sle NUMERIC(12, 2) DEFAULT 14400.00,
    credit_score NUMERIC(5, 2) DEFAULT 88.8,
    tier VARCHAR(8) DEFAULT 'A',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Group Memberships
CREATE TABLE group_members (
    id VARCHAR(64) PRIMARY KEY,
    group_id VARCHAR(64) REFERENCES osusu_groups(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    member_number VARCHAR(32) NOT NULL,
    pot_turn_order INT NOT NULL,
    turn_date VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE'
);

-- 4. Wallets (Derived from double-entry ledger)
CREATE TABLE wallets (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    available_balance_sle NUMERIC(12, 2) DEFAULT 0.00,
    locked_envelopes_balance_sle NUMERIC(12, 2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Virtual Wallet Envelopes (G5 Innovation)
CREATE TABLE wallet_envelopes (
    id VARCHAR(64) PRIMARY KEY,
    wallet_id VARCHAR(64) REFERENCES wallets(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    allocation_pct NUMERIC(5, 2) DEFAULT 25.0,
    balance_sle NUMERIC(12, 2) DEFAULT 0.00,
    target_sle NUMERIC(12, 2) DEFAULT 1000.00
);

-- 6. Double-Entry Wallet Ledger Transactions
-- Invariant: For balanced transfers: debit account loses X, credit account gains X.
CREATE TABLE wallet_transactions (
    id VARCHAR(64) PRIMARY KEY,
    reference VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    wallet_id VARCHAR(64) REFERENCES wallets(id) ON DELETE CASCADE,
    entry_type VARCHAR(16) NOT NULL, -- 'CREDIT' or 'DEBIT'
    amount_sle NUMERIC(12, 2) NOT NULL CHECK (amount_sle > 0),
    category VARCHAR(32) NOT NULL, -- 'HARVEST_PAYOUT', 'LOAN_REPAYMENT', 'OSUSU_CONTRIBUTION', 'POT_ADVANCE', 'FEE_DEDUCTION', 'ENVELOPE_TRANSFER', 'DROUGHT_RELIEF'
    counterparty VARCHAR(128),
    description TEXT,
    idempotency_key VARCHAR(128) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Farm Activity Ledger (Voice / USSD / App)
CREATE TABLE ledger_entries (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    farmer_name VARCHAR(128) NOT NULL,
    crop VARCHAR(64) NOT NULL,
    entry_type VARCHAR(32) NOT NULL, -- 'sale', 'expense', 'harvest'
    quantity NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    amount_sle NUMERIC(12, 2) NOT NULL,
    source VARCHAR(32) NOT NULL, -- 'voice', 'text', 'ussd'
    location VARCHAR(64),
    verified_by_buyer BOOLEAN DEFAULT FALSE,
    confirmed_by_farmer BOOLEAN DEFAULT TRUE,
    raw_voice_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Agricultural Input Loans & Pot Advances
CREATE TABLE loans (
    id VARCHAR(64) PRIMARY KEY,
    lender_id VARCHAR(64) REFERENCES users(id),
    lender_name VARCHAR(128) NOT NULL,
    group_id VARCHAR(64) REFERENCES osusu_groups(id),
    farmer_id VARCHAR(64) REFERENCES users(id),
    farmer_name VARCHAR(128) NOT NULL,
    principal_amount_sle NUMERIC(12, 2) NOT NULL,
    interest_rate_pct NUMERIC(5, 2) NOT NULL CHECK (interest_rate_pct <= 15.0), -- Statutory ceiling
    total_repayable_sle NUMERIC(12, 2) NOT NULL,
    repaid_amount_sle NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(32) DEFAULT 'ACTIVE', -- 'PENDING', 'ACTIVE', 'REPAID'
    repayment_at_source BOOLEAN DEFAULT TRUE,
    purpose VARCHAR(128) NOT NULL,
    disbursed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE
);

-- 9. Buyer Payout Batches and Lines
CREATE TABLE payout_batches (
    id VARCHAR(64) PRIMARY KEY,
    buyer_id VARCHAR(64) REFERENCES users(id),
    buyer_name VARCHAR(128) NOT NULL,
    batch_number VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'SETTLED',
    total_gross_sle NUMERIC(12, 2) NOT NULL,
    total_net_sle NUMERIC(12, 2) NOT NULL,
    total_loan_sle NUMERIC(12, 2) NOT NULL,
    total_osusu_sle NUMERIC(12, 2) NOT NULL,
    total_fee_sle NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE payout_lines (
    id VARCHAR(64) PRIMARY KEY,
    batch_id VARCHAR(64) REFERENCES payout_batches(id) ON DELETE CASCADE,
    farmer_id VARCHAR(64) REFERENCES users(id),
    farmer_name VARCHAR(128) NOT NULL,
    phone_number VARCHAR(32) NOT NULL,
    crop VARCHAR(64) NOT NULL,
    quantity_kg NUMERIC(10, 2) NOT NULL,
    price_per_kg NUMERIC(10, 2) NOT NULL,
    gross_amount_sle NUMERIC(12, 2) NOT NULL,
    loan_repayment_sle NUMERIC(12, 2) NOT NULL,
    osusu_contribution_sle NUMERIC(12, 2) NOT NULL,
    platform_fee_sle NUMERIC(12, 2) NOT NULL,
    net_payout_sle NUMERIC(12, 2) NOT NULL,
    provider VARCHAR(32) NOT NULL, -- 'Orange Money', 'Afrimoney', 'QMoney'
    status VARCHAR(32) DEFAULT 'PENDING', -- 'PENDING', 'PROCESSING', 'SETTLED', 'FAILED'
    tx_reference VARCHAR(64),
    failure_reason TEXT,
    retry_count INT DEFAULT 0
);

-- 10. Real-time Events Queue
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL,
    target_user_id VARCHAR(64) DEFAULT 'ALL',
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. SMS Outbox and Audit Log
CREATE TABLE sms_logs (
    id VARCHAR(64) PRIMARY KEY,
    recipient VARCHAR(32) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for low latency queries
CREATE INDEX idx_transactions_user ON wallet_transactions(user_id);
CREATE INDEX idx_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_ledger_user ON ledger_entries(user_id);
CREATE INDEX idx_events_id ON events(id);
CREATE INDEX idx_payout_batch ON payout_lines(batch_id);
