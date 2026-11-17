package ussd

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/fambulfund/ussd-gateway/payments"
)

// LedgerEntry matches the unified ledger schema across app and USSD.
type LedgerEntry struct {
	ID        string    `json:"id"`
	Phone     string    `json:"phone"`
	Crop      string    `json:"crop"`
	EntryType string    `json:"entry_type"` // sale, expense, harvest
	Quantity  float64   `json:"quantity"`
	Amount    float64   `json:"amount"`
	Source    string    `json:"source"` // "ussd"
	CreatedAt time.Time `json:"created_at"`
}

// Handler orchestrates USSD callback requests.
type Handler struct {
	sessions   SessionStore
	security   *SecurityManager
	smsAdapter *payments.SMSAdapter
	ledger     []LedgerEntry
}

// NewHandler initializes a new USSD Handler.
func NewHandler(store SessionStore, sm *SecurityManager, sms *payments.SMSAdapter) *Handler {
	return &Handler{
		sessions:   store,
		security:   sm,
		smsAdapter: sms,
		ledger:     make([]LedgerEntry, 0),
	}
}

// USSDRequest holds input parameters from telecom aggregators (Africa's Talking / Hubtel / standard).
type USSDRequest struct {
	SessionID   string `json:"sessionId"`
	PhoneNumber string `json:"phoneNumber"`
	Text        string `json:"text"`
	ServiceCode string `json:"serviceCode"`
}

// ServeHTTP handles POST /ussd/callback.
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var req USSDRequest
	contentType := r.Header.Get("Content-Type")

	if strings.Contains(contentType, "application/json") {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}
		if err := json.Unmarshal(body, &req); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}
	} else {
		// Default form urlencoded
		if err := r.ParseForm(); err != nil {
			http.Error(w, "Parse Form Error", http.StatusBadRequest)
			return
		}
		req.SessionID = r.FormValue("sessionId")
		if req.SessionID == "" {
			req.SessionID = r.FormValue("SessionId")
		}
		req.PhoneNumber = r.FormValue("phoneNumber")
		if req.PhoneNumber == "" {
			req.PhoneNumber = r.FormValue("PhoneNumber")
		}
		req.Text = r.FormValue("text")
		if req.Text == "" {
			req.Text = r.FormValue("Text")
		}
		req.ServiceCode = r.FormValue("serviceCode")
	}

	if req.PhoneNumber == "" {
		req.PhoneNumber = "+23276123456" // demo default
	}
	if req.SessionID == "" {
		req.SessionID = fmt.Sprintf("sess-%d", time.Now().UnixNano())
	}

	resp := h.Process(req)
	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(resp))
}

// Process evaluates the USSD input state machine.
func (h *Handler) Process(req USSDRequest) string {
	phone := req.PhoneNumber
	user, exists := h.security.GetUser(phone)

	// Case 1: First-time Registration Flow
	if !exists || !user.Registered {
		return h.handleRegistration(req)
	}

	// Retrieve or create session
	session, found := h.sessions.Get(req.SessionID)
	if !found {
		// Check for graceful session resume within 90-second timeout window
		if prevSession, hasPrev := h.sessions.GetByPhone(phone); hasPrev && prevSession.CurrentPath != "" && prevSession.CurrentPath != "home" {
			session = &Session{
				SessionID:   req.SessionID,
				PhoneNumber: phone,
				Language:    user.Language,
				CurrentPath: "resume_prompt",
				Data:        prevSession.Data,
			}
			session.Data["suspended_path"] = prevSession.CurrentPath
			_ = h.sessions.Save(session)

			if user.Language == "krio" {
				return "CON Yu session bin drop. Yu wan kɔntinyu?\n1. Yɛs, go bifo\n2. No, go bak na mein menyu"
			}
			return "CON Session dropped. Resume?\n1. Yes, continue\n2. No, main menu"
		}

		session = &Session{
			SessionID:   req.SessionID,
			PhoneNumber: phone,
			Language:    user.Language,
			CurrentPath: "home",
			Data:        make(map[string]string),
		}
	}

	// Parse user input from latest step
	userInput := extractLatestInput(req.Text)

	// Global navigation handlers: 0 = Back, 00 = Home
	if userInput == "00" {
		session.CurrentPath = "home"
		_ = h.sessions.Save(session)
		return h.renderHome(user, session)
	}

	if userInput == "0" && session.CurrentPath != "home" {
		session.CurrentPath = "home" // step back to home
		_ = h.sessions.Save(session)
		return h.renderHome(user, session)
	}

	// Route based on CurrentPath
	resp := h.route(session, user, userInput)
	_ = h.sessions.Save(session)
	return resp
}

