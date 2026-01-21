package models

// DailySummary represents the AI-generated structured output.
type DailySummary struct {
	Date            string   `json:"date"`
	FlowScore       int      `json:"flow_score"`               // 0-100
	DominantEmotion string   `json:"dominant_emotion"`         // e.g., "focus", "frustration", "exploration"
	Tags            []string `json:"tags"`                     // #coding, #research, #meeting
	SummaryText     string   `json:"summary_text"`             // The short paragraph
	TopActivities   []string `json:"top_activities"`           // List of top windows
	VisualContext   string   `json:"visual_context,omitempty"` // Vision pipeline analysis
}

// LLMRequest is the payload we send to Groq.
type LLMRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
	// We ask for JSON to parse it easily back into Go structs
	ResponseFormat map[string]string `json:"response_format,omitempty"`
}

type Message struct {
	Role    string `json:"role"` // system, user, assistant
	Content string `json:"content"`
}
