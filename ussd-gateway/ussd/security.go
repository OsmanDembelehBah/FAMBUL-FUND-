package ussd

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sync"
	"time"
)

// UserRecord stores security and preference attributes for a phone subscriber.
type UserRecord struct {
	PhoneNumber    string    `json:"phone_number"`
	Language       string    `json:"language"` // "en" or "krio"
	Salt           string    `json:"salt"`
	HashedPIN      string    `json:"hashed_pin"`
	FailedAttempts int       `json:"failed_attempts"`
	LockedUntil    time.Time `json:"locked_until"`
	Registered     bool      `json:"registered"`
	IsLeader       bool      `json:"is_leader"`
	WalletBalance  float64   `json:"wallet_balance"`
	OsusuGroup     string    `json:"osusu_group"`
	MemberNumber   string    `json:"member_number"`
}

// SecurityManager handles authentication, lockout policies, and idempotency.
type SecurityManager struct {
	mu            sync.RWMutex
	users         map[string]*UserRecord
	idempotency   map[string]time.Time
	lockoutWindow time.Duration
	maxAttempts   int
}

// NewSecurityManager creates an instance of SecurityManager with seeded synthetic users.
func NewSecurityManager() *SecurityManager {
	sm := &SecurityManager{
		users:         make(map[string]*UserRecord),
		idempotency:   make(map[string]time.Time),
		lockoutWindow: 15 * time.Minute,
		maxAttempts:   3,
	}

	// Seed demo farmers matching the synthetic dataset
	// Primary demo farmer: Aminata Kamara (+23276123456, PIN 1234)
	sm.SeedUser("+23276123456", "1234", "krio", true, "Gbo-Kakua Osusu", "M-01", 1250.00)
	// Group Leader: Sorie Mansaray (+23277987654, PIN 2468)
	sm.SeedUser("+23277987654", "2468", "en", true, "Gbo-Kakua Osusu", "M-02", 4100.00)
	// Member 3: Fatmata Bangura (+23278555111, PIN 1111)
	sm.SeedUser("+23278555111", "1111", "krio", false, "Gbo-Kakua Osusu", "M-03", 850.00)

	return sm
}

// HashPIN combines a plain 4-digit PIN with a random per-user salt.
func HashPIN(pin, salt string) string {
	hasher := sha256.New()
	hasher.Write([]byte(salt + ":" + pin))
	return hex.EncodeToString(hasher.Sum(nil))
}

// GenerateSalt creates a crypto-secure 16-byte hex salt.
func GenerateSalt() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

// SeedUser pre-populates a user for testing and demo consistency.
func (sm *SecurityManager) SeedUser(phone, pin, lang string, isLeader bool, group, memberNum string, balance float64) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	salt := GenerateSalt()
	sm.users[phone] = &UserRecord{
		PhoneNumber:    phone,
		Language:       lang,
		Salt:           salt,
		HashedPIN:      HashPIN(pin, salt),
		FailedAttempts: 0,
		Registered:     true,
		IsLeader:       isLeader,
		WalletBalance:  balance,
		OsusuGroup:     group,
		MemberNumber:   memberNum,
	}
}

// GetUser retrieves a user record or nil if not registered.
func (sm *SecurityManager) GetUser(phone string) (*UserRecord, bool) {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	u, exists := sm.users[phone]
	if !exists {
		return nil, false
	}
	// Return a copy to avoid concurrency mutation
	userCopy := *u
	return &userCopy, true
}

// Register registers a new phone number with a 4-digit PIN and chosen language.
func (sm *SecurityManager) Register(phone, pin, lang string) error {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	if len(pin) != 4 {
		return fmt.Errorf("PIN must be exactly 4 digits")
	}

	salt := GenerateSalt()
	sm.users[phone] = &UserRecord{
		PhoneNumber:    phone,
		Language:       lang,
		Salt:           salt,
		HashedPIN:      HashPIN(pin, salt),
		FailedAttempts: 0,
		Registered:     true,
		WalletBalance:  350.00, // starter seed balance
		OsusuGroup:     "Gbo-Kakua Osusu",
		MemberNumber:   "M-07",
	}
	return nil
}

// VerifyPIN verifies the provided PIN against the salt+hash, enforcing 15-min lockout.
func (sm *SecurityManager) VerifyPIN(phone, pin string) (bool, string) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	user, exists := sm.users[phone]
	if !exists {
		return false, "User not registered"
	}

	// Check if currently locked
	if time.Now().Before(user.LockedUntil) {
		remainingMinutes := int(time.Until(user.LockedUntil).Minutes()) + 1
		return false, fmt.Sprintf("Account locked for %d min due to 3 wrong attempts", remainingMinutes)
	}

	expectedHash := HashPIN(pin, user.Salt)
	if user.HashedPIN == expectedHash {
		// Reset failed attempts on success
		user.FailedAttempts = 0
		return true, ""
	}

	// Wrong PIN
	user.FailedAttempts++
	if user.FailedAttempts >= sm.maxAttempts {
		user.LockedUntil = time.Now().Add(sm.lockoutWindow)
		return false, "Wrong PIN entered 3 times. Account locked for 15 minutes."
	}

	remaining := sm.maxAttempts - user.FailedAttempts
	return false, fmt.Sprintf("Wrong PIN. %d attempts remaining before 15-min lock.", remaining)
}

// ChangePIN changes the user's PIN if old PIN matches.
func (sm *SecurityManager) ChangePIN(phone, oldPIN, newPIN string) (bool, string) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	user, exists := sm.users[phone]
	if !exists {
		return false, "User not found"
	}

	if HashPIN(oldPIN, user.Salt) != user.HashedPIN {
		return false, "Incorrect current PIN"
	}

	if len(newPIN) != 4 {
		return false, "New PIN must be 4 digits"
	}

	user.Salt = GenerateSalt()
	user.HashedPIN = HashPIN(newPIN, user.Salt)
	return true, "PIN changed successfully"
}

// SetLanguage updates user language preference.
func (sm *SecurityManager) SetLanguage(phone, lang string) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	if u, exists := sm.users[phone]; exists {
		u.Language = lang
	}
}

// CheckIdempotency verifies that an idempotency key hasn't been executed recently (10 mins).
func (sm *SecurityManager) CheckIdempotency(key string) bool {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	if prevTime, exists := sm.idempotency[key]; exists {
		if time.Since(prevTime) < 10*time.Minute {
			return false // Duplicate action blocked!
		}
	}
	sm.idempotency[key] = time.Now()
	return true
}

// MaskAmount formats amounts securely for SMS notifications (e.g., SLE 1,200.00 -> SLE ***.00 or SLE 1,***)
func MaskAmount(amount float64) string {
	return fmt.Sprintf("SLE ***.00 (verified)")
}
