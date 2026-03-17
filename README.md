# IGNISIA — Real-Time Document Verification

> **Hackathon Demo** — Real-time document fraud detection & prompt injection defense system.

![Status](https://img.shields.io/badge/Status-Demo-brightgreen) ![Python](https://img.shields.io/badge/Python-3.10+-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd ignisia/backend
pip install -r requirements.txt
```

### 2. Set Anthropic API Key (Optional)

```bash
# Windows PowerShell
$env:ANTHROPIC_API_KEY="your_key_here"

# Linux/Mac
export ANTHROPIC_API_KEY=your_key_here
```

> Without the API key, IGNISIA runs in **Demo Mode** — pattern matching only, no AI semantic analysis.

### 3. Start Backend Server

```bash
cd ignisia/backend
uvicorn main:app --reload --port 8000
```

### 4. Open Frontend

Open `ignisia/frontend/index.html` in your browser.

The status pill in the header should show **● ENGINE ONLINE** in green.

---

## 🏗️ Architecture

```
ignisia/
├── backend/
│   ├── main.py                    # FastAPI app (3 endpoints)
│   ├── analyzers/
│   │   ├── document_analyzer.py   # Visual + text analysis
│   │   ├── injection_detector.py  # Prompt injection detection (regex + Claude AI)
│   │   └── risk_scorer.py         # Ensemble risk scoring
│   └── requirements.txt
├── frontend/
│   └── index.html                 # Full UI (dark theme, Tailwind CSS)
└── README.md
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check + engine status |
| `/api/verify` | POST | Upload & analyze document (multipart/form-data) |
| `/api/demo` | POST | Pre-built demo scenarios for live presentation |

### Demo Scenarios

| Scenario | Score | Story |
|----------|-------|-------|
| `clean` | 12 | All layers PASS — verified in 87ms |
| `tampered` | 74 | Visual FAIL — metadata mismatch, EXIF inconsistency |
| `injection` | 91 | Injection FAIL — hidden adversarial instructions in white text |
| `serial_fraud` | 68 | Behavioral FAIL — template reuse across 3 submissions |

## 🛡️ Analysis Layers

1. **Visual Integrity** — File structure, metadata, embedded JS, EXIF
2. **Text Authenticity** — Date consistency, boilerplate, Unicode tricks
3. **Prompt Injection Defense** — Regex patterns + Claude AI semantic analysis (USP)
4. **Behavioral Patterns** — Cross-submission template deduplication
5. **Ensemble Risk Scoring** — Weighted aggregation (injection at 40% weight)

## ⚙️ Tech Stack

- **Backend**: Python, FastAPI, Uvicorn
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Frontend**: HTML + Tailwind CSS (CDN) + Vanilla JS
- **State**: In-memory only (no database)
