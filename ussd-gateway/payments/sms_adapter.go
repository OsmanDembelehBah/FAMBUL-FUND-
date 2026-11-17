package payments

import (
	"fmt"
	"sync"
	"time"
)

// MaskAmount formats amounts securely for SMS notifications (e.g., SLE 1,200.00 -> SLE ***.00)
func MaskAmount(amount float64) string {
	return "SLE ***.00"
}

// SMSMessage represents a generated SMS confirmation.
type SMSMessage struct {
	ID        string    `json:"id"`
	Recipient string    `json:"recipient"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
	Status    string    `json:"status"` // "DELIVERED", "QUEUED"
	Category  string    `json:"category"` // "OSUSU_CONTRIBUTION", "LOAN_REPAYMENT", "POT_ADVANCE", "HARVEST_PAYOUT"
}

// SMSAdapter defines sending and logging SMS notifications.
type SMSAdapter struct {
	mu      sync.RWMutex
	outbox  []SMSMessage
	maxLogs int
}

var DefaultSMSAdapter = NewSMSAdapter(50)

func NewSMSAdapter(maxLogs int) *SMSAdapter {
	return &SMSAdapter{
		outbox:  make([]SMSMessage, 0),
		maxLogs: maxLogs,
	}
}

// SendSMS records and sends a simulated telecom SMS.
func (s *SMSAdapter) SendSMS(recipient, message, category string) SMSMessage {
	s.mu.Lock()
	defer s.mu.Unlock()

	msg := SMSMessage{
		ID:        fmt.Sprintf("SMS-%d", time.Now().UnixNano()%1000000),
		Recipient: recipient,
		Message:   message,
		Timestamp: time.Now(),
		Status:    "DELIVERED",
		Category:  category,
	}

	// Prepend for newest first
	s.outbox = append([]SMSMessage{msg}, s.outbox...)
	if len(s.outbox) > s.maxLogs {
		s.outbox = s.outbox[:s.maxLogs]
	}
	return msg
}

// GetRecentMessages retrieves the recent simulated SMS messages for UI display.
func (s *SMSAdapter) GetRecentMessages(limit int) []SMSMessage {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if limit <= 0 || limit > len(s.outbox) {
		limit = len(s.outbox)
	}
	msgs := make([]SMSMessage, limit)
	copy(msgs, s.outbox[:limit])
	return msgs
}
