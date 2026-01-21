package main

import (
	"fmt"
	"log"
	"time"

	"moirai/lachesis/internal/processor"
)

func main() {
	// Default to today, but could accept args later
	targetDate := time.Now()

	fmt.Println("===============================================")
	fmt.Println("       LACHESIS: THE WEAVER (v1.0)             ")
	fmt.Println("===============================================")
	fmt.Printf("Analyzing date: %s\n", targetDate.Format("2006-01-02"))

	// 1. Initialize Processor
	p, err := processor.New(targetDate)
	if err != nil {
		log.Fatalf("FATAL: Initialization failed: %v", err)
	}

	// 2. Run Analysis
	fmt.Println("Reading telemetry data...")
	summary, structured, err := p.AnalyzeDay()
	if err != nil {
		log.Fatalf("FATAL: Analysis failed: %v", err)
	}

	// 3. Write Output
	fmt.Println("Weaving narrative...")
	if err := p.SaveResults(summary, structured); err != nil {
		log.Fatalf("FATAL: Save failed: %v", err)
	}

	fmt.Println("\nSUCCESS: Daily narrative woven.")
	fmt.Printf("   Story: %s\n", p.GetMarkdownPath())
	fmt.Printf("   Data:  %s\n", p.GetJSONPath())
}
