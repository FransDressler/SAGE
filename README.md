<div align="center">

# SAGE
<img width="1710" height="948" alt="Bildschirmfoto 2026-02-09 um 17 49 21" src="https://github.com/user-attachments/assets/f5ff6860-9ca8-4d7f-9e17-f69a84cbf9e3" />

<img width="1707" height="945" alt="Bildschirmfoto 2026-02-09 um 17 46 12" src="https://github.com/user-attachments/assets/84eee3b7-920e-44f8-b29d-e23a41d55a64" />

** _S_tudy _A_id for _G_uided _E_ducation**

--- 

**S**tudy **A**id for **G**uided **E**ducation

A redesigned fork of [PageLM](https://github.com/CaviraOSS/PageLM) — rebuilt with a new UI and extended with academic research, AI mind maps, subject graphs, and more.


</div>

<p align="center">
  <a href="LICENSE.md"><img src="https://img.shields.io/badge/Base-PageLM%20Community%20License-blueviolet.svg" alt="Base License"></a>
  <a href="LICENSE-ADDITIONS.md"><img src="https://img.shields.io/badge/Additions-%C2%A9%20Frans%20Dressler-orange.svg" alt="Additions License"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg" alt="Node.js"></a>
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-19-blue.svg" alt="React"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0+-blue.svg" alt="TypeScript"></a>
</p>

---

## What SAGE Changes

SAGE is a redesigned take on PageLM — new UI, streamlined feature set, and new capabilities:

| Change | Description |
|--------|-------------|
| **New Design** | Fully reworked UI — workspace layout, collapsible panels, command palette, keyboard shortcuts, drag-and-drop uploads |
| **Academic Research** | Generate research papers with arXiv, PubMed, and Wikipedia integration — 6-phase pipeline with citations |
| **Exam Builder** | Generate exam-style assessments from your sources with open and MCQ questions, point allocation, and time limits |
| **Mind Map + AI Editing** | Visual knowledge graphs with AI-assisted restructuring, category clustering, and force-directed auto-layout |
| **Subject Graph** | Persistent cross-subject knowledge graph that grows incrementally as you add sources |
| **Mathpix OCR** | Math-aware PDF parsing — converts LaTeX formulas and extracts diagrams |
| **Image Understanding** | Vision model describes extracted diagrams and figures for richer context |
| **Chat Sidebar** | Multi-chat support with history, rename, and delete |
| **Source Viewer** | Inline PDF and markdown preview with page navigation |
| **Enhanced Chat** | Improved composer, markdown rendering, and source attribution display |
| **Quiz Redesign** | Rebuilt question cards, results panel, review modal, and topic bar |
| **Removed** | ExamLab, Debate, and Study Companion — stripped to keep the tool focused |

---

## Features

| Tool | Description |
|------|-------------|
| **Contextual Chat** | RAG-powered Q&A over uploaded documents with source attribution and multi-chat history |
| **Academic Research** | Generate research papers with arXiv, PubMed, and Wikipedia sources — dedicated reader with TOC |
| **SmartNotes** | Cornell-style structured notes with Wikipedia enrichment, graph context, and PDF export |
| **Flashcards** | Cognitive-dimension tagged cards (anti-rote learning) |
| **Quizzes** | MCQ generation with hints, explanations, and scoring |
| **AI Podcast** | Two-speaker audio dialogues from your materials |
| **Voice Transcriber** | Lecture recordings to searchable, embeddable text |
| **Homework Planner** | AI scheduling with Pomodoro time-blocking |
| **Web Search** | Pull and embed web content into your sources |
| **Exam Builder** | Generate custom exams from your uploaded sources |
| **Mind Map** | Visual knowledge graphs with AI editing, category clustering, and color-coded themes |
| **Subject Graph** | Persistent knowledge graph that grows incrementally with each source added |
| **Source Viewer** | Inline PDF and markdown preview with page navigation |
| **Command Palette** | Unified search across chats, tools, and sources (`Cmd+K`) |

### Supported AI Providers

| Category | Providers |
|----------|-----------|
| **LLM** | Google Gemini · OpenAI GPT · Anthropic Claude · xAI Grok · Ollama (local) · OpenRouter |
| **Embeddings** | OpenAI · Gemini · Ollama |
| **TTS** | Edge TTS · ElevenLabs · Google Cloud TTS |
| **Transcription** | OpenAI Whisper · Google Cloud · AssemblyAI |
| **OCR** | Mathpix (math-aware LaTeX extraction) |
| **Vision** | OpenAI GPT-4.1-mini (image/diagram descriptions) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React 19 + Vite + TailwindCSS)                   │
│  Command palette · Keyboard shortcuts · Drag-and-drop       │
│  WebSocket streams for all long-running operations           │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP + WebSocket
┌──────────────────────▼──────────────────────────────────────┐
│  Backend (Node.js + TypeScript)                              │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ AI Agents   │  │ Services     │  │ RAG Pipeline       │  │
│  │ ─ Tutor     │  │ ─ Research   │  │ ─ Semantic Chunker │  │
│  │ ─ Researcher│  │ ─ Podcast    │  │ ─ Hybrid Retrieval │  │
│  │ ─ Examiner  │  │ ─ Quiz       │  │   (BM25 + Vector)  │  │
│  │ ─ Podcaster │  │ ─ SmartNotes │  │ ─ Parent/Child     │  │
│  │             │  │ ─ Mindmap    │  │   document splits   │  │
│  │  LangGraph  │  │ ─ Exam       │  │                    │  │
│  │  runtime    │  │ ─ Transcriber│  │  LangChain         │  │
│  │             │  │ ─ Web Search │  │                    │  │
│  │             │  │ ─ SubjGraph  │  │  External APIs:    │  │
│  │             │  │ ─ Wikipedia  │  │  arXiv · PubMed    │  │
│  │             │  │ ─ Mathpix    │  │  Wikipedia · Tavily │  │
│  └─────────────┘  └──────────────┘  └────────────────────┘  │
│  Storage: JSON files (default) or ChromaDB (vector)          │
│  All data stays local — no cloud dependencies                │
└──────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** v20+
- **npm** (or pnpm)
- **ffmpeg** — required for podcast audio generation
- **Docker** — optional

