# Implementation Plan: Extraction & Prompting Pipeline Upgrade

## Task Type
- [x] Backend
- [ ] Frontend
- [x] Fullstack (minor frontend cleanup)

---

## Problem Statement

The document extraction pipeline uses outdated libraries (`pdf-parse` v1.1.1, abandoned since 2019) with no OCR, no layout analysis, and no table detection. DOCX extraction discards all formatting. The prompting architecture suffers from a bloated 2500-token system prompt with 60% redundant/aspirational content, fragile JSON output via string manipulation, wasted flashcard generation on every chat request, and context window overflow for smaller models. Agent system prompts are dead code. The transcriber hardcodes `gpt-4o-mini` bypassing the configured LLM provider.

---

## Technical Solution

Three-phase upgrade: immediate quality wins (zero-risk), extraction & prompt restructuring (moderate effort), and advanced retrieval capabilities (higher effort).

---

## Phase 1: Zero-Risk Immediate Quality Gains

### Step 1.1 — Switch mammoth to Markdown extraction
**File:** `backend/src/lib/parser/upload.ts:133`

Change `mammoth.extractRawText()` to `mammoth.convertToMarkdown()`. This preserves headings (`#`), tables (`|`), lists (`-`), and emphasis that the downstream chunker's heading propagation regex already looks for.

```diff
- const r = await mammoth.extractRawText({ buffer: raw })
+ const r = await mammoth.convertToMarkdown({ buffer: raw })
```

**Expected result:** DOCX heading-based chunking starts working. Tables preserved in chunks.

---

### Step 1.2 — Fix conversation history serialization
**File:** `backend/src/lib/ai/ask.ts` — `toConversationHistory()`

Currently sends full `AskPayload` JSON objects as assistant message history, wasting 1500-6000 tokens. Fix to extract only the `.answer` markdown string and truncate.

```typescript
function toConversationHistory(history?: HistoryMessage[]) {
  if (!history?.length) return []
  return history.slice(-8)
    .filter(m => m?.role === "user" || m?.role === "assistant")
    .map(msg => {
      const text = toMessageContent(msg.content)
      if (msg.role === "assistant") {
        // Extract answer from AskPayload objects, cap at 300 chars
        return { role: msg.role, content: text.slice(0, 300) + (text.length > 300 ? "\n..." : "") }
      }
      return { role: msg.role, content: text.slice(0, 500) }
    })
}
```

**Expected result:** ~1500-3000 tokens saved per request with history. Better model comprehension of conversation flow.

---

### Step 1.3 — Reorder user message (question before context)
**File:** `backend/src/lib/ai/ask.ts` — `askWithContext()`

Put the question first to prime model attention, use XML-style delimiters for unambiguous boundaries.

```diff
- content: `Context:\n${ctx}\n\nQuestion:\n${safeQ}\n\nTopic:\n${topic}\n\nReturn only the JSON object.`
+ content: `<question>${safeQ}</question>\n\n<topic>${topic}</topic>\n\n<context>\n${ctx}\n</context>\n\nAnswer the question using the provided context. Return only the JSON object.`
```

**Expected result:** Better answer relevance, especially for long context.

---

### Step 1.4 — Use Intl.Segmenter for German-aware sentence splitting
**File:** `backend/src/lib/ai/chunker.ts` — `splitSentences()`

Replace English-centric regex with locale-aware API (available in Node 21+, already required by project).

```typescript
function splitSentences(text: string): string[] {
  const segmenter = new Intl.Segmenter('de', { granularity: 'sentence' })
  return [...segmenter.segment(text)]
    .map(s => s.segment.trim())
    .filter(s => s.length > 0)
}
```

**Expected result:** Correct sentence boundaries for German text. No more false splits on capitalized nouns.

---

### Step 1.5 — Fix transcriber hardcoded OpenAI
**File:** `backend/src/services/transcriber/index.ts` — `generateStudyMaterials()`

Replace direct `OpenAI` SDK usage with project LLM abstraction. Accept `llmOverride` parameter.

**Expected result:** Study materials generated via configured provider (Ollama, Gemini, Claude, etc.).

