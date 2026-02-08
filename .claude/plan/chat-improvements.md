# Implementation Plan: Chat Improvements (4 Issues)

## Task Type
- [x] Frontend
- [x] Backend
- [x] Fullstack (Parallel)

## Summary

Four changes:
1. **Bug Fix**: Chat input disappears when conversation gets long
2. **Custom System Prompt**: Editable per-subject prompt with learning-strategy defaults
3. **Markdown Rendering**: Already works for assistant messages; missing for user messages (minor)
4. **Formula Rendering**: KaTeX already configured and working

---

## Issue 1: Chat Input Disappears (Bug Fix)

### Root Cause Analysis

`ChatPanel.tsx:184` uses `h-full flex flex-col`. The parent chain is:
- `SubjectWorkspace.tsx:92` → `<div className="flex-1 overflow-hidden">`
- Desktop grid: `md:grid md:grid-cols-[280px_1fr_320px] h-full`

The **chat messages area** (`flex-1 overflow-y-auto`, line 215) and **composer** (`shrink-0`, line 323) are correctly structured. However, the issue is that `overflow-hidden` on the parent (line 92) combined with `h-full` on the grid (line 94) creates a proper constraint — but when many messages accumulate, `scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })` (line 102) can scroll the **entire panel** instead of just the messages container.

The `scrollRef` div is placed at the bottom of the messages container (line 319). The `scrollIntoView` with `block: "end"` can cause ancestor scrollable elements to scroll, pushing the composer below the viewport.

### Fix

**File**: `frontend/src/components/Workspace/ChatPanel.tsx`

Change line 102 auto-scroll to use the messages container's `scrollTop` instead of `scrollIntoView`:

```typescript
// Replace line 50:
const scrollRef = useRef<HTMLDivElement>(null);
// With:
const messagesRef = useRef<HTMLDivElement>(null);

// Replace lines 101-103:
useEffect(() => {
  setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
}, [messages.length, awaiting]);
// With:
useEffect(() => {
  const el = messagesRef.current;
  if (el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
}, [messages.length, awaiting]);

// Line 215 - add ref to messages container:
<div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll">

// Remove line 319:
<div ref={scrollRef} />
```

Also ensure the outer div has `min-h-0` to properly constrain flex children:

```tsx
// Line 185: add min-h-0
<div className="h-full flex flex-col bg-black min-h-0">
```

### Files Changed
| File | Operation | Description |
|------|-----------|-------------|
| `frontend/src/components/Workspace/ChatPanel.tsx:50,101-103,185,215,319` | Modify | Fix scroll behavior, add min-h-0 |

---

## Issue 2: Custom System Prompt per Subject

### Technical Solution

Add an optional `systemPrompt` field to the subject data model. Provide a default prompt with learning strategies. Allow editing via the frontend settings panel.

### Implementation Steps

#### Step 2.1: Extend SubjectMeta type (Backend)

**File**: `backend/src/utils/subjects/subjects.ts:8-13`

```typescript
export type SubjectMeta = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  systemPrompt?: string  // custom system prompt, empty = use default
}
```

#### Step 2.2: Add updateSubjectPrompt function (Backend)

**File**: `backend/src/utils/subjects/subjects.ts` — add new function:

```typescript
export async function updateSubjectPrompt(id: string, prompt: string): Promise<SubjectMeta | null> {
  const m = (await db.get(`subject:${id}`)) as SubjectMeta | undefined
  if (!m) return null
  m.systemPrompt = prompt
  m.updatedAt = Date.now()
  await db.set(`subject:${id}`, m)
  return m
}
```

#### Step 2.3: Add PATCH endpoint for prompt (Backend)

**File**: `backend/src/core/routes/subjects.ts` — after the existing PATCH handler (line 75), update it to also accept `systemPrompt`:

Modify the existing PATCH `/subjects/:id` to handle both `name` and `systemPrompt`:

```typescript
app.patch("/subjects/:id", async (req: any, res: any) => {
  try {
    if (!UUID_RE.test(req.params.id)) return res.status(400).send({ ok: false, error: "invalid id" })
    const name = req.body?.name !== undefined ? String(req.body.name).trim() : undefined
    const systemPrompt = req.body?.systemPrompt !== undefined ? String(req.body.systemPrompt) : undefined
    if (name === undefined && systemPrompt === undefined) {
      return res.status(400).send({ ok: false, error: "name or systemPrompt required" })
    }
    const subject = await getSubject(req.params.id)
    if (!subject) return res.status(404).send({ ok: false, error: "not found" })
    if (name !== undefined && name) {
      await renameSubject(req.params.id, name)
    }
    if (systemPrompt !== undefined) {
      await updateSubjectPrompt(req.params.id, systemPrompt)
    }
    const updated = await getSubject(req.params.id)
    res.send({ ok: true, subject: updated })
  } catch (e: any) {
    res.status(500).send({ ok: false, error: e?.message || "failed" })
  }
})
```

#### Step 2.4: Pass systemPrompt through chat pipeline (Backend)

**File**: `backend/src/core/routes/chat.ts`

After line 69 (`const ns = ...`), fetch the subject to get its custom prompt:

```typescript
import { getSubject } from "../../utils/subjects/subjects"

// After line 70:
const subject = await getSubject(subjectId)
const customPrompt = subject?.systemPrompt?.trim() || undefined
```

Then pass it to `handleAsk` at line 112:

```typescript
answer = await handleAsk({
  q,
  namespace: ns,
  history: relevantHistory,
  llmOverride,
  systemPrompt: customPrompt,  // NEW
});
```

**File**: `backend/src/lib/ai/ask.ts`

