package groq

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

const (
	BaseURL = "https://api.groq.com/openai/v1/chat/completions"
	// Text model for telemetry analysis
	ModelID = "llama-3.3-70b-versatile"
)

// VisionModelID returns the vision model, overridable via GROQ_VISION_MODEL env var.
func VisionModelID() string {
	if m := os.Getenv("GROQ_VISION_MODEL"); m != "" {
		return m
	}
	return "meta-llama/llama-4-maverick-17b-128e-instruct"
}

type Client struct {
	APIKey string
	HTTP   *http.Client
}

func NewClient() (*Client, error) {
	key := os.Getenv("GROQ_API_KEY")
	if key == "" {
		return nil, fmt.Errorf("GROQ_API_KEY environment variable not set")
	}

	return &Client{
		APIKey: key,
		HTTP:   &http.Client{},
	}, nil
}

// Chat sends a text-only chat completion request.
func (c *Client) Chat(systemPrompt, userPrompt string) (string, error) {
	reqBody := map[string]interface{}{
		"model": ModelID,
		"messages": []map[string]string{
			{"role": "system", "content": systemPrompt},
			{"role": "user", "content": userPrompt},
		},
		"temperature": 0.7,
	}

	return c.sendRequest(reqBody)
}

// ChatWithVision sends a multi-modal chat completion request with images.
// imagesBase64 should contain raw base64-encoded PNG data (no data URI prefix).
func (c *Client) ChatWithVision(systemPrompt, userPrompt string, imagesBase64 []string) (string, error) {
	// Build content array: text + image parts
	content := []map[string]interface{}{
		{"type": "text", "text": userPrompt},
	}
	for _, img := range imagesBase64 {
		content = append(content, map[string]interface{}{
			"type": "image_url",
			"image_url": map[string]string{
				"url": "data:image/png;base64," + img,
			},
		})
	}

	reqBody := map[string]interface{}{
		"model": VisionModelID(),
		"messages": []interface{}{
			map[string]string{
				"role":    "system",
				"content": systemPrompt,
			},
			map[string]interface{}{
				"role":    "user",
				"content": content,
			},
		},
		"temperature": 0.5,
		"max_tokens":  512,
	}

	return c.sendRequest(reqBody)
}

// sendRequest handles the HTTP request/response cycle for both text and vision calls.
func (c *Client) sendRequest(reqBody map[string]interface{}) (string, error) {
	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", BaseURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("API Error %d: %s", resp.StatusCode, string(body))
	}

	var respData struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&respData); err != nil {
		return "", err
	}

	if len(respData.Choices) == 0 {
		return "", fmt.Errorf("no response from API")
	}

	return respData.Choices[0].Message.Content, nil
}
