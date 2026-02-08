# Implementation Plan: Study Tools Persistence

## Summary

Save generated study tools (quizzes, podcasts, smartnotes) as metadata in the existing Keyv/SQLite database under per-subject keys. Add a listing endpoint so the frontend can load past results on mount. Move smartnotes PDFs into subject folders for consistency with podcasts.

---

## Task Type
- [x] Frontend
- [x] Backend
- [x] Fullstack

---

## Architecture Overview

### Current State
- **Quizzes**: Generated via LLM, streamed over WebSocket, then lost — zero persistence
- **Podcasts**: Audio saved to `subjects/{id}/podcasts/{pid}/`, but no metadata stored — files exist but aren't discoverable
- **SmartNotes**: PDFs saved to global `storage/smartnotes/`, not linked to subjects — undiscoverable after page reload
- **Existing pattern**: Subject metadata lives in SQLite via Keyv (`keyv:subject:{id}:sources`, `keyv:subject:{id}:flashcards`, etc.)

### Target State
- All three tool types save metadata to Keyv: `keyv:subject:{id}:tools` (array of `ToolRecord`)
- SmartNotes PDFs move to `subjects/{id}/smartnotes/` (directory already created by `createSubject`)
- New `GET /subjects/:id/tools` endpoint returns the saved list
- Frontend loads the list on mount and merges with in-flight generations
- Backend saves the record after each successful generation (quiz route, podcast route, notes route)

---

## Data Model

```typescript
type ToolRecord = {
  id: string;                                    // UUID
  tool: "quiz" | "podcast" | "smartnotes";
  topic: string;
  config: {                                      // What the user configured
    difficulty?: "easy" | "medium" | "hard";
    length?: string;
  };
  createdAt: number;
  result: QuizResult | PodcastResult | NotesResult;
};

type QuizResult = {
  type: "quiz";
  questions: QuizItem[];                         // The full question array
};

type PodcastResult = {
  type: "podcast";
  pid: string;                                   // Podcast directory ID
  filename: string;                              // Audio filename
};

type NotesResult = {
  type: "smartnotes";
  filename: string;                              // PDF filename in subject smartnotes dir
};
```

Storage key: `subject:{subjectId}:tools` — array of `ToolRecord`, newest first.

---

## Implementation Steps

### Phase 1: Backend — Storage helpers

**Step 1.1: Add tool record helpers to `subjects.ts`**

| File | Operation | Description |
|------|-----------|-------------|
| `backend/src/utils/subjects/subjects.ts` | Modify | Add `ToolRecord` type, `listTools(subjectId)`, `addTool(subjectId, record)`, `deleteTool(subjectId, toolId)` |

Functions:
- `listTools(subjectId)` → reads `subject:{id}:tools` from Keyv, returns array
- `addTool(subjectId, record)` → prepends record to array, saves back
- `deleteTool(subjectId, toolId)` → removes record + cleans up files if applicable

Also update `deleteSubject()` to clean up `subject:{id}:tools` key.

### Phase 2: Backend — Save on generation completion

**Step 2.1: Save quiz results after generation**

| File | Operation | Description |
|------|-----------|-------------|
| `backend/src/core/routes/quiz.ts:56-63` | Modify | After `handleQuiz` succeeds and before emitting `done`, call `addTool()` to persist the quiz questions |

After `const qz = await withTimeout(handleQuiz(...))`:
```
await addTool(subjectId, {
  id: quizId,
  tool: "quiz",
  topic,
  config: { difficulty, length: String(length) },
  createdAt: Date.now(),
  result: { type: "quiz", questions: qz },
})
```

Note: Use `quizId` as the tool record ID (already a UUID).

**Step 2.2: Save podcast metadata after audio creation**

| File | Operation | Description |
|------|-----------|-------------|
| `backend/src/core/routes/podcast.ts:79-107` | Modify | After audio file created, save tool record with pid + filename |

After `emit(pid, audioMessage)`:
```
await addTool(subjectId, {
  id: pid,
  tool: "podcast",
  topic,
  config: { length },
  createdAt: Date.now(),
  result: { type: "podcast", pid, filename },
})
```

**Step 2.3: Move smartnotes PDF to subject folder + save metadata**

| File | Operation | Description |
|------|-----------|-------------|
| `backend/src/services/smartnotes/index.ts` | Modify | Change output directory from `storage/smartnotes/` to `subjects/{subjectId}/smartnotes/` |
| `backend/src/core/routes/notes.ts:61-77` | Modify | Pass `subjectId` to `handleSmartNotes`, save tool record after generation |

The smartnotes service needs the `subjectId` to know where to save. Update `SmartNotesOptions` to include `subjectId`. Change both `fillTemplateFormPDF` and `createSimplePDF` to use `subjects/{subjectId}/smartnotes/` as the output directory.

After PDF generation, the route saves:
```
await addTool(subjectId, {
  id: noteId,
  tool: "smartnotes",
  topic,
  config: { length },
  createdAt: Date.now(),
  result: { type: "smartnotes", filename: path.basename(result.file) },
})
```

The download URL becomes: `/subjects/{subjectId}/smartnotes/{filename}` (need a new static route).

### Phase 3: Backend — Listing endpoint + static file serving

**Step 3.1: Add GET /subjects/:id/tools**

| File | Operation | Description |
|------|-----------|-------------|
| `backend/src/core/routes/subjects.ts` | Modify | Add `GET /subjects/:id/tools` returning the tools array |

