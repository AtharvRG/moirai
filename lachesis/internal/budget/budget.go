package budget

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// TokenBudget enforces daily and monthly token limits for API calls.
// When the budget is exceeded, it signals the caller to fall back to offline mode.
type TokenBudget struct {
	mu             sync.Mutex
	DailyLimit     int    `json:"daily_limit"`
	MonthlyLimit   int    `json:"monthly_limit"`
	DailyUsed      int    `json:"daily_used"`
	MonthlyUsed    int    `json:"monthly_used"`
	LastResetDay   string `json:"last_reset_day"`
	LastResetMonth string `json:"last_reset_month"`
	configPath     string
}

// NewTokenBudget loads or creates a token budget from the config directory.
func NewTokenBudget(configDir string) *TokenBudget {
	tb := &TokenBudget{
		DailyLimit:   100000,  // 100k tokens/day default
		MonthlyLimit: 2000000, // 2M tokens/month default
		configPath:   filepath.Join(configDir, "token_budget.json"),
	}

	// Try to load existing budget
	if data, err := os.ReadFile(tb.configPath); err == nil {
		if jsonErr := json.Unmarshal(data, tb); jsonErr != nil {
			log.Println("WARN: Could not parse token_budget.json, using defaults:", jsonErr)
		}
	}

	// Auto-reset if day/month has rolled over
	tb.resetIfNeeded()
	return tb
}

// CanSpend returns true if the requested token count is within budget.
func (tb *TokenBudget) CanSpend(tokens int) bool {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	tb.resetIfNeeded()
	return (tb.DailyUsed+tokens <= tb.DailyLimit) && (tb.MonthlyUsed+tokens <= tb.MonthlyLimit)
}

// Spend records token usage. Call this after a successful API call.
func (tb *TokenBudget) Spend(tokens int) {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	tb.DailyUsed += tokens
	tb.MonthlyUsed += tokens
	tb.save()

	// Log remaining budget
	dailyRemaining := tb.DailyLimit - tb.DailyUsed
	monthlyRemaining := tb.MonthlyLimit - tb.MonthlyUsed
	log.Printf("TOKEN BUDGET: Spent %d tokens. Daily remaining: %d, Monthly remaining: %d",
		tokens, dailyRemaining, monthlyRemaining)
}

// GetStatus returns a human-readable budget status.
func (tb *TokenBudget) GetStatus() string {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	tb.resetIfNeeded()
	return fmt.Sprintf("Daily: %d/%d | Monthly: %d/%d",
		tb.DailyUsed, tb.DailyLimit, tb.MonthlyUsed, tb.MonthlyLimit)
}

// IsExhausted returns true if either daily or monthly budget is fully consumed.
func (tb *TokenBudget) IsExhausted() bool {
	tb.mu.Lock()
	defer tb.mu.Unlock()
	tb.resetIfNeeded()
	return tb.DailyUsed >= tb.DailyLimit || tb.MonthlyUsed >= tb.MonthlyLimit
}

// resetIfNeeded resets daily/monthly counters when a new day or month begins.
func (tb *TokenBudget) resetIfNeeded() {
	now := time.Now()
	today := now.Format("2006-01-02")
	thisMonth := now.Format("2006-01")

	if tb.LastResetDay != today {
		tb.DailyUsed = 0
		tb.LastResetDay = today
		log.Println("TOKEN BUDGET: Daily counter reset.")
	}

	if tb.LastResetMonth != thisMonth {
		tb.MonthlyUsed = 0
		tb.LastResetMonth = thisMonth
		log.Println("TOKEN BUDGET: Monthly counter reset.")
	}
}

// save persists the current budget state to disk.
func (tb *TokenBudget) save() {
	data, err := json.MarshalIndent(tb, "", "  ")
	if err != nil {
		log.Println("WARN: Could not marshal token budget:", err)
		return
	}

	// Atomic write: write to temp, then rename
	tmpPath := tb.configPath + ".tmp"
	if err := os.WriteFile(tmpPath, data, 0644); err != nil {
		log.Println("WARN: Could not write token budget:", err)
		return
	}
	os.Rename(tmpPath, tb.configPath)
}
