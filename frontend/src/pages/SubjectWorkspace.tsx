import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSubject } from "../context/SubjectContext";
import { renameSubject } from "../lib/api";
import SourcesPanel from "../components/Workspace/SourcesPanel";
import ChatPanel, { type ChatPanelHandle } from "../components/Workspace/ChatPanel";
import ToolsPanel, { type ToolsPanelHandle } from "../components/Workspace/ToolsPanel";
import SubjectGraphColumn from "../components/Workspace/SubjectGraphColumn";
import KeyboardShortcutsHelp from "../components/Workspace/KeyboardShortcutsHelp";
import CommandPalette from "../components/Workspace/CommandPalette";
import { useKeyboardShortcuts, type Shortcut } from "../hooks/useKeyboardShortcuts";

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
  const { subject, loadSubject, setActiveChatId, viewingSource, closeSource } = useSubject();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [collapsed, setCollapsed] = useState<Record<ColumnKey, boolean>>(loadCollapsed);
  const [toolChatContext, setToolChatContext] = useState<ToolChatContext | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const chatPanelRef = useRef<ChatPanelHandle>(null);
  const toolsPanelRef = useRef<ToolsPanelHandle>(null);
  const viewingSourceRef = useRef(viewingSource);
  viewingSourceRef.current = viewingSource;

  const isDesktop = useCallback(() => window.innerWidth >= 768, []);

  const shortcuts = useMemo<Shortcut[]>(() => [
    // Cmd+Shift+7/8/9/0 — toggle columns (desktop only)
    { key: "7", mod: true, shift: true, action: () => { if (isDesktop()) toggleCollapse("sources"); } },
    { key: "8", mod: true, shift: true, action: () => { if (isDesktop()) toggleCollapse("chat"); } },
    { key: "9", mod: true, shift: true, action: () => { if (isDesktop()) toggleCollapse("tools"); } },
    { key: "0", mod: true, shift: true, action: () => { if (isDesktop()) toggleCollapse("graph"); } },
    // Cmd+Shift+O — new chat
    { key: "o", mod: true, shift: true, action: () => chatPanelRef.current?.newChat() },
    // Cmd+K — toggle command palette
    { key: "k", mod: true, allowInInputs: true, action: () => setShowCommandPalette(v => !v) },
    // Cmd+Enter — send message
    { key: "Enter", mod: true, allowInInputs: true, action: () => chatPanelRef.current?.send() },
    // Escape — close source viewer or stop generating
    { key: "Escape", allowInInputs: true, action: () => { if (viewingSourceRef.current) closeSource(); else chatPanelRef.current?.stopGenerating(); } },
    // Cmd+H — show shortcuts help
    { key: "h", mod: true, action: () => setShowShortcuts(v => !v) },
  ], [isDesktop, toggleCollapse, closeSource]);

  useKeyboardShortcuts(shortcuts);

  const expandColumn = useCallback((col: ColumnKey) => {
    setCollapsed(prev => {
      if (!prev[col]) return prev;
      const next = { ...prev, [col]: false };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

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

  const toggleCollapse = useCallback((col: ColumnKey) => {
    setCollapsed(prev => {
      const openCount = Object.values(prev).filter(v => !v).length;
      // Prevent collapsing the last open column
      if (!prev[col] && openCount <= 1) return prev;
      const next = { ...prev, [col]: !prev[col] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Auto-expand sources column when a source is opened from chat/graph
  useEffect(() => {
    if (!viewingSource) return;
    if (isDesktop()) {
      expandColumn("sources");
    } else {
      setMobileTab("sources");
    }
  }, [viewingSource, isDesktop, expandColumn]);

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
        <button
          onClick={() => setShowShortcuts(true)}
          className="ml-auto hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-stone-600 hover:text-stone-400 hover:bg-stone-800/50 transition-colors"
          title="Keyboard shortcuts"
        >
          <kbd className="text-[10px] font-mono bg-stone-800 border border-stone-700 rounded px-1 py-0.5">⌘H</kbd>
          <span className="text-[10px]">Help</span>
        </button>
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
          <ChatPanel ref={chatPanelRef} collapsed={collapsed.chat} onToggleCollapse={() => toggleCollapse("chat")} toolChatContext={toolChatContext} onToolChatConsumed={() => setToolChatContext(null)} />
          <ToolsPanel ref={toolsPanelRef} collapsed={collapsed.tools} onToggleCollapse={() => toggleCollapse("tools")} onChatAboutTool={handleChatAboutTool} />
          <SubjectGraphColumn collapsed={collapsed.graph} onToggleCollapse={() => toggleCollapse("graph")} onChatAbout={handleChatAboutTool} />
        </div>

        {/* Mobile */}
        <div className="md:hidden h-full">
          {mobileTab === "sources" && <SourcesPanel />}
          {mobileTab === "chat" && <ChatPanel ref={chatPanelRef} toolChatContext={toolChatContext} onToolChatConsumed={() => setToolChatContext(null)} />}
          {mobileTab === "tools" && <ToolsPanel ref={toolsPanelRef} onChatAboutTool={handleChatAboutTool} />}
          {mobileTab === "graph" && <SubjectGraphColumn />}
        </div>
      </div>

      {showShortcuts && <KeyboardShortcutsHelp onClose={() => setShowShortcuts(false)} />}
      {showCommandPalette && (
        <CommandPalette
          onClose={() => setShowCommandPalette(false)}
          onNewChat={() => {
            expandColumn("chat");
            chatPanelRef.current?.newChat();
          }}
          onSelectChat={(chatId) => {
            expandColumn("chat");
            setActiveChatId(chatId);
          }}
          onSelectSource={() => {
            expandColumn("sources");
          }}
          onSelectTool={(toolId) => {
            expandColumn("tools");
            setTimeout(() => toolsPanelRef.current?.openTool(toolId), 50);
          }}
        />
      )}
    </div>
  );
}
