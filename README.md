<div align="center">

<!-- LOGO AREA -->
<img src="./aphrodite/src/app/favicon.ico" alt="Fractal Logo" width="180" />


# Moirai: The Narrative OS for Windows

Weaving the thread of daily action into the narrative of life intent.

<br/>

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

</div>

## Overview

Moirai is a local-first, cloud-augmented resident agent for Windows that transforms passive digital behavior into an actionable life narrative. Unlike traditional productivity tools that demand manual input, Moirai operates as a background chronicler—observing, compressing, and narrating your digital life through the metaphor of the Three Fates from Greek mythology.

**Core Paradigm:**  
Clotho captures the raw moment. Lachesis weaves meaning. Atropos grants you the final cut.

## Authors

- **AtharvRG** - [GitHub](https://github.com/AtharvRG)
- **krishnagoyal099** - [GitHub](https://github.com/krishnagoyal099)

## Architecture

Moirai consists of four primary components, each serving a distinct purpose in the narrative lifecycle:

### 1. Clotho (The Spinner)
**Technology:** Go  
**Role:** System capture and telemetry spooling  
**Location:** Background Windows process

Clotho integrates deeply with Windows APIs to capture system activity:
- UI Automation for window tracking and process monitoring
- Raw Input API for measuring input velocity (keys/minute, scroll deltas)
- Windows Graphics Capture for smart screenshots during high-intent activities
- WebSocket IPC for communication with Atropos

**Key Features:**
- Privacy-first design: captures velocity metrics, never raw keystrokes
- Hierarchical storage: organized by Year/Quarter/Week/Day
- Smart screenshot capture triggered by IDE usage or high-velocity activity
- Local SQLite database with WAL mode for data integrity

### 2. Lachesis (The Measurer)
**Technology:** Go  
**Role:** AI narrative generation and processing  
**Location:** Batch processing service

Lachesis transforms raw telemetry into meaningful narratives:
- Processes daily activity data from Clotho
- Integrates with PuterJS API (Mistral OCR + Claude 3.5 Sonnet)
- Generates narrative summaries and intent classifications
- Outputs both human-readable markdown and structured JSON

**Processing Pipeline:**
1. Reads telemetry data from hierarchical storage
2. Extracts text from screenshots using Mistral OCR
3. Sends metadata + OCR + historical context to Claude
4. Receives narrative summary + intent classification
5. Saves results as daily chronicles

### 3. Atropos (The Cutter)
**Technology:** Electron + React + TypeScript  
**Role:** User interface and control center  
**Location:** Desktop application

Atropos provides the visual interface for interacting with your narrative:
- System tray integration for minimal intrusion
- Dashboard views for activity chronicles
- Environmental reshaping (resume threads, cut noise)
- Real-time data updates via file system watchers
- Settings management and privacy controls

**Features:**
- Chronicle tree visualization (Year/Quarter/Week/Day hierarchy)
- Activity pulse indicator (productive/scattered/idle)
- Thread notifications for extended focus sessions
- One-click thread resumption (restore window states)
- Demo mode for testing without real data

### 4. Aphrodite (The Landing)
**Technology:** Next.js + React + TypeScript  
**Role:** Marketing website and project showcase  
**Location:** Web application

Aphrodite presents Moirai to the world with a premium, immersive experience:
- Scroll-driven narrative timeline
- WebGL-powered visual effects
- Responsive design with smooth animations
- SEO-optimized content structure

## Project Structure

```
moirai/
├── clotho/              # System capture service (Go)
│   ├── internal/
│   │   ├── capture/     # Screenshot and screen capture
│   │   ├── config/      # Configuration management
│   │   ├── hooks/       # System event listeners
│   │   ├── storage/     # Hierarchical path management
│   │   ├── telemetry/   # Data collection and storage
│   │   └── worker/      # Background processing
│   ├── go.mod
│   └── main.go
│
├── lachesis/            # Narrative processing engine (Go)
│   ├── internal/
│   │   ├── processor/   # AI integration and analysis
│   │   ├── reader/      # Telemetry data reading
│   │   └── writer/      # Output generation
│   ├── go.mod
│   └── main.go
│
├── atropos/             # Desktop application (Electron)
│   ├── electron/        # Main process and IPC
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Application views
│   │   ├── hooks/       # Custom React hooks
│   │   ├── store/       # Zustand state management
│   │   ├── services/    # API integrations
│   │   └── utils/       # Utility functions
│   └── package.json
│
├── aphrodite/           # Landing page (Next.js)
│   ├── src/
│   │   ├── app/         # Next.js app router
│   │   ├── components/  # React components
│   │   └── hooks/       # Custom hooks
│   └── package.json
│
├── .github/             # GitHub workflows and CI/CD
├── LICENSE
└── project.md           # Detailed project specification
```

## Installation

### Prerequisites

- **Windows 10/11** (64-bit)
- **Go 1.25.7+** (for building Clotho and Lachesis)
- **Node.js 18+** (for building Atropos and Aphrodite)
- **Git**

### Building from Source

#### 1. Clone the Repository

```bash
git clone https://github.com/AtharvRG/moirai.git
cd moirai
```

#### 2. Build Clotho (System Capture Service)

```bash
cd clotho
go mod download
go build -o clotho.exe .
cd ..
```

#### 3. Build Lachesis (Narrative Processor)

```bash
cd lachesis
go mod download
go build -o lachesis.exe .
cd ..
```

#### 4. Build Atropos (Desktop Application)

```bash
cd atropos
npm install
npm run build
npm run electron:build
cd ..
```

The built application will be in `atropos/dist/`.

#### 5. Build Aphrodite (Landing Page - Optional)

```bash
cd aphrodite
npm install
npm run build
cd ..
```

## Usage

### Running Clotho (Background Capture)

```bash
./clotho/clotho.exe
```

Clotho will start capturing system activity and storing telemetry data in:
```
%LOCALAPPDATA%\Moirai\chronicle\<YEAR>\<QUARTER>\<WEEK>\<DATE>.db
```

**Privacy Controls:**
- Press `Ctrl+Shift+End` to terminate Clotho and wipe unprocessed data
- Configure capture settings in `%LOCALAPPDATA%\Moirai\config.json`

### Running Lachesis (Narrative Generation)

```bash
./lachesis/lachesis.exe
```

Lachesis will:
1. Read today's telemetry data
2. Process screenshots with OCR
3. Generate narrative summaries
4. Save results to the chronicle directory

**Output:**
- Markdown narrative: `<DATE>_summary.md`
- Structured data: `<DATE>_structured.json`

### Running Atropos (Desktop Application)

Launch the installed application from the Start Menu or run:

```bash
cd atropos
npm run electron:dev
```

**Features:**
- View daily chronicles in the Chronicle Tree
- Monitor real-time activity pulse
- Resume previous work threads
- Configure privacy and capture settings
- Export/import data
- Enable demo mode for testing

## Configuration

### Clotho Configuration

Create or edit `%LOCALAPPDATA%\Moirai\config.json`:

```json
{
  "dataRoot": "%LOCALAPPDATA%\\Moirai\\chronicle",
  "captureInterval": 30,
  "screenshotQuality": 0.7,
  "enableSmartCapture": true,
  "highIntentProcesses": ["code.exe", "devenv.exe", "idea64.exe"],
  "velocityThreshold": 100
}
```

### Lachesis Configuration

Set environment variables for API access:

```bash
set PUTER_API_KEY=your_puter_api_key
set MISTRAL_API_KEY=your_mistral_api_key
set CLAUDE_API_KEY=your_claude_api_key
```

### Atropos Configuration

Settings are managed through the application UI:
- System Tray → Settings
- Configure API keys, auto-launch, data paths, and privacy options

## Privacy & Security

Moirai is designed with privacy as a core principle:

### Local-First Promise
- Raw keystrokes are NEVER stored (only velocity metrics)
- Screenshots are processed locally before any cloud transmission
- The Redaction Layer strips emails and PII using regex and window detection
- All raw data stays on your machine

### Cloud Integration
Groq only receives:
- Redacted screenshots (optional, user-toggleable)
- Process names (e.g., "code.exe")
- Window title hashes (not raw titles for sensitive apps)
- Velocity vectors

### Permission Model
- Windows UI Access (for cross-window title reading)
- 
## Data Lifecycle

### 1. The Gasp (Real-Time)
Every 30 seconds, Clotho writes to local SQLite:
```
timestamp | process | window_hash | kps | scroll_vel | thread_id
```

### 2. The Visual Gasp (Smart Capture)
Triggered when `process == code.exe` OR velocity > threshold:
- JPEG screenshot (quality 0.7)
- Stored in hierarchical folder structure
- Redaction layer applied before transmission

### 3. The Weaving (Batch Processing)
Every 5-10 minutes (configurable):
1. Mistral OCR extracts text from screenshots
2. Claude receives: metadata + OCR + historical context
3. Returns: narrative summary + intent classification

### 4. The Chronicle (Storage)
- **Hot Data:** Last 7 days (raw spool + screenshots)
- **Compressed:** Daily summaries after 7 days (narrative text only)
- **Archived:** Quarterly compression to cold storage

## Development

### Running in Development Mode

#### Clotho
```bash
cd clotho
go run main.go
```

#### Lachesis
```bash
cd lachesis
go run main.go
```

#### Atropos
```bash
cd atropos
npm run electron:dev
```

#### Aphrodite
```bash
cd aphrodite
npm run dev
```

### Testing

#### Go Components
```bash
cd clotho
go test ./...

cd ../lachesis
go test ./...
```

#### Electron Application
```bash
cd atropos
npm run lint
npm run build
```

## Roadmap

### Current Scope (MVP)
- Windows process monitoring and velocity tracking
- Smart screenshot capture
- Groq integration for OCR and narrative generation
- Hierarchical Chronicle storage
- Environmental reshaping (resume/cut threads)
- Electron-based system tray interface

### Future Enhancements (V2)
- Cross-device sync
- Local LLM inference (offline mode)
- Mobile App integration
- Collaborative/shared narratives
- Advanced analytics and insights
- Custom intent classification models

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention
We follow conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test additions or modifications
- `chore:` - Build process or auxiliary tool changes

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Greek mythology of the Three Fates (Moirai)
- Built with modern web and systems programming technologies
- Powered by PuterJS, Mistral OCR, and Claude AI

## Support

For issues, questions, or feature requests:
- Open an issue on [GitHub](https://github.com/AtharvRG/moirai/issues)
- Check the [project documentation](project.md) for detailed specifications

## Philosophy

Moirai does not manage your time. It reveals the story of how you spend it.

The system embraces "epistolary latency"—rather than interrupting you with real-time suggestions, it observes for 5-10 minutes before weaving a narrative summary. This transforms the AI from an intrusive assistant into a perceptive diarist, someone who reflects rather than reacts.

If the narrative feels wrong, you simply cut it. No damage done.
