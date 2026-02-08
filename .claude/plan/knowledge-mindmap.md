# Implementation Plan: Knowledge Mindmap

## Summary

Add an interactive knowledge mindmap to each subject workspace that extracts concepts and relationships from uploaded documents and renders them as a navigable React Flow graph. Users can click nodes to see details, expand/collapse clusters, and the graph is cached per-subject.

## Task Type
- [x] Frontend (React Flow graph UI)
- [x] Backend (LLM-based concept extraction API)
- [x] Fullstack (end-to-end feature)

---

## Technical Solution

### Extraction Strategy: LLM-based entity/relationship extraction

For each subject, call the LLM with retrieved document chunks and ask it to extract:
- **Concepts** (nodes): key terms, theories, people, events — each with a short description and importance level
- **Relationships** (edges): how concepts connect — labeled with type (causes, part-of, contrasts, supports, etc.)

The extraction runs **on-demand** (user clicks "Generate Mindmap"), processes the subject's embedded chunks in batches, merges duplicates, and caches the result. When new sources are added, the user can regenerate.

### Frontend: React Flow

React Flow provides custom nodes with expandable info panels — perfect for attaching descriptions, source references, and related chunks to each concept. Automatic layout via dagre (hierarchical) or d3-force (organic).

---

## Implementation Steps

### Phase 1: Backend — Concept Extraction API

#### Step 1.1: Define types (`backend/src/services/mindmap/types.ts`)

```typescript
type ConceptNode = {
  id: string                    // slugified concept name
  label: string                 // display name
  description: string           // 1-2 sentence summary
  category: string              // e.g. "theory", "person", "event", "term"
  importance: "high" | "medium" | "low"
  sources: { file: string; page?: number }[]
}

type ConceptEdge = {
  source: string                // node id
  target: string                // node id
  label: string                 // relationship type
  weight: number                // 0-1 strength
}

type MindmapData = {
  nodes: ConceptNode[]
  edges: ConceptEdge[]
  generatedAt: number
  sourceCount: number
}
```

#### Step 1.2: Extraction service (`backend/src/services/mindmap/index.ts`)

- Retrieve all chunks for the subject from the vector store (use `db.ts` collection `subject:{id}`)
- Batch chunks (group by source, ~10 chunks per batch to fit context window)
- For each batch, call LLM with a structured prompt:
  ```
  Extract key concepts and their relationships from the following text.
  Return JSON: { concepts: [{label, description, category, importance}], relationships: [{from, to, label, weight}] }
  ```
- Merge results across batches:
  - Deduplicate concepts by normalized label (case-insensitive, trimmed)
  - Merge source references
  - Deduplicate edges, average weights for duplicates
- Optionally, a final LLM call to refine/consolidate the merged graph (if node count > 50)
- Return `MindmapData`

**Key decisions:**
- Use `makeModels()` for LLM, support `resolveOverride()` for per-request model selection
- Cap at 200 nodes max — if more, keep only "high" and "medium" importance
- Extraction prompt should be language-aware (output in same language as source material)

#### Step 1.3: Route (`backend/src/core/routes/mindmap.ts`)

```
POST /subjects/:id/mindmap          — Generate mindmap (202 + WebSocket stream)
GET  /subjects/:id/mindmap          — Get cached mindmap (or 404)
DELETE /subjects/:id/mindmap        — Clear cached mindmap
```

**POST flow:**
1. Validate subject exists
2. Return 202 with `{ stream: wsURL }`
3. Async: emit phases via WebSocket (`extracting` → `merging` → `done`)
4. Cache result as tool record via `addTool()` with tool type `"mindmap"`

**GET flow:**
1. Look up cached mindmap from tools list
2. Return `MindmapData` JSON or 404

#### Step 1.4: Register route in `router.ts`

Add `mindmapRoutes(app)` to `registerRoutes()`.

---

### Phase 2: Frontend — React Flow Visualization

#### Step 2.1: Install React Flow

```bash
cd frontend && npm install @xyflow/react
```

React Flow v12+ uses `@xyflow/react` package name.

#### Step 2.2: API functions (`frontend/src/lib/api.ts`)

Add:
```typescript
export function generateMindmap(subjectId: string, opts?: { provider?: string; model?: string })
export function getMindmap(subjectId: string): Promise<MindmapData | null>
export function connectMindmapStream(subjectId: string): WebSocket
export function deleteMindmap(subjectId: string): Promise<void>
```

#### Step 2.3: Custom node component (`frontend/src/components/Workspace/tools/mindmap/ConceptNode.tsx`)

A React Flow custom node that shows:
- **Collapsed**: Label + category icon + importance color ring
- **Expanded** (on click): Description, source file references, related concepts list
- Color scheme: categories get distinct stone/accent hues from the existing palette
- Size: importance maps to node size (high = larger)

#### Step 2.4: Layout engine (`frontend/src/components/Workspace/tools/mindmap/layout.ts`)

