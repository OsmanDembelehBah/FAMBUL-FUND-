package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/fambulfund/ussd-gateway/payments"
	"github.com/fambulfund/ussd-gateway/ussd"
)

var startTime = time.Now()

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	env := os.Getenv("ENVIRONMENT")
	if env == "" {
		env = os.Getenv("NODE_ENV")
	}
	if env == "" {
		env = "production"
	}

	redisURL := os.Getenv("REDIS_URL")
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "*"
	}

	sessionStore := ussd.NewMemorySessionStore(90 * time.Second)
	secManager := ussd.NewSecurityManager()
	smsAdapter := payments.DefaultSMSAdapter

	ussdHandler := ussd.NewHandler(sessionStore, secManager, smsAdapter)

	mux := http.NewServeMux()

	// CORS middleware
	withCORS := func(h http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", allowedOrigins)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}
			h(w, r)
		}
	}

	// USSD Telephony Webhook
	mux.HandleFunc("/ussd/callback", withCORS(ussdHandler.ServeHTTP))

	// Health Check Endpoints
	healthHandler := withCORS(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		redisStatus := "in-memory-active"
		if redisURL != "" {
			redisStatus = "configured"
		}
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":       "healthy",
			"service":      "ussd-gateway",
			"environment":  env,
			"uptime_sec":   int(time.Since(startTime).Seconds()),
			"redis_status": redisStatus,
			"timestamp":    time.Now().UTC().Format(time.RFC3339),
		})
	})
	mux.HandleFunc("/health", healthHandler)
	mux.HandleFunc("/healthz", healthHandler)

	// SMS Outbox Inspection
	mux.HandleFunc("/sms/outbox", withCORS(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		msgs := smsAdapter.GetRecentMessages(20)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"messages": msgs,
			"count":    len(msgs),
		})
	}))

	// Payout Rail Batch Endpoint
	mux.HandleFunc("/payments/payout", withCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}
		var req struct {
			Lines []payments.PayoutLine `json:"lines"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		results := payments.ExecuteBatchPayout(req.Lines, false)
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(results)
	}))

	addr := fmt.Sprintf(":%s", port)
	log.Printf("🚀 Fambul Fund USSD Gateway listening on port %s [env=%s]\n", port, env)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
