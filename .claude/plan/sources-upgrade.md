# Implementation Plan: Sources Tab Upgrade — Type Differentiation + Web Search

## Task Type
- [x] Frontend (primary)
- [x] Backend (supporting)
- [x] Fullstack (parallel)

---

## Summary

Two features: (1) Source type differentiation (material/exercise/websearch) with exercise-aware tutoring behavior, and (2) web search integration to ingest web content as sources. Both are fully additive — zero breaking changes to existing data.

---

## Phase 1: Source Type Foundation (Backend + Frontend Types)

**Goal**: Add `sourceType` field across the entire data pipeline.

### Step 1.1 — Backend Data Model
**File**: `backend/src/utils/subjects/subjects.ts`
- Add `SourceType = "material" | "exercise" | "websearch"` type export
- Extend `Source` type: `sourceType: SourceType`, `searchQuery?: string`, `searchMode?: "quick" | "deep"`, `sourceUrl?: string`
- Update `listSources()` to normalize legacy sources: `sourceType: s.sourceType || "material"`
- Update `addSource()` to accept and store `sourceType`

### Step 1.2 — Embedding Metadata Propagation
**File**: `backend/src/lib/ai/embed.ts`
- Add `sourceType?: SourceType` to `EmbedMeta`
- Add `...(meta.sourceType && { sourceType: meta.sourceType })` in `applyMeta()`
- Add `sourceType` propagation in parent-child metadata block (lines 187-202)

**File**: `backend/src/lib/parser/upload.ts`
- Add `sourceType?: SourceType` to `UploadOpts`
- Pass through to `EmbedMeta` in `embedTextFromFile()` call

### Step 1.3 — Upload Route: Accept sourceType
**File**: `backend/src/core/routes/subjects.ts`
- Add Busboy `"field"` event handler to capture `sourceType` from multipart form
- Pass `sourceType` to `addSource()` and `handleUpload()`
- Update reindex endpoint to pass `sourceType` from stored Source record

### Step 1.4 — Frontend Type Definitions
**File**: `frontend/src/lib/api.ts`
- Add `SourceType = "material" | "exercise" | "websearch"` type export
- Extend `Source` type with `sourceType`, `searchQuery?`, `searchMode?`
- Extend `RagSource` type with `sourceType?: SourceType`
- Update `uploadSources()` signature: `(subjectId, files, sourceType = "material")`
- Append `sourceType` as FormData field

### Step 1.5 — Context State Update
**File**: `frontend/src/context/SubjectContext.tsx`
- Update `uploadSources` in context value to accept optional `SourceType`
- Normalize legacy sources in `loadSubject` (default `sourceType: "material"`)

**Deliverable**: sourceType flows through upload → storage → embedding → retrieval metadata. All existing sources default to "material".

---

## Phase 2: Exercise Mode — Tutor Behavior (Backend)

**Goal**: When exercise sources are in RAG context, the AI explains concepts instead of giving solutions.

### Step 2.1 — Context Annotation
**File**: `backend/src/lib/ai/ask.ts`
- In `handleAsk()` context-building step (~line 226), annotate exercise chunks:
  ```
  const typeMarker = m?.sourceType === "exercise" ? " [TYPE: EXERCISE]" : ""
  ```
- Add `sourceType` to `RagSource` extraction (~line 235)

### Step 2.2 — System Prompt Composition
**File**: `backend/src/lib/ai/ask.ts`
- After context building, check: `const hasExerciseContext = ctxDocs.some(d => d?.meta?.sourceType === "exercise")`
- If true, append exercise rules to effective system prompt:
  ```
  EXERCISE SOURCE RULES:
  - Chunks marked [TYPE: EXERCISE] come from practice problems/exams.
  - NEVER reveal solutions or worked-out steps from exercise sources.
  - Instead: identify the core concept, explain the underlying principle,
    guide via Socratic questioning.
  - If asked for a solution directly, redirect: "This comes from your exercise
    materials. Let me help you understand the concept instead..."
  ```
- Cache key already includes system prompt, so no cache collision

**Deliverable**: Chat with exercise sources triggers tutor mode automatically. Material-only queries behave identically to today.

---

## Phase 3: Frontend — Source Type UI (Mainly Frontend)

**Goal**: Visual differentiation in sources panel, chat badges, and tool modal.

### Step 3.1 — Style Constants
**File**: `frontend/src/components/Workspace/SourcesPanel.tsx` (top of file)
- Define `SOURCE_TYPE_STYLES` constant:

