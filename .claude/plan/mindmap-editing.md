# Implementation Plan: Interactive Mindmap Editing

## Summary

Upgrade the existing mindmap tool with full editing capabilities — both AI-assisted (via a prompt popup) and manual (direct graph manipulation). Users can add/edit/delete nodes and connections, and ask AI to modify the graph via natural language.

## Task Type
- [x] Frontend (React Flow interactive editing UI)
- [x] Backend (AI-powered graph modification API + persistence)
- [x] Fullstack (end-to-end feature)

---

## Current State

The mindmap is currently **read-only**:
- **Backend**: `POST /subjects/:id/mindmap` generates a new mindmap, `GET` retrieves it, `DELETE` removes it. Stored via `addTool()` as a `ToolRecord`.
- **Frontend**: `MindmapPlayer.tsx` renders the React Flow graph with `useNodesState`/`useEdgesState` (which already supports drag-to-reposition), but no UI for adding/editing/deleting nodes or edges.
- **Data model**: `ConceptNode` (id, label, description, category, importance, sources) + `ConceptEdge` (source, target, label, weight).
- **Persistence**: No `updateTool()` function exists — only `addTool()` and `deleteTool()`.

---

## Technical Solution

### Architecture Overview

```
User Action → MindmapPlayer (React Flow) → API Call → Backend → Persist Updated MindmapData
                    ↓                                      ↓
            AI Edit Popup ─────→ PATCH /subjects/:id/mindmap/ai-edit ─→ LLM modifies graph
            Manual Actions ────→ PATCH /subjects/:id/mindmap ──────────→ Direct data update
```

### Key Decisions

1. **Single source of truth**: The `MindmapData` object stored in the `ToolRecord` is the canonical state. All edits (AI or manual) result in a full `MindmapData` update persisted via a new `updateTool()` function.

2. **React Flow's built-in editing**: React Flow already supports `addEdge`, `onConnect`, node deletion, etc. We wire these up and add custom UI for the AI popup + node creation.

3. **AI editing**: A new backend endpoint receives the current graph + a natural language instruction, sends both to the LLM, and returns a modified graph. The frontend replaces its state with the result.

4. **Optimistic UI**: Manual edits update the React Flow state immediately, then persist to backend. AI edits show a loading state while waiting for LLM response.

---

## Implementation Steps

### Phase 1: Backend — Persistence & AI Edit API

#### Step 1.1: Add `updateTool()` to subjects utility

**File**: `backend/src/utils/subjects/subjects.ts`
**Operation**: Add function

```typescript
export async function updateTool(subjectId: string, toolId: string, result: any): Promise<boolean> {
  const tools = await listTools(subjectId)
  const idx = tools.findIndex(t => t.id === toolId)
  if (idx === -1) return false
  tools[idx].result = result
  await db.set(`subject:${subjectId}:tools`, tools)
  return true
}
```

This is the minimal addition — just update the `result` field of an existing tool record.

#### Step 1.2: Add `PATCH /subjects/:id/mindmap` route (manual save)

**File**: `backend/src/core/routes/mindmap.ts`
**Operation**: Add route

Accepts the full updated `MindmapData` from the frontend and persists it:

```typescript
app.patch("/subjects/:id/mindmap", async (req, res) => {
  // Validate subjectId
  // Get existing mindmap tool record
  // Replace result.data with req.body.data (the updated MindmapData)
  // Call updateTool()
  // Return { ok: true }
})
```

#### Step 1.3: Add `PATCH /subjects/:id/mindmap/ai-edit` route (AI-assisted)

**File**: `backend/src/core/routes/mindmap.ts`
**Operation**: Add route

Accepts:
```json
{
  "instruction": "Add a node about quantum entanglement connected to quantum mechanics",
  "currentData": { "nodes": [...], "edges": [...] }
}
```

Flow:
1. Receive current graph data + natural language instruction
2. Call LLM with a system prompt that says: "You are a knowledge graph editor. Given the current graph and an instruction, return the modified graph."
3. LLM returns updated `{ nodes, edges }` JSON
4. Persist via `updateTool()`
5. Return the new `MindmapData` to the frontend

**LLM Prompt**:
```
You are a knowledge graph editor. You receive a knowledge graph and an editing instruction.
Apply the requested changes and return the COMPLETE updated graph as JSON.

Rules:
- Keep all existing nodes/edges unless explicitly asked to remove them
- New nodes need: id (slugified), label, description, category, importance
- New edges need: source, target, label, weight
- Preserve the original language of existing content
```

#### Step 1.4: Add AI edit function to mindmap service

**File**: `backend/src/services/mindmap/index.ts`
**Operation**: Add `editMindmapWithAI()` function

```typescript
export async function editMindmapWithAI(
  currentData: MindmapData,
  instruction: string,
  llmOverride?: LLM
): Promise<MindmapData>
```

