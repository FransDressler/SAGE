# Implementation Plan: RAG Upgrade — Hybrid Search + Semantic Chunking

## Requirements Restatement

1. **Semantic Chunking**: Replace fixed-size character splitting with embedding-based semantic chunking that splits at points where meaning changes most
2. **Hybrid Search (BM25 + Vector)**: Combine keyword-based BM25/TF-IDF retrieval with existing embedding-based vector search using Reciprocal Rank Fusion
3. **Rich Metadata**: Store source file, page numbers, section headings, chunk position, and timestamps with each chunk
4. **Fix Critical Bug**: JSON mode `saveDocuments` overwrites instead of appending

---

## Task Type
- [x] Backend (Node.js + TypeScript + LangChain)
- [ ] Frontend
- [ ] Fullstack

---

## Technical Solution

### Semantic Chunking (Custom Implementation)

LangChain.js does **not** have a built-in `SemanticChunker` (Python-only). We implement it ourselves:

**Algorithm**:
1. Split document into sentences (regex-based sentence boundary detection)
2. Group sentences into sliding windows of 3 (buffer_size=3) for stability
3. Batch-embed all sentence groups using the configured embedding provider
4. Compute cosine similarity between consecutive group embeddings
5. Find breakpoints where similarity drops below a threshold (percentile-based: split at the bottom 25% of similarity scores)
6. Merge sentences between breakpoints into chunks
7. Apply min/max size constraints (min: 200 chars, max: 2048 chars) — merge tiny chunks up, split oversized chunks with RecursiveCharacterTextSplitter as fallback

**Why custom**: The algorithm is ~80 lines of code. Adding a Python microservice or untested npm package adds more complexity than writing it.

### Hybrid Search (BM25 + Vector via EnsembleRetriever)

LangChain.js **does** provide both `BM25Retriever` and `EnsembleRetriever`:

```typescript
import { BM25Retriever } from "@langchain/community/retrievers/bm25"
import { EnsembleRetriever } from "langchain/retrievers/ensemble"
```

**Strategy**:
- Create a `BM25Retriever` from the same documents used for vector search
- Wrap both in `EnsembleRetriever` with configurable weights (default: 0.5 vector / 0.5 BM25)
- EnsembleRetriever uses **Reciprocal Rank Fusion (RRF)** to merge results — this is exactly what the user wants (keyword matches + semantic matches combined)

**Storage**: BM25 operates on raw documents in memory — no separate index file needed. The JSON/ChromaDB already stores `pageContent`, which BM25 reads directly.

### Metadata Schema

```typescript
type ChunkMetadata = {
  sourceId: string        // UUID of the Source record
  sourceFile: string      // Original filename ("Lecture 3.pdf")
  mimeType: string        // "application/pdf"
  subjectId: string       // Subject UUID
  pageNumber?: number     // PDF page (1-indexed, when extractable)
  heading?: string        // Nearest section heading (propagated)
  chunkIndex: number      // 0-based position within this source
  totalChunks: number     // Total chunks from this source
  ingestedAt: number      // Unix timestamp
  loc?: { lines: { from: number; to: number } }  // Backwards compat
}
```

---

## Implementation Steps

### Phase 1: Fix JSON Mode Append Bug
**File**: `backend/src/utils/database/db.ts`
**Deliverable**: `saveDocuments` reads existing JSON, appends new docs, writes combined

```pseudo
function saveDocuments(collection, newDocs, embeddings):
  if json_mode:
    existing = file_exists(path) ? JSON.parse(read(path)) : []
    combined = [...existing, ...newDocs]
    writeFile(path, JSON.stringify(combined))
    invalidate caches
  else:
    // ChromaDB addDocuments already appends — no change needed
```

### Phase 2: Semantic Chunker Module
**New file**: `backend/src/lib/ai/chunker.ts`
**Deliverable**: `semanticChunk(text, embeddings, opts)` → `Document[]`

```pseudo
function semanticChunk(text, embeddings, opts = {}):
  // 1. Split into sentences
  sentences = splitSentences(text)  // regex: /(?<=[.!?])\s+(?=[A-Z])/
  if sentences.length < 3: return fallbackChunk(text)

  // 2. Create sentence groups (buffer_size=3)
  groups = slidingWindow(sentences, bufferSize=3)

  // 3. Batch embed all groups
  vectors = await embeddings.embedDocuments(groups.map(g => g.join(" ")))

  // 4. Compute cosine similarities between consecutive groups
  similarities = []
  for i in 1..vectors.length:
    similarities.push(cosineSimilarity(vectors[i-1], vectors[i]))

  // 5. Find breakpoints (percentile-based threshold)
  threshold = percentile(similarities, 25)  // bottom 25% = breakpoints
  breakpoints = similarities.indices.where(sim < threshold)

  // 6. Merge sentences between breakpoints into chunks
  chunks = splitAtBreakpoints(sentences, breakpoints)

  // 7. Apply size constraints
  chunks = enforceMinMax(chunks, min=200, max=2048)

  return chunks.map((text, i) => new Document({
    pageContent: text,
    metadata: { chunkIndex: i, totalChunks: chunks.length }
  }))
```