Update `handleAsk` signature (line 340-346) to accept `systemPrompt`:

```typescript
export async function handleAsk(
  q: string | { q: string; namespace?: string; history?: any[]; llmOverride?: LLM; systemPrompt?: string },
  ...
)
```

And at line 388, use it:

```typescript
systemPrompt: params.systemPrompt || BASE_SYSTEM_PROMPT,
```

#### Step 2.5: Export default prompt for frontend use

**File**: `backend/src/lib/ai/ask.ts` — `BASE_SYSTEM_PROMPT` is already exported.

Add a new route to retrieve the default prompt:

**File**: `backend/src/core/routes/subjects.ts` — in the GET `/subjects/:id` response, include the systemPrompt:

The current response already returns `{ ok: true, subject, sources }` — since `subject` now has `systemPrompt`, it's automatically included.

#### Step 2.6: Frontend API types (Frontend)

**File**: `frontend/src/lib/api.ts:5-11`

```typescript
export type Subject = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  sourceCount: number;
  systemPrompt?: string;  // NEW
};
```

Add `updateSubjectPrompt` API function:

```typescript
export function updateSubjectPrompt(id: string, systemPrompt: string) {
  return req<{ ok: true; subject: Subject }>(`${env.backend}/subjects/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify({ systemPrompt }),
  });
}
```

#### Step 2.7: Prompt Editor UI (Frontend)

Add a "System Prompt" section to the SourcesPanel (or as a modal/expandable section in the workspace). A textarea that shows the current prompt (or default placeholder), with a save button.

**File**: `frontend/src/components/Workspace/SourcesPanel.tsx` — add a collapsible prompt editor section at the bottom of the sources panel.

The default prompt text (displayed as placeholder when empty):

```
Du bist ein Lernassistent. Verwende folgende Strategien:

1. **Feynman-Technik**: Erkläre Konzepte so einfach, dass ein Kind sie verstehen könnte
2. **Aktives Erinnern**: Stelle Fragen statt nur Fakten zu nennen
3. **Analogien**: Verbinde neue Konzepte mit bekanntem Wissen
4. **Sokratische Methode**: Leite zum Verständnis statt Antworten zu geben
5. **Progressive Vertiefung**: Baue Wissen schichtweise auf
6. **Anti-Auswendiglernen**: Fördere Verständnis statt Auswendiglernen

Antworte in der Sprache der Frage. Verwende Markdown-Formatierung mit Überschriften, Listen, Tabellen und LaTeX-Formeln ($..$ inline, $$...$$ block) wenn passend.
```

### Files Changed
| File | Operation | Description |
|------|-----------|-------------|
| `backend/src/utils/subjects/subjects.ts:8-13` | Modify | Add `systemPrompt?` to SubjectMeta |
| `backend/src/utils/subjects/subjects.ts` (end) | Add | New `updateSubjectPrompt()` function |
| `backend/src/core/routes/subjects.ts:64-75` | Modify | Extend PATCH to handle systemPrompt |
| `backend/src/core/routes/subjects.ts` (imports) | Modify | Import `updateSubjectPrompt` |
| `backend/src/core/routes/chat.ts:70,112` | Modify | Fetch subject, pass systemPrompt to handleAsk |
| `backend/src/lib/ai/ask.ts:340-346,388` | Modify | Accept+use systemPrompt in handleAsk |
| `frontend/src/lib/api.ts:5-11` | Modify | Add systemPrompt to Subject type |
| `frontend/src/lib/api.ts` (new fn) | Add | `updateSubjectPrompt()` API call |
| `frontend/src/components/Workspace/SourcesPanel.tsx` | Modify | Add prompt editor section |
| `frontend/src/context/SubjectContext.tsx` | Modify | Expose subject.systemPrompt, add refreshSubject |

---

## Issue 3 & 4: Markdown + Formula Rendering

### Current State
- **Assistant messages**: Already use `<MarkdownView md={m.content} />` (line 228) with remarkGfm, remarkMath, rehypeKatex, rehypeHighlight. **Working correctly.**
- **User messages**: Render as plain text with `whitespace-pre-wrap` (line 270). This is **correct behavior** — user input should display as typed.
- **KaTeX CSS**: Loaded via CDN in `frontend/index.html:7`. **Working correctly.**

### No Changes Needed
The markdown and formula rendering is already fully functional for assistant responses. The MarkdownView component (line 228) handles:
- GitHub-Flavored Markdown (tables, strikethrough, etc.)
- Math formulas via `remark-math` + `rehype-katex`
- Code highlighting via `rehype-highlight`
- Custom styled components for headings, lists, tables, code blocks

**Verification**: The system prompt already instructs the LLM to output GitHub-Flavored Markdown with formulas. No changes needed here.

---

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| Existing subjects have no `systemPrompt` field | Field is optional (`systemPrompt?: string`); undefined = use default. Backward compatible. |
| Very large custom prompts | No limit needed — system prompt is just a string in the LLM call. Could add max-length validation later. |
| Scroll fix might break auto-scroll UX | Using `scrollTop = scrollHeight` is more reliable than `scrollIntoView` which affects ancestor containers |
| PATCH route now accepts two fields | Both optional, at least one required. Non-breaking change. |

---

## Implementation Order

1. **Bug fix** (Issue 1) — Frontend only, standalone
2. **Backend: SubjectMeta + routes** (Issue 2, Steps 2.1-2.5) — Backend only
3. **Backend: Chat pipeline** (Issue 2, Step 2.4) — Backend only
4. **Frontend: API + UI** (Issue 2, Steps 2.6-2.7) — Frontend only, depends on step 2-3