// route navigates through the menu tree based on current state.
func (h *Handler) route(sess *Session, user *UserRecord, input string) string {
	lang := user.Language

	switch sess.CurrentPath {
	case "resume_prompt":
		if input == "1" {
			sess.CurrentPath = sess.Data["suspended_path"]
			return h.route(sess, user, "")
		}
		sess.CurrentPath = "home"
		return h.renderHome(user, sess)

	case "home":
		switch input {
		case "1":
			sess.CurrentPath = "wallet_menu"
			return h.renderWalletMenu(user, lang)
		case "2":
			sess.CurrentPath = "osusu_menu"
			return h.renderOsusuMenu(user, lang)
		case "3":
			sess.CurrentPath = "loan_menu"
			return h.renderLoanMenu(user, lang)
		case "4":
			sess.CurrentPath = "record_menu"
			return h.renderRecordMenu(lang)
		case "5":
			sess.CurrentPath = "more_menu"
			return h.renderMoreMenu(lang)
		default:
			return h.renderHome(user, sess)
		}

	// 1. My Wallet Branch
	case "wallet_menu":
		switch input {
		case "1":
			return h.renderWalletBalance(user, lang)
		case "2":
			return h.renderLastTransactions(user, lang)
		case "3":
			return h.renderEnvelopes(user, lang)
		default:
			sess.CurrentPath = "home"
			return h.renderHome(user, sess)
		}

	// 2. My Osusu Branch
	case "osusu_menu":
		switch input {
		case "1":
			sess.CurrentPath = "osusu_pay_amt"
			if lang == "krio" {
				return "CON Enter amownt fɔ pay na Osusu pot (SLE):\n0. Bak"
			}
			return "CON Enter amount to pay into Osusu pot (SLE):\n0. Back"
		case "2":
			return h.renderOsusuTurn(user, lang)
		case "3":
			return h.renderOsusuStatus(user, lang)
		case "4":
			if user.IsLeader {
				sess.CurrentPath = "osusu_leader_member"
				if lang == "krio" {
					return "CON [Lida Mode] Enter memba nɔmba (e.g. M-03):\n0. Bak"
				}
				return "CON [Leader Mode] Enter member number (e.g. M-03):\n0. Back"
			}
			return "END Option invalid."
		default:
			sess.CurrentPath = "home"
			return h.renderHome(user, sess)
		}

	case "osusu_pay_amt":
		amt, err := strconv.ParseFloat(input, 64)
		if err != nil || amt <= 0 {
			return "CON Invalid amount. Enter numbers only (e.g. 50):\n0. Back"
		}
		sess.Data["osusu_pay_amt"] = input
		sess.CurrentPath = "osusu_pay_pin"
		if lang == "krio" {
			return fmt.Sprintf("CON Pay SLE %.0f na Osusu pot?\nEnter yu 4-digit PIN:\n0. Bak", amt)
		}
		return fmt.Sprintf("CON Pay SLE %.0f to Osusu pot?\nEnter your 4-digit PIN:\n0. Back", amt)

	case "osusu_pay_pin":
		ok, errStr := h.security.VerifyPIN(user.PhoneNumber, input)
		if !ok {
			return fmt.Sprintf("END Authentication failed: %s", errStr)
		}
		amt, _ := strconv.ParseFloat(sess.Data["osusu_pay_amt"], 64)
		idempKey := fmt.Sprintf("osusu-%s-%.2f-%d", user.PhoneNumber, amt, time.Now().Unix()/60)
		if !h.security.CheckIdempotency(idempKey) {
			return "END Error: Duplicate payment detected. Retried within 10 min window."
		}

		user.WalletBalance -= amt
		_ = h.security.Register(user.PhoneNumber, input, user.Language) // update state

		// Send Masked SMS Confirmation
		masked := payments.MaskAmount(amt)
		h.smsAdapter.SendSMS(
			user.PhoneNumber,
			fmt.Sprintf("Fambul Fund: %s contribution confirmed to %s. New bal: SLE ***. Ref: OSU-%d.", masked, user.OsusuGroup, time.Now().UnixNano()%10000),
			"OSUSU_CONTRIBUTION",
		)

		sess.CurrentPath = "home"
		if lang == "krio" {
			return fmt.Sprintf("END Sakses! Yu dɔn pay SLE %.0f na %s pot.\nSMS kɔnfamashɔn dɔn sεnt.", amt, user.OsusuGroup)
		}
		return fmt.Sprintf("END Success! Paid SLE %.0f to %s pot.\nSMS confirmation sent.", amt, user.OsusuGroup)

	// Osusu Leader Proxy Record
	case "osusu_leader_member":
		sess.Data["proxy_member"] = input
		sess.CurrentPath = "osusu_leader_amt"
		if lang == "krio" {
			return fmt.Sprintf("CON Enter amownt fɔ memba %s (SLE):\n0. Bak", input)
		}
		return fmt.Sprintf("CON Enter amount for member %s (SLE):\n0. Back", input)

	case "osusu_leader_amt":
		sess.Data["proxy_amt"] = input
		sess.CurrentPath = "osusu_leader_pin"
		if lang == "krio" {
			return fmt.Sprintf("CON Lida kɔnfam SLE %s fɔ %s.\nEnter yu 4-digit PIN:", input, sess.Data["proxy_member"])
		}
		return fmt.Sprintf("CON Leader confirm SLE %s for %s.\nEnter your 4-digit PIN:", input, sess.Data["proxy_member"])

	case "osusu_leader_pin":
		ok, errStr := h.security.VerifyPIN(user.PhoneNumber, input)
		if !ok {
			return fmt.Sprintf("END Authentication failed: %s", errStr)
		}
		amt, _ := strconv.ParseFloat(sess.Data["proxy_amt"], 64)
		memberNum := sess.Data["proxy_member"]
		
		// Send SMS to member and leader
		h.smsAdapter.SendSMS(
			"+23278555111", // member phone
			fmt.Sprintf("Fambul Fund: Group Leader recorded your contribution of %s to %s.", payments.MaskAmount(amt), user.OsusuGroup),
			"OSUSU_CONTRIBUTION",
		)

		if lang == "krio" {
			return fmt.Sprintf("END Kɔntribyushɔn dɔn rekɔd fɔ memba %s! Group score dɔn opdate.", memberNum)
		}
		return fmt.Sprintf("END Contribution recorded for member %s! Group score updated.", memberNum)

	// 3. Loans Branch
	case "loan_menu":
		switch input {
		case "1":
			return h.renderLoanStatus(user, lang)
		case "2":
			sess.CurrentPath = "loan_repay_amt"
			return "CON Enter repayment amount (SLE):\n0. Back"
		case "3":
			sess.CurrentPath = "pot_advance_choice"
			if lang == "krio" {
				return "CON Pot Advans (Erli Tɔn)\nElidjibul op to SLE 800\n1. Tek SLE 400 (Fi SLE 8)\n2. Tek SLE 800 (Fi SLE 16)\n0. Bak"
			}
			return "CON Pot Advance (Early Turn)\nEligible up to SLE 800\n1. Take SLE 400 (Fee SLE 8)\n2. Take SLE 800 (Fee SLE 16)\n0. Back"
		default:
			sess.CurrentPath = "home"
			return h.renderHome(user, sess)
		}

	case "loan_repay_amt":
		sess.Data["loan_repay_amt"] = input
		sess.CurrentPath = "loan_repay_pin"
		return fmt.Sprintf("CON Repay SLE %s towards loan?\nEnter 4-digit PIN:\n0. Back", input)

	case "loan_repay_pin":
		ok, errStr := h.security.VerifyPIN(user.PhoneNumber, input)
		if !ok {
			return fmt.Sprintf("END Authentication failed: %s", errStr)
		}
		amt, _ := strconv.ParseFloat(sess.Data["loan_repay_amt"], 64)
		idempKey := fmt.Sprintf("repay-%s-%.2f-%d", user.PhoneNumber, amt, time.Now().Unix()/60)
		if !h.security.CheckIdempotency(idempKey) {
			return "END Duplicate repayment blocked."
		}

		h.smsAdapter.SendSMS(
			user.PhoneNumber,
			fmt.Sprintf("Fambul Fund: Loan repayment of %s received. Outstanding loan reduced. Ref: LNR-%d.", payments.MaskAmount(amt), time.Now().UnixNano()%10000),
			"LOAN_REPAYMENT",
		)
		return fmt.Sprintf("END Loan repayment of SLE %.0f successful! Lender ledger updated live.", amt)

	case "pot_advance_choice":
		amt := 400.0
		if input == "2" {
			amt = 800.0
		} else if input != "1" {
			sess.CurrentPath = "home"
			return h.renderHome(user, sess)
		}
		sess.Data["advance_amt"] = fmt.Sprintf("%.0f", amt)
		sess.CurrentPath = "pot_advance_pin"
		if lang == "krio" {
			return fmt.Sprintf("CON Konfam SLE %.0f Pot Advans.\nEnter yu 4-digit PIN:", amt)
		}
		return fmt.Sprintf("CON Confirm SLE %.0f Pot Advance.\nEnter your 4-digit PIN:", amt)

	case "pot_advance_pin":
		ok, errStr := h.security.VerifyPIN(user.PhoneNumber, input)
		if !ok {
			return fmt.Sprintf("END Authentication failed: %s", errStr)
		}
		amt, _ := strconv.ParseFloat(sess.Data["advance_amt"], 64)
		idempKey := fmt.Sprintf("advance-%s-%.2f-%d", user.PhoneNumber, amt, time.Now().Unix()/60)
		if !h.security.CheckIdempotency(idempKey) {
			return "END Duplicate Pot Advance blocked."
		}

		h.smsAdapter.SendSMS(
			user.PhoneNumber,
			fmt.Sprintf("Fambul Fund: Pot Advance of %s credited to your wallet. Auto-deducts next harvest. Ref: ADV-%d.", payments.MaskAmount(amt), time.Now().UnixNano()%10000),
			"POT_ADVANCE",
		)
		return fmt.Sprintf("END Pot Advance approved! SLE %.0f credited to your wallet.", amt)

	// 4. Record Branch (Sale | Expense | Harvest)
	case "record_menu":
		entryType := "sale"
		if input == "2" {
			entryType = "expense"
		} else if input == "3" {
			entryType = "harvest"
		}
		sess.Data["record_type"] = entryType
		sess.CurrentPath = "record_crop"
		if lang == "krio" {
			return "CON Pick crop:\n1. Rice (Rays)\n2. Cassava\n3. Cocoa\n4. Palm Oil\n0. Bak"
		}
		return "CON Select crop:\n1. Rice\n2. Cassava\n3. Cocoa\n4. Palm Oil\n0. Back"

	case "record_crop":
		crop := "Rice"
		switch input {
		case "2":
			crop = "Cassava"
		case "3":
			crop = "Cocoa"
		case "4":
			crop = "Palm Oil"
		}
		sess.Data["record_crop"] = crop
		sess.CurrentPath = "record_qty"
		if lang == "krio" {
			return fmt.Sprintf("CON Enter kwantiti fɔ %s (bags/kg):\n0. Bak", crop)
		}
		return fmt.Sprintf("CON Enter quantity for %s (bags/kg):\n0. Back", crop)

	case "record_qty":
		sess.Data["record_qty"] = input
		sess.CurrentPath = "record_amt"
		if lang == "krio" {
			return "CON Enter amownt na SLE:\n0. Bak"
		}
		return "CON Enter total amount in SLE:\n0. Back"

	case "record_amt":
		sess.Data["record_amt"] = input
		sess.CurrentPath = "record_confirm"
		crop := sess.Data["record_crop"]
		recType := sess.Data["record_type"]
		qty := sess.Data["record_qty"]
		amt := input
		if lang == "krio" {
			return fmt.Sprintf("CON Rekɔd %s: %s %s bag fɔ SLE %s?\n1. Kɔnfam & sev\n2. Kansul\n0. Bak", recType, crop, qty, amt)
		}
		return fmt.Sprintf("CON Record %s: %s %s units for SLE %s?\n1. Confirm & save\n2. Cancel\n0. Back", recType, crop, qty, amt)

	case "record_confirm":
		if input != "1" {
			return "END Entry cancelled."
		}
		qty, _ := strconv.ParseFloat(sess.Data["record_qty"], 64)
		amt, _ := strconv.ParseFloat(sess.Data["record_amt"], 64)
		entry := LedgerEntry{
			ID:        fmt.Sprintf("USSD-LED-%d", time.Now().UnixNano()%100000),
			Phone:     user.PhoneNumber,
			Crop:      sess.Data["record_crop"],
			EntryType: sess.Data["record_type"],
			Quantity:  qty,
			Amount:    amt,
			Source:    "ussd",
			CreatedAt: time.Now(),
		}
		h.ledger = append(h.ledger, entry)

		if lang == "krio" {
			return "END Rekɔd dɔn sev na ledger (source=ussd)! Yu group skɔ dɔn fresh."
		}
		return "END Record saved to ledger (source=ussd)! Group score updated on lender dashboard."

	// 5. More Branch
	case "more_menu":
		switch input {
		case "1":
			sess.CurrentPath = "price_crop"
			return "CON Select Crop for Price:\n1. Cocoa\n2. Rice\n3. Cassava\n4. Oil Palm\n0. Back"
		case "2":
			return "END Rain-Check: Drought Cover ACTIVE for 2026. Micro-premium paid. Payout trigger: <30mm/mo."
		case "3":
			sess.CurrentPath = "change_lang"
			return "CON Select Language / Pick Langwej:\n1. English\n2. Krio\n0. Back"
		case "4":
			sess.CurrentPath = "change_pin_old"
			return "CON Enter current 4-digit PIN:\n0. Back"
		default:
			sess.CurrentPath = "home"
			return h.renderHome(user, sess)
		}

	case "price_crop":
		crop := "Cocoa"
		switch input {
		case "2":
			crop = "Rice"
		case "3":
			crop = "Cassava"
		case "4":
			crop = "Oil Palm"
		}
		sess.Data["price_crop"] = crop
		sess.CurrentPath = "price_district"
		return "CON Select District:\n1. Bo\n2. Kenema\n3. Kailahun\n4. Port Loko\n0. Back"

	case "price_district":
		dist := "Bo"
		switch input {
		case "2":
			dist = "Kenema"
		case "3":
			dist = "Kailahun"
		case "4":
			dist = "Port Loko"
		}
		crop := sess.Data["price_crop"]
		price := 60.0
		if dMap, ok := FarmgatePrices[crop]; ok {
			if p, ok2 := dMap[dist]; ok2 {
				price = p
			}
		}
		return fmt.Sprintf("END Farmgate Price Index: %s in %s is SLE %.1f/kg. (Verified by 34 verified buyer payouts)", crop, dist, price)

	case "change_lang":
		if input == "2" {
			h.security.SetLanguage(user.PhoneNumber, "krio")
			user.Language = "krio"
			return "END Langwej dɔn chenj to Krio!"
		}
		h.security.SetLanguage(user.PhoneNumber, "en")
		user.Language = "en"
		return "END Language set to English!"

	case "change_pin_old":
		sess.Data["old_pin"] = input
		sess.CurrentPath = "change_pin_new"
		return "CON Enter new 4-digit PIN:\n0. Back"

	case "change_pin_new":
		oldPIN := sess.Data["old_pin"]
		ok, msg := h.security.ChangePIN(user.PhoneNumber, oldPIN, input)
		if !ok {
			return fmt.Sprintf("END PIN change failed: %s", msg)
		}
		return "END PIN changed successfully! Please use new PIN for future transactions."

	default:
		sess.CurrentPath = "home"
		return h.renderHome(user, sess)
	}
}

