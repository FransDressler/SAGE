<div align="center">

# SAGE
<img width="1710" height="948" alt="Bildschirmfoto 2026-02-09 um 17 49 21" src="https://github.com/user-attachments/assets/f5ff6860-9ca8-4d7f-9e17-f69a84cbf9e3" />

<img width="1707" height="945" alt="Bildschirmfoto 2026-02-09 um 17 46 12" src="https://github.com/user-attachments/assets/84eee3b7-920e-44f8-b29d-e23a41d55a64" />
**Study Aid for Guided Education**




An enhanced fork of [PageLM](https://github.com/CaviraOSS/PageLM) — the open-source AI education platform that transforms study materials into interactive learning experiences.

SAGE extends PageLM with exam simulation, mind map editing, subject graphs, UI refinements, and more.


</div>

<p align="center">
  <a href="LICENSE.md"><img src="https://img.shields.io/badge/Base-PageLM%20Community%20License-blueviolet.svg" alt="Base License"></a>
  <a href="LICENSE-ADDITIONS.md"><img src="https://img.shields.io/badge/Additions-%C2%A9%20Frans%20Dressler-orange.svg" alt="Additions License"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg" alt="Node.js"></a>
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-19-blue.svg" alt="React"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0+-blue.svg" alt="TypeScript"></a>
</p>

---

## What SAGE Adds

SAGE builds on PageLM's foundation with these additions:

| Feature | Description |
|---------|-------------|
| **Exam Builder** | Generate exam-style assessments from your sources with open and MCQ questions, point allocation, and time limits |
| **Mind Map AI Editing** | AI-assisted mind map modifications — ask the AI to restructure, expand, or refine your knowledge graphs |
| **Force-Directed Layout** | Physics-based auto-layout for mind map nodes |
| **Subject Graph** | Cross-subject knowledge graph visualization |
| **UI Overhaul** | Refined workspace layout, collapsible panels, improved mobile header, selection popups, and loading indicators |
| **Enhanced Chat** | Improved composer, markdown rendering, and source attribution display |
| **Quiz Improvements** | Redesigned question cards, results panel, review modal, and topic bar |

---

## All Features

Everything from PageLM, plus SAGE additions:

### Learning Tools

| Tool | Origin | Description |
|------|--------|-------------|
| **Contextual Chat** | PageLM | RAG-powered Q&A over uploaded documents with source attribution |
| **SmartNotes** | PageLM | Cornell-style structured notes with PDF export |
| **Flashcards** | PageLM | Cognitive-dimension tagged cards (anti-rote learning) |
| **Quizzes** | PageLM | MCQ generation with hints, explanations, and scoring |
| **AI Podcast** | PageLM | Two-speaker audio dialogues from your materials |
| **Voice Transcriber** | PageLM | Lecture recordings to searchable, embeddable text |
| **Homework Planner** | PageLM | AI scheduling with Pomodoro time-blocking |
| **ExamLab** | PageLM | Simulate standardized tests (GRE, GMAT, SAT, IELTS, JEE) |
| **Debate** | PageLM | Practice argumentation with an AI opponent |
| **Study Companion** | PageLM | Persistent AI assistant across study sessions |
| **Web Search** | PageLM | Pull and embed web content into your sources |
| **Exam Builder** | SAGE | Generate custom exams from your uploaded sources |
| **Mind Map** | SAGE | Visual knowledge graphs with AI-assisted editing and force layout |
| **Subject Graph** | SAGE | Cross-subject knowledge visualization |

### Supported AI Providers

| Category | Providers |
|----------|-----------|
| **LLM** | Google Gemini · OpenAI GPT · Anthropic Claude · xAI Grok · Ollama (local) · OpenRouter |
| **Embeddings** | OpenAI · Gemini · Ollama |
| **TTS** | Edge TTS · ElevenLabs · Google Cloud TTS |
| **Transcription** | OpenAI Whisper · Google Cloud · AssemblyAI |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React 19 + Vite + TailwindCSS)                   │
│  WebSocket streams for all long-running operations           │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP + WebSocket
┌──────────────────────▼──────────────────────────────────────┐
│  Backend (Node.js + TypeScript)                              │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ AI Agents   │  │ Services     │  │ RAG Pipeline       │  │
│  │ ─ Tutor     │  │ ─ Podcast    │  │ ─ Semantic Chunker │  │
│  │ ─ Researcher│  │ ─ Quiz       │  │ ─ Hybrid Retrieval │  │
│  │ ─ Examiner  │  │ ─ SmartNotes │  │   (BM25 + Vector)  │  │
│  │ ─ Podcaster │  │ ─ Mindmap    │  │ ─ Parent/Child     │  │
│  │             │  │ ─ ExamLab    │  │   document splits   │  │
│  │  LangGraph  │  │ ─ Exam ★     │  │                    │  │
│  │  runtime    │  │ ─ Transcriber│  │  LangChain         │  │
│  │             │  │ ─ Web Search │  │                    │  │
│  │             │  │ ─ SubjGraph ★│  │                    │  │
│  └─────────────┘  └──────────────┘  └────────────────────┘  │
│                                         ★ = SAGE additions   │
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

The base PageLM code is free for personal and educational use. SAGE additions (exam builder, mind map AI editing, subject graph, UI changes, and all other original code by Frans Dressler) are **copyright Frans Dressler** — viewing for reference only, no copying or redistribution without permission.

See [LICENSE.md](LICENSE.md) and [LICENSE-ADDITIONS.md](LICENSE-ADDITIONS.md) for full terms.

---

## Attribution

SAGE is built on [PageLM](https://github.com/CaviraOSS/PageLM) by CaviraOSS (nullure & recabasic).

---

<div align="center">

**SAGE — Study AI, Guided by Evidence**

Built by [Frans Dressler](https://github.com/FransDressler)

</div>
