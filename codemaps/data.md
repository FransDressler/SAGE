# Data Models Codemap

> Generated: 2026-02-15T14:31:00Z | Version: 1.0.0

## Core Domain Models

### Subject
```typescript
// backend: utils/subjects/subjects.ts | frontend: lib/api.ts
type SubjectMeta = {
  id: string; name: string; createdAt: number; updatedAt: number; systemPrompt?: string
}
// Frontend adds: sourceCount: number
```

### Source
```typescript
// backend: utils/subjects/subjects.ts | frontend: lib/api.ts
type SourceType = "material" | "exercise" | "websearch"
type Source = {
  id: string; filename: string; originalName: string; mimeType: string
  size: number; uploadedAt: number; sourceType: SourceType
  searchQuery?: string; searchMode?: "quick" | "deep"; sourceUrl?: string
}
```

### ToolRecord
```typescript
// backend: utils/subjects/subjects.ts | frontend: lib/api.ts
type ToolRecord = {
  id: string
  tool: "quiz" | "podcast" | "smartnotes" | "mindmap" | "exam" | "research"
  topic: string; config: Record<string, string | undefined>
  createdAt: number; result: QuizResult | PodcastResult | NotesResult | MindmapResult | ExamResult | ResearchResult
}
```

## Chat Models

```typescript
// backend: utils/chat/chat.ts
type ChatMeta = { id: string; title: string; at: number }
type ChatMsg = { role: "user" | "assistant"; content: any; at: number; sources?: RagSource[] }

// frontend: lib/api.ts
type ChatPhase = "upload_start" | "upload_done" | "generating" | "thinking"
  | "listing_sources" | "searching_sources" | "searching_web" | "reading_results"
type AgentStep = { stepId: number; phase: ChatPhase; detail?: string; status: "active" | "done" }
```

## RAG Models

```typescript
// backend: lib/ai/ask.ts
type RagSource = { sourceFile: string; sourceId?: string; pageNumber?: number
  heading?: string; sourceType?: string; url?: string }
type AskPayload = { topic: string; answer: string; flashcards: AskCard[]; sources?: RagSource[] }

// backend: lib/ai/embed.ts — embedding metadata
type EmbedMeta = { sourceId?: string; sourceFile?: string; mimeType?: string
  subjectId?: string; sourceType?: string }
```

## Tool-Specific Models

### Quiz
```typescript
type QuizItem = { id: number; question: string; options: string[]; correct: number
  hint: string; explanation: string; imageHtml?: string }
type QuizOpts = { difficulty?: "easy" | "medium" | "hard"; length?: number; sourceIds?: string[] }
```

### Exam
```typescript
type ExamQuestion = { id: number; question: string; type: "open" | "mcq"
  options?: string[]; correctAnswer?: string; hint: string; solution: string
  points: number; source: string }
```

### Mindmap
```typescript
// backend: services/mindmap/types.ts
type ConceptNode = { id: string; label: string; description: string; category: string
  importance: "high" | "medium" | "low"; color: string; sources: { file: string; page?: number }[] }
type ConceptEdge = { source: string; target: string; label: string; weight: number }
type MindmapData = { nodes: ConceptNode[]; edges: ConceptEdge[]; generatedAt: number; sourceCount: number }
```

### SmartNotes
```typescript
type SmartNotesMode = "summary" | "deep" | "study-guide"
type SmartNotesOptions = { topic?: any; notes?: string; filePath?: string; length?: string
  mode?: SmartNotesMode; subjectId: string; sourceIds?: string[] }
```

### Research
```typescript
// backend: services/research/types.ts
type ResearchDepth = "quick" | "standard" | "comprehensive"
type ResearchPlan = { title: string; abstract: string; subQuestions: SubQuestion[]; externalTopics: string[] }
type SubQuestion = { id: string; question: string; searchTerms: string[]
  expectedSources: ("rag" | "wikipedia" | "arxiv" | "pubmed" | "web")[] }
type ArxivResult = { title: string; authors: string[]; abstract: string; published: string; arxivId: string }
type PubmedResult = { title: string; authors: string[]; abstract: string; published: string; pmid: string }
```