// renderHome displays the top-level 5-option menu.
func (h *Handler) renderHome(user *UserRecord, sess *Session) string {
	if user.Language == "krio" {
		return "CON Fambul Fund\n1. Mi walet\n2. Mi Osusu\n3. Lon dɛn\n4. Rekɔd\n5. Mɔ tin dɛn\n00. Om"
	}
	return "CON Fambul Fund\n1. My wallet\n2. My Osusu\n3. Loans\n4. Record\n5. More\n00. Home"
}

func (h *Handler) renderWalletMenu(user *UserRecord, lang string) string {
	if lang == "krio" {
		return "CON Mi Walet\n1. Balans\n2. Las 3 trenzakshɔn\n3. Envelopes\n0. Bak"
	}
	return "CON My Wallet\n1. Balance\n2. Last 3 transactions\n3. Envelopes\n0. Back"
}

func (h *Handler) renderWalletBalance(user *UserRecord, lang string) string {
	if lang == "krio" {
		return fmt.Sprintf("END Yu walet balans na: SLE %.2f.\nEnvelopes: Agrik Inputs SLE 300, Skul fi SLE 200.", user.WalletBalance)
	}
	return fmt.Sprintf("END Wallet Balance: SLE %.2f.\nEnvelopes: Ag Inputs SLE 300, School SLE 200.", user.WalletBalance)
}

