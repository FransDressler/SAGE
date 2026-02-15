# Frontend Codemap

> Generated: 2026-02-15T14:31:00Z | Version: 1.0.0

## Directory Structure

```
frontend/src/
├── main.tsx                    # App entry — React Router setup
├── index.css                   # TailwindCSS + custom theme (bone palette, sunset gradients)
├── pages/
│   ├── Home.tsx                # Subject list, create/delete subjects
│   ├── SubjectWorkspace.tsx    # Main workspace — 3-column layout
│   └── 404.tsx                 # Not found page
├── components/
│   ├── Chat/                   # Chat UI components
│   │   ├── Composer.tsx        # Message input with file upload
│   │   ├── MarkdownView.tsx    # Markdown renderer (KaTeX, code highlight)
│   │   ├── LoadingIndicator.tsx# Agent step progress display
│   │   ├── SelectionPopup.tsx  # Text selection actions
│   │   └── SourcesList.tsx     # RAG source citations display
│   ├── Home/                   # Home page components
│   │   ├── SubjectCard.tsx     # Subject card with sunset gradient
│   │   └── CreateSubjectDialog.tsx # New subject modal
│   ├── Workspace/              # Workspace layout components
│   │   ├── ChatPanel.tsx       # Chat column (messages + composer)
│   │   ├── ChatSidebar.tsx     # Chat history sidebar
│   │   ├── SourcesPanel.tsx    # Sources list + upload
│   │   ├── SourceViewer.tsx    # PDF/document viewer
│   │   ├── ToolsPanel.tsx      # Tool launcher grid
│   │   ├── ToolCard.tsx        # Individual tool card
│   │   ├── StudyToolModal.tsx  # Tool configuration modal
│   │   ├── ModelSelector.tsx   # LLM provider/model picker
│   │   ├── SubjectGraphColumn.tsx # Knowledge graph visualization
│   │   ├── CollapsedColumn.tsx # Collapsed panel indicator
│   │   ├── CommandPalette.tsx  # Cmd+K command palette
│   │   ├── DropOverlay.tsx     # Drag-and-drop file overlay
│   │   ├── KeyboardShortcutsHelp.tsx # Shortcuts reference
│   │   └── tools/              # Tool-specific viewers
│   │       ├── QuizTool.tsx    # Quiz config + trigger
│   │       ├── QuizPlayer.tsx  # Interactive quiz UI
│   │       ├── SmartNotesTool.tsx # Notes config + trigger
│   │       ├── NotesViewer.tsx # Rendered notes display
│   │       ├── PodcastTool.tsx # Podcast config + trigger
│   │       ├── PodcastPlayer.tsx # Audio player UI
│   │       ├── ExamPlayer.tsx  # Timed exam UI
│   │       ├── FlashcardsTool.tsx # Flashcard manager
│   │       ├── TranscriberTool.tsx # Audio transcription UI
│   │       ├── MindmapPlayer.tsx # Mindmap visualization (ReactFlow)
│   │       ├── ResearchViewer.tsx # Research report viewer
│   │       └── mindmap/        # Mindmap sub-components
│   │           ├── ConceptNode.tsx    # Custom ReactFlow node
│   │           ├── AddNodeForm.tsx    # Add concept form
│   │           ├── NodeContextMenu.tsx
│   │           ├── EdgeContextMenu.tsx
│   │           ├── MindmapEditPopup.tsx
│   │           ├── ClusterBackground.tsx
│   │           ├── layout.ts          # Dagre layout algorithm
│   │           ├── forceLayout.ts     # D3-force layout
│   │           └── clusterLayout.ts   # Cluster grouping
│   ├── Footer.tsx              # App footer
│   ├── MobileHeader.tsx        # Mobile responsive header
│   └── Quiz/                   # Shared quiz components
│       └── ReviewModal.tsx     # Quiz review modal
├── context/
│   ├── SubjectContext.tsx       # Subject state, sources, tools, active panel
│   └── ModelContext.tsx         # LLM provider/model selection state
├── hooks/
│   ├── useDragZone.ts          # File drag-and-drop hook
│   └── useKeyboardShortcuts.ts # Global keyboard shortcuts
├── lib/
│   └── api.ts                  # API client — HTTP + WebSocket helpers, all types
└── config/
    └── env.ts                  # Runtime env config (backend URL, timeout)
```

## Component Hierarchy

```
App (main.tsx)
├── Home
│   ├── CreateSubjectDialog
│   └── SubjectCard[]
└── SubjectWorkspace
    ├── SubjectContext.Provider
    │   ├── ModelContext.Provider
    │   │   ├── SourcesPanel (col 1)
    │   │   │   └── SourceViewer
    │   │   ├── ChatPanel (col 2)
    │   │   │   ├── ChatSidebar
    │   │   │   ├── MarkdownView[]
    │   │   │   ├── LoadingIndicator
    │   │   │   ├── SourcesList
    │   │   │   └── Composer
    │   │   ├── ToolsPanel (col 3)
    │   │   │   ├── ToolCard[]
    │   │   │   └── [ActiveTool]*
    │   │   ├── SubjectGraphColumn
    │   │   ├── CommandPalette
    │   │   └── StudyToolModal
    │   └── DropOverlay
    └── KeyboardShortcutsHelp
```

## State Management

### SubjectContext
- `subject`, `sources`, `tools` — current subject data
- `activeTool` — which tool panel is open
- `viewingSource` — PDF/doc viewer state
- `refreshSources()`, `refreshTools()` — data fetchers
- Legacy source normalization (pre-sourceType → "material")

### ModelContext
- `provider`, `model` — selected LLM provider/model
- Persisted via localStorage

## API Client (lib/api.ts)

All backend communication via:
- **`req<T>(url, opts?)`** — typed HTTP requests
- **`streamWs<T>(url, onEvent)`** — WebSocket streaming with typed events
- **`env.backend`** — configurable backend URL (default: `http://localhost:5000`)

## Design System

- **Theme**: Warm bone palette (`--color-bone`, `--color-accent`)
- **Font**: Courier Prime (monospace)
- **Effects**: Sunset gradient borders/text on hover (`.sunset-card`, `.sunset-text`)
- **Styling**: TailwindCSS v4 with custom `@theme` tokens
- **Scrollbars**: Custom styled (`.custom-scroll`)
