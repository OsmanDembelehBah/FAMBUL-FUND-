-- Fambul Fund Initial Seed Script (PostgreSQL)

-- Clean existing data
TRUNCATE users, osusu_groups, group_members, wallets, wallet_envelopes, wallet_transactions, ledger_entries, loans, payout_batches, payout_lines, events, sms_logs CASCADE;

-- 1. Users
-- Farmer 1: Aminata Kamara (PIN: 1234)
INSERT INTO users (id, phone, email, pin_hash, password_hash, name, role, district, chiefdom, village, language)
VALUES ('usr-farmer-01', '+23276123456', 'aminata@fambulfund.sl', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', NULL, 'Aminata Kamara', 'farmer', 'Bo', 'Kakua', 'Tikonko', 'krio');

-- Farmer 2: Fatmata Tarawally (PIN: 1111)
INSERT INTO users (id, phone, email, pin_hash, password_hash, name, role, district, chiefdom, village, language)
VALUES ('usr-farmer-02', '+23278555111', 'fatmata@fambulfund.sl', '0ffe1abd1a08215353c233d6e009613e95eec4253832a761af28ff37ac5a150c', NULL, 'Fatmata Tarawally', 'farmer', 'Bo', 'Kakua', 'Gbaama', 'krio');

-- Leader: Sorie Mansaray (PIN: 2468)
INSERT INTO users (id, phone, email, pin_hash, password_hash, name, role, district, chiefdom, village, language)
VALUES ('usr-leader-01', '+23277987654', 'sorie@fambulfund.sl', '0b4e7a0e5fe84ad35fb5f95b9ceeac79ce7b56bdecedb61257cb0f9fd99d004a', NULL, 'Sorie Mansaray', 'leader', 'Bo', 'Kakua', 'Tikonko', 'krio');

-- Buyer: Sahr Bundu (Password: password123)
INSERT INTO users (id, phone, email, pin_hash, password_hash, name, role, district, chiefdom, village, language)
VALUES ('usr-buyer-01', '+23277900200', 'buyer@rokelgrain.sl', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Sahr Bundu (Rokel Grain)', 'buyer', 'Bo', 'Kakua', 'Bo Town', 'en');

-- Lender: Aminata Bangura (Password: password123)
INSERT INTO users (id, phone, email, pin_hash, password_hash, name, role, district, chiefdom, village, language)
VALUES ('usr-lender-01', '+23276800100', 'lender@partnerbank.sl', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Aminata Bangura (Partner Bank)', 'lender', 'Freetown', 'Western Urban', 'Central Freetown', 'en');

-- Admin / Regulator: David Mansaray (Password: password123)
INSERT INTO users (id, phone, email, pin_hash, password_hash, name, role, district, chiefdom, village, language)
VALUES ('usr-admin-01', '+23279999000', 'admin@uncdf.org', NULL, 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'David Mansaray (UNCDF / Bank of SL)', 'admin', 'Freetown', 'Western Area', 'Tower Hill', 'en');

-- 2. Osusu Groups
INSERT INTO osusu_groups (id, name, district, cycle_number, target_pot_sle, total_pool_saved_sle, credit_score, tier)
VALUES ('grp-01', 'Gbo-Kakua Osusu', 'Bo', 6, 1200.00, 14400.00, 88.8, 'A');

INSERT INTO osusu_groups (id, name, district, cycle_number, target_pot_sle, total_pool_saved_sle, credit_score, tier)
VALUES ('grp-02', 'Nongowa Farmers Union', 'Kenema', 8, 1500.00, 18000.00, 86.4, 'A');

INSERT INTO osusu_groups (id, name, district, cycle_number, target_pot_sle, total_pool_saved_sle, credit_score, tier)
VALUES ('grp-03', 'Luawa Women Savings', 'Kailahun', 4, 1000.00, 9600.00, 79.2, 'B');

INSERT INTO osusu_groups (id, name, district, cycle_number, target_pot_sle, total_pool_saved_sle, credit_score, tier)
VALUES ('grp-04', 'Scarcies River Rice Osusu', 'Kambia', 5, 1100.00, 11000.00, 74.5, 'B');

INSERT INTO osusu_groups (id, name, district, cycle_number, target_pot_sle, total_pool_saved_sle, credit_score, tier)
VALUES ('grp-05', 'Maforki Cassava Union', 'Port Loko', 3, 800.00, 6400.00, 62.0, 'C');

INSERT INTO osusu_groups (id, name, district, cycle_number, target_pot_sle, total_pool_saved_sle, credit_score, tier)
VALUES ('grp-06', 'Yoni Oil Palm Cooperative', 'Tonkolili', 2, 700.00, 4200.00, 58.4, 'C');

-- 3. Group Members
INSERT INTO group_members (id, group_id, user_id, member_number, pot_turn_order, turn_date)
VALUES ('mem-01', 'grp-01', 'usr-farmer-01', 'M-01', 6, '24 Nov 2026');

INSERT INTO group_members (id, group_id, user_id, member_number, pot_turn_order, turn_date)
VALUES ('mem-02', 'grp-01', 'usr-farmer-02', 'M-02', 7, '01 Dec 2026');

INSERT INTO group_members (id, group_id, user_id, member_number, pot_turn_order, turn_date)
VALUES ('mem-03', 'grp-01', 'usr-leader-01', 'M-03', 8, '08 Dec 2026');

-- 4. Wallets
INSERT INTO wallets (id, user_id, available_balance_sle, locked_envelopes_balance_sle)
VALUES ('wal-farmer-01', 'usr-farmer-01', 1250.00, 650.00);

INSERT INTO wallets (id, user_id, available_balance_sle, locked_envelopes_balance_sle)
VALUES ('wal-farmer-02', 'usr-farmer-02', 820.00, 300.00);

INSERT INTO wallets (id, user_id, available_balance_sle, locked_envelopes_balance_sle)
VALUES ('wal-leader-01', 'usr-leader-01', 1500.00, 400.00);

INSERT INTO wallets (id, user_id, available_balance_sle, locked_envelopes_balance_sle)
VALUES ('wal-buyer-01', 'usr-buyer-01', 85000.00, 0.00);

INSERT INTO wallets (id, user_id, available_balance_sle, locked_envelopes_balance_sle)
VALUES ('wal-lender-01', 'usr-lender-01', 250000.00, 0.00);

INSERT INTO wallets (id, user_id, available_balance_sle, locked_envelopes_balance_sle)
VALUES ('wal-admin-01', 'usr-admin-01', 10000.00, 0.00);

-- 5. Wallet Envelopes (G5)
INSERT INTO wallet_envelopes (id, wallet_id, name, allocation_pct, balance_sle, target_sle)
VALUES ('env-01', 'wal-farmer-01', 'Seed & Inputs', 35.0, 250.00, 600.00);

INSERT INTO wallet_envelopes (id, wallet_id, name, allocation_pct, balance_sle, target_sle)
VALUES ('env-02', 'wal-farmer-01', 'School Fees', 25.0, 200.00, 500.00);

INSERT INTO wallet_envelopes (id, wallet_id, name, allocation_pct, balance_sle, target_sle)
VALUES ('env-03', 'wal-farmer-01', 'Emergency Fund', 20.0, 100.00, 400.00);

INSERT INTO wallet_envelopes (id, wallet_id, name, allocation_pct, balance_sle, target_sle)
VALUES ('env-04', 'wal-farmer-01', 'Osusu Savings', 20.0, 100.00, 300.00);

-- 6. Initial Double-Entry Ledger Transactions for Aminata
-- Initial deposit
INSERT INTO wallet_transactions (id, reference, user_id, wallet_id, entry_type, amount_sle, category, counterparty, description)
VALUES ('tx-01', 'REF-INIT-01', 'usr-farmer-01', 'wal-farmer-01', 'CREDIT', 3105.00, 'HARVEST_PAYOUT', 'Rokel Grain Aggregators', 'Initial harvest settlement');

-- Initial input loan repayment
INSERT INTO wallet_transactions (id, reference, user_id, wallet_id, entry_type, amount_sle, category, counterparty, description)
VALUES ('tx-02', 'REF-LOAN-01', 'usr-farmer-01', 'wal-farmer-01', 'DEBIT', 900.00, 'LOAN_REPAYMENT', 'Partner Bank', 'Pre-season seed loan deduction');

-- Initial osusu contribution
INSERT INTO wallet_transactions (id, reference, user_id, wallet_id, entry_type, amount_sle, category, counterparty, description)
VALUES ('tx-03', 'REF-OSU-01', 'usr-farmer-01', 'wal-farmer-01', 'DEBIT', 305.00, 'OSUSU_CONTRIBUTION', 'Gbo-Kakua Osusu', 'Weekly osusu share transfer');

-- Initial envelope lock
INSERT INTO wallet_transactions (id, reference, user_id, wallet_id, entry_type, amount_sle, category, counterparty, description)
VALUES ('tx-04', 'REF-ENV-01', 'usr-farmer-01', 'wal-farmer-01', 'DEBIT', 650.00, 'ENVELOPE_TRANSFER', 'Virtual Envelopes', 'Partitioned into ring-fenced envelopes');

-- 7. Farm Activity Ledger
INSERT INTO ledger_entries (id, user_id, farmer_name, crop, entry_type, quantity, unit, amount_sle, source, location, verified_by_buyer, confirmed_by_farmer, raw_voice_note)
VALUES ('led-01', 'usr-farmer-01', 'Aminata Kamara', 'Cocoa', 'sale', 150.0, 'kg', 4500.00, 'voice', 'Bo', true, true, 'A sel 150 kilo cocoa na Bo maket');

INSERT INTO ledger_entries (id, user_id, farmer_name, crop, entry_type, quantity, unit, amount_sle, source, location, verified_by_buyer, confirmed_by_farmer, raw_voice_note)
VALUES ('led-02', 'usr-farmer-01', 'Aminata Kamara', 'Rice', 'harvest', 25.0, 'bags', 0.00, 'voice', 'Bo', true, true, 'Harvested 25 bags of rice today');

INSERT INTO ledger_entries (id, user_id, farmer_name, crop, entry_type, quantity, unit, amount_sle, source, location, verified_by_buyer, confirmed_by_farmer, raw_voice_note)
VALUES ('led-03', 'usr-farmer-02', 'Fatmata Tarawally', 'Rice', 'sale', 8.0, 'bags', 256.00, 'ussd', 'Bo', true, true, 'USSD *714# sale entry');

-- 8. Loans
INSERT INTO loans (id, lender_id, lender_name, group_id, farmer_id, farmer_name, principal_amount_sle, interest_rate_pct, total_repayable_sle, repaid_amount_sle, status, purpose)
VALUES ('ln-01', 'usr-lender-01', 'Partner Rural Development Bank', 'grp-01', 'usr-farmer-01', 'Aminata Kamara', 900.00, 12.0, 1008.00, 900.00, 'ACTIVE', 'Agri Inputs & Fertilizer');

INSERT INTO loans (id, lender_id, lender_name, group_id, farmer_id, farmer_name, principal_amount_sle, interest_rate_pct, total_repayable_sle, repaid_amount_sle, status, purpose)
VALUES ('ln-02', 'usr-lender-01', 'Partner Rural Development Bank', 'grp-01', 'usr-farmer-02', 'Fatmata Tarawally', 600.00, 12.0, 672.00, 150.00, 'ACTIVE', 'Seedlings & Labor');

-- 9. Payout Batches and Lines
INSERT INTO payout_batches (id, buyer_id, buyer_name, batch_number, status, total_gross_sle, total_net_sle, total_loan_sle, total_osusu_sle, total_fee_sle)
VALUES ('batch-01', 'usr-buyer-01', 'Rokel River Grain Aggregators Ltd', 'ROK-2026-B4', 'PENDING', 7850.00, 5241.50, 1720.00, 810.00, 78.50);

INSERT INTO payout_lines (id, batch_id, farmer_id, farmer_name, phone_number, crop, quantity_kg, price_per_kg, gross_amount_sle, loan_repayment_sle, osusu_contribution_sle, platform_fee_sle, net_payout_sle, provider, status)
VALUES ('line-01', 'batch-01', 'usr-farmer-01', 'Aminata Kamara', '+23276123456', 'Cocoa', 100.0, 45.0, 4500.00, 900.00, 450.00, 45.00, 3105.00, 'Orange Money', 'PENDING');

INSERT INTO payout_lines (id, batch_id, farmer_id, farmer_name, phone_number, crop, quantity_kg, price_per_kg, gross_amount_sle, loan_repayment_sle, osusu_contribution_sle, platform_fee_sle, net_payout_sle, provider, status, failure_reason)
VALUES ('line-02', 'batch-01', 'usr-farmer-02', 'Fatmata Tarawally', '+23278555111', 'Rice', 50.0, 32.0, 1600.00, 520.00, 160.00, 16.00, 904.00, 'Afrimoney', 'PENDING', NULL);

INSERT INTO payout_lines (id, batch_id, farmer_id, farmer_name, phone_number, crop, quantity_kg, price_per_kg, gross_amount_sle, loan_repayment_sle, osusu_contribution_sle, platform_fee_sle, net_payout_sle, provider, status)
VALUES ('line-03', 'batch-01', 'usr-leader-01', 'Sorie Mansaray', '+23277987654', 'Rice', 55.0, 32.0, 1750.00, 300.00, 200.00, 17.50, 1232.50, 'Orange Money', 'PENDING');

-- 10. Initial Events
INSERT INTO events (event_type, target_user_id, payload)
VALUES ('system.ready', 'ALL', '{"message": "Fambul Fund real-time backbone initialized.", "status": "LIVE"}');

-- 11. Initial SMS Log
INSERT INTO sms_logs (id, recipient, message, category)
VALUES ('sms-01', '+23276123456', 'Fambul Fund: Welcome Aminata! Dial *714# anytime to check wallet or Osusu status.', 'SYSTEM');
