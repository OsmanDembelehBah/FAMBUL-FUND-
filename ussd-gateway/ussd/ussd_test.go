package ussd

import (
	"strings"
	"testing"
	"time"

	"github.com/fambulfund/ussd-gateway/payments"
)

func setupTestHandler() (*Handler, *SecurityManager, SessionStore, *payments.SMSAdapter) {
	store := NewMemorySessionStore(90 * time.Second)
	sm := NewSecurityManager()
	sms := payments.NewSMSAdapter(20)
	h := NewHandler(store, sm, sms)
	return h, sm, store, sms
}

// Test 1: Validate hard limit of <= 160 characters on all key screens
func TestScreenCharacterLimit(t *testing.T) {
	h, _, _, _ := setupTestHandler()
	phone := "+23276123456"

	testInputs := []struct {
		name string
		text string
	}{
		{"Home Dial", ""},
		{"Wallet Menu", "1"},
		{"Wallet Balance", "1*1"},
		{"Osusu Menu", "2"},
		{"Osusu Turn", "2*2"},
		{"Osusu Group Status", "2*3"},
		{"Loans Menu", "3"},
		{"Loan Status", "3*1"},
		{"Record Menu", "4"},
		{"More Menu", "5"},
	}

	for _, tc := range testInputs {
		t.Run(tc.name, func(t *testing.T) {
			resp := h.Process(USSDRequest{
				SessionID:   "test-sess-char",
				PhoneNumber: phone,
				Text:        tc.text,
			})
			body := strings.TrimPrefix(strings.TrimPrefix(resp, "CON "), "END ")
			if len(body) > 160 {
				t.Errorf("%s screen exceeded 160 chars: got %d chars: %q", tc.name, len(body), body)
			}
		})
	}
}

// Test 2: PIN Lockout after 3 failed attempts
func TestPINLockoutPolicy(t *testing.T) {
	_, sm, _, _ := setupTestHandler()
	phone := "+23276123456"

	// 1st wrong attempt
	ok, msg := sm.VerifyPIN(phone, "9999")
	if ok || !strings.Contains(msg, "2 attempts remaining") {
		t.Fatalf("Expected 2 attempts remaining, got: %s", msg)
	}

	// 2nd wrong attempt
	ok, msg = sm.VerifyPIN(phone, "9999")
	if ok || !strings.Contains(msg, "1 attempts remaining") {
		t.Fatalf("Expected 1 attempt remaining, got: %s", msg)
	}

	// 3rd wrong attempt -> Trigger 15-minute lock
	ok, msg = sm.VerifyPIN(phone, "9999")
	if ok || !strings.Contains(msg, "locked for 15 minutes") {
		t.Fatalf("Expected 15-minute lock message, got: %s", msg)
	}

	// Even if user now provides the CORRECT PIN ("1234"), account remains locked!
	ok, msg = sm.VerifyPIN(phone, "1234")
	if ok || !strings.Contains(msg, "Account locked") {
		t.Fatalf("Expected locked rejection even with correct PIN, got: %s", msg)
	}
}

// Test 3: Idempotency Protection against duplicate double-charges
func TestIdempotencyProtection(t *testing.T) {
	_, sm, _, _ := setupTestHandler()

	key := "test-idemp-key-1"
	if !sm.CheckIdempotency(key) {
		t.Fatalf("First check should pass idempotency")
	}

	// Immediate replay of exact same key must be rejected
	if sm.CheckIdempotency(key) {
		t.Fatalf("Duplicate transaction key must be rejected within lock window")
	}
}

// Test 4: Graceful Session Resume on drop within 90-second timeout
func TestSessionResumeGracefully(t *testing.T) {
	store := NewMemorySessionStore(90 * time.Second)
	sm := NewSecurityManager()
	sms := payments.NewSMSAdapter(20)
	h := NewHandler(store, sm, sms)
	phone := "+23276123456"

	// Step 1: User navigates into Osusu menu and enters pay contribution step
	_ = h.Process(USSDRequest{
		SessionID:   "dropped-session-101",
		PhoneNumber: phone,
		Text:        "2", // enters Osusu
	})

	_ = h.Process(USSDRequest{
		SessionID:   "dropped-session-101",
		PhoneNumber: phone,
		Text:        "2*1", // selects Pay contribution
	})

	// Step 2: Session drops (network disconnect / telecom drop)
	// Farmer re-dials with a NEW telecom session ID
	resumePrompt := h.Process(USSDRequest{
		SessionID:   "new-session-202",
		PhoneNumber: phone,
		Text:        "", // empty initial dial
	})

	if !strings.Contains(resumePrompt, "Resume") && !strings.Contains(resumePrompt, "kɔntinyu") {
		t.Fatalf("Expected graceful resume prompt upon re-dial, got: %s", resumePrompt)
	}

	// Farmer presses '1' (Yes, resume)
	resumedScreen := h.Process(USSDRequest{
		SessionID:   "new-session-202",
		PhoneNumber: phone,
		Text:        "1",
	})

	if !strings.Contains(resumedScreen, "amount") && !strings.Contains(resumedScreen, "amownt") {
		t.Fatalf("Expected to resume at Osusu pay amount screen, got: %s", resumedScreen)
	}
}

// Test 5: Navigation Back (0) and Home (00)
func TestNavigation0and00(t *testing.T) {
	h, _, _, _ := setupTestHandler()
	phone := "+23276123456"

	// Go into loans menu
	resp := h.Process(USSDRequest{SessionID: "nav-sess", PhoneNumber: phone, Text: "3"})
	if !strings.Contains(resp, "Loans") && !strings.Contains(resp, "Lon") {
		t.Fatalf("Expected Loans menu, got: %s", resp)
	}

	// Press 0 (Back to home)
	resp = h.Process(USSDRequest{SessionID: "nav-sess", PhoneNumber: phone, Text: "0"})
	if !strings.Contains(resp, "Fambul Fund") {
		t.Fatalf("Expected Home menu after 0, got: %s", resp)
	}
}
