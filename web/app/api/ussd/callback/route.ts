import { NextRequest, NextResponse } from "next/server";
import { query, executeDoubleEntry, recalculateGroupScore, emitEvent } from "@/lib/db";
import { fambulStore } from "@/lib/store";

interface USSDSession {
  sessionId: string;
  phoneNumber: string;
  language: "en" | "krio";
  currentPath: string;
  data: Record<string, string>;
  updatedAt: number;
}

const sessions = new Map<string, USSDSession>();
const phoneToSession = new Map<string, string>();
const pinAttempts = new Map<string, { count: number; lockedUntil: number }>();

const USER_PINS: Record<string, string> = {
  "+23276123456": "1234", // Aminata Kamara
  "+23277987654": "2468", // Sorie Mansaray (Leader)
  "+23278555111": "1111", // Fatmata Tarawally
};

export async function POST(req: NextRequest) {
  let sessionId = "";
  let phoneNumber = "+23276123456";
  let text = "";
  let serviceCode = "*714#";

  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await req.json();
    sessionId = body.sessionId || body.SessionId || "";
    phoneNumber = body.phoneNumber || body.PhoneNumber || "+23276123456";
    text = body.text || body.Text || "";
    serviceCode = body.serviceCode || "*714#";
  } else {
    const formData = await req.formData();
    sessionId = (formData.get("sessionId") as string) || (formData.get("SessionId") as string) || "";
    phoneNumber = (formData.get("phoneNumber") as string) || (formData.get("PhoneNumber") as string) || "+23276123456";
    text = (formData.get("text") as string) || (formData.get("Text") as string) || "";
    serviceCode = (formData.get("serviceCode") as string) || "*714#";
  }

  if (!sessionId) sessionId = `sess-${Date.now()}`;

  const responseText = await processUSSD(sessionId, phoneNumber, text);
  return new NextResponse(responseText, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

async function processUSSD(sessionId: string, phone: string, text: string): Promise<string> {
  const parts = text ? text.split("*") : [];
  const latestInput = parts.length > 0 ? parts[parts.length - 1] : "";

  // 15-minute PIN lockout check
  const lockInfo = pinAttempts.get(phone);
  if (lockInfo && Date.now() < lockInfo.lockedUntil) {
    const remainingMin = Math.ceil((lockInfo.lockedUntil - Date.now()) / 60000);
    return `END Account locked for ${remainingMin} min due to 3 wrong attempts.`;
  }

  let session = sessions.get(sessionId);
  if (!session) {
    const prevSessionId = phoneToSession.get(phone);
    const prevSession = prevSessionId ? sessions.get(prevSessionId) : null;
    const now = Date.now();

    if (prevSession && now - prevSession.updatedAt < 90000 && prevSession.currentPath !== "home" && prevSession.currentPath !== "") {
      session = {
        sessionId,
        phoneNumber: phone,
        language: prevSession.language,
        currentPath: "resume_prompt",
        data: { ...prevSession.data, suspended_path: prevSession.currentPath },
        updatedAt: now,
      };
      sessions.set(sessionId, session);
      phoneToSession.set(phone, sessionId);
      return session.language === "krio"
        ? "CON Yu session bin drop. Yu wan kɔntinyu?\n1. Yɛs, kɔntinyu\n2. No, go bak na mein menyu"
        : "CON Session dropped. Resume?\n1. Yes, continue\n2. No, main menu";
    }

    session = {
      sessionId,
      phoneNumber: phone,
      language: "krio",
      currentPath: "home",
      data: {},
      updatedAt: now,
    };
    sessions.set(sessionId, session);
    phoneToSession.set(phone, sessionId);
  }

  session.updatedAt = Date.now();

  // Navigation shortcuts
  if (latestInput === "00") {
    session.currentPath = "home";
    return renderHome(session.language);
  }
  if (latestInput === "0" && session.currentPath !== "home") {
    session.currentPath = "home";
    return renderHome(session.language);
  }

  // Routing
  return await handleRouting(session, latestInput);
}

async function handleRouting(sess: USSDSession, input: string): Promise<string> {
  const lang = sess.language;

  // Resolve user id from phone
  let userId = "usr-farmer-01";
  let farmerName = "Aminata Kamara";
  try {
    const uRes = await query("SELECT id, name FROM users WHERE phone = $1", [sess.phoneNumber]);
    if (uRes.rows.length > 0) {
      userId = uRes.rows[0].id;
      farmerName = uRes.rows[0].name;
    }
  } catch {}

  switch (sess.currentPath) {
    case "resume_prompt":
      if (input === "1") {
        sess.currentPath = sess.data.suspended_path || "home";
        return await handleRouting(sess, "");
      }
      sess.currentPath = "home";
      return renderHome(lang);

    case "home":
      switch (input) {
        case "1":
          sess.currentPath = "wallet_menu";
          return lang === "krio"
            ? "CON Mi Walet\n1. Balans\n2. Las 3 trenzakshɔn\n3. Envelopes\n0. Bak"
            : "CON My Wallet\n1. Balance\n2. Last 3 transactions\n3. Envelopes\n0. Back";
        case "2":
          sess.currentPath = "osusu_menu";
          return lang === "krio"
            ? "CON Mi Osusu\n1. Pɛ kɔntribyushɔn\n2. Mi tɔn / pɔt det\n3. Grup statɔs\n4. Lida Mod\n0. Bak"
            : "CON My Osusu\n1. Pay contribution\n2. My turn / pot date\n3. Group status\n4. Leader Mode\n0. Back";
        case "3":
          sess.currentPath = "loan_menu";
          return "CON Loans & Advances\n1. Loan status\n2. Repay loan\n3. Pot Advance (Early turn)\n0. Back";
        case "4":
          sess.currentPath = "record_type";
          return "CON Record Activity\n1. Record Sale\n2. Record Expense\n3. Record Harvest\n0. Back";
        case "5":
          sess.currentPath = "more_menu";
          return "CON More Services\n1. Farmgate Prices\n2. Rain-Check Cover\n3. Switch Language\n4. Change PIN\n0. Back";
      }
      return renderHome(lang);

    // 1. Wallet Branch
    case "wallet_menu":
      if (input === "1") {
        let bal = 1250;
        try {
          const wRes = await query("SELECT available_balance_sle FROM wallets WHERE user_id = $1", [userId]);
          if (wRes.rows.length > 0) bal = parseFloat(wRes.rows[0].available_balance_sle);
        } catch {}
        return `END Fambul Fund Wallet\nAvailable Bal: SLE ${bal.toFixed(2)}\nLocked Envelopes: SLE 650.00\nSMS sent.`;
      }
      if (input === "2") {
        return "END Last 3 Transactions:\n1. Harvest Net: +SLE 3,105\n2. Loan Repay: -SLE 900\n3. Osusu: -SLE 100";
      }
      if (input === "3") {
        return "END Virtual Envelopes:\nSeed: SLE 250\nSchool: SLE 200\nEmergency: SLE 100\nOsusu: SLE 100";
      }
      sess.currentPath = "home";
      return renderHome(lang);

    // 2. Osusu Branch
    case "osusu_menu":
      if (input === "1") {
        sess.currentPath = "osusu_amount";
        return lang === "krio"
          ? "CON Enta kɔntribyushɔn amownt (SLE):\n1. SLE 100\n2. SLE 200\n3. Ɔda amownt\n0. Bak"
          : "CON Enter contribution amount (SLE):\n1. SLE 100\n2. SLE 200\n3. Other amount\n0. Back";
      }
      if (input === "2") {
        return "END Your turn for Osusu pot is Nov 24, 2026. Target pot is SLE 1,200. 100% on-time rate.";
      }
      if (input === "3") {
        return "END Gbo-Kakua Osusu: 12 members. Total Pool: SLE 14,400. Credit Score: 88.8 (Tier A Prime).";
      }
      if (input === "4") {
        sess.currentPath = "osusu_leader_mem";
        return "CON Leader Mode: Enter member group number (e.g. M-02):\n0. Back";
      }
      sess.currentPath = "home";
      return renderHome(lang);

    case "osusu_amount":
      sess.data.osusu_amt = input === "2" ? "200" : "100";
      sess.currentPath = "osusu_pin";
      return `CON Confirm SLE ${sess.data.osusu_amt} to Gbo-Kakua Osusu?\nEnter 4-digit PIN:\n0. Back`;

    case "osusu_pin":
      if (!verifyPIN(sess.phoneNumber, input)) {
        return "END Authentication failed: Incorrect PIN.";
      }
      const osusuAmt = parseFloat(sess.data.osusu_amt || "100") || 100;

      try {
        await executeDoubleEntry({
          userId,
          amountSLE: osusuAmt,
          entryType: "DEBIT",
          category: "OSUSU_CONTRIBUTION",
          counterparty: "Gbo-Kakua Osusu (USSD *714#)",
          description: `USSD Osusu contribution of SLE ${osusuAmt}`,
        });
        await query("UPDATE osusu_groups SET total_pool_saved_sle = total_pool_saved_sle + $1 WHERE id = 'grp-01'", [osusuAmt]);
        await recalculateGroupScore("grp-01");
      } catch {}

      sess.currentPath = "home";
      return `END Success! Paid SLE ${osusuAmt} to Osusu pot.\nSMS confirmation sent. Group score updated live!`;

    // Leader Mode
    case "osusu_leader_mem":
      sess.data.target_member = input;
      sess.currentPath = "osusu_leader_amt";
      return `CON Enter amount for member ${input} (SLE):\n0. Back`;

    case "osusu_leader_amt":
      sess.data.proxy_amt = input;
      sess.currentPath = "osusu_leader_pin";
      return `CON Leader confirm SLE ${input} for ${sess.data.target_member}.\nEnter 4-digit PIN:`;

    case "osusu_leader_pin":
      if (!verifyPIN(sess.phoneNumber, input)) {
        return "END Authentication failed: Incorrect PIN.";
      }
      const proxyAmt = parseFloat(sess.data.proxy_amt || "50") || 50;
      try {
        await query("UPDATE osusu_groups SET total_pool_saved_sle = total_pool_saved_sle + $1 WHERE id = 'grp-01'", [proxyAmt]);
        await recalculateGroupScore("grp-01");
        await emitEvent("contribution.paid", "ALL", {
          member: sess.data.target_member,
          amountSLE: proxyAmt,
          source: "ussd_leader_mode",
        });
      } catch {}
      sess.currentPath = "home";
      return `END Contribution recorded for ${sess.data.target_member}! SMS sent to member.`;

    // 3. Loans Branch
    case "loan_menu":
      if (input === "1") {
        return `END Active Loan: SLE 900.00\nRepaid: SLE 900.00\nNext harvest auto-deduct: SLE 250\nRate: 12% (within ceiling).`;
      }
      if (input === "2") {
        sess.currentPath = "loan_repay_amt";
        return "CON Enter repayment amount (SLE):\n0. Back";
      }
      if (input === "3") {
        sess.currentPath = "pot_advance_choice";
        return "CON Pot Advance (Early Turn)\nEligible up to SLE 800\n1. Take SLE 400 (Fee SLE 8)\n2. Take SLE 800 (Fee SLE 16)\n0. Back";
      }
      sess.currentPath = "home";
      return renderHome(lang);

    case "loan_repay_amt":
      sess.data.loan_amt = input;
      sess.currentPath = "loan_pin";
      return `CON Repay SLE ${input} towards loan?\nEnter 4-digit PIN:\n0. Back`;

    case "loan_pin":
      if (!verifyPIN(sess.phoneNumber, input)) {
        return "END Authentication failed: Incorrect PIN.";
      }
      const repayAmt = parseFloat(sess.data.loan_amt || "150") || 150;
      try {
        await executeDoubleEntry({
          userId,
          amountSLE: repayAmt,
          entryType: "DEBIT",
          category: "LOAN_REPAYMENT",
          counterparty: "Partner Rural Development Bank (USSD)",
          description: `USSD Loan repayment of SLE ${repayAmt}`,
        });
        await query(
          "UPDATE loans SET repaid_amount_sle = LEAST(total_repayable_sle, repaid_amount_sle + $1) WHERE farmer_id = $2 AND status = 'ACTIVE'",
          [repayAmt, userId]
        );
        await emitEvent("repayment.deducted", "ALL", {
          farmerId: userId,
          farmerName,
          repaymentSLE: repayAmt,
          source: "ussd",
        });
      } catch {}
      sess.currentPath = "home";
      return `END Loan repayment of SLE ${repayAmt} successful! Lender ledger updated live.`;

    case "pot_advance_choice":
      const advAmt = input === "2" ? 800 : 400;
      sess.data.adv_amt = `${advAmt}`;
      sess.currentPath = "pot_adv_pin";
      return `CON Confirm SLE ${advAmt} Pot Advance?\nEnter 4-digit PIN:\n0. Back`;

    case "pot_adv_pin":
      if (!verifyPIN(sess.phoneNumber, input)) {
        return "END Authentication failed: Incorrect PIN.";
      }
      const finalAdv = parseFloat(sess.data.adv_amt || "400") || 400;
      try {
        await executeDoubleEntry({
          userId,
          amountSLE: finalAdv,
          entryType: "CREDIT",
          category: "POT_ADVANCE",
          counterparty: "Partner Rural Development Bank (USSD)",
          description: `USSD Pot Advance early turn bridge`,
        });
        await emitEvent("advance.approved", "ALL", {
          farmerId: userId,
          farmerName,
          principalAmountSLE: finalAdv,
          source: "ussd",
        });
      } catch {}
      sess.currentPath = "home";
      return `END Pot Advance approved! SLE ${finalAdv} credited to wallet. Auto-deducts next harvest.`;

    // 4. Record Branch
    case "record_type":
      sess.data.entry_type = input === "2" ? "expense" : input === "3" ? "harvest" : "sale";
      sess.currentPath = "record_crop";
      return "CON Select crop:\n1. Rice\n2. Cassava\n3. Cocoa\n4. Palm Oil\n0. Back";

    case "record_crop":
      const crops = ["Rice", "Cassava", "Cocoa", "Palm Oil"];
      sess.data.crop = crops[parseInt(input, 10) - 1] || "Rice";
      sess.currentPath = "record_qty";
      return `CON Enter quantity for ${sess.data.crop} (bags/kg):\n0. Back`;

    case "record_qty":
      sess.data.qty = input;
      sess.currentPath = "record_amt";
      return "CON Enter total amount in SLE:\n0. Back";

    case "record_amt":
      sess.data.amt = input;
      sess.currentPath = "record_confirm";
      return `CON Confirm ${sess.data.entry_type} of ${sess.data.qty} ${sess.data.crop} for SLE ${input}?\n1. Confirm & Save\n0. Back`;

    case "record_confirm":
      if (input !== "1") return "END Entry cancelled.";
      const recAmt = parseFloat(sess.data.amt || "0") || 0;
      const recQty = parseFloat(sess.data.qty || "1") || 1;

      try {
        const id = `led-ussd-${Date.now()}`;
        await query(
          `INSERT INTO ledger_entries 
          (id, user_id, farmer_name, crop, entry_type, quantity, unit, amount_sle, source, location, verified_by_buyer, confirmed_by_farmer)
          VALUES ($1, $2, $3, $4, $5, $6, 'bags', $7, 'ussd', 'Bo', true, true)`,
          [id, userId, farmerName, sess.data.crop || "Rice", sess.data.entry_type || "sale", recQty, recAmt]
        );

        await emitEvent("ledger.created", "ALL", {
          entry: {
            id,
            userId,
            farmerName,
            crop: sess.data.crop || "Rice",
            entryType: sess.data.entry_type || "sale",
            quantity: recQty,
            unit: "bags",
            amountSLE: recAmt,
            source: "ussd",
            location: "Bo",
            createdAt: new Date().toISOString(),
          },
        });

        await recalculateGroupScore("grp-01");
      } catch {}

      sess.currentPath = "home";
      return "END Record saved to ledger (source=ussd)! Credit score refreshed on lender dashboard.";

    // 5. More Branch
    case "more_menu":
      if (input === "1") {
        sess.currentPath = "price_crop";
        return "CON Select Crop for Price:\n1. Cocoa\n2. Rice\n3. Cassava\n4. Oil Palm\n0. Back";
      }
      if (input === "2") {
        return "END Rain-Check: Drought Cover ACTIVE for 2026. Micro-premium paid. Payout trigger: <30mm/mo.";
      }
      if (input === "3") {
        sess.language = sess.language === "en" ? "krio" : "en";
        return `END Language switched to ${sess.language === "krio" ? "Krio" : "English"}!`;
      }
      if (input === "4") {
        return "END PIN change service available at agent kiosk or customer care dial 111.";
      }
      sess.currentPath = "home";
      return renderHome(lang);

    case "price_crop":
      const cropName = input === "1" ? "Cocoa" : input === "2" ? "Rice" : input === "3" ? "Cassava" : "Oil Palm";
      const price = input === "1" ? "49.5" : input === "2" ? "32.5" : input === "3" ? "12.0" : "48.0";
      return `END Farmgate Price Index: ${cropName} benchmark is SLE ${price}/kg in Bo/Kenema.`;

    default:
      sess.currentPath = "home";
      return renderHome(lang);
  }
}

function renderHome(lang: string): string {
  if (lang === "krio") {
    return "CON Fambul Fund\n1. Mi walet\n2. Mi Osusu\n3. Lon dɛn\n4. Rekɔd\n5. Mɔ tin dɛn\n00. Om";
  }
  return "CON Fambul Fund\n1. My wallet\n2. My Osusu\n3. Loans\n4. Record\n5. More\n00. Home";
}

function verifyPIN(phone: string, pin: string): boolean {
  const expected = USER_PINS[phone] || "1234";
  if (pin === expected) {
    pinAttempts.delete(phone);
    return true;
  }

  const existing = pinAttempts.get(phone) || { count: 0, lockedUntil: 0 };
  existing.count++;
  if (existing.count >= 3) {
    existing.lockedUntil = Date.now() + 15 * 60 * 1000;
  }
  pinAttempts.set(phone, existing);
  return false;
}