**Helper**: `cosineSimilarity(a, b)` — dot product / (norm(a) * norm(b))
**Helper**: `percentile(arr, p)` — sort and pick value at position p%
**Fallback**: If document is very short (<5 sentences), use RecursiveCharacterTextSplitter with chunkSize=1024, overlap=128

### Phase 3: Rich Metadata Injection
**Files**: `backend/src/lib/ai/embed.ts`, `backend/src/lib/parser/upload.ts`
**Deliverable**: Every chunk carries full metadata

```pseudo
// embed.ts — new signature
function embedTextFromFile(filePath, namespace, meta: {
  sourceId, sourceFile, mimeType, subjectId, pageNumber?
}):
  raw = readFile(filePath)
  docs = semanticChunk(raw, embeddings)

  // Inject metadata into each chunk
  for doc in docs:
    doc.metadata = { ...doc.metadata, ...meta, ingestedAt: Date.now() }

  // Propagate headings
  propagateHeadings(docs, raw)

  await saveDocuments(namespace, docs, embeddings)

// upload.ts — pass metadata through
function handleUpload({ filePath, filename, contentType, namespace, sourceId, subjectId }):
  txt = extractText(filePath, contentType)
  await embedTextFromFile(txtPath, namespace, {
    sourceId, sourceFile: filename, mimeType: contentType, subjectId
  })
```

**Heading propagation**:
- Detect heading-like lines (lines that are ALL CAPS, or start with `#`, or are short + followed by longer text)
- For each chunk, find the nearest preceding heading and store in `metadata.heading`
- Optionally prepend heading to chunk content: `"## {heading}\n\n{chunk text}"`

### Phase 4: Enhanced PDF Extraction with Page Tracking
**File**: `backend/src/lib/parser/upload.ts`
**Deliverable**: PDF text extraction preserves page boundaries

```pseudo
function extractTextWithPages(filePath, mime):
  if pdf:
    data = await pdf(raw, {
      pagerender: (pageData) => {
        // pdf-parse provides per-page text via custom render
        return pageData.getTextContent().then(tc => tc.items.map(i => i.str).join(" "))
      }
    })
    // Return structured: [{ page: 1, text: "..." }, { page: 2, text: "..." }]
    return { text: data.text, pages: extractPageBoundaries(data) }
  // ... other types return { text, pages: null }
```

Note: `pdf-parse` provides `data.numpages` but not per-page text by default. We use the `pagerender` callback to capture page boundaries, or alternatively split on form-feed characters (`\f`) which `pdf-parse` inserts between pages.

### Phase 5: Hybrid Retriever (BM25 + Vector)
**File**: `backend/src/utils/database/db.ts`
**Deliverable**: `getRetriever` returns an `EnsembleRetriever` combining BM25 + vector

```pseudo
function getRetriever(collection, embeddings, opts = { k: 8 }):
  if cached: return cached

  docs = loadDocuments(collection)  // same for both modes

  // Vector retriever
  vectorStore = MemoryVectorStore.fromDocuments(docs, embeddings)  // or Chroma
  vectorRetriever = vectorStore.asRetriever({ k: opts.k })

  // BM25 retriever (keyword/TF-IDF)
  bm25Retriever = BM25Retriever.fromDocuments(docs, { k: opts.k })

  // Combine with Reciprocal Rank Fusion
  ensemble = new EnsembleRetriever({
    retrievers: [vectorRetriever, bm25Retriever],
    weights: [0.5, 0.5]  // equal weight — tunable
  })

  cache(collection, ensemble)
  return ensemble
```