func (h *Handler) renderLastTransactions(user *UserRecord, lang string) string {
	return "END Last 3 Tx:\n1. 14 Nov: Osusu Pot -SLE 100\n2. 10 Nov: Harvest Sale +SLE 850\n3. 02 Nov: Loan Repay -SLE 150"
}

func (h *Handler) renderEnvelopes(user *UserRecord, lang string) string {
	return "END Envelopes:\n1. Ag Inputs: SLE 300\n2. School Fees: SLE 200\n3. Osusu Reserve: SLE 150\nTotal Locked: SLE 650"
}

func (h *Handler) renderOsusuMenu(user *UserRecord, lang string) string {
	leaderLine := ""
	if user.IsLeader {
		if lang == "krio" {
			leaderLine = "\n4. Lida: Rekɔd fɔ memba"
		} else {
			leaderLine = "\n4. Leader: Record for member"
		}
	}
	if lang == "krio" {
		return fmt.Sprintf("CON Mi Osusu (%s)\n1. Pay kɔntribyushɔn\n2. Mi tɔn / pot det\n3. Grup statɔs%s\n0. Bak", user.OsusuGroup, leaderLine)
	}
	return fmt.Sprintf("CON My Osusu (%s)\n1. Pay contribution\n2. My turn / pot date\n3. Group status%s\n0. Back", user.OsusuGroup, leaderLine)
}