| Type | Icon | Left Border | Badge | Badge Color |
|------|------|-------------|-------|-------------|
| material | MIME-based (PDF/DOC/TXT/MD) | none | none | — |
| exercise | `EX` | `border-l-2 border-l-amber-600` | "Exercise" | amber-400 |
| websearch | Globe/`WEB` | `border-l-2 border-l-blue-600` | "Web" | blue-400 |

### Step 3.2 — Add Dropdown Menu
**File**: `frontend/src/components/Workspace/SourcesPanel.tsx`
- Replace single `+ Add` button with dropdown trigger
- Dropdown options: `+ Material`, `+ Exercise`, `+ Web Search`
- Material/Exercise open file picker with appropriate `sourceType`
- Web Search switches panel to search view (Phase 4)
- Drag-and-drop defaults to `sourceType: "material"`
- Dropdown styling matches SubjectCard context menu pattern

### Step 3.3 — Source Row Styling
**File**: `frontend/src/components/Workspace/SourcesPanel.tsx`
- Update source rows with conditional left-border accent by type
- Update `fileIcon()` to show type-aware icons (EX for exercise, globe for web)
- Add type badge pill next to file size for exercise/websearch sources

### Step 3.4 — Filter Tabs
**File**: `frontend/src/components/Workspace/SourcesPanel.tsx`
- Add horizontal filter bar: `[All (N)] [Material (N)] [Exercise (N)] [Web (N)]`
- Local component state, resets on subject change
- Hidden if only one source type exists
- `overflow-x-auto` for narrow viewports

### Step 3.5 — Chat Source Badges
**File**: `frontend/src/components/Chat/SourcesList.tsx`
- Add `EX` prefix badge (amber) for exercise sources
- Add `WEB` prefix badge (blue) for websearch sources
- Subtle border color shift per type

### Step 3.6 — StudyToolModal Source Selection
**File**: `frontend/src/components/Workspace/StudyToolModal.tsx`
- Add filter pills above source checkbox list
- Add inline type badges next to source names
- "All sources" checkbox always means ALL sources regardless of active filter

**Deliverable**: Full visual differentiation across sources panel, chat, and tool modal.

---

## Phase 4: Web Search Service (Backend)

**Goal**: Backend service to search the web, extract content, structure it for RAG.

### Step 4.1 — Configuration
**File**: `backend/src/config/env.ts`
- Add: `websearch_provider` (default: `tavily`), `tavily_api_key`, `brave_search_api_key`
- Add: `websearch_max_results_quick` (5), `websearch_max_results_deep` (15)
- Add: `websearch_timeout` (30000), `websearch_max_content_chars` (20000)

### Step 4.2 — Web Search Service
**New directory**: `backend/src/services/websearch/`
- `types.ts` — `WebSearchResult`, `WebSearchConfig`, `SearchMode` types
- `search.ts` — Search provider abstraction (Tavily primary via `@tavily/core` or LangChain `TavilySearchResults`)
  - Quick mode: `searchDepth: "basic"`, 5 results
  - Deep mode: `searchDepth: "advanced"`, 10 results + 2-3 LLM-generated follow-up queries + 5 results each
- `extract.ts` — Content cleaning: strip HTML remnants, deduplicate, min-length filtering (200 chars), cap total chars
- `structure.ts` — Build structured markdown document:
  ```markdown
  # Web Research: <query>
  ## <Title 1> (source: domain.com)
  <cleaned content>
  ## <Title 2> (source: other.com)
  <cleaned content>
  ```
  For deep mode: LLM synthesis pass to organize by topic, not by source
- `index.ts` — Orchestrator: dispatches quick/deep mode, emits WebSocket progress events

### Step 4.3 — Web Search Route
**New file**: `backend/src/core/routes/websearch.ts`
- `POST /subjects/:id/websearch` — accepts `{ query, mode }`
- Returns 202 immediately, processes async
- WebSocket progress events: `searching` → `result` (per result) → `extracting` → `structuring` → `embedding` → `done`/`error`
- On completion: creates Source record with `sourceType: "websearch"`, writes markdown file, runs embedding pipeline
- Rate limiting: 5s cooldown quick, 30s cooldown deep (per subject)

**File**: `backend/src/core/router.ts`
- Register websearch routes

### Step 4.4 — Install Tavily Dependency
- `npm install @tavily/core` in backend/

**Deliverable**: Full web search → extract → structure → embed pipeline.

---

## Phase 5: Web Search UI (Frontend)

**Goal**: Search interface in the sources panel.

