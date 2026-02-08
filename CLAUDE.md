# PageLM

AI-powered education platform that transforms study materials (PDFs, documents, recordings) into interactive learning experiences. Self-hosted, privacy-focused alternative to NotebookLM.

## Tech Stack

- **Frontend**: React 19 + Vite + TailwindCSS + TypeScript
- **Backend**: Node.js + TypeScript + LangChain/LangGraph
- **AI Providers**: OpenAI, Gemini, Claude, Grok, Ollama (local), OpenRouter
- **Storage**: All local — JSON files (default) or ChromaDB (vector)
- **Real-time**: WebSockets for streaming
- **Deployment**: Docker or npm

## Project Structure

```
backend/src/
  agents/          # Multi-agent system (Tutor, Researcher, Examiner, Podcaster)
  core/            # HTTP server, routing, middleware, route handlers
  services/        # Feature implementations (podcast, quiz, smartnotes, planner, examlab, debate, transcriber)
  lib/             # Core business logic (AI operations, file parsing)
  utils/           # LLM adapters, database, TTS, WebSocket, text processing
frontend/src/
  pages/           # Route pages (Chat, Quiz, Debate, ExamLab, FlashCards, Planner, Tools, Landing)
  components/      # React components (Chat, Quiz, Companion, Landing, Tools, planner)
  config/          # Frontend configuration
  types/           # TypeScript type definitions
modules/           # YAML exam specifications (GRE, GMAT, SAT, IELTS, JEE)
storage/           # Local persistent storage (uploads, cache, JSON DB, SQLite)
assets/            # Static assets (fonts, templates)
```

## Key Features

1. **Contextual Chat** — RAG-powered Q&A over uploaded documents
2. **SmartNotes** — Cornell-style structured notes with PDF export
3. **Flashcards** — Anti-rote, cognitive-dimension tagged cards
4. **Quizzes** — MCQ generation with hints and explanations
5. **AI Podcast** — 2-speaker audio dialogue from notes (multi-TTS: Edge, ElevenLabs, Google)
6. **Voice Transcriber** — Lecture recordings to searchable text
7. **Homework Planner** — AI scheduling with Pomodoro time-blocking
8. **ExamLab** — Simulate standardized tests (GRE, GMAT, SAT, IELTS, JEE)
9. **Debate** — Practice argumentation with AI
10. **Study Companion** — Persistent AI assistant

## Architecture

- **Provider-agnostic**: LLM/TTS/transcription providers swappable via `.env`
- **Agent-based**: Specialized AI agents with tool access via LangGraph
- **Streaming-first**: WebSockets for all long-running operations
- **Local storage**: JSON files, uploads, cache, SQLite — no cloud dependencies
- **No auth**: Single-user, self-hosted deployment
- **Pedagogical AI**: System prompts embed learning science (Feynman technique, cognitive load theory, anti-rote learning)

## Configuration

All behavior controlled via `.env`:
- `LLM_PROVIDER`: gemini | openai | claude | grok | ollama | openrouter
- `EMB_PROVIDER`: openai | gemini | ollama
- `TTS_PROVIDER`: edge | google | eleven
- `TRANSCRIPTION_PROVIDER`: openai | google | assemblyai
- `db_mode`: json | vector

## Development

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```