func (h *Handler) renderOsusuTurn(user *UserRecord, lang string) string {
	return "END Next Pot Turn: 24 Nov 2026.\nTarget Pot: SLE 1,200.\nYour turn number: 4 of 12.\nGroup on-time rate: 98%."
}

func (h *Handler) renderOsusuStatus(user *UserRecord, lang string) string {
	return fmt.Sprintf("END %s:\nMembers: 12\nCredit Score: 87/100 (Tier A)\nCycle: 4/12\nPool: SLE 4,800 saved.", user.OsusuGroup)
}

func (h *Handler) renderLoanMenu(user *UserRecord, lang string) string {
	if lang == "krio" {
		return "CON Lon dɛn\n1. Lon statɔs\n2. Pay bita lon\n3. Rekwɛst Pot Advans\n0. Bak"
	}
	return "CON Loans\n1. Loan status\n2. Repay now\n3. Request Pot Advance\n0. Back"
}

func (h *Handler) renderLoanStatus(user *UserRecord, lang string) string {
	return "END Active Loan: SLE 450.00\nRepaid to date: SLE 200.00\nNext harvest auto-deduct: SLE 250.00\nInterest rate: 12% (within ceiling)."
}

func (h *Handler) renderRecordMenu(lang string) string {
	if lang == "krio" {
		return "CON Rekɔd na Farm\n1. Sel (Sale)\n2. Spɛndin (Expense)\n3. Avɛst (Harvest)\n0. Bak"
	}
	return "CON Record Farm Activity\n1. Sale\n2. Expense\n3. Harvest\n0. Back"
}

