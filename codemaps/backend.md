# Backend Codemap

> Generated: 2026-02-15T14:31:00Z | Version: 1.0.0

## Directory Structure

```
backend/src/
├── core/                    # HTTP server, routing, middleware
│   ├── index.ts             # Entry point — creates HTTP + WS server
│   ├── router.ts            # Route registration, CORS, static file serving
│   └── routes/              # Route handlers (one file per feature)
├── agents/                  # Multi-agent system (LangGraph)
│   ├── index.ts             # Agent orchestrator entry
│   ├── agents.ts            # Agent definitions
│   ├── registry.ts          # Agent registry
│   ├── runtime.ts           # LangGraph execution runtime
│   ├── memory.ts            # Agent memory/state management
│   ├── tools/               # Agent tool definitions
│   └── types.ts             # Agent type definitions
├── services/                # Feature service pipelines
│   ├── exam/                # Exam generation
│   ├── mindmap/             # Concept mindmap generation
│   ├── podcast/             # AI podcast dialogue + TTS
│   ├── quiz/                # MCQ quiz generation
│   ├── research/            # Multi-source research pipeline
│   ├── smartnotes/          # Cornell-style notes (plan→gather→generate→assemble)
│   ├── subjectgraph/        # Cross-subject knowledge graph
│   ├── transcriber/         # Audio/video transcription
│   └── websearch/           # Tavily web search + embed pipeline
├── lib/                     # Core business logic
│   ├── ai/                  # AI operations
│   │   ├── agentChat.ts     # Agent-based chat with tool use
│   │   ├── ask.ts           # RAG Q&A pipeline
│   │   ├── chunker.ts       # Semantic text chunking
│   │   ├── embed.ts         # Document embedding pipeline
│   │   ├── extract.ts       # Text extraction from documents
│   │   ├── describeImages.ts # Image description via LLM
│   │   ├── imageUtils.ts    # Image URL extraction + resolution
│   │   └── tools/           # Chat tool definitions (chatTools.ts)
│   ├── parser/              # File parsing
│   │   ├── upload.ts        # Upload handler (PDF, DOCX, MD, etc.)
│   │   └── mathpix.ts       # Mathpix OCR integration
│   └── prompts/             # System prompt templates
└── utils/                   # Shared utilities
    ├── database/
    │   └── db.ts            # Keyv + JSON/ChromaDB hybrid store, BM25+Vector retrieval
    ├── llm/
    │   ├── llm.ts           # makeModels() — provider-agnostic LLM factory
    │   └── models/          # Provider adapters (openai, gemini, claude, grok, ollama, openrouter)
    ├── subjects/
    │   └── subjects.ts      # Subject/Source CRUD, ToolRecord management
    ├── chat/
    │   └── chat.ts          # Chat session CRUD (messages, history)
    ├── tts/                 # Text-to-speech (Edge, Google, ElevenLabs)
    ├── text/                # Text processing utilities
    ├── quiz/                # Quiz utilities
    ├── server/              # Server helpers
    └── debug/               # Debug bus and utilities
```

## Route Map

| Route File         | Method | Endpoint                              | Purpose                    |
|--------------------|--------|---------------------------------------|----------------------------|
| subjects.ts        | POST   | /subjects                             | Create subject             |
| subjects.ts        | GET    | /subjects                             | List subjects              |
| subjects.ts        | GET    | /subjects/:id                         | Get subject + sources      |
| subjects.ts        | PATCH  | /subjects/:id                         | Update subject             |
| subjects.ts        | DELETE | /subjects/:id                         | Delete subject + data      |
| subjects.ts        | POST   | /subjects/:id/sources                 | Upload files               |
| subjects.ts        | DELETE | /subjects/:id/sources/:sourceId       | Delete source              |
| subjects.ts        | POST   | /subjects/:id/reindex                 | Re-embed all sources       |
| chat.ts            | POST   | /subjects/:id/chat                    | Start chat (WS stream)     |
| chat.ts            | GET    | /subjects/:id/chats                   | List chat sessions         |
| chat.ts            | GET    | /subjects/:id/chats/:chatId           | Get chat history           |
| chat.ts            | DELETE | /subjects/:id/chats/:chatId           | Delete chat                |
| notes.ts           | POST   | /subjects/:id/smartnotes              | Generate notes (WS)        |
| notes.ts           | GET    | /subjects/:id/smartnotes              | List saved notes           |
| notes.ts           | GET    | /subjects/:id/smartnotes/:file        | Read note file             |
| quiz.ts            | POST   | /subjects/:id/quiz                    | Generate quiz (WS)         |
| podcast.ts         | POST   | /subjects/:id/podcast                 | Generate podcast (WS)      |
| exam.ts            | POST   | /subjects/:id/exam                    | Generate exam (WS)         |
| mindmap.ts         | POST   | /subjects/:id/mindmap                 | Generate mindmap (WS)      |
| mindmap.ts         | PATCH  | /subjects/:id/mindmap                 | Update mindmap             |
| research.ts        | POST   | /subjects/:id/research                | Start research (WS)        |
| transcriber.ts     | POST   | /subjects/:id/transcribe              | Transcribe audio           |
| flashcards.ts      | *      | /subjects/:id/flashcards*             | Flashcard CRUD             |
| subjectgraph.ts    | POST   | /subjects/:id/graph                   | Generate subject graph     |
| websearch.ts       | POST   | /subjects/:id/websearch               | Web search + embed (WS)    |
| models.ts          | GET    | /models                               | List available LLM providers |
| subjects.ts        | GET    | /subjects/:id/tools                   | List tool records          |
| subjects.ts        | DELETE | /subjects/:id/tools/:toolId           | Delete tool record         |

## AI Pipeline

```
                     ┌──────────────┐
  Upload ──→ parse ──┤  chunker.ts  ├──→ embed.ts ──→ db.ts (store)
                     │  (semantic)  │
                     └──────────────┘

                     ┌──────────────┐
  Query ──→ db.ts ──→│  ask.ts      ├──→ LLM ──→ stream response
            (hybrid) │  (RAG ctx)   │
            BM25+Vec └──────────────┘
```

## Key Patterns

- **Per-collection mutex**: `withLock(collectionId)` in db.ts prevents JSON write races
- **UUID validation**: All route params validated before processing
- **Filename sanitization**: `path.basename().replace()` for path traversal prevention
- **Streaming**: All long-running ops use WebSocket with consistent event protocol
- **Provider swapping**: `makeModels()` factory returns {llm, embeddings} based on env
