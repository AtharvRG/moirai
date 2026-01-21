package processor

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"moirai/lachesis/internal/budget"
	"moirai/lachesis/internal/groq"
	"moirai/lachesis/internal/models"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

type Processor struct {
	Date         time.Time
	DataPath     string
	DailyDir     string
	MarkdownPath string
	JSONPath     string
	client       *groq.Client
	budget       *budget.TokenBudget
}

func New(date time.Time) (*Processor, error) {
	home, _ := os.UserHomeDir()
	base := filepath.Join(home, "Moirai_Data")

	year := date.Year()
	quarter := getQuarter(date)
	month := date.Format("January")
	_, weekNum := date.ISOWeek()

	dailyDir := filepath.Join(base, fmt.Sprintf("%d", year), fmt.Sprintf("Q%d", quarter), month, fmt.Sprintf("Week_%d", weekNum), date.Format("2006-01-02"))

	dataFile := filepath.Join(dailyDir, "raw_telemetry.json")
	markdownFile := filepath.Join(dailyDir, "daily_summary.md")
	jsonFile := filepath.Join(dailyDir, "daily_structured.json")

	client, err := groq.NewClient()
	if err != nil {
		return nil, err
	}

	// Initialize token budget
	tokenBudget := budget.NewTokenBudget(base)

	return &Processor{
		Date:         date,
		DataPath:     dataFile,
		DailyDir:     dailyDir,
		MarkdownPath: markdownFile,
		JSONPath:     jsonFile,
		client:       client,
		budget:       tokenBudget,
	}, nil
}

func (p *Processor) GetMarkdownPath() string { return p.MarkdownPath }
func (p *Processor) GetJSONPath() string     { return p.JSONPath }

// getQuarter returns the quarter (1-4) for a given date.
func getQuarter(date time.Time) int {
	month := int(date.Month())
	switch {
	case month >= 1 && month <= 3:
		return 1
	case month >= 4 && month <= 6:
		return 2
	case month >= 7 && month <= 9:
		return 3
	default:
		return 4
	}
}

// TelemetryData matches the structure produced by Clotho
type TelemetryData struct {
	Meta struct {
		Date string `json:"date"`
	} `json:"meta"`
	Metrics struct {
		TotalKeystrokes int     `json:"total_keystrokes"`
		TotalMouseDist  float64 `json:"total_mouse_dist_pixels"`
		FlowScoreEst    float64 `json:"flow_score_estimate"`
		TopWindow       string  `json:"top_window"`
	} `json:"metrics"`
	Events []struct {
		Title string `json:"title"`
		Type  string `json:"type"`
	} `json:"events"`
}

func (p *Processor) AnalyzeDay() (string, *models.DailySummary, error) {
	// 1. Read Telemetry
	content, err := os.ReadFile(p.DataPath)
	if err != nil {
		return "", nil, fmt.Errorf("could not read telemetry: %w", err)
	}

	// 2. Construct Prompt
	systemPrompt := `You are Lachesis, the Digital Biographer. You analyze raw telemetry data (mouse movement, window focus) to write a daily summary.
    
Your Task:
1. Analyze the provided JSON telemetry.
2. Identify "Flow State" periods (long focus on one app).
3. Identify "Context Switching" (rapid changes).
4. Determine the dominant emotion (Focus, Frustration, Exploration).
5. Output a valid JSON object ONLY. No markdown formatting, no code blocks.

JSON Format:
{
    "flow_score": 0-100,
    "dominant_emotion": "string",
    "tags": ["#tag1", "#tag2"],
    "summary_text": "A 2-sentence narrative of the day.",
    "top_activities": ["App 1", "App 2"]
}`

	userPrompt := fmt.Sprintf("Here is the telemetry data for %s:\n\n%s", p.Date.Format("2006-01-02"), string(content))

	// 3. Check token budget before API call
	estimatedTokens := len(content)/4 + 500 // rough estimate: ~4 chars per token + response
	if !p.budget.CanSpend(estimatedTokens) {
		log.Println("TOKEN BUDGET EXHAUSTED. Falling back to offline mode.")
		return p.offlineFallback(content)
	}

	// 4. Call Groq (Text)
	response, err := p.client.Chat(systemPrompt, userPrompt)
	if err != nil {
		return "", nil, err
	}

	// Record token usage
	p.budget.Spend(estimatedTokens)

	// 5. Parse Response
	var summary models.DailySummary
	cleanResp := cleanLLMResponse(response)

	if err := json.Unmarshal([]byte(cleanResp), &summary); err != nil {
		return "", nil, fmt.Errorf("failed to parse LLM response: %w. Response was: %s", err, response)
	}

	// 6. Vision Pipeline: Analyze screenshots if budget allows
	visualContext := p.analyzeScreenshots()
	if visualContext != "" {
		summary.VisualContext = visualContext
	}

	// 7. Generate Narrative (Markdown)
	markdown := p.generateMarkdown(&summary)

	return markdown, &summary, nil
}

