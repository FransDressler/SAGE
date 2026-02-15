import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSubject } from "../../context/SubjectContext";
import { listTools, type ToolRecord } from "../../lib/api";

type Props = {
  onClose: () => void;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onSelectSource: (sourceId: string) => void;
  onSelectTool: (toolId: string) => void;
};

type ResultItem =
  | { kind: "action"; id: "new-chat"; label: string }
  | { kind: "chat"; id: string; title: string; at?: number }
  | { kind: "tool"; id: string; tool: string; topic: string; createdAt: number }
  | { kind: "source"; id: string; name: string; sourceType: string };

const TOOL_LABELS: Record<string, string> = {
  quiz: "Quiz",
  podcast: "Podcast",
  smartnotes: "Notes",
  mindmap: "Mind Map",
  exam: "Exam",
  research: "Research",
};

const TOOL_LETTERS: Record<string, string> = {
  quiz: "Q",
  podcast: "P",
  smartnotes: "N",
  mindmap: "M",
  exam: "E",
  research: "R",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function sourceTypeBadge(type: string): string {
  if (type === "exercise") return "Exercise";
  if (type === "websearch") return "Web";
  return "Material";
}

export default function CommandPalette({ onClose, onSelectChat, onNewChat, onSelectSource, onSelectTool }: Props) {
  const { subject, chats, sources } = useSubject();
  const [query, setQuery] = useState("");
  const [tools, setTools] = useState<ToolRecord[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Load tools on mount
  useEffect(() => {
    if (!subject) return;
    listTools(subject.id).then(r => setTools(r.tools)).catch(() => {});
  }, [subject]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const q = query.toLowerCase().trim();

  const items = useMemo<ResultItem[]>(() => {
    const result: ResultItem[] = [];

    // Always include "New Chat" action
    result.push({ kind: "action", id: "new-chat", label: "New Chat" });

    // Filter chats
    const filteredChats = chats.filter(c => {
      if (!q) return true;
      return (c.title || "Untitled chat").toLowerCase().includes(q);
    });
    // Sort by most recent first
    const sortedChats = [...filteredChats].sort((a, b) => (b.at ?? 0) - (a.at ?? 0));
    for (const c of sortedChats) {
      result.push({ kind: "chat", id: c.id, title: c.title || "Untitled chat", at: c.at });
    }

    // Filter tools
    const filteredTools = tools.filter(t => {
      if (!q) return true;
      const label = TOOL_LABELS[t.tool] || t.tool;
      return t.topic.toLowerCase().includes(q) || label.toLowerCase().includes(q);
    });
    const sortedTools = [...filteredTools].sort((a, b) => b.createdAt - a.createdAt);
    for (const t of sortedTools) {
      result.push({ kind: "tool", id: t.id, tool: t.tool, topic: t.topic, createdAt: t.createdAt });
    }

    // Filter sources
    const filteredSources = sources.filter(s => {
      if (!q) return true;
      return s.originalName.toLowerCase().includes(q);
    });
    for (const s of filteredSources) {
      result.push({ kind: "source", id: s.id, name: s.originalName, sourceType: s.sourceType });
    }

    return result;
  }, [q, chats, tools, sources]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [items.length, q]);

  const activate = useCallback((item: ResultItem) => {
    switch (item.kind) {
      case "action":
        onNewChat();
        break;
      case "chat":
        onSelectChat(item.id);
        break;
      case "tool":
        onSelectTool(item.id);
        break;
      case "source":
        onSelectSource(item.id);
        break;
    }
    onClose();
  }, [onClose, onNewChat, onSelectChat, onSelectTool, onSelectSource]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, items.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (items[activeIndex]) activate(items[activeIndex]);
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [items, activeIndex, activate, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    const el = container.querySelector(`[data-index="${activeIndex}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Group items for rendering with section headers
  const sections = useMemo(() => {
    const groups: { label: string; items: { item: ResultItem; globalIndex: number }[] }[] = [];
    let idx = 0;

    // Actions
    const actions = items.filter(i => i.kind === "action");
    if (actions.length) {
      groups.push({ label: "", items: actions.map(item => ({ item, globalIndex: idx++ })) });
    }

    // Chats
    const chatItems = items.filter(i => i.kind === "chat");
    if (chatItems.length) {
      groups.push({ label: "Chats", items: chatItems.map(item => ({ item, globalIndex: idx++ })) });
    }

    // Tools
    const toolItems = items.filter(i => i.kind === "tool");
    if (toolItems.length) {
      groups.push({ label: "Tools", items: toolItems.map(item => ({ item, globalIndex: idx++ })) });
    }

    // Sources
    const sourceItems = items.filter(i => i.kind === "source");
    if (sourceItems.length) {
      groups.push({ label: "Sources", items: sourceItems.map(item => ({ item, globalIndex: idx++ })) });
    }

    return groups;
  }, [items]);

  const hasResults = items.length > 1; // > 1 because "New Chat" is always present

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-800">
          <svg className="w-4 h-4 text-stone-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search chats, tools, sources..."
            className="flex-1 bg-transparent text-bone-light text-sm placeholder:text-stone-600 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 h-5 bg-stone-800 border border-stone-700 rounded text-[10px] text-stone-500 font-mono">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto custom-scroll py-1">
          {sections.map((section, si) => (
            <div key={si}>
              {section.label && (
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">{section.label}</span>
                </div>
              )}
              {section.items.map(({ item, globalIndex }) => (
                <button
                  key={item.id}
                  data-index={globalIndex}
                  onClick={() => activate(item)}
                  onMouseEnter={() => setActiveIndex(globalIndex)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                    globalIndex === activeIndex ? "bg-stone-800" : "hover:bg-stone-800/50"
                  }`}
                >
                  {renderItem(item)}
                </button>
              ))}
            </div>
          ))}

          {!hasResults && q && (
            <div className="px-4 py-6 text-center text-stone-500 text-sm">
              No results for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderItem(item: ResultItem) {
  switch (item.kind) {
    case "action":
      return (
        <>
          <span className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </span>
          <span className="text-sm text-bone-light font-medium">{item.label}</span>
        </>
      );
    case "chat":
      return (
        <>
          <span className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <span className="text-sm text-bone-light truncate block">{item.title}</span>
          </div>
          {item.at && (
            <span className="text-[11px] text-stone-500 shrink-0">{timeAgo(item.at)}</span>
          )}
        </>
      );
    case "tool":
      return (
        <>
          <span className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-[11px] font-bold text-stone-400 shrink-0">
            {TOOL_LETTERS[item.tool] || "T"}
          </span>
          <div className="flex-1 min-w-0">
            <span className="text-sm text-bone-light truncate block">{item.topic}</span>
            <span className="text-[11px] text-stone-500">{TOOL_LABELS[item.tool] || item.tool}</span>
          </div>
          <span className="text-[11px] text-stone-500 shrink-0">{timeAgo(item.createdAt)}</span>
        </>
      );
    case "source":
      return (
        <>
          <span className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <span className="text-sm text-bone-light truncate block">{item.name}</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-500 shrink-0">
            {sourceTypeBadge(item.sourceType)}
          </span>
        </>
      );
  }
}
