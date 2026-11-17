package ussd

import (
	"sync"
	"time"
)

// Session represents an active USSD session for a subscriber.
type Session struct {
	SessionID   string            `json:"session_id"`
	PhoneNumber string            `json:"phone_number"`
	Language    string            `json:"language"` // "en" or "krio"
	CurrentPath string            `json:"current_path"`
	History     []string          `json:"history"`
	Data        map[string]string `json:"data"`
	PINVerified bool              `json:"pin_verified"`
	UpdatedAt   time.Time         `json:"updated_at"`
	CreatedAt   time.Time         `json:"created_at"`
}

// SessionStore defines storage operations for USSD sessions.
type SessionStore interface {
	Get(sessionID string) (*Session, bool)
	GetByPhone(phoneNumber string) (*Session, bool)
	Save(session *Session) error
	Delete(sessionID string) error
	Cleanup(timeout time.Duration)
}

// MemorySessionStore is a concurrent-safe in-memory session store.
type MemorySessionStore struct {
	mu           sync.RWMutex
	sessions     map[string]*Session
	phoneSession map[string]string // phone -> latest sessionID
	idleTimeout  time.Duration
}

// NewMemorySessionStore creates a new in-memory session store.
func NewMemorySessionStore(idleTimeout time.Duration) *MemorySessionStore {
	if idleTimeout <= 0 {
		idleTimeout = 90 * time.Second
	}
	store := &MemorySessionStore{
		sessions:     make(map[string]*Session),
		phoneSession: make(map[string]string),
		idleTimeout:  idleTimeout,
	}

	// Periodic garbage collection for expired sessions
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		for range ticker.C {
			store.Cleanup(store.idleTimeout)
		}
	}()

	return store
}

func (s *MemorySessionStore) Get(sessionID string) (*Session, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	sess, exists := s.sessions[sessionID]
	if !exists {
		return nil, false
	}
	if time.Since(sess.UpdatedAt) > s.idleTimeout {
		return nil, false
	}
	return sess, true
}

func (s *MemorySessionStore) GetByPhone(phoneNumber string) (*Session, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	sessionID, exists := s.phoneSession[phoneNumber]
	if !exists {
		return nil, false
	}
	sess, exists := s.sessions[sessionID]
	if !exists {
		return nil, false
	}
	if time.Since(sess.UpdatedAt) > s.idleTimeout {
		return nil, false
	}
	return sess, true
}

func (s *MemorySessionStore) Save(session *Session) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	session.UpdatedAt = time.Now()
	if session.CreatedAt.IsZero() {
		session.CreatedAt = session.UpdatedAt
	}
	if session.Data == nil {
		session.Data = make(map[string]string)
	}

	s.sessions[session.SessionID] = session
	s.phoneSession[session.PhoneNumber] = session.SessionID
	return nil
}

func (s *MemorySessionStore) Delete(sessionID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if sess, exists := s.sessions[sessionID]; exists {
		delete(s.phoneSession, sess.PhoneNumber)
		delete(s.sessions, sessionID)
	}
	return nil
}

func (s *MemorySessionStore) Cleanup(timeout time.Duration) {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	for id, sess := range s.sessions {
		if now.Sub(sess.UpdatedAt) > timeout {
			delete(s.phoneSession, sess.PhoneNumber)
			delete(s.sessions, id)
		}
	}
}