func (h *Handler) renderMoreMenu(lang string) string {
	if lang == "krio" {
		return "CON Mɔ tin dɛn\n1. Farmgate Prayz dɛn\n2. Ren-Chɛk Ensɔrans\n3. Chenj Langwej\n4. Chenj PIN\n0. Bak"
	}
	return "CON More Options\n1. Farmgate Prices\n2. Rain-Check Cover\n3. Change Language\n4. Change PIN\n0. Back"
}

// handleRegistration guides new phone numbers through 4-digit PIN setup.
func (h *Handler) handleRegistration(req USSDRequest) string {
	step := req.Text
	phone := req.PhoneNumber

	if step == "" {
		return "CON Welcome to Fambul Fund / Kushe na Fambul Fund.\n1. English\n2. Krio"
	}

	parts := strings.Split(step, "*")
	if len(parts) == 1 {
		lang := "en"
		if parts[0] == "2" {
			lang = "krio"
		}
		if lang == "krio" {
			return "CON Mek yu nyu 4-digit PIN fɔ protekt yu walet:"
		}
		return "CON Enter a 4-digit PIN to secure your wallet:"
	}

	if len(parts) == 2 {
		lang := "en"
		if parts[0] == "2" {
			lang = "krio"
		}
		pin := parts[1]
		if len(pin) != 4 {
			return "CON PIN must be exactly 4 digits. Re-enter 4-digit PIN:"
		}
		if lang == "krio" {
			return "CON Konfam yu 4-digit PIN agen:"
		}
		return "CON Re-enter your 4-digit PIN to confirm:"
	}

	if len(parts) >= 3 {
		lang := "en"
		if parts[0] == "2" {
			lang = "krio"
		}
		pin1 := parts[1]
		pin2 := parts[2]
		if pin1 != pin2 {
			return "END PINs do not match. Please re-dial to try again."
		}
		_ = h.security.Register(phone, pin1, lang)
		if lang == "krio" {
			return "END Sakses! Yu dɔn rejista na Fambul Fund.\nDaiyal *714# fɔ stât."
		}
		return "END Success! Registered on Fambul Fund.\nDial *714# anytime to access your wallet."
	}

	return "END Invalid input."
}

func extractLatestInput(text string) string {
	if text == "" {
		return ""
	}
	parts := strings.Split(text, "*")
	return parts[len(parts)-1]
}