This keeps the AI logic in the service layer, consistent with `generateMindmap()`.

---

### Phase 2: Frontend — AI Edit Popup

#### Step 2.1: Create `MindmapEditPopup` component

**File**: `frontend/src/components/Workspace/tools/mindmap/MindmapEditPopup.tsx`
**Operation**: Create

A modal/popup triggered by a button in the MindmapPlayer header:

```
┌─────────────────────────────────┐
│  AI Edit Mindmap            [×] │
│─────────────────────────────────│
│  What would you like to change? │
│  ┌─────────────────────────┐    │
│  │ Add connections between  │    │
│  │ quantum mechanics and    │    │
│  │ wave-particle duality    │    │
│  └─────────────────────────┘    │
│                                 │
│  Examples:                      │
│  · "Add a node about X"        │
│  · "Connect A to B"            │
│  · "Remove all low-importance"  │
│  · "Add more detail to Y"      │
│                                 │
│              [Cancel]  [Apply]  │
└─────────────────────────────────┘
```

- Textarea for free-form instruction
- Example suggestions as clickable chips
- Loading state with spinner while AI processes
- On success: replaces the graph data in MindmapPlayer
- Error handling with retry option

#### Step 2.2: Add API functions for editing

**File**: `frontend/src/lib/api.ts`
**Operation**: Add functions

```typescript
export function saveMindmap(subjectId: string, toolId: string, data: MindmapData): Promise<{ ok: true }>
export function aiEditMindmap(subjectId: string, toolId: string, instruction: string, currentData: MindmapData): Promise<{ ok: true; data: MindmapData }>
```

---

### Phase 3: Frontend — Manual Editing

#### Step 3.1: Enable edge creation (connecting nodes)

**File**: `frontend/src/components/Workspace/tools/MindmapPlayer.tsx`
**Operation**: Modify

React Flow supports `onConnect` callback natively. Add:

```typescript
import { addEdge, type Connection } from "@xyflow/react";

const onConnect = useCallback((connection: Connection) => {
  setEdges((eds) => addEdge({
    ...connection,
    label: "relates-to",
    style: { stroke: "#57534e", strokeWidth: 2 },
    labelStyle: { fill: "#a8a29e", fontSize: 10, fontFamily: "'Courier Prime', monospace" },
    labelBgStyle: { fill: "#1c1917", fillOpacity: 0.8 },
  }, eds));
  setHasUnsavedChanges(true);
}, [setEdges]);

// Pass to ReactFlow:
<ReactFlow onConnect={onConnect} connectionLineStyle={{ stroke: "#57534e" }} />
```

Users drag from one node handle to another to create a connection.

#### Step 3.2: Add "Add Node" button + form

**File**: `frontend/src/components/Workspace/tools/mindmap/AddNodeForm.tsx`
**Operation**: Create

A small inline form (triggered by toolbar button or double-click on empty canvas):

```
┌─────────────────────┐
│  Add Concept         │
│  Label:  [________]  │
│  Desc:   [________]  │
│  Category: [▼ term]  │
│  Importance: [▼ med] │
│  [Cancel]    [Add]   │
└─────────────────────┘
```

On submit:
1. Generate node ID via `slugify(label)`
2. Add to React Flow state at clicked position (or center of viewport)
3. Mark as unsaved

#### Step 3.3: Node context menu (edit/delete)

**File**: `frontend/src/components/Workspace/tools/mindmap/NodeContextMenu.tsx`
**Operation**: Create

Right-click (or long-press) on a node shows:

```
┌──────────────┐
│  Edit Node   │
│  Delete Node │
│  ──────────  │
│  Connect To… │
└──────────────┘
```

- **Edit Node**: Opens inline form pre-filled with current data (label, description, category, importance)
- **Delete Node**: Removes node + all connected edges, confirms if node has many connections
- **Connect To**: Enters connection mode (same as dragging from handle)

#### Step 3.4: Edge context menu (edit label / delete)

**File**: `frontend/src/components/Workspace/tools/mindmap/EdgeContextMenu.tsx`
**Operation**: Create

Right-click on an edge:

```
┌────────────────┐
│  Edit Label    │
│  Change Weight │
│  Delete Edge   │
└────────────────┘
```

- **Edit Label**: Inline text input to change relationship label
- **Change Weight**: Slider 0-1 (affects visual thickness + animation)
- **Delete Edge**: Removes the edge

#### Step 3.5: Toolbar additions to MindmapPlayer

**File**: `frontend/src/components/Workspace/tools/MindmapPlayer.tsx`
**Operation**: Modify

Add a toolbar row below the header:

```
[+ Add Node] [AI Edit ✨] [Save 💾] [Undo ↩] | Unsaved changes indicator
```