### Step 5.1 — Panel View State
**File**: `frontend/src/components/Workspace/SourcesPanel.tsx`
- Add `panelView: "list" | "websearch"` state
- When `panelView === "websearch"`, render search view instead of file list
- `+ Web Search` dropdown option sets `panelView = "websearch"`

### Step 5.2 — Search View Component
**File**: `frontend/src/components/Workspace/SourcesPanel.tsx` (or extract to `WebSearchView.tsx`)
- Back navigation: `< Back to Sources`
- Search input + Go button
- Mode toggle: "Quick Search" / "Deep Research" with descriptions
- Results area with four states: empty, loading (shimmer + phase text), results (cards with checkboxes), error
- Result cards: title, domain (blue), snippet (2-line clamp)
- Sticky footer: "Add Selected (N)" button

### Step 5.3 — WebSocket Integration for Progress
**File**: `frontend/src/lib/api.ts`
- Add `webSearch(subjectId, query, mode)` API function
- WebSocket connection for progress events (matches existing podcast/quiz streaming pattern)
- AbortController support for cancellation

### Step 5.4 — Context Integration
**File**: `frontend/src/context/SubjectContext.tsx`
- After web search ingest completes, call `refreshSources()` to update the source list

**Deliverable**: Complete web search UX with progress feedback and source ingestion.

---

## Key Files

| File | Operation | Description |
|------|-----------|-------------|
| `backend/src/utils/subjects/subjects.ts` | Modify | Add SourceType, extend Source, normalize legacy |
| `backend/src/lib/ai/embed.ts` | Modify | Add sourceType to EmbedMeta + propagation |
| `backend/src/lib/parser/upload.ts` | Modify | Add sourceType to UploadOpts |
| `backend/src/core/routes/subjects.ts` | Modify | Parse sourceType field, pass through pipeline |
| `backend/src/lib/ai/ask.ts` | Modify | Exercise context annotation + prompt composition |
| `backend/src/config/env.ts` | Modify | Web search config entries |
| `backend/src/services/websearch/` | Create | New service: search, extract, structure, types |
| `backend/src/core/routes/websearch.ts` | Create | Web search API endpoint |
| `backend/src/core/router.ts` | Modify | Register websearch routes |
| `frontend/src/lib/api.ts` | Modify | SourceType, extend Source/RagSource, new API fns |
| `frontend/src/context/SubjectContext.tsx` | Modify | sourceType in upload, normalize legacy |
| `frontend/src/components/Workspace/SourcesPanel.tsx` | Modify | Major: dropdown, type styling, filter tabs, web search view |
| `frontend/src/components/Chat/SourcesList.tsx` | Modify | Type prefix badges |
| `frontend/src/components/Workspace/StudyToolModal.tsx` | Modify | Filter pills, type badges |

## Risks and Mitigation

| Risk | Severity | Mitigation |
|------|----------|------------|
| Exercise solution leakage (LLM ignores prompt rules) | Medium | Strong prompt wording + Socratic redirect + test with adversarial prompts |
| Tavily API downtime | Low | Graceful error handling; show "Web search unavailable" message |
| Web content quality variance | Medium | Min-length filter, `filterLowQualityChunks()` in embed.ts already handles |
| Prompt injection via web content | Medium | Content is chunked (fragmented), JSON output format constraints, deduplication filtering |
| Legacy sources missing sourceType | None | Normalized to "material" at read time, zero migration needed |
| Deep search latency (15-45s) | Low | WebSocket progress events, shimmer animation, cancellation support |

## Visual Style Reference

| Source Type | Left Border | Icon | Badge | Colors |
|-------------|-------------|------|-------|--------|
| Material | none | MIME-based (PDF/DOC/TXT/MD) | none | stone-400/stone-800 |
| Exercise | `border-l-2 border-l-amber-600` | `EX` | "Exercise" | amber-400/amber-900 |
| Web Search | `border-l-2 border-l-blue-600` | Globe | "Web" | blue-400/blue-900 |

## Dependencies Between Phases

```
Phase 1 (Types) ─┬─→ Phase 2 (Exercise Mode)
                  ├─→ Phase 3 (Type UI)
                  └─→ Phase 4 (Web Search Service) → Phase 5 (Web Search UI)
```

Phase 1 is the foundation. Phases 2, 3, and 4 can proceed in parallel after Phase 1. Phase 5 depends on Phase 4.

## SESSION_ID
- CODEX_SESSION: N/A (codeagent-wrapper not available)
- GEMINI_SESSION: N/A (codeagent-wrapper not available)