### Quick Setup

```bash
git clone https://github.com/FransDressler/SAGE.git
cd SAGE

# Linux / macOS
chmod +x ./setup.sh && ./setup.sh

# Windows (PowerShell)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
./setup.ps1
```

### Manual Setup

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..

# Configure environment
cp .env.example .env
# Edit .env — set your API keys and preferred providers

# Start backend (terminal 1)
cd backend && npm run dev

# Start frontend (terminal 2)
cd frontend && npm run dev
```

Open **http://localhost:5173**

### Docker

```bash
docker compose up --build

# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+K` | Open command palette |
| `Cmd/Ctrl+Shift+O` | New chat |
| `Cmd/Ctrl+Shift+7` | Toggle sources panel |
| `Cmd/Ctrl+Shift+8` | Toggle chat panel |
| `Cmd/Ctrl+Shift+9` | Toggle tools panel |
| `Cmd/Ctrl+Shift+0` | Toggle graph panel |
| `Cmd/Ctrl+Enter` | Send message |
| `Cmd/Ctrl+H` | Show shortcuts help |
| `Esc` | Stop generating / close modals |

---

## Configuration

All behavior is controlled through `.env`. Copy `.env.example` and configure:

```env
LLM_PROVIDER=gemini            # gemini | openai | claude | grok | ollama | openrouter
EMB_PROVIDER=openai             # openai | gemini | ollama
db_mode=json                    # json | vector (ChromaDB)
TTS_PROVIDER=edge               # edge | google | eleven
TRANSCRIPTION_PROVIDER=openai   # openai | google | assemblyai
```

| Provider | Key Variable | Default Model |
|----------|-------------|---------------|
| Gemini | `gemini` | `gemini-2.5-flash` |
| OpenAI | `OPENAI_API_KEY` | `gpt-4o-mini` |
| Claude | `ANTHROPIC_API_KEY` | `claude-3-5-sonnet-latest` |
| Grok | `XAI_API_KEY` | `grok-2-latest` |
| Ollama | *(local, no key)* | `llama4` |
| OpenRouter | `OPENROUTER_API_KEY` | `google/gemini-2.5-flash` |

### Optional Services

| Service | Variables | Purpose |
|---------|-----------|---------|
| **Mathpix** | `MATHPIX_APP_ID`, `MATHPIX_API_KEY` | Math-aware OCR for PDFs with LaTeX formulas |
| **Tavily** | `TAVILY_API_KEY` | Web search integration for sourcing |
| **ElevenLabs** | `ELEVEN_API_KEY` | Premium TTS voices for podcasts |
| **AssemblyAI** | `ASSEMBLYAI_API_KEY` | Alternative transcription provider |

See [`.env.example`](.env.example) for the complete list.

---

## Staying Up to Date

SAGE tracks the upstream PageLM repository. To pull in the latest changes:

```bash
git fetch upstream
git merge upstream/main
```

---

## License

This repository contains two layers of licensing:

| Scope | License | Copyright |
|-------|---------|-----------|
| **Base PageLM code** | [PageLM Community License](LICENSE.md) | nullure & recabasic |
| **SAGE additions** | [SAGE Additions License](LICENSE-ADDITIONS.md) | Frans Dressler |

The base PageLM code is free for personal and educational use. SAGE modifications (new UI design, exam builder, mind map AI editing, subject graph, and all other original code by Frans Dressler) are **copyright Frans Dressler** — viewing for reference only, no copying or redistribution without permission.

See [LICENSE.md](LICENSE.md) and [LICENSE-ADDITIONS.md](LICENSE-ADDITIONS.md) for full terms.

---

## Attribution

SAGE is built on [PageLM](https://github.com/CaviraOSS/PageLM) by CaviraOSS (nullure & recabasic).

---

<div align="center">

**SAGE — Study AI, Guided by Evidence**

Built by [Frans Dressler](https://github.com/FransDressler)

</div>