- **Add Node**: Opens the AddNodeForm at viewport center
- **AI Edit**: Opens MindmapEditPopup
- **Save**: Persists current state to backend via `saveMindmap()`
- **Undo**: Simple undo stack (stores last 10 states)
- **Unsaved indicator**: Yellow dot when changes exist

#### Step 3.6: Auto-save / save on close

When the user closes the MindmapPlayer with unsaved changes, show a confirmation:
"You have unsaved changes. Save before closing?"
[Discard] [Save & Close]

Alternatively, auto-save on every manual edit with a debounce (500ms).

---

### Phase 4: State Management & Undo

#### Step 4.1: Undo/redo stack

**File**: `frontend/src/components/Workspace/tools/mindmap/useUndoRedo.ts`
**Operation**: Create

A custom hook that tracks graph state history:

```typescript
export function useUndoRedo(initialNodes: Node[], initialEdges: Edge[]) {
  // Maintains a stack of { nodes, edges } snapshots
  // Returns: { nodes, edges, setNodes, setEdges, undo, redo, canUndo, canRedo }
  // Pushes a snapshot whenever nodes/edges change (debounced)
  // Max 20 history entries
}
```

#### Step 4.2: Track tool ID for persistence

The MindmapPlayer currently doesn't know its `toolId` (needed for `updateTool()`). Pass it through from ToolsPanel:

```typescript
// ToolsPanel.tsx — when viewing a mindmap, pass the tool key
<MindmapPlayer data={gen.result} topic={gen.config.topic} toolId={key} subjectId={subject.id} onClose={...} />
```

---

## Key Files

| File | Operation | Description |
|------|-----------|-------------|
| `backend/src/utils/subjects/subjects.ts:208` | Modify | Add `updateTool()` function |
| `backend/src/core/routes/mindmap.ts` | Modify | Add PATCH routes for manual save + AI edit |
| `backend/src/services/mindmap/index.ts` | Modify | Add `editMindmapWithAI()` function |
| `frontend/src/lib/api.ts` | Modify | Add `saveMindmap()` and `aiEditMindmap()` functions |
| `frontend/src/components/Workspace/tools/MindmapPlayer.tsx` | Modify | Add toolbar, onConnect, context menus, save/undo |
| `frontend/src/components/Workspace/tools/mindmap/MindmapEditPopup.tsx` | Create | AI edit popup dialog |
| `frontend/src/components/Workspace/tools/mindmap/AddNodeForm.tsx` | Create | Manual node creation form |
| `frontend/src/components/Workspace/tools/mindmap/NodeContextMenu.tsx` | Create | Right-click menu for nodes |
| `frontend/src/components/Workspace/tools/mindmap/EdgeContextMenu.tsx` | Create | Right-click menu for edges |
| `frontend/src/components/Workspace/tools/mindmap/useUndoRedo.ts` | Create | Undo/redo state management hook |
| `frontend/src/components/Workspace/ToolsPanel.tsx:277-280` | Modify | Pass toolId + subjectId to MindmapPlayer |
| `frontend/src/components/Workspace/tools/mindmap/ConceptNode.tsx` | Modify | Add edit-mode visual indicators |

## No New Dependencies

All functionality uses existing packages:
- `@xyflow/react` already installed — has built-in `addEdge`, `onConnect`, `onNodesDelete`, `onEdgesDelete`
- `dagre` already installed
- Backend LLM infra already in place

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| AI edit returns invalid graph (missing nodes referenced by edges) | Validate AI output: filter edges with dangling references, ensure all node IDs are unique |
| AI edit removes nodes user wanted to keep | Prompt engineering: "Keep all existing nodes unless explicitly asked to remove them" |
| Concurrent edits via multiple tabs | Per-collection mutex (`withLock`) already exists in db.ts; add optimistic locking via `generatedAt` timestamp |
| Large graph makes context menu hard to use | Position context menu relative to viewport, not canvas; use portal rendering |
| Undo stack memory with large graphs | Cap at 20 entries; store only diffs if needed (but full snapshots are simpler and graphs are small) |
| Save fails silently | Show toast notification on save success/failure |
| React Flow `onConnect` creates duplicate edges | Check for existing edge between same source/target before adding |

## Implementation Order

1. **Backend persistence** (Step 1.1-1.2) — enables save
2. **Frontend manual editing** (Step 3.1-3.5) — core editing UX
3. **Save/undo** (Step 3.6, 4.1-4.2) — persistence + safety net
4. **AI edit backend** (Step 1.3-1.4) — LLM integration
5. **AI edit frontend** (Step 2.1-2.2) — popup UI

This order lets you test manual editing immediately while the AI integration is built.

## Estimated Scope

- **Backend**: ~100 lines new code (updateTool + 2 routes + AI edit function)
- **Frontend**: ~600 lines new code (popup, forms, menus, toolbar, undo hook)
- **Modifications**: ~6 existing files, moderate changes each
- **Total**: ~700 lines of new code, ~150 lines of modifications