---

### Step 1.6 — Centralize locale enforcement
**New file:** `backend/src/lib/prompts/locale.ts`

```typescript
export function getLocale() {
  const code = process.env.PAGELM_LOCALE || "de"
  const locales = {
    de: "Respond in German (Deutsch). Use proper orthography: ae, oe, ue, ss. Technical terms may stay in English where standard.",
    en: "Respond in English."
  }
  return { code, instruction: locales[code] || locales.de }
}
```

Replace 7 hardcoded German language blocks across: `ask.ts`, `quiz/index.ts`, `podcast/index.ts`, `smartnotes/index.ts`, `transcriber/index.ts`, `agents.ts`.

**Expected result:** Single point of control for language. Future multi-language support trivial.

---

## Phase 2: Extraction & Prompt Restructuring

### Step 2.1 — Replace pdf-parse with unpdf
**File:** `backend/src/lib/parser/upload.ts`

Replace abandoned `pdf-parse` v1.1.1 with `unpdf` (modern wrapper around latest Mozilla pdf.js). Better reading-order awareness, maintained, TypeScript-native.

```bash
npm uninstall pdf-parse && npm install unpdf
```

Update `extractText()` for PDF path:

```typescript
import { extractText as unpdfExtract } from 'unpdf'

if (mime.includes("pdf")) {
  const { text, totalPages } = await unpdfExtract(raw)
  // unpdf provides page-aware extraction
  return { text, pages: null } // or parse pages if API supports it
}
```

**Expected result:** Better text extraction for multi-column PDFs, maintained library. Prerequisite for page metadata propagation.

---

### Step 2.2 — Propagate page numbers through the pipeline
**Files:** `upload.ts`, `embed.ts`, `chunker.ts`

Currently `extractText()` computes per-page text but `handleUpload()` discards it. Thread page information through to chunk metadata.

1. `handleUpload` passes `pages` array to embedding layer
2. `embedTextFromFile` receives pages and maps chunks to page numbers
3. Chunk metadata includes `pageNumber` based on character offset mapping

**Expected result:** `[Source: file, p.N]` attribution becomes accurate.

---

### Step 2.3 — Consolidate JSON extraction into shared module
**New file:** `backend/src/lib/ai/extract.ts`

Consolidate 4 duplicate `extractFirstJsonObject` implementations into one, with proper string-escape handling:

```typescript
export function extractFirstJsonObject(s: string): string {
  let depth = 0, start = -1, inString = false, escape = false
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (escape) { escape = false; continue }
    if (ch === "\\") { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === "{") { if (depth === 0) start = i; depth++ }
    else if (ch === "}") { depth--; if (depth === 0 && start !== -1) return s.slice(start, i + 1) }
  }
  return ""
}
```

Update imports in: `ask.ts`, `smartnotes/index.ts`, `agents/tools/podcast.ts`. Remove frontend copy once backend serialization is normalized (Step 2.7).

---

### Step 2.4 — Reduce BASE_SYSTEM_PROMPT from 2500 to ~800 tokens
**File:** `backend/src/lib/ai/ask.ts`

Replace the 254-line monolithic prompt with a focused version that keeps only the 5 sections with measurable behavioral impact:

1. Identity + JSON output schema (~150 tokens)
2. Teaching approach with concrete negative examples (~200 tokens)
3. Flashcard rules (when enabled) (~100 tokens)
4. Locale directive via `getLocale()` (~50 tokens)
5. Output restrictions (~30 tokens)

