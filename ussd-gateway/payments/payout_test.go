package payments

import (
	"math"
	"strings"
	"testing"
)

func TestCalculateSplitLogic(t *testing.T) {
	// Standard case: Sufficient gross sale to cover all deductions
	split := CalculateSplit(1000.00, 200.00, 100.00)

	expectedFee := 10.00 // 1% of 1000
	expectedRepay := 200.00
	expectedOsusu := 100.00
	expectedNet := 690.00 // 1000 - 10 - 200 - 100

	if math.Abs(split.PlatformFee-expectedFee) > 0.001 {
		t.Errorf("Platform fee mismatch: expected %.2f, got %.2f", expectedFee, split.PlatformFee)
	}
	if math.Abs(split.LoanRepayment-expectedRepay) > 0.001 {
		t.Errorf("Loan repayment mismatch: expected %.2f, got %.2f", expectedRepay, split.LoanRepayment)
	}
	if math.Abs(split.OsusuContribution-expectedOsusu) > 0.001 {
		t.Errorf("Osusu contribution mismatch: expected %.2f, got %.2f", expectedOsusu, split.OsusuContribution)
	}
	if math.Abs(split.NetFarmerPayout-expectedNet) > 0.001 {
		t.Errorf("Net farmer payout mismatch: expected %.2f, got %.2f", expectedNet, split.NetFarmerPayout)
	}

	// Invariant: Gross == Fee + Repay + Osusu + Net
	sum := split.PlatformFee + split.LoanRepayment + split.OsusuContribution + split.NetFarmerPayout
	if math.Abs(sum-split.Gross) > 0.01 {
		t.Errorf("Accounting invariant broken: Gross %.2f != Sum %.2f", split.Gross, sum)
	}
}

func TestPartialGrossCoverage(t *testing.T) {
	// Edge case: Gross sale smaller than total obligations
	split := CalculateSplit(50.00, 100.00, 50.00)

	expectedFee := 0.50 // 1% of 50
	expectedRepay := 49.50
	expectedOsusu := 0.00
	expectedNet := 0.00

	if math.Abs(split.PlatformFee-expectedFee) > 0.001 {
		t.Errorf("Expected fee %.2f, got %.2f", expectedFee, split.PlatformFee)
	}
	if math.Abs(split.LoanRepayment-expectedRepay) > 0.001 {
		t.Errorf("Expected loan repayment clamped to available %.2f, got %.2f", expectedRepay, split.LoanRepayment)
	}
	if math.Abs(split.OsusuContribution-expectedOsusu) > 0.001 {
		t.Errorf("Expected osusu contribution %.2f, got %.2f", expectedOsusu, split.OsusuContribution)
	}
	if math.Abs(split.NetFarmerPayout-expectedNet) > 0.001 {
		t.Errorf("Expected net payout 0.00, got %.2f", split.NetFarmerPayout)
	}
}

func TestWalletAdaptersAndProviders(t *testing.T) {
	om := ResolveAdapter("+23276123456")
	if om.GetProviderName() != "Orange Money" {
		t.Errorf("Expected Orange Money adapter for +23276, got %s", om.GetProviderName())
	}

	afri := ResolveAdapter("+23277987654")
	if afri.GetProviderName() != "Afrimoney" {
		t.Errorf("Expected Afrimoney adapter for +23277, got %s", afri.GetProviderName())
	}

	qm := ResolveAdapter("+23233111222")
	if qm.GetProviderName() != "QMoney" {
		t.Errorf("Expected QMoney adapter for +23233, got %s", qm.GetProviderName())
	}

	// Test disbursement
	ok, txID, err := om.Disburse("+23276123456", 250.0, "REF-101")
	if !ok || err != nil || txID == "" {
		t.Errorf("Failed disbursement through mock adapter: %v", err)
	}
}

func TestSMSMaskingAndOutbox(t *testing.T) {
	sms := NewSMSAdapter(10)
	msg := sms.SendSMS("+23276123456", "Fambul Fund: SLE ***.00 paid", "OSUSU_CONTRIBUTION")

	if msg.Recipient != "+23276123456" {
		t.Errorf("Unexpected recipient: %s", msg.Recipient)
	}
	if !strings.Contains(msg.Message, "***") {
		t.Errorf("SMS message did not mask sensitive financial amount: %s", msg.Message)
	}

	recent := sms.GetRecentMessages(5)
	if len(recent) != 1 {
		t.Errorf("Expected 1 recent message, got %d", len(recent))
	}
}