// analyzeScreenshots reads up to 3 most recent screenshots from visual_snaps/
// and sends them to the vision model for context analysis.
func (p *Processor) analyzeScreenshots() string {
	visualDir := filepath.Join(p.DailyDir, "visual_snaps")

	entries, err := os.ReadDir(visualDir)
	if err != nil {
		// No visual_snaps directory — this is normal
		return ""
	}

	// Filter for image files only
	var imageFiles []os.DirEntry
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		name := strings.ToLower(e.Name())
		if strings.HasSuffix(name, ".png") || strings.HasSuffix(name, ".jpg") || strings.HasSuffix(name, ".jpeg") {
			imageFiles = append(imageFiles, e)
		}
	}

	if len(imageFiles) == 0 {
		return ""
	}

	// Sort by name (timestamps) descending to get most recent
	sort.Slice(imageFiles, func(i, j int) bool {
		return imageFiles[i].Name() > imageFiles[j].Name()
	})

	// Take at most 3 screenshots to control API cost
	maxImages := 3
	if len(imageFiles) < maxImages {
		maxImages = len(imageFiles)
	}

	var imagesB64 []string
	for i := 0; i < maxImages; i++ {
		imgPath := filepath.Join(visualDir, imageFiles[i].Name())
		data, err := os.ReadFile(imgPath)
		if err != nil {
			log.Printf("WARN: Could not read screenshot %s: %v", imageFiles[i].Name(), err)
			continue
		}
		imagesB64 = append(imagesB64, base64.StdEncoding.EncodeToString(data))
	}

	if len(imagesB64) == 0 {
		return ""
	}

	// Check budget before expensive vision call (~10k tokens per image)
	estimatedVisionTokens := len(imagesB64) * 10000
	if !p.budget.CanSpend(estimatedVisionTokens) {
		log.Println("TOKEN BUDGET: Skipping vision analysis (budget exhausted)")
		return ""
	}

	log.Printf("VISION: Analyzing %d screenshot(s)...", len(imagesB64))

	visionSystemPrompt := `You are Lachesis Vision, a visual analyst. You examine screenshots of a user's desktop to determine what activity they are performing.

Your Task:
1. Identify the application(s) visible in each screenshot.
2. Classify the activity (Coding, Browsing, Gaming, Communication, Document Editing, etc.).
3. Note any visible project names, file names, or URLs if readable.
4. Output a concise 2-3 sentence summary of what the user was doing.

Be specific and factual. Focus on observable evidence only.`

	visionUserPrompt := fmt.Sprintf("Here are %d screenshot(s) from the user's desktop on %s. Analyze what the user was working on.", len(imagesB64), p.Date.Format("2006-01-02"))

	response, err := p.client.ChatWithVision(visionSystemPrompt, visionUserPrompt, imagesB64)
	if err != nil {
		log.Printf("WARN: Vision analysis failed (falling back to text-only): %v", err)
		return ""
	}

	// Record vision token usage
	p.budget.Spend(estimatedVisionTokens)

	log.Printf("VISION: Analysis complete")
	return response
}

// offlineFallback generates a basic summary using local template when token budget is exhausted.
// FIX: Now correctly handles the JSON structure from Clotho.
func (p *Processor) offlineFallback(rawData []byte) (string, *models.DailySummary, error) {
	log.Println("OFFLINE MODE: Generating template-based summary (no API call).")

	// FIX: Unmarshal into the correct structure
	var data TelemetryData
	if err := json.Unmarshal(rawData, &data); err != nil {
		log.Printf("ERROR parsing telemetry in offline mode: %v", err)
		return "", nil, err
	}

	// Count unique apps from events
	uniqueApps := make(map[string]bool)
	for _, e := range data.Events {
		if e.Title != "" {
			uniqueApps[e.Title] = true
		}
	}

	topApps := make([]string, 0, len(uniqueApps))
	for app := range uniqueApps {
		topApps = append(topApps, app)
		if len(topApps) >= 5 {
			break
		}
	}

	// Create a basic summary object
	summary := &models.DailySummary{
		FlowScore:       int(data.Metrics.FlowScoreEst), // Use the calculated score from Clotho
		DominantEmotion: "Neutral (Offline Mode)",
		Tags:            []string{"#offline", "#auto-generated"},
		SummaryText:     fmt.Sprintf("Token budget exhausted. Recorded %d events, %d keystrokes across %d applications. Flow Score was %.2f.", len(data.Events), data.Metrics.TotalKeystrokes, len(uniqueApps), data.Metrics.FlowScoreEst),
		TopActivities:   topApps,
	}

	markdown := p.generateMarkdown(summary)
	return markdown, summary, nil
}

// cleanLLMResponse strips markdown code block fences from LLM output.
func cleanLLMResponse(resp string) string {
	resp = strings.TrimSpace(resp)
	// Remove ```json or ``` prefix
	if strings.HasPrefix(resp, "```") {
		// Find the end of the first line
		if idx := strings.Index(resp, "\n"); idx != -1 {
			resp = resp[idx+1:]
		}
	}
	// Remove trailing ```
	resp = strings.TrimSuffix(resp, "```")
	return strings.TrimSpace(resp)
}

func (p *Processor) generateMarkdown(data *models.DailySummary) string {
	md := fmt.Sprintf(`# Daily Report: %s

## Flow State
**Score:** %d/100
**Emotion:** %s

## Narrative
%s

## Tags
%v

## Top Activities
%v
`,
		p.Date.Format("2006-01-02"),
		data.FlowScore,
		data.DominantEmotion,
		data.SummaryText,
		data.Tags,
		data.TopActivities,
	)

	// Append visual context if available
	if data.VisualContext != "" {
		md += fmt.Sprintf(`
## Visual Context
%s
`, data.VisualContext)
	}

	md += `---
*Generated by Project Moirai - Lachesis Engine*
`

	return md
}

func (p *Processor) SaveResults(markdown string, data *models.DailySummary) error {
	if err := os.WriteFile(p.MarkdownPath, []byte(markdown), 0644); err != nil {
		return err
	}

	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(p.JSONPath, jsonData, 0644)
}
