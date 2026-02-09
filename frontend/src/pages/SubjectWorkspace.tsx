import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSubject } from "../context/SubjectContext";
import { renameSubject } from "../lib/api";
import SourcesPanel from "../components/Workspace/SourcesPanel";
import ChatPanel from "../components/Workspace/ChatPanel";
import ToolsPanel from "../components/Workspace/ToolsPanel";
import SubjectGraphColumn from "../components/Workspace/SubjectGraphColumn";

export type ToolChatContext = { tool: string; topic: string; content: string };

type MobileTab = "sources" | "chat" | "tools" | "graph";
type ColumnKey = "sources" | "chat" | "tools" | "graph";

const STORAGE_KEY = "pagelm-collapsed-columns";

function loadCollapsed(): Record<ColumnKey, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        typeof parsed === "object" && parsed !== null &&
        typeof parsed.sources === "boolean" &&
        typeof parsed.chat === "boolean" &&
        typeof parsed.tools === "boolean" &&
        Object.values(parsed).some((v: unknown) => !v)
      ) {
        return { ...parsed, graph: parsed.graph ?? true };
      }
    }
  } catch {}
  return { sources: false, chat: false, tools: false, graph: true };
}

function buildGridCols(collapsed: Record<ColumnKey, boolean>): string {
  const cols: string[] = [
    collapsed.sources ? "40px" : "minmax(0,1fr)",
    collapsed.chat ? "40px" : "minmax(0,1fr)",
    collapsed.tools ? "40px" : "minmax(0,1fr)",
    collapsed.graph ? "40px" : "minmax(0,1fr)",
  ];
  return cols.join(" ");
}

export default function SubjectWorkspace() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const { subject, loadSubject } = useSubject();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [collapsed, setCollapsed] = useState<Record<ColumnKey, boolean>>(loadCollapsed);
  const [toolChatContext, setToolChatContext] = useState<ToolChatContext | null>(null);

  const handleChatAboutTool = (ctx: ToolChatContext) => {
    // Ensure chat panel is open
    setCollapsed(prev => {
      if (prev.chat) {
        const next = { ...prev, chat: false };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      }
      return prev;
    });
    setMobileTab("chat");
    setToolChatContext(ctx);
  };

  const toggleCollapse = (col: ColumnKey) => {
    setCollapsed(prev => {
      const openCount = Object.values(prev).filter(v => !v).length;
      // Prevent collapsing the last open column
      if (!prev[col] && openCount <= 1) return prev;
      const next = { ...prev, [col]: !prev[col] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    if (subjectId) loadSubject(subjectId);
  }, [subjectId, loadSubject]);

  useEffect(() => {
    if (subject) setName(subject.name);
  }, [subject]);

  const handleRename = async () => {
    if (name.trim() && subject && name.trim() !== subject.name) {
      await renameSubject(subject.id, name.trim());
      await loadSubject(subject.id);
    }
    setEditing(false);
  };

  if (!subject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-2 border-stone-600 border-t-bone rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-stone-800 shrink-0">
        <button
          onClick={() => navigate("/")}
          className="p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") { setName(subject.name); setEditing(false); } }}
            className="bg-stone-800 border border-stone-700 rounded px-2 py-1 text-bone-light font-medium outline-none focus:border-stone-600"
          />
        ) : (
          <h1
            className="text-bone-light font-medium cursor-pointer hover:text-bone transition-colors"
            onClick={() => setEditing(true)}
          >
            {subject.name}
          </h1>
        )}
      </header>

      {/* Mobile tab switcher */}
      <div className="flex md:hidden border-b border-stone-800 shrink-0">
        {(["sources", "chat", "tools", "graph"] as MobileTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
              mobileTab === tab
                ? "text-bone border-b-2 border-bone"
                : "text-stone-500 hover:text-stone-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4-column layout (desktop) / single column (mobile) */}
      <div className="flex-1 overflow-hidden">
        {/* Desktop */}
        <div
          className="hidden md:grid h-full min-h-0 workspace-grid"
          style={{ gridTemplateColumns: buildGridCols(collapsed) }}
        >
          <SourcesPanel collapsed={collapsed.sources} onToggleCollapse={() => toggleCollapse("sources")} />
          <ChatPanel collapsed={collapsed.chat} onToggleCollapse={() => toggleCollapse("chat")} toolChatContext={toolChatContext} onToolChatConsumed={() => setToolChatContext(null)} />
          <ToolsPanel collapsed={collapsed.tools} onToggleCollapse={() => toggleCollapse("tools")} onChatAboutTool={handleChatAboutTool} />
          <SubjectGraphColumn collapsed={collapsed.graph} onToggleCollapse={() => toggleCollapse("graph")} onChatAbout={handleChatAboutTool} />
        </div>

        {/* Mobile */}
        <div className="md:hidden h-full">
          {mobileTab === "sources" && <SourcesPanel />}
          {mobileTab === "chat" && <ChatPanel toolChatContext={toolChatContext} onToolChatConsumed={() => setToolChatContext(null)} />}
          {mobileTab === "tools" && <ToolsPanel onChatAboutTool={handleChatAboutTool} />}
          {mobileTab === "graph" && <SubjectGraphColumn />}
        </div>
      </div>
    </div>
  );
}
