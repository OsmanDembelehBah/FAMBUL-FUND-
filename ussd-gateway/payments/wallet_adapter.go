package payments

import (
	"fmt"
	"math"
	"math/rand"
	"time"
)

// PayoutLine represents an individual farmer payment line within a buyer harvest batch.
type PayoutLine struct {
	ID                string    `json:"id"`
	FarmerID          string    `json:"farmer_id"`
	FarmerName        string    `json:"farmer_name"`
	PhoneNumber       string    `json:"phone_number"`
	Crop              string    `json:"crop"`
	GrossAmount       float64   `json:"gross_amount"`
	LoanRepayment     float64   `json:"loan_repayment"`
	OsusuContribution float64   `json:"osusu_contribution"`
	PlatformFee       float64   `json:"platform_fee"`
	NetPayout         float64   `json:"net_payout"`
	Provider          string    `json:"provider"` // "Orange Money", "Afrimoney", "QMoney", "Monime"
	Status            string    `json:"status"`   // "PENDING", "SUCCESS", "FAILED"
	TxReference       string    `json:"tx_reference"`
	FailureReason     string    `json:"failure_reason,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
}

// SplitCalculation holds the verified split breakdown of a gross farmgate sale.
type SplitCalculation struct {
	Gross             float64 `json:"gross"`
	PlatformFee       float64 `json:"platform_fee"` // 1.0%
	LoanRepayment     float64 `json:"loan_repayment"`
	OsusuContribution float64 `json:"osusu_contribution"`
	NetFarmerPayout   float64 `json:"net_farmer_payout"`
}

// CalculateSplit computes the 4-way split logic:
// Gross - Loan Repayment - Osusu Contribution - 1% Platform Fee = Net Wallet
func CalculateSplit(gross, loanDue, osusuDue float64) SplitCalculation {
	if gross <= 0 {
		return SplitCalculation{}
	}

	// 1.0% platform fee
	fee := round2(gross * 0.01)
	available := gross - fee

	// Priority 1: Loan repayment deduction up to loanDue or available
	repay := math.Min(loanDue, math.Max(0, available))
	available -= repay

	// Priority 2: Osusu rotating savings deduction up to osusuDue or remaining available
	osusu := math.Min(osusuDue, math.Max(0, available))
	available -= osusu

	// Remainder goes directly to farmer mobile wallet
	net := math.Max(0, available)

	return SplitCalculation{
		Gross:             round2(gross),
		PlatformFee:       round2(fee),
		LoanRepayment:     round2(repay),
		OsusuContribution: round2(osusu),
		NetFarmerPayout:   round2(net),
	}
}

func round2(val float64) float64 {
	return math.Round(val*100) / 100
}

// WalletAdapter defines the standard interface for mobile money and payment gateways in Sierra Leone.
// Supported telecom rails: Orange Money SL, Africell Afrimoney, QCell QMoney, and Monime Aggregator.
type WalletAdapter interface {
	GetProviderName() string
	Disburse(phone string, amount float64, ref string) (success bool, txID string, err error)
	Collect(phone string, amount float64, ref string) (success bool, txID string, err error)
	CheckStatus(txID string) (status string, err error)
}

// MockOrangeMoneyAdapter simulates the Orange Money Sierra Leone Open API (B2C / C2B).
type MockOrangeMoneyAdapter struct{}

func (m *MockOrangeMoneyAdapter) GetProviderName() string {
	return "Orange Money"
}

func (m *MockOrangeMoneyAdapter) Disburse(phone string, amount float64, ref string) (bool, string, error) {
	// In production:
	// POST https://api.orange.com/orange-money-webpay/sl/v1/transaction
	// Authorization: Bearer <access_token>
	// Body: {"recipient": phone, "amount": amount, "currency": "SLE", "reference": ref}
	txID := fmt.Sprintf("OM-SL-%d", time.Now().UnixNano()%10000000)
	return true, txID, nil
}

func (m *MockOrangeMoneyAdapter) Collect(phone string, amount float64, ref string) (bool, string, error) {
	txID := fmt.Sprintf("OM-COL-%d", time.Now().UnixNano()%10000000)
	return true, txID, nil
}

func (m *MockOrangeMoneyAdapter) CheckStatus(txID string) (string, error) {
	return "SUCCESS", nil
}

// MockAfrimoneyAdapter simulates Africell Afrimoney Sierra Leone API.
type MockAfrimoneyAdapter struct{}

func (m *MockAfrimoneyAdapter) GetProviderName() string {
	return "Afrimoney"
}

func (m *MockAfrimoneyAdapter) Disburse(phone string, amount float64, ref string) (bool, string, error) {
	txID := fmt.Sprintf("AFRI-%d", time.Now().UnixNano()%10000000)
	return true, txID, nil
}

func (m *MockAfrimoneyAdapter) Collect(phone string, amount float64, ref string) (bool, string, error) {
	txID := fmt.Sprintf("AFRI-COL-%d", time.Now().UnixNano()%10000000)
	return true, txID, nil
}

func (m *MockAfrimoneyAdapter) CheckStatus(txID string) (string, error) {
	return "SUCCESS", nil
}

// MockQMoneyAdapter simulates QCell QMoney Sierra Leone API.
type MockQMoneyAdapter struct{}

func (m *MockQMoneyAdapter) GetProviderName() string {
	return "QMoney"
}

func (m *MockQMoneyAdapter) Disburse(phone string, amount float64, ref string) (bool, string, error) {
	txID := fmt.Sprintf("QM-%d", time.Now().UnixNano()%10000000)
	return true, txID, nil
}

func (m *MockQMoneyAdapter) Collect(phone string, amount float64, ref string) (bool, string, error) {
	txID := fmt.Sprintf("QM-COL-%d", time.Now().UnixNano()%10000000)
	return true, txID, nil
}

func (m *MockQMoneyAdapter) CheckStatus(txID string) (string, error) {
	return "SUCCESS", nil
}

// MockMonimeAdapter simulates Monime Sierra Leone payment orchestrator API.
type MockMonimeAdapter struct{}

func (m *MockMonimeAdapter) GetProviderName() string {
	return "Monime"
}

func (m *MockMonimeAdapter) Disburse(phone string, amount float64, ref string) (bool, string, error) {
	txID := fmt.Sprintf("MNM-PAY-%d", time.Now().UnixNano()%10000000)
	return true, txID, nil
}

func (m *MockMonimeAdapter) Collect(phone string, amount float64, ref string) (bool, string, error) {
	txID := fmt.Sprintf("MNM-COL-%d", time.Now().UnixNano()%10000000)
	return true, txID, nil
}

func (m *MockMonimeAdapter) CheckStatus(txID string) (string, error) {
	return "SUCCESS", nil
}

// ResolveAdapter returns the matching adapter according to phone prefix or carrier name.
func ResolveAdapter(phoneOrProvider string) WalletAdapter {
	switch {
	case phoneOrProvider == "Afrimoney" || (len(phoneOrProvider) > 6 && phoneOrProvider[:6] == "+23277"):
		return &MockAfrimoneyAdapter{}
	case phoneOrProvider == "QMoney" || (len(phoneOrProvider) > 6 && phoneOrProvider[:6] == "+23233"):
		return &MockQMoneyAdapter{}
	case phoneOrProvider == "Monime":
		return &MockMonimeAdapter{}
	default:
		// Default to Orange Money (+23276, +23278, +23275)
		return &MockOrangeMoneyAdapter{}
	}
}

// ExecuteBatchPayout executes payout split lines with retry and error simulation.
func ExecuteBatchPayout(lines []PayoutLine, simulateOneFailure bool) []PayoutLine {
	result := make([]PayoutLine, len(lines))
	copy(result, lines)

	rand.Seed(time.Now().UnixNano())
	failIndex := -1
	if simulateOneFailure && len(result) > 1 {
		failIndex = 1 // simulate failure on 2nd row for realistic demo retry
	}

	for i := range result {
		split := CalculateSplit(result[i].GrossAmount, result[i].LoanRepayment, result[i].OsusuContribution)
		result[i].PlatformFee = split.PlatformFee
		result[i].LoanRepayment = split.LoanRepayment
		result[i].OsusuContribution = split.OsusuContribution
		result[i].NetPayout = split.NetFarmerPayout

		adapter := ResolveAdapter(result[i].PhoneNumber)
		result[i].Provider = adapter.GetProviderName()

		if i == failIndex {
			result[i].Status = "FAILED"
			result[i].FailureReason = "Subscriber wallet temporarily inactive (retryable)"
			result[i].TxReference = ""
		} else {
			ok, txID, _ := adapter.Disburse(result[i].PhoneNumber, result[i].NetPayout, result[i].ID)
			if ok {
				result[i].Status = "SUCCESS"
				result[i].TxReference = txID
				result[i].FailureReason = ""
			} else {
				result[i].Status = "FAILED"
				result[i].FailureReason = "Provider timeout"
			}
		}
	}
	return result
}