### Podcast
```typescript
type PSeg = { spk: string; voice?: string; md: string }
type POut = { title: string; summary: string; segments: PSeg[] }
```

## Agent System Models

```typescript
// backend: agents/types.ts
type Agent = { id: string; name: string; sys: string; tools: ToolIO[] }
type ToolIO = { name: string; desc: string; schema: any; run: (i: any, c: Ctx) => Promise<any> }
type ExecPlan = { steps: ExecStep[] }
type ExecStep = { tool: string; input?: any; timeoutMs?: number; retries?: number }
type ExecOut = { trace: any[]; result: any; threadId: string }
```

## LLM Provider Models

```typescript
// backend: utils/llm/models/types.ts
interface LLM { invoke(m: Msg[]): Promise<any>; call(m: Msg[]): Promise<any>; raw(): any }
type EmbeddingsLike = { embedDocuments(texts: string[]): Promise<number[][]>; embedQuery(text: string): Promise<number[]> }
type AvailableProvider = { id: string; name: string; defaultModel: string }
```

## Storage Schema

### Keyv (SQLite) Keys
| Key Pattern                      | Value Type    | Description            |
|----------------------------------|---------------|------------------------|
| `subject:{id}`                   | SubjectMeta   | Subject metadata       |
| `subject:{id}:sources`           | Source[]       | Source list            |
| `subject:{id}:tools`             | ToolRecord[]   | Generated tool records |
| `subject:{id}:graph`             | MindmapData   | Subject knowledge graph|
| `subject:index`                  | string[]       | All subject IDs       |
| `chat:{subjectId}:{chatId}`      | ChatMeta      | Chat metadata          |
| `chat:{subjectId}:{chatId}:msgs` | ChatMsg[]      | Chat message history  |
| `chat:{subjectId}:index`         | string[]       | Chat IDs per subject  |

### JSON Embeddings (storage/json/)
| File Pattern                     | Content                           |
|----------------------------------|-----------------------------------|
| `subject:{id}.json`              | Embedded document chunks          |
| `subject:{id}__parents.json`     | Parent documents (pre-chunking)   |

### Document Chunk Metadata
```typescript
{
  chunkIndex: number; totalChunks: number; sourceId: string; sourceFile: string
  mimeType: string; subjectId: string; ingestedAt: number
  pageNumber?: number; parentId?: string; heading?: string; sourceType?: SourceType
}
```

### File System Storage
```
subjects/{subjectId}/
├── sources/         # Uploaded files + .txt extractions
├── smartnotes/      # Generated markdown notes
├── podcasts/        # Generated audio files
└── research/        # Research reports
storage/
├── database.sqlite  # Keyv metadata store
├── json/            # JSON embedding store
└── cache/           # Temporary files
```

## WebSocket Event Protocol

All streaming tools follow a consistent discriminated union:
```typescript
type StreamEvent<T extends string, D = {}> =
  | { type: "ready" } & D
  | { type: "phase"; value: string; detail?: string }
  | { type: T; [key: string]: any }     // tool-specific payload
  | { type: "done" }
  | { type: "error"; error: string }
  | { type: "ping"; t: number }
```

| Tool        | Result Event Type | Payload Key      |
|-------------|-------------------|------------------|
| Chat        | `answer`          | answer (string)  |
| Quiz        | `quiz`            | quiz (Question[])|
| SmartNotes  | `file`            | file (string)    |
| Podcast     | `audio`           | file (string)    |
| Exam        | `exam`            | exam (object)    |
| Mindmap     | `mindmap`         | data (MindmapData)|
| Research    | `file` + `plan`   | file/plan        |
| WebSearch   | `result` + `done` | result/sourceId  |
| Graph       | `graph`           | data (object)    |