Remove: aspirational tracking instructions (model can't do stateful analysis), redundant anti-rote restatements (6x -> 1x), uncheckable quality benchmarks, `[[ ]]` section markers (no LLM meaning), empty `{{ }}` placeholders.

**Expected result:** 1700 tokens saved per request. Better adherence to remaining instructions (less attention dilution).

---

### Step 2.5 — Remove mandatory flashcard generation from chat
**File:** `backend/src/lib/ai/ask.ts`

Currently every chat response must include a `flashcards` array, but the frontend discards it. Change output schema to:

```json
{"topic": "string", "answer": "markdown"}
```

Add `CHAT_GENERATE_FLASHCARDS=true|false` env var (default: false) for backward compatibility. When true, append flashcard schema to prompt.

**Expected result:** ~300 output tokens saved per chat response. Faster responses.

---

### Step 2.6 — Add context budgeting
**File:** `backend/src/lib/ai/ask.ts`

Add `LLM_CONTEXT_BUDGET` env var (default: 12000 chars / ~3000 tokens). Truncate retrieved chunks to fit budget before constructing context string.

```typescript
function budgetChunks(chunks: Array<{ text?: string; meta?: any }>, maxChars = 12000) {
  let total = 0
  return chunks.filter(c => {
    const len = (c?.text || "").length
    if (total + len > maxChars && total > 0) return false
    total += len
    return true
  })
}
```

**Expected result:** Prevents context window overflow for small models (Ollama). Predictable token usage.

---

### Step 2.7 — Normalize backend chat message serialization
**File:** `backend/src/core/routes/chat.ts`, `backend/src/utils/chat/chat.ts`

Store assistant messages as `{ role, content: string, sources?: RagSource[] }` instead of storing the full `AskPayload` object as `content`. This eliminates the need for frontend JSON re-parsing.

**Expected result:** Clean separation of concerns. Frontend `normalizePayload` and its `extractFirstJsonObject` copy can be deleted.

---

### Step 2.8 — Add structural pre-segmentation before semantic chunking
**File:** `backend/src/lib/ai/chunker.ts`

Add a structural pre-pass that splits on headings, horizontal rules, code fences, and table blocks before applying semantic chunking within each segment.

```
Document -> Structural segments (headings, tables, code)
  -> Semantic chunks (within each segment)
  -> Min/max enforcement
```

**Expected result:** Chunks never cross heading boundaries. Tables stay intact.

---

### Step 2.9 — Fix quiz coercion (stop producing wrong answers)
**File:** `backend/src/services/quiz/index.ts`

Remove the rotation-based padding that fabricates incorrect questions. Return actual count generated. Let the frontend display fewer questions rather than wrong ones.

---

## Phase 3: Advanced Retrieval & Capabilities

### Step 3.1 — Add optional marker-pdf Python sidecar for OCR
**New file:** `backend/src/lib/parser/marker.ts`

Spawn `marker_single input.pdf output.md` as child process for scanned/complex PDFs. Enable via `ADVANCED_PDF=marker` env var. Output is clean markdown with tables and headings preserved.

**Expected result:** Scanned textbooks become processable. Table-heavy STEM content preserved.

---

### Step 3.2 — Add cross-encoder reranking
**New file:** `backend/src/lib/ai/rerank.ts`

After ensemble retrieval (BM25 + Vector), add a reranking step. Retrieve more candidates (k=20), rerank to top-6. Support Ollama `bge-reranker-v2-m3` or Cohere.

**Expected result:** Higher retrieval precision. Less noisy context.

---

### Step 3.3 — Add metadata filtering to RAG search
**Files:** `backend/src/agents/tools/Ragsearch.ts`, `backend/src/utils/database/db.ts`

Add optional `where` metadata filters (sourceId, heading, mimeType) to retriever. For ChromaDB: native `where` support. For JSON: post-retrieval filtering.

---

### Step 3.4 — Add query decomposition for complex questions
**New file:** `backend/src/lib/ai/decompose.ts`

Detect multi-part questions (contains "compare," "contrast," conjunctions joining distinct topics). Split into sub-queries, retrieve independently, merge and deduplicate.

---

### Step 3.5 — Add RAG context to quiz generation
**File:** `backend/src/services/quiz/index.ts`

When `subjectId` is available, retrieve 3-4 relevant chunks and include as source material in the quiz prompt. Makes quizzes relevant to uploaded materials.

---

### Step 3.6 — Use native structured output per provider
**Files:** `backend/src/utils/llm/models/types.ts`, `backend/src/utils/llm/models/util.ts`

Extend LLM interface to accept `ModelOpts` (including `response_format`). Use native JSON mode:
- OpenAI/Grok/OpenRouter: `response_format: { type: "json_object" }`
- Gemini: `responseMimeType: "application/json"`
- Ollama: `format: "json"`
- Claude: tool use with schema

**Expected result:** Eliminates JSON parse failures. Removes need for retry loops.

---

### Step 3.7 — Support additional file formats
**Files:** `backend/src/lib/parser/upload.ts`, `frontend/src/components/Workspace/SourcesPanel.tsx`

Add support for: PPTX (via `pptx-parser`), HTML (via `turndown`), EPUB (via `epub2`). Update frontend `accept` attribute.

---

## Key Files

| File | Operation | Phase | Description |
|------|-----------|-------|-------------|
| `backend/src/lib/parser/upload.ts` | Modify | 1, 2 | mammoth -> markdown, pdf-parse -> unpdf, page propagation |
| `backend/src/lib/ai/ask.ts` | Modify | 1, 2 | History fix, message reorder, prompt reduction, context budget |
| `backend/src/lib/ai/chunker.ts` | Modify | 1, 2 | Intl.Segmenter, structural pre-pass |
| `backend/src/lib/ai/embed.ts` | Modify | 2 | Page metadata propagation |
| `backend/src/lib/ai/extract.ts` | Create | 2 | Consolidated JSON extraction |
| `backend/src/lib/prompts/locale.ts` | Create | 1 | Centralized locale |
| `backend/src/services/transcriber/index.ts` | Modify | 1 | Fix hardcoded OpenAI |
| `backend/src/services/quiz/index.ts` | Modify | 2, 3 | Fix coercion, add RAG context |
| `backend/src/agents/agents.ts` | Modify | 1 | Locale centralization |
| `backend/src/core/routes/chat.ts` | Modify | 2 | Normalize message serialization |
| `backend/src/utils/chat/chat.ts` | Modify | 2 | Add sources to message type |
| `backend/src/utils/llm/models/types.ts` | Modify | 3 | ModelOpts for structured output |
| `backend/src/utils/llm/models/util.ts` | Modify | 3 | Pass opts through wrapChat |
| `backend/src/utils/database/db.ts` | Modify | 3 | Metadata filtering, reranking |
| `backend/src/lib/ai/rerank.ts` | Create | 3 | Cross-encoder reranking |
| `backend/src/lib/ai/decompose.ts` | Create | 3 | Query decomposition |
| `backend/src/lib/parser/marker.ts` | Create | 3 | marker-pdf Python sidecar |

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| Replacing pdf-parse changes text output, stale embeddings | Provide reindex command (already exists). Document in migration notes. |
| Reduced system prompt may change answer style | A/B test with 10 questions before deploying. Keep old prompt as fallback. |
| mammoth markdown output may include unexpected formatting | Already handled by chunker; test with real DOCX samples. |
| unpdf may have different page splitting behavior | Test with current PDF corpus before switching. |
| Removing flashcards breaks existing consumers | Gate behind `CHAT_GENERATE_FLASHCARDS` env var. |
| Intl.Segmenter may over-split on abbreviations | Test with German academic text samples. Fallback to improved regex. |
| marker-pdf requires Python runtime | Optional, gated behind `ADVANCED_PDF` env var. |

## Token Budget Impact

| Change | Tokens saved/request | Phase |
|--------|---------------------|-------|
| Prompt reduction (2500 -> 800) | ~1700 input | 2 |
| Remove flashcard generation | ~300 output | 2 |
| History compression | ~1500-3000 input | 1 |
| Context budgeting | ~0-6000 (overflow prevention) | 2 |
| Native JSON mode | ~100 input | 3 |
| **Total savings** | **~3600-11100 per request** | |

---

## Extraction Tool Recommendation

**Replace `pdf-parse` with `unpdf`** (Node-native, modern pdf.js wrapper) for immediate gains. Add `marker-pdf` as optional Python sidecar for OCR/complex layouts. Do NOT use LlamaParse (cloud API, contradicts self-hosted philosophy), Apache Tika (JVM dependency), or Unstructured.io (overly heavy).
