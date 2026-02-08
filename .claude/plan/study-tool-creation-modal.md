# Implementation Plan: Study Tool Creation Modal & Right-Panel Rendering

## Summary

Replace the current inline tool creation forms (topic + model selector embedded in each tool component) with a unified **popup modal** for configuring and launching study tools (Quiz, Notes, Podcast). After pressing "Start", the tool shows a **loading spinner card** in the right column. Once ready, the user clicks the card to open the tool's output **inline in the right column** (with a close X to return to the overview). Source filtering, topic, difficulty (quiz only), length, and model selection are all configured in the modal.

---

## Task Type
- [x] Frontend
- [x] Backend (minor — accept new params)
- [x] Fullstack

---

## Architecture Overview

### Current State
- `ToolsPanel.tsx` renders 5 tool buttons → clicking opens the tool component inline
- Each tool (QuizTool, PodcastTool, SmartNotesTool) has its own inline form: topic input + ModelSelector + generate button
- Tool components manage their own state (topic, busy, result)
- `SubjectContext` tracks `activePanel: ToolPanel` (which tool is open)

### Target State
- `ToolsPanel.tsx` renders 5 tool buttons → clicking a generative tool (Quiz/Notes/Podcast) opens a **creation modal**
- Modal contains: source filter, topic, difficulty (quiz only), length, model selector
- Pressing "Start" closes modal, shows a **loading card** in the tools overview grid
- Once generation completes, the card becomes clickable
- Clicking the card opens the tool output in the right column with a **close (X) button** in the top-right
- Closing returns to the tools overview (card grid)
- Flashcards and Transcriber remain as-is (they don't have a generation step that fits this pattern)

---

## Implementation Steps

### Phase 1: Backend — Accept New Parameters

**Step 1.1: Extend quiz route to accept `difficulty`, `length`, and `sourceIds`**

| File | Operation | Description |
|------|-----------|-------------|
| `backend/src/core/routes/quiz.ts:42-46` | Modify | Extract `difficulty`, `length`, `sourceIds` from `req.body` |
| `backend/src/services/quiz/index.ts:14-42` | Modify | Incorporate `difficulty` (easy/medium/hard) and `length` (number of questions) into the system prompt. Change hardcoded `5` to dynamic count. |

- `difficulty`: "easy" | "medium" | "hard" — adjusts question complexity in the system prompt
- `length`: number (default 5, range 3-20) — replaces hardcoded "exactly 5"
- `sourceIds`: string[] (optional) — passed through for future RAG filtering (not connected to retrieval yet, but stored)

**Step 1.2: Extend podcast and smartnotes routes to accept `sourceIds` and `length`**

| File | Operation | Description |
|------|-----------|-------------|
| `backend/src/core/routes/podcast.ts:63-67` | Modify | Accept `sourceIds` and `length` from body, pass to service |
| `backend/src/core/routes/notes.ts:44-51` | Modify | Accept `sourceIds` and `length` from body, pass to service |
| `backend/src/services/podcast/index.ts:59` | Modify | Accept `length` to control segment count (short=6, medium=12, long=18) |
| `backend/src/services/smartnotes/index.ts` | Modify | Accept `length` to control note detail level |

### Phase 2: Frontend — Creation Modal Component

**Step 2.1: Create `StudyToolModal.tsx`**

| File | Operation | Description |
|------|-----------|-------------|
| `frontend/src/components/Workspace/StudyToolModal.tsx` | Create | New modal component |

Props:
```typescript
type StudyToolModalProps = {
  tool: "quiz" | "podcast" | "smartnotes";
  sources: Source[];
  onStart: (config: ToolConfig) => void;
  onClose: () => void;
};

type ToolConfig = {
  topic: string;
  difficulty?: "easy" | "medium" | "hard";  // quiz only
  length: "short" | "medium" | "long";
  sourceIds: string[];                       // empty = all sources
  provider?: string;
  model?: string;
};
```

UI layout:
- **Backdrop overlay** (dark semi-transparent, click-to-close)
- **Centered card** (max-w-md, bg-stone-900, rounded-xl, border)
- **Header**: Tool name + colored icon + close X
- **Form fields**:
  1. **Topic** — text input (pre-filled with subject name)
  2. **Sources** — multi-select checkboxes listing all subject sources (filename + size). "All sources" toggle at top. If no sources, show "No sources uploaded" hint.
  3. **Difficulty** — 3-button toggle (Easy / Medium / Hard) — only shown for Quiz
  4. **Length** — 3-button toggle (Short / Medium / Long) with contextual labels:
     - Quiz: "5 questions" / "10 questions" / "20 questions"
     - Podcast: "~3 min" / "~6 min" / "~10 min"
     - Notes: "Summary" / "Detailed" / "Comprehensive"
  5. **Model** — ModelSelector (existing component)
- **Footer**: "Start" button (colored per tool) + "Cancel" text button

**Step 2.2: Create `ToolCard.tsx` for the overview grid**

| File | Operation | Description |
|------|-----------|-------------|
| `frontend/src/components/Workspace/ToolCard.tsx` | Create | Card component for tools overview |

Represents a tool in the overview grid. Three visual states:
1. **Idle** — shows tool icon + "Generate" label, clicking opens the modal
2. **Loading** — spinner animation + "Generating..." text, not clickable
3. **Ready** — result preview (e.g., "Quiz: 10 questions on X"), click to open output

```typescript
type ToolCardProps = {
  tool: "quiz" | "podcast" | "smartnotes" | "flashcards" | "transcriber";
  color: string;
  status: "idle" | "loading" | "ready";
  label?: string;           // e.g., "Neural Networks Quiz"
  onClick: () => void;
};
```

### Phase 3: Frontend — Refactor ToolsPanel

**Step 3.1: Refactor `ToolsPanel.tsx` with new state management**

| File | Operation | Description |
|------|-----------|-------------|
| `frontend/src/components/Workspace/ToolsPanel.tsx` | Modify | Major refactor — overview grid + modal + inline output |

New state in ToolsPanel:
```typescript
type GeneratedTool = {
  tool: "quiz" | "podcast" | "smartnotes";
  config: ToolConfig;
  status: "loading" | "ready" | "error";
  result: any;  // quiz questions, audio file, notes file
};

// State
const [modalTool, setModalTool] = useState<"quiz"|"podcast"|"smartnotes"|null>(null);
const [generated, setGenerated] = useState<Map<string, GeneratedTool>>(new Map());
const [viewingTool, setViewingTool] = useState<string | null>(null); // key of generated tool being viewed
```

Layout logic:
```
if (viewingTool) {
  // Render: close X button + tool output component (quiz player, audio player, PDF link)
} else {
  // Render: tool cards grid (5 cards) + modal if modalTool set
}
```

**Step 3.2: Wire up generation flow**

When user clicks "Start" in modal:
1. Close modal
2. Create a `GeneratedTool` entry with `status: "loading"`
3. Call the appropriate API (`quizStart`, `podcastStart`, `smartnotesStart`) with extended params
4. Connect WebSocket, update status to `"ready"` when done, store result
5. On error, set `status: "error"`

**Step 3.3: Render tool output inline**

When user clicks a "ready" card:
1. Set `viewingTool` to the card's key
2. Render the tool output component in the right column:
   - **Quiz**: QuizHeader + QuestionCard (reuse existing components)
   - **Podcast**: Audio player + download button
   - **Notes**: Download link
3. Show a **close (X) button** in the top-right corner
4. Clicking X sets `viewingTool = null` → returns to grid overview

### Phase 4: Frontend — Refactor Tool Components

**Step 4.1: Extract quiz output into `QuizPlayer.tsx`**

| File | Operation | Description |
|------|-----------|-------------|
| `frontend/src/components/Workspace/tools/QuizPlayer.tsx` | Create | Stateless quiz player receiving questions as props |

Move the quiz-playing logic from QuizTool into a new `QuizPlayer` component:
- Props: `{ questions: Question[], topic: string, onClose: () => void }`
- Contains: question stepping, scoring, hint/explanation, results panel
- Reuses: QuizHeader, QuestionCard, ResultsPanel, ReviewModal

**Step 4.2: Extract podcast output into `PodcastPlayer.tsx`**

| File | Operation | Description |
|------|-----------|-------------|
| `frontend/src/components/Workspace/tools/PodcastPlayer.tsx` | Create | Audio player for generated podcast |

- Props: `{ audioFile: string, audioFilename: string, topic: string, onClose: () => void }`
- Contains: audio element + download button

**Step 4.3: Extract notes output into `NotesViewer.tsx`**

| File | Operation | Description |
|------|-----------|-------------|
| `frontend/src/components/Workspace/tools/NotesViewer.tsx` | Create | PDF download link for generated notes |

- Props: `{ filePath: string, topic: string, onClose: () => void }`
- Contains: download link + preview iframe if desired

**Step 4.4: Update QuizTool, PodcastTool, SmartNotesTool**

| File | Operation | Description |
|------|-----------|-------------|
| `frontend/src/components/Workspace/tools/QuizTool.tsx` | Modify | Remove inline form, use QuizPlayer |
| `frontend/src/components/Workspace/tools/PodcastTool.tsx` | Modify | Remove inline form, use PodcastPlayer |
| `frontend/src/components/Workspace/tools/SmartNotesTool.tsx` | Modify | Remove inline form, use NotesViewer |

### Phase 5: Frontend — Update API Client

**Step 5.1: Extend API functions to accept new params**

| File | Operation | Description |
|------|-----------|-------------|
| `frontend/src/lib/api.ts:245-253` | Modify | `quizStart` accepts `{ topic, difficulty?, length?, sourceIds?, provider?, model? }` |
| `frontend/src/lib/api.ts:270-280` | Modify | `podcastStart` accepts `sourceIds` and `length` |
| `frontend/src/lib/api.ts:299-307` | Modify | `smartnotesStart` accepts `sourceIds` and `length` |

### Phase 6: Responsive Design

**Step 6.1: Handle narrow viewport**

- The right column is 320px on desktop — the modal should render as a **portal to document body** (not constrained by the 320px panel)
- Tool cards grid: 1 column on narrow, 2 columns when space allows
- Quiz player in narrow mode: full-width questions, smaller buttons
- Close (X) button: sticky top-right, always visible even when scrolled

---

## Key Files

| File | Operation | Description |
|------|-----------|-------------|
| `frontend/src/components/Workspace/StudyToolModal.tsx` | Create | Configuration modal for tool generation |
| `frontend/src/components/Workspace/ToolCard.tsx` | Create | Card component for tool overview grid |
| `frontend/src/components/Workspace/tools/QuizPlayer.tsx` | Create | Quiz playing component (extracted from QuizTool) |
| `frontend/src/components/Workspace/tools/PodcastPlayer.tsx` | Create | Audio player component |
| `frontend/src/components/Workspace/tools/NotesViewer.tsx` | Create | Notes download/view component |
| `frontend/src/components/Workspace/ToolsPanel.tsx` | Modify | Major refactor: grid + modal + inline view |
| `frontend/src/components/Workspace/tools/QuizTool.tsx` | Modify | Remove inline form |
| `frontend/src/components/Workspace/tools/PodcastTool.tsx` | Modify | Remove inline form |
| `frontend/src/components/Workspace/tools/SmartNotesTool.tsx` | Modify | Remove inline form |
| `frontend/src/lib/api.ts` | Modify | Extend API functions with new params |
| `backend/src/core/routes/quiz.ts` | Modify | Accept difficulty, length, sourceIds |
| `backend/src/services/quiz/index.ts` | Modify | Dynamic difficulty and question count |
| `backend/src/core/routes/podcast.ts` | Modify | Accept sourceIds, length |
| `backend/src/core/routes/notes.ts` | Modify | Accept sourceIds, length |
| `backend/src/services/podcast/index.ts` | Modify | Dynamic segment count |

---

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| Quiz generation with 20 questions may timeout (currently 60s) | Increase timeout proportionally with length; add progress indication |
| Modal portal may cause z-index issues with other panels | Use React portal to `document.body`, high z-index (z-50) |
| Narrow viewport (320px) may truncate modal content | Modal renders as portal overlaying entire viewport, not constrained to panel |
| Multiple concurrent generations could conflict | Each generation gets a unique key in the Map; support multiple loading cards |
| Source filtering not yet wired to RAG retrieval | Accept `sourceIds` on backend now, wire to retrieval in a follow-up — display sources in UI regardless |

---

## UX Flow Summary

```
1. User sees tool cards grid in right column
   [Quiz] [Podcast] [Notes] [Cards] [Transcribe]

2. User clicks [Quiz] → modal opens over entire viewport
   ┌──────────────────────────────────────┐
   │  New Quiz                        [X] │
   │                                      │
   │  Topic: [Neural Networks          ]  │
   │                                      │
   │  Sources:                            │
   │  [x] All sources                     │
   │  [x] ml-textbook.pdf                 │
   │  [x] lecture-notes.md                │
   │                                      │
   │  Difficulty:                         │
   │  [Easy] [Medium] [Hard]              │
   │                                      │
   │  Length:                              │
   │  [5 Qs] [10 Qs] [20 Qs]             │
   │                                      │
   │  Model: [Gemini ▾]                   │
   │                                      │
   │         [Start Quiz]                 │
   └──────────────────────────────────────┘

3. User clicks "Start Quiz" → modal closes, card shows spinner
   [Quiz ⟳] [Podcast] [Notes] [Cards] [Transcribe]
    Generating...

4. Generation completes → card becomes clickable
   [Quiz ✓] [Podcast] [Notes] [Cards] [Transcribe]
    "10 Qs on Neural..."

5. User clicks card → quiz opens inline in right column
   ┌─────────────────────────────────[X]─┐
   │  Neural Networks Quiz                │
   │  Question 3 of 10      Score: 2     │
   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
   │                                      │
   │  What is backpropagation?            │
   │  A) ...                              │
   │  B) ...                              │
   │  C) ...                              │
   │  D) ...                              │
   │                                      │
   │         [Next Question]              │
   └──────────────────────────────────────┘

6. User clicks [X] → returns to tool cards overview
```
