# PageLM Architecture Codemap

> Generated: 2026-02-15T14:31:00Z | Version: 1.0.0

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                   │
│  Vite + TailwindCSS + TypeScript                        │
│  Port: 5173                                             │
├─────────────────────────────────────────────────────────┤
│  Pages: Home | SubjectWorkspace | 404                   │
│  State: SubjectContext + ModelContext                    │
│  API: lib/api.ts → HTTP + WebSocket                     │
└──────────────┬──────────────────────┬───────────────────┘
               │ REST (HTTP)          │ WS (streaming)
┌──────────────▼──────────────────────▼───────────────────┐
│                   Backend (Node.js)                      │
│  TypeScript + LangChain/LangGraph                       │
│  Port: 5000                                             │
├─────────────────────────────────────────────────────────┤
│  core/        Routes + HTTP server + middleware          │
│  services/    Feature pipelines (quiz, podcast, etc.)   │
│  agents/      Multi-agent system (LangGraph)            │
│  lib/         AI ops (RAG, chunking, embedding)         │
│  utils/       LLM adapters, DB, TTS, text processing   │
└──────────┬────────────┬──────────────┬──────────────────┘
           │            │              │
    ┌──────▼──┐  ┌──────▼──────┐  ┌───▼────────────┐
    │ Storage │  │ LLM Provider│  │ External APIs   │
    │ (local) │  │ (swappable) │  │ TTS/STT/Search  │
    └─────────┘  └─────────────┘  └─────────────────┘
```

## Key Data Flows

### 1. Upload → RAG Pipeline
```
Upload → Parse (PDF/DOCX/MD) → Semantic Chunk → Embed → Store (JSON/ChromaDB)
```

### 2. Chat Query
```
User Q → Hybrid Retrieve (BM25 + Vector) → Context Assembly → LLM → Stream → Response
```

### 3. Tool Generation (Quiz/Notes/Podcast/etc.)
```
Request → WS Stream → Service Pipeline → Progress Events → Result → Store as ToolRecord
```

### 4. Agent Chat
```
User Q → Agent Router → Tool Selection → Execute → Reflect → Stream Answer
```

## Module Dependency Graph

```
core/routes/* ──→ services/*  ──→ lib/ai/*  ──→ utils/llm/*
      │                │              │              │
      └────────────────┴──→ utils/database/db.ts ◄──┘
                             utils/subjects/subjects.ts
```

## Provider Architecture

| Layer          | Providers                                         |
|----------------|---------------------------------------------------|
| LLM            | OpenAI, Gemini, Claude, Grok, Ollama, OpenRouter  |
| Embeddings     | OpenAI, Gemini, Ollama                            |
| TTS            | Edge, Google, ElevenLabs                          |
| Transcription  | OpenAI, Google, AssemblyAI, ElevenLabs            |
| Search         | Tavily                                            |
| Storage        | JSON files (default), ChromaDB (vector)           |

## WebSocket Streaming Pattern

All long-running operations use a consistent WS event protocol:
```
{ type: "ready",  ... }    → Stream established
{ type: "phase",  value }  → Progress update
{ type: "<result>", data } → Tool-specific payload
{ type: "done" }           → Complete
{ type: "error", error }   → Failure
{ type: "ping", t }        → Keep-alive
```

## Configuration

All via `.env`:
- `LLM_PROVIDER` / `EMB_PROVIDER` / `TTS_PROVIDER` / `TRANSCRIPTION_PROVIDER`
- `db_mode`: json | vector
- `BACKEND_PORT` / `VITE_BACKEND_URL`
- Provider API keys: `OPENAI_API_KEY`, `GOOGLE_API_KEY`, `ANTHROPIC_API_KEY`, etc.
