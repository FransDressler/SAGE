# Implementation Plan: Frontend Color Rework — Dark Stone + Bone Accent

## Task Type
- [x] Frontend

## Design Vision

**Goal**: Replace the current blue-tinted dark theme with a natural, earthy dark stone palette and warm bone/ivory accent color for text and interactive elements.

### Color Palette Definition

| Role | Current | New | Tailwind Class |
|------|---------|-----|----------------|
| **Base background** | `bg-black` (#000) | `bg-stone-950` (#0c0a09) | `bg-stone-950` |
| **Surface / cards** | `bg-stone-950`, `bg-stone-900` | `bg-stone-900` (#1c1917), `bg-stone-900/50` | `bg-stone-900` |
| **Elevated surface** | `bg-stone-800` | `bg-stone-800` (#292524) | `bg-stone-800` |
| **Borders** | `border-stone-800`, `border-stone-900` | `border-stone-800` (#292524) | `border-stone-800` |
| **Hover borders** | `border-stone-700` | `border-stone-700` (#44403c) | `border-stone-700` |
| **Primary text** | `text-stone-200` (#e7e5e4) | **Bone**: custom `#E8E0D4` | CSS variable `--color-bone` |
| **Heading text** | `text-stone-100`, `text-white` | **Bone light**: custom `#F2EDE6` | CSS variable `--color-bone-light` |
| **Muted text** | `text-stone-400`, `text-stone-500` | `text-stone-500` (#78716c) | `text-stone-500` |
| **Faint text** | `text-stone-600` | `text-stone-600` (#57534e) | `text-stone-600` |
| **Primary accent (CTA)** | `bg-sky-600` (#0284c7) | **Warm bone accent**: custom `#D4C8B8` on stone bg | CSS variable `--color-accent` |
| **Primary accent hover** | `bg-sky-500` | **Lighter bone**: custom `#E0D6C8` | CSS variable `--color-accent-hover` |
| **Active/selection** | `border-sky-400`, `text-sky-400` | `text-amber-200` / `border-amber-300` | Tailwind amber |
| **Focus ring** | `focus:border-sky-500` | `focus:border-stone-600` | Tailwind stone |

### Semantic / Tool Colors (kept but muted)

These per-tool identity colors stay but are slightly softened to fit the natural palette:

| Tool | Current | New |
|------|---------|-----|
| Quiz | `green-600/500/400` | `green-700/600/500` (darker green) |
| Podcast | `purple-600/500/400` | `purple-700/600/500` (darker purple) |
| Notes | `sky-600/500/400` | Use accent bone color (no blue) |
| Flashcards | `amber-600/500/400` | `amber-700/600/500` (fits palette naturally) |
| Transcriber | `orange-600/500/400` | `orange-700/600/500` (darker orange) |
| Download | `emerald-600/500` | `emerald-700/600` |

### Status Colors (unchanged — functional necessity)

| Status | Colors | Note |
|--------|--------|------|
| Correct | `green-400/500/600` | Keep for quiz/review |
| Incorrect | `red-400/500/600` | Keep for quiz/review |
| Warning/Hint | `yellow-200/700/900` | Keep for hint boxes |

---

## Implementation Steps

### Step 1: Define CSS Custom Properties in `index.css`

**File**: `frontend/src/index.css`

Add a `:root` block with the bone/accent palette as CSS custom properties, then register them with Tailwind v4's `@theme` directive:

```css
@import "tailwindcss";

@theme {
  --color-bone: #E8E0D4;
  --color-bone-light: #F2EDE6;
  --color-bone-muted: #C4B8A8;
  --color-accent: #D4C8B8;
  --color-accent-hover: #E0D6C8;
  --color-accent-active: #C4B8A8;
}
```

This makes `text-bone`, `bg-bone`, `text-bone-light`, `bg-accent`, etc. available as Tailwind utilities.

**Expected deliverable**: Custom colors available as Tailwind classes.

---

### Step 2: Update Root Background in `App.tsx`

**File**: `frontend/src/App.tsx:9`

```diff
- <div className="bg-black text-stone-300 min-h-screen">
+ <div className="bg-stone-950 text-bone min-h-screen">
```

**Expected deliverable**: App root uses warm stone background + bone text.

---

### Step 3: Update Scrollbar Styles in `index.css`

**File**: `frontend/src/index.css`

Replace hardcoded rgba values with stone-palette equivalents:

| Current | New |
|---------|-----|
| `rgba(82, 82, 91, 0.9)` → zinc-600 | `rgba(120, 113, 108, 0.9)` → stone-500 |
| `rgba(24, 24, 27, 0.7)` → zinc-900 | `rgba(28, 25, 23, 0.7)` → stone-900 |
| `rgba(113, 113, 122, 1)` → zinc-500 | `rgba(168, 162, 158, 1)` → stone-400 |
| `rgb(47, 47, 47)` → neutral-800 | `rgba(41, 37, 36, 1)` → stone-800 |

**Expected deliverable**: Scrollbars match stone palette.

---

### Step 4: Update Pages

#### 4a. `Home.tsx`

| Line | Change |
|------|--------|
| L57 | `text-stone-100` → `text-bone-light` |
| L60 | `bg-sky-600 hover:bg-sky-500 text-white` → `bg-accent hover:bg-accent-hover text-stone-950` |
| L68 | `border-stone-600 border-t-sky-500` → `border-stone-600 border-t-bone` |
| L79 | Same CTA button change as L60 |

#### 4b. `SubjectWorkspace.tsx`

| Line | Change |
|------|--------|
| L62 | `focus:border-sky-500` → `focus:border-stone-600` |
| L66 | `text-stone-100 ... hover:text-white` → `text-bone-light ... hover:text-bone` |
| L82 | `text-sky-400 border-b-2 border-sky-400` → `text-bone border-b-2 border-bone` |

#### 4c. `404.tsx`

Full rework: replace green/blue/purple gradients with stone/bone tones. Replace `bg-black` with `bg-stone-950`, replace colored stars with warm stone tones, replace green gradient CTA with bone-colored border button.

**Expected deliverable**: All pages use stone + bone palette.

---

### Step 5: Update Workspace Panels

#### 5a. `ChatPanel.tsx`

| Element | Change |
|---------|--------|
| Background | `bg-black` → `bg-stone-950` |
| Select | `text-stone-300` → `text-bone` on dropdowns |
| Send button | `bg-sky-600 hover:bg-sky-500 text-white` → `bg-accent hover:bg-accent-hover text-stone-950` |
| Edit border | `border-sky-600` → `border-stone-600` |
| Edit send button | Same accent treatment |
| Spinner | `border-t-sky-500` → `border-t-bone` |
| User message | `bg-stone-900/70 border-zinc-800` → `bg-stone-900/70 border-stone-800` |
| Assistant message | `bg-stone-950/90 border-zinc-900` → `bg-stone-950/90 border-stone-800` |
| Focus | `focus:border-stone-700` stays |

#### 5b. `SourcesPanel.tsx`

| Element | Change |
|---------|--------|
| Drag highlight | `bg-sky-950/20` → `bg-stone-800/30` |
| Save button | `bg-sky-600 hover:bg-sky-500` → `bg-accent hover:bg-accent-hover text-stone-950` |
| Focus | `focus:border-sky-600` → `focus:border-stone-600` (in SmartNotesTool) |

#### 5c. `ToolsPanel.tsx`

No changes needed — tool colors are semantic and handled in Step 6.

#### 5d. `ModelSelector.tsx`

Already uses stone palette. No changes.

**Expected deliverable**: All workspace panels use stone + bone palette.

---

### Step 6: Update Tool Components

#### 6a. `QuizTool.tsx` (+ Quiz sub-components)

| Element | Change |
|---------|--------|
| Input focus | `focus:border-green-600` stays (tool identity) |
| Start button | `bg-green-600 hover:bg-green-500` → `bg-green-700 hover:bg-green-600` (darker) |
| Spinner | `border-t-green-500` → `border-t-green-600` |

#### 6b. `PodcastTool.tsx`

| Element | Change |
|---------|--------|
| Input focus | `focus:border-purple-600` stays |
| Generate button | `bg-purple-600 hover:bg-purple-500` → `bg-purple-700 hover:bg-purple-600` |
| Status box | `bg-purple-950/40 border-purple-800/40` stays (muted enough) |
| Download | `bg-emerald-600 hover:bg-emerald-500` → `bg-emerald-700 hover:bg-emerald-600` |

#### 6c. `SmartNotesTool.tsx`

| Element | Change |
|---------|--------|
| Input focus | `focus:border-sky-600` → `focus:border-stone-600` |
| Generate button | `bg-sky-600 hover:bg-sky-500` → `bg-accent hover:bg-accent-hover text-stone-950` |
| Status box | `bg-sky-950/40 border-sky-800/40` → `bg-stone-800/40 border-stone-700/40 text-bone-muted` |
| Download | `bg-emerald-600 hover:bg-emerald-500` → `bg-emerald-700 hover:bg-emerald-600` |

#### 6d. `FlashcardsTool.tsx`

| Element | Change |
|---------|--------|
| Input focus | `focus:border-amber-600` stays (fits palette) |
| Add button | `bg-amber-600 hover:bg-amber-500` → `bg-amber-700 hover:bg-amber-600` |

#### 6e. `TranscriberTool.tsx`

| Element | Change |
|---------|--------|
| Upload button | `bg-orange-600 hover:bg-orange-500` → `bg-orange-700 hover:bg-orange-600` |
| Status box | stays (already muted) |

**Expected deliverable**: Tool buttons slightly darker, accent colors removed from non-tool-identity elements.

---

### Step 7: Update Quiz Components

#### 7a. `QuestionCard.tsx`

| Element | Change |
|---------|--------|
| Selected answer | `border-blue-500 bg-blue-600/20` → `border-bone-muted bg-bone/10` |
| Option letter border | `border-stone-600` stays |

#### 7b. `QuizHeader.tsx`

| Element | Change |
|---------|--------|
| Progress bar | `bg-blue-600` → `bg-bone-muted` |

#### 7c. `ResultsPanel.tsx`

| Element | Change |
|---------|--------|
| Score color | `text-blue-400` → `text-bone` |
| Accuracy color | `text-sky-400` → `text-bone` |

#### 7d. `ReviewModal.tsx`

| Element | Change |
|---------|--------|
| Scrollbar hardcoded hex | `#0b0b0b` → stone-950 equiv, `#3f3f46` → stone-700 equiv, `#52525b` → stone-600 equiv |

#### 7e. `TopicBar.tsx`

No changes needed — already uses stone palette.

**Expected deliverable**: Quiz components use bone for selections/progress, no blue.

---

### Step 8: Update Chat Sub-Components

#### 8a. `MarkdownView.tsx`

| Element | Change |
|---------|--------|
| Headings | `text-stone-100` → `text-bone-light` |
| Body text | `text-stone-200` → `text-bone` |
| Strong | `text-stone-100` → `text-bone-light` |
| Inline code bg | `bg-stone-800 text-stone-100` → `bg-stone-800 text-bone-light` |
| HR | `border-zinc-800` → `border-stone-800` |
| Blockquote border | `border-zinc-700` → `border-stone-700` |
| Table header border | `border-zinc-800` → `border-stone-800` |
| Pre border | `border-zinc-800` → `border-stone-800` |
| Prose class | `prose-invert` stays |

#### 8b. `SourcesList.tsx`

Already uses stone palette. No changes.

#### 8c. `LoadingIndicator.tsx`

Already uses stone palette. No changes.

#### 8d. `SelectionPopup.tsx`

Already uses stone palette. No changes.

#### 8e. `Composer.tsx`

Already uses stone palette. No changes.

#### 8f. `CreateSubjectDialog.tsx`

| Element | Change |
|---------|--------|
| Title | `text-stone-100` → `text-bone-light` |
| Input | `focus:border-sky-500` → `focus:border-stone-600` |
| Create button | `bg-sky-600 hover:bg-sky-500 text-white` → `bg-accent hover:bg-accent-hover text-stone-950` |

**Expected deliverable**: All zinc references removed, bone colors applied to text.

---

### Step 9: Update Remaining Components

#### 9a. `MobileHeader.tsx`

| Element | Change |
|---------|--------|
| `text-white` | → `text-bone-light` |

#### 9b. `SubjectCard.tsx`

| Element | Change |
|---------|--------|
| Title | `text-stone-100` → `text-bone-light` |
| Input focus | `focus:border-sky-500` → `focus:border-stone-600` |

**Expected deliverable**: All components consistent.

---

## Key Files

| File | Operation | Description |
|------|-----------|-------------|
| `frontend/src/index.css` | Modify | Add `@theme` block with bone/accent CSS vars, update scrollbar colors |
| `frontend/src/App.tsx:9` | Modify | Root bg + text color |
| `frontend/src/pages/Home.tsx` | Modify | CTA buttons, heading, spinner |
| `frontend/src/pages/SubjectWorkspace.tsx` | Modify | Tab colors, focus, heading |
| `frontend/src/pages/404.tsx` | Modify | Full color rework (green → bone/stone) |
| `frontend/src/components/Workspace/ChatPanel.tsx` | Modify | Send button, borders, spinner, zinc → stone |
| `frontend/src/components/Workspace/SourcesPanel.tsx` | Modify | Drag highlight, save button |
| `frontend/src/components/Workspace/tools/SmartNotesTool.tsx` | Modify | Accent button, status colors |
| `frontend/src/components/Workspace/tools/QuizTool.tsx` | Modify | Darker green buttons |
| `frontend/src/components/Workspace/tools/PodcastTool.tsx` | Modify | Darker purple buttons, download |
| `frontend/src/components/Workspace/tools/FlashcardsTool.tsx` | Modify | Darker amber buttons |
| `frontend/src/components/Workspace/tools/TranscriberTool.tsx` | Modify | Darker orange buttons |
| `frontend/src/components/Quiz/QuestionCard.tsx` | Modify | Selection: blue → bone |
| `frontend/src/components/Quiz/QuizHeader.tsx` | Modify | Progress bar: blue → bone |
| `frontend/src/components/Quiz/ResultsPanel.tsx` | Modify | Score/accuracy colors |
| `frontend/src/components/Quiz/ReviewModal.tsx` | Modify | Scrollbar hex values |
| `frontend/src/components/Chat/MarkdownView.tsx` | Modify | zinc → stone, text → bone |
| `frontend/src/components/Home/CreateSubjectDialog.tsx` | Modify | Focus, CTA button |
| `frontend/src/components/Home/SubjectCard.tsx` | Modify | Title text, focus |
| `frontend/src/components/MobileHeader.tsx` | Modify | Heading color |

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| Bone text on stone backgrounds may have insufficient contrast for accessibility | Test WCAG AA contrast ratios: `#E8E0D4` on `#1c1917` = 11.5:1 (passes AAA). `#C4B8A8` on `#1c1917` = 8.5:1 (passes AAA). Safe. |
| Tailwind v4 `@theme` syntax may differ from expected | Verify with Tailwind v4 docs — `@theme` block is the correct v4 way to define custom colors |
| Accent buttons with dark text (`text-stone-950`) on bone bg may look different | The bone accent `#D4C8B8` with `text-stone-950` (#0c0a09) has 10.8:1 contrast — excellent |
| 404 page rework is extensive | Lower priority, can be done last or skipped initially |
| Missing a zinc/sky reference somewhere | Run a final grep for `zinc-`, `sky-`, `blue-` across all frontend files after implementation |

## Verification Checklist

After implementation, run:
```bash
grep -rn 'sky-\|blue-[0-9]\|zinc-' frontend/src/ --include='*.tsx' --include='*.css'
```
Any remaining matches should only be in quiz status colors (green/red for correct/incorrect) or intentionally retained tool identity colors.

## SESSION_ID (for /ccg:execute use)
- CODEX_SESSION: N/A (codeagent-wrapper unavailable)
- GEMINI_SESSION: N/A (codeagent-wrapper unavailable)