**For ChromaDB mode**: Vector retriever comes from Chroma directly. BM25 still needs documents loaded in memory (ChromaDB doesn't do BM25). Load docs from Chroma via `store.collection.get()` to feed BM25.

### Phase 6: Source Deletion Cleanup
**Files**: `backend/src/utils/database/db.ts`, `backend/src/utils/subjects/subjects.ts`
**Deliverable**: Removing a source also removes its chunks from the vector store

```pseudo
// db.ts — new function
function deleteDocumentsBySource(collection, sourceId, embeddings):
  if json_mode:
    docs = loadJson(collection)
    filtered = docs.filter(d => d.metadata.sourceId !== sourceId)
    writeJson(collection, filtered)
    invalidate caches
  else:
    // ChromaDB supports metadata-based deletion
    store = new Chroma(embeddings, { collectionName: collection })
    await store.collection.delete({ where: { sourceId } })
    invalidate caches

// subjects.ts — wire into removeSource()
function removeSource(subjectId, sourceId):
  // ... existing file deletion ...
  await deleteDocumentsBySource(`subject:${subjectId}`, sourceId, embeddings)
```

### Phase 7: Context Assembly Improvements
**File**: `backend/src/lib/ai/ask.ts`
**Deliverable**: Retrieved chunks include source attribution, sorted by document order

```pseudo
// In handleAsk(), after RAG search:
ctxDocs = rag.results

// Sort by source + chunkIndex for coherent reading
ctxDocs.sort((a, b) => {
  if (a.meta.sourceFile !== b.meta.sourceFile) return a.meta.sourceFile.localeCompare(b.meta.sourceFile)
  return (a.meta.chunkIndex || 0) - (b.meta.chunkIndex || 0)
})

// Add source attribution
ctx = ctxDocs.map(d => {
  const source = d.meta.sourceFile ? `[Source: ${d.meta.sourceFile}` +
    (d.meta.pageNumber ? `, p.${d.meta.pageNumber}` : "") + "]" : ""
  return `${source}\n${d.text}`
}).join("\n\n---\n\n")
```

### Phase 8: Re-indexing Endpoint (Migration)
**File**: `backend/src/core/routes/subjects.ts`
**Deliverable**: API endpoint to re-embed all sources for a subject with new chunking

```pseudo
// POST /subjects/:id/reindex
app.post("/subjects/:id/reindex", async (req, res) => {
  const sources = await listSources(subjectId)
  // Clear existing chunks
  clearCollection(`subject:${subjectId}`)
  // Re-embed each source with new semantic chunker
  for (const source of sources) {
    const txtPath = path.join(sourcesDir, source.filename + ".txt")
    await embedTextFromFile(txtPath, namespace, {
      sourceId: source.id, sourceFile: source.originalName, ...
    })
  }
  res.send({ ok: true, reindexed: sources.length })
})
```

---

## Key Files

| File | Operation | Description |
|------|-----------|-------------|
| `backend/src/utils/database/db.ts` | Modify | Fix append bug, add hybrid retriever, add deleteDocumentsBySource |
| `backend/src/lib/ai/chunker.ts:1-*` | Create | Semantic chunking module (new file) |
| `backend/src/lib/ai/embed.ts` | Modify | Accept metadata param, use semantic chunker |
| `backend/src/lib/parser/upload.ts` | Modify | Pass metadata, improve PDF extraction |
| `backend/src/agents/tools/Ragsearch.ts` | Modify | Support higher k, pass metadata in results |
| `backend/src/lib/ai/ask.ts:336-354` | Modify | Source attribution in context, sort by doc order |
| `backend/src/utils/subjects/subjects.ts:120-140` | Modify | Wire deleteDocumentsBySource into removeSource |
| `backend/src/core/routes/subjects.ts` | Modify | Add reindex endpoint, pass metadata on upload |
| `package.json` | Modify | No new deps needed — BM25Retriever is in `@langchain/community` already installed |

---

## Risks and Mitigation

| Risk | Severity | Mitigation |
|------|----------|------------|
| Semantic chunking costs extra embedding API calls at ingest | MEDIUM | Batch embed (LangChain `embedDocuments` already batches). ~1 call per 3 sentences, typical 100-page PDF = ~500 calls = ~$0.01 with text-embedding-3-large |
| Semantic chunks can be wildly different sizes | MEDIUM | Min/max constraints (200-2048 chars) with fallback splitting |
| BM25 needs documents in memory (both modes) | LOW | Documents already loaded for MemoryVectorStore. For ChromaDB, one-time fetch via collection.get() |
| Re-indexing existing data after schema change | MEDIUM | Provide `/reindex` endpoint. Old chunks without new metadata fields still work (undefined = optional) |
| EnsembleRetriever import path may differ across LangChain versions | LOW | Verified: `langchain/retrievers/ensemble` in langchain@0.3.x |
| PDF page boundary detection accuracy | LOW | Use `\f` (form-feed) split as primary, `pagerender` callback as enhanced option |

---

## Dependency Order

```
Phase 1 (bug fix)
    ↓
Phase 2 (semantic chunker) → Phase 3 (metadata) → Phase 4 (PDF pages)
                                                         ↓
Phase 8 (reindex) ← Phase 7 (context) ← Phase 5 (hybrid retriever) ← Phase 6 (source deletion)
```

**Phases 1-2 are independent and can start in parallel.**

---

## New Dependencies

**None required.** All needed packages are already installed:
- `@langchain/community@^0.3.56` — includes `BM25Retriever`
- `langchain@^0.3.7` — includes `EnsembleRetriever`
- `@langchain/core@^0.3.78` — Document types, embeddings interface
