# Plan: Rework Generated Study Tools List

## Requirements Restatement

The user wants to rework the **generated study tools list** (the "Generated" section in `ToolsPanel.tsx`, lines 266-326) so that each generated item:

1. **Left icon**: Uses the **same icon letter** as the big tool launcher cards (`Q`, `P`, `N`) with the same color styling — instead of the current checkmark/spinner/error icons
2. **Name**: Shows the **user's topic** (what they typed in the StudyToolModal) as the primary name — instead of the tool type label ("Quiz", "Podcast", "Notes")
3. **Subtitle**: Shows the **tool type** in small text below the name (e.g., "Quiz", "Podcast", "Notes") — this is currently where the topic/label appears
4. **Spinner**: Keep the circular loading animation while generating — the icon area shows the spinner during loading, then reverts to the letter icon when ready

## Current Behavior (lines 270-322 in ToolsPanel.tsx)

```
[checkmark/spinner/error] | "Quiz"         | →
                          | "topic text"   |
                          | "2h ago"       |
```

- Left: 6x6 rounded square with checkmark (ready), spinner (loading), or error icon
- Top text: Tool type label ("Quiz", "Podcast", "Notes") in tool color
- Bottom text: Topic label (ready), "Generating..." (loading), "Failed" (error)
- Timestamp below that

## Proposed New Layout

```
[Q/P/N or spinner] | "My Custom Topic"     | →
                    | Quiz · 2h ago         |
```

- **Left**: Same letter icon as `ToolCard.tsx` (`Q`, `P`, `N`) in same color/bg — during loading, show the spinner circle instead
- **Primary text**: User's topic (`gen.label` / `gen.config.topic`) — this is the main name
- **Secondary text**: Tool type label in smaller stone-500 text, with timestamp appended after a dot separator
- **Error state**: Red icon with `!` or error indicator, "Failed" as secondary text

## Files to Change

### 1. `frontend/src/components/Workspace/ToolsPanel.tsx`

Modify the generated items list (lines 266-326):

- **Icon area** (lines 286-300): Replace checkmark/error SVGs with the letter icon from `TOOL_STYLES`. Keep spinner for loading state.
- **Add TOOL_ICONS map**: `{ quiz: "Q", podcast: "P", smartnotes: "N" }` (or import from ToolCard)
- **Primary text** (line 304-305): Change from `TOOL_LABELS[gen.tool]` to `gen.label` (the topic)
- **Secondary text** (lines 307-312): Change from topic/Generating/Failed to tool type label + timestamp combined
- Keep the spinner animation during loading (line 290) — this is already correct

### No changes needed:
- `ToolCard.tsx` — the big launcher cards stay the same
- `StudyToolModal.tsx` — no changes needed

## Detailed Code Changes

### In `ToolsPanel.tsx`:

**Add icon map** (near line 36):
```ts
const TOOL_ICONS: Record<string, string> = {
  quiz: "Q",
  podcast: "P",
  smartnotes: "N",
};
```

**Rework icon area** (lines 286-300):
```tsx
<div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
  gen.status === "error" ? "bg-red-900/30" : style.bg
}`}>
  {gen.status === "loading" ? (
    <div className={`w-3.5 h-3.5 border-2 border-stone-600 ${style.spinner} rounded-full animate-spin`} />
  ) : gen.status === "error" ? (
    <span className="text-red-400 text-xs font-bold">!</span>
  ) : (
    <span className={`text-xs font-bold ${style.text}`}>{TOOL_ICONS[gen.tool]}</span>
  )}
</div>
```

**Rework text area** (lines 303-312):
```tsx
<div className="min-w-0 flex-1">
  <div className={`text-xs font-medium truncate ${
    gen.status === "ready" ? "text-stone-200" :
    gen.status === "loading" ? "text-stone-400" :
    "text-red-400"
  }`}>
    {gen.status === "loading" ? gen.config.topic || "Generating..." :
     gen.status === "error" ? gen.config.topic || "Failed" :
     gen.label}
  </div>
  <div className="text-[11px] text-stone-500 truncate">
    {gen.status === "loading" ? `${TOOL_LABELS[gen.tool]} · Generating...` :
     gen.status === "error" ? `${TOOL_LABELS[gen.tool]} · Failed` :
     gen.createdAt ? `${TOOL_LABELS[gen.tool]} · ${relativeTime(gen.createdAt)}` :
     TOOL_LABELS[gen.tool]}
  </div>
</div>
```

## Complexity: LOW
- Single file change (`ToolsPanel.tsx`)
- Purely visual rework, no logic changes
- No API or state changes needed

## Risks: NONE
- This is a visual-only change to the generated items list
- The tool launcher cards remain unchanged
- No data flow or generation logic is affected

**WAITING FOR CONFIRMATION**: Proceed with this plan?