Response:
```json
{
  "ok": true,
  "tools": [
    { "id": "...", "tool": "quiz", "topic": "...", "config": {...}, "createdAt": 1234, "result": { "type": "quiz", "questions": [...] } },
    { "id": "...", "tool": "podcast", "topic": "...", "result": { "type": "podcast", "pid": "...", "filename": "..." } },
    ...
  ]
}
```

For podcast results, compute the download URL server-side:
```
result.url = `/subjects/${subjectId}/podcast/download/${result.pid}/${result.filename}`
```

For smartnotes results, compute:
```
result.url = `${config.url}/subjects/${subjectId}/smartnotes/${result.filename}`
```

**Step 3.2: Serve smartnotes PDFs from subject folder**

| File | Operation | Description |
|------|-----------|-------------|
| `backend/src/core/routes/subjects.ts` or `notes.ts` | Modify | Add `GET /subjects/:id/smartnotes/:filename` static file serve route |

Simple: validate subjectId, sanitize filename via `path.basename()`, read from `subjects/{id}/smartnotes/{filename}`, pipe to response with `Content-Type: application/pdf`.

### Phase 4: Frontend — Load + display persisted tools

**Step 4.1: Add API function**

| File | Operation | Description |
|------|-----------|-------------|
| `frontend/src/lib/api.ts` | Modify | Add `listTools(subjectId)` function |

```typescript
export type ToolRecord = {
  id: string;
  tool: "quiz" | "podcast" | "smartnotes";
  topic: string;
  config: { difficulty?: string; length?: string };
  createdAt: number;
  result: any;
};

export function listTools(subjectId: string) {
  return req<{ ok: true; tools: ToolRecord[] }>(
    `${env.backend}/subjects/${encodeURIComponent(subjectId)}/tools`
  );
}
```

**Step 4.2: Load tools on mount in ToolsPanel**

| File | Operation | Description |
|------|-----------|-------------|
| `frontend/src/components/Workspace/ToolsPanel.tsx` | Modify | On mount (when `subject.id` changes), fetch `listTools()` and populate `generated` Map with saved records |

```typescript
useEffect(() => {
  if (!subject) return;
  listTools(subject.id).then(res => {
    const map = new Map<string, GeneratedTool>();
    for (const t of res.tools) {
      map.set(t.id, {
        tool: t.tool,
        config: { topic: t.topic, length: (t.config.length || "medium") as any, sourceIds: [], ...t.config },
        status: "ready",
        result: t.tool === "quiz" ? t.result.questions.map((q: any) => ({ ...q, correct: Math.max(0, q.correct - 1) }))
               : t.tool === "podcast" ? { file: t.result.url, filename: t.result.filename }
               : { file: t.result.url },
        label: t.topic,
      });
    }
    setGenerated(prev => {
      // Merge: keep in-flight items, add saved items that aren't already present
      const merged = new Map(prev);
      for (const [k, v] of map) {
        if (!merged.has(k)) merged.set(k, v);
      }
      return merged;
    });
  }).catch(() => {});
}, [subject?.id]);
```

**Step 4.3: Show creation time in the generated list**

| File | Operation | Description |
|------|-----------|-------------|
| `frontend/src/components/Workspace/ToolsPanel.tsx` | Modify | Add `createdAt` to `GeneratedTool` type, display relative time in list items |

---

## Key Files

| File | Operation | Description |
|------|-----------|-------------|
| `backend/src/utils/subjects/subjects.ts` | Modify | Add `ToolRecord` type, `listTools`, `addTool`, `deleteTool` helpers |
| `backend/src/core/routes/quiz.ts` | Modify | Save quiz after generation |
| `backend/src/core/routes/podcast.ts` | Modify | Save podcast metadata after audio creation |
| `backend/src/core/routes/notes.ts` | Modify | Pass subjectId, save notes metadata |
| `backend/src/services/smartnotes/index.ts` | Modify | Output to `subjects/{id}/smartnotes/` instead of `storage/smartnotes/` |
| `backend/src/core/routes/subjects.ts` | Modify | Add `GET /subjects/:id/tools` + smartnotes file serve |
| `frontend/src/lib/api.ts` | Modify | Add `listTools()` + `ToolRecord` type |
| `frontend/src/components/Workspace/ToolsPanel.tsx` | Modify | Load saved tools on mount, merge with in-flight |

---

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| Large quiz arrays in SQLite (20 questions * many quizzes) | Cap at ~50 tool records per subject; old ones auto-pruned |
| SmartNotes PDF path change breaks existing PDFs in `storage/smartnotes/` | Old files stay; only new PDFs go to subject folder. No migration needed. |
| Race condition: two concurrent generations write to same tools array | Use the existing Keyv get→modify→set pattern; low risk since generations are sequential per user |
| Frontend Map merge: duplicate keys between saved and in-flight | Use tool record `id` as key (same UUID used for quizId/pid/noteId) — natural dedup |

---

## Notes

- Quiz questions are stored with 1-based `correct` index (backend convention). Frontend converts to 0-based on load.
- The `config` object in `ToolRecord` is intentionally minimal — just enough to show what was configured. The full `ToolConfig` (sourceIds, model) is not persisted to keep records small.
- Podcast audio files already persist on disk. This change just adds the metadata layer so they're discoverable.
- Subject deletion already removes the entire subject folder (`fs.rmSync(dir, { recursive: true })`), so podcast audio and smartnotes PDFs get cleaned up automatically. The Keyv key cleanup just needs `db.delete(`subject:${id}:tools`)` added.
