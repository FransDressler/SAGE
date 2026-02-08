# Implementation Plan: Collapsible Workspace Columns

## Task Type
- [x] Frontend

## Problem
The three-column workspace layout (`320px | 1fr | 380px`) has fixed widths. The tools column (380px) is too narrow for the mindmap and other visual tools. The chat column can't display wide tables properly. Users need the ability to collapse any column to give remaining columns more space.

## Technical Solution

Add a minimize/collapse button (minus icon) to the top-left corner of each column. When clicked:
1. The column collapses to a narrow vertical bar (~40px) showing the column name rotated vertically plus an expand button
2. The remaining open columns redistribute width equally using CSS grid `1fr` units
3. State persists in `localStorage` so collapsed columns stay collapsed on reload

### Grid Template Logic

| Sources | Chat | Tools | Grid Template |
|---------|------|-------|---------------|
| open | open | open | `1fr 1fr 1fr` |
| collapsed | open | open | `40px 1fr 1fr` |
| open | collapsed | open | `1fr 40px 1fr` |
| open | open | collapsed | `1fr 1fr 40px` |
| collapsed | collapsed | open | `40px 40px 1fr` |
| collapsed | open | collapsed | `1fr 40px 40px` (edge case — chat always visible) |
| open | collapsed | collapsed | `1fr 40px 40px` |

At least one column must remain open (prevent collapsing the last open column).

## Implementation Steps

### Step 1: Add collapse state to SubjectWorkspace

**File**: `frontend/src/pages/SubjectWorkspace.tsx`

- Add state: `const [collapsed, setCollapsed] = useState<Record<'sources'|'chat'|'tools', boolean>>({ sources: false, chat: false, tools: false })`
- Load/save to `localStorage` key `pagelm-collapsed-columns`
- Compute `gridTemplateCols` string from collapsed state
- Replace `md:grid-cols-[320px_1fr_380px]` with dynamic `style={{ gridTemplateColumns: gridTemplateCols }}`
- Pass `collapsed` and `onToggleCollapse` props to each panel
- Guard: prevent collapsing if only 1 column is open

### Step 2: Create CollapsedColumn component

**File**: `frontend/src/components/Workspace/CollapsedColumn.tsx` (new)

A thin vertical bar (40px wide) that appears when a column is collapsed:
- Full height, `bg-stone-950/50`, matching border style
- Column label rotated 90deg (vertical text): "Sources" / "Chat" / "Tools"
- Plus/expand icon button at top
- Clicking anywhere on the bar expands the column
- Smooth transition with CSS `transition-all duration-200`

### Step 3: Add collapse button to each panel

**Files**:
- `frontend/src/components/Workspace/SourcesPanel.tsx`
- `frontend/src/components/Workspace/ChatPanel.tsx`
- `frontend/src/components/Workspace/ToolsPanel.tsx`

Each panel gets:
- New optional props: `collapsed?: boolean`, `onToggleCollapse?: () => void`
- When `collapsed === true`, render `<CollapsedColumn />` instead of full panel content
- A small minus button (`−`) in the panel header (top-left area, before the title)
- Button style: `p-1 rounded hover:bg-stone-800 text-stone-500 hover:text-stone-300`

### Step 4: Add CSS transition

**File**: `frontend/src/index.css`

```css
.workspace-grid {
  transition: grid-template-columns 200ms ease;
}
```

### Step 5: Mobile — no changes

Mobile layout already uses tab-based switching. The collapse feature is desktop-only (`md:` breakpoint).

## Key Files

| File | Operation | Description |
|------|-----------|-------------|
| `frontend/src/pages/SubjectWorkspace.tsx` | Modify | Add collapsed state, dynamic grid, pass props |
| `frontend/src/components/Workspace/CollapsedColumn.tsx` | Create | Thin collapsed column placeholder bar |
| `frontend/src/components/Workspace/SourcesPanel.tsx` | Modify | Accept collapsed/toggle props, add minus button |
| `frontend/src/components/Workspace/ChatPanel.tsx` | Modify | Accept collapsed/toggle props, add minus button |
| `frontend/src/components/Workspace/ToolsPanel.tsx` | Modify | Accept collapsed/toggle props, add minus button |
| `frontend/src/index.css` | Modify | Add grid transition class |

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| ReactFlow (mindmap) may not resize properly when column expands | ReactFlow's `fitView` auto-adapts; `useReactFlow().fitView()` can be called on resize |
| Tables in chat still overflow even with more space | Already has `overflow-x-auto` wrapper — works correctly |
| All columns collapsed = blank screen | Guard: prevent collapsing last open column |
| Transition jank with grid-template-columns animation | Use `transition` on the grid container; modern browsers animate grid-template-columns smoothly |