Use dagre for automatic hierarchical layout:
```typescript
import dagre from '@dagrejs/dagre'

export function layoutGraph(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] }
```

The project already has `d3-force` as a dependency — could offer a toggle between hierarchical (dagre) and organic (force-directed) layouts.

#### Step 2.5: Mindmap viewer component (`frontend/src/components/Workspace/tools/MindmapTool.tsx`)

Main component:
- **Empty state**: "Generate Mindmap" button with model selector
- **Loading state**: Phase progress indicator (extracting → merging → laying out)
- **Graph state**: React Flow canvas with:
  - Zoom/pan controls (React Flow built-in)
  - Minimap (React Flow built-in)
  - Search/filter bar — highlight matching nodes, dim others
  - Layout toggle: hierarchical vs organic
  - Category legend
  - "Regenerate" button
- **Interaction**:
  - Click node → expand info panel (within the node or side drawer)
  - Hover edge → show relationship label
  - Double-click node → filter to only connected nodes (subgraph view)

#### Step 2.6: Integrate into workspace

**Option A — As a tool in ToolsPanel** (consistent with quiz/podcast/notes):
- Add `"mindmap"` to the `ToolPanel` union type in `SubjectContext.tsx`
- Add a ToolCard for "Knowledge Map" in `ToolsPanel.tsx`
- Render `MindmapTool` when `activePanel === "mindmap"`

**Option B — As a fourth column / overlay** (more visual real estate):
- Full-screen overlay triggered from workspace header or tools panel
- Better for large graphs but breaks the current layout pattern

**Recommendation: Option A** — keeps the UI consistent. The React Flow canvas handles zoom/pan well even in constrained space, and the user can already toggle panels.

#### Step 2.7: Styling

Follow existing palette:
- Background: `stone-950` (matches workspace)
- Nodes: `stone-800` border, `stone-900` fill, `bone` text
- Edges: `stone-600` with `bone-muted` labels
- Selected/hovered: `accent` highlight
- Categories: subtle color coding via left border or icon tint
- Use existing Courier Prime font for labels

---

### Phase 3: Caching & Lifecycle

#### Step 3.1: Persistence

Store mindmap as a tool record:
```typescript
addTool(subjectId, {
  tool: "mindmap",
  topic: "Knowledge Map",
  config: { nodeCount, edgeCount },
  result: mindmapData   // the full MindmapData object
})
```

This reuses the existing `ToolRecord` system — no new storage mechanism needed.

#### Step 3.2: Invalidation

- When sources are added/removed, mark the cached mindmap as stale (add `stale: true` flag)
- Show "Sources changed — Regenerate?" banner in the UI
- On reindex, delete the mindmap tool record

---

## Key Files

| File | Operation | Description |
|------|-----------|-------------|
| `backend/src/services/mindmap/types.ts` | Create | Type definitions |
| `backend/src/services/mindmap/index.ts` | Create | LLM extraction + merge logic |
| `backend/src/core/routes/mindmap.ts` | Create | REST + WebSocket endpoints |
| `backend/src/core/router.ts` | Modify | Register mindmap routes |
| `frontend/src/lib/api.ts` | Modify | Add mindmap API functions |
| `frontend/src/context/SubjectContext.tsx` | Modify | Add "mindmap" to ToolPanel type |
| `frontend/src/components/Workspace/ToolsPanel.tsx` | Modify | Add mindmap ToolCard |
| `frontend/src/components/Workspace/tools/MindmapTool.tsx` | Create | Main mindmap viewer |
| `frontend/src/components/Workspace/tools/mindmap/ConceptNode.tsx` | Create | Custom React Flow node |
| `frontend/src/components/Workspace/tools/mindmap/layout.ts` | Create | Dagre/force layout |

## Dependencies to Install

| Package | Purpose |
|---------|---------|
| `@xyflow/react` | React Flow graph library (frontend) |
| `@dagrejs/dagre` | Automatic graph layout (frontend) |

No new backend dependencies — uses existing LangChain + Keyv stack.

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| Large subjects produce too many nodes | Cap at 200 nodes; filter by importance; offer zoom/collapse |
| LLM extraction is slow for many chunks | Batch processing with WebSocket progress; cache results aggressively |
| Extraction quality varies by LLM provider | Test prompt with multiple providers; keep prompt simple and structured |
| Token cost for large documents | Batch chunks efficiently; don't send full text — use pre-chunked pieces |
| React Flow performance with 200+ nodes | Use `nodeTypes` memo, viewport culling (built-in), and dagre pre-layout |
| Merge deduplication is imperfect | Normalize labels aggressively; optional LLM consolidation pass |

## Estimated Scope

- **Backend**: ~3 files, ~300 lines total
- **Frontend**: ~5 files, ~500 lines total
- **Modifications**: ~4 existing files, minor additions each
