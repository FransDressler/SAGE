import { useEffect, useRef, useState } from "react";
import { useSubject } from "../../context/SubjectContext";
import type { SourceType, WebSearchEvent } from "../../lib/api";
import * as api from "../../lib/api";
import CollapsedColumn from "./CollapsedColumn";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mime: string, sourceType: SourceType) {
  if (sourceType === "exercise") return "EX";
  if (sourceType === "websearch") return "WEB";
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("word") || mime.includes("document")) return "DOC";
  if (mime.includes("text")) return "TXT";
  if (mime.includes("markdown")) return "MD";
  return "FILE";
}

function iconBg(sourceType: SourceType) {
  if (sourceType === "exercise") return "bg-amber-900/40 text-amber-400";
  if (sourceType === "websearch") return "bg-blue-900/40 text-blue-400";
  return "bg-stone-800 text-stone-400";
}

function rowBorder(sourceType: SourceType) {
  if (sourceType === "exercise") return "border-l-2 border-l-amber-600";
  if (sourceType === "websearch") return "border-l-2 border-l-blue-600";
  return "";
}

type FilterTab = "all" | SourceType;
type SearchResult = { title: string; url: string; content: string };

const DEFAULT_PROMPT_PLACEHOLDER = `Du bist ein Lernassistent. Verwende folgende Strategien:

1. **Feynman-Technik**: Erkläre Konzepte so einfach, dass ein Kind sie verstehen könnte
2. **Aktives Erinnern**: Stelle Fragen statt nur Fakten zu nennen
3. **Analogien**: Verbinde neue Konzepte mit bekanntem Wissen
4. **Sokratische Methode**: Leite zum Verständnis statt Antworten zu geben
5. **Progressive Vertiefung**: Baue Wissen schichtweise auf
6. **Anti-Auswendiglernen**: Fördere Verständnis statt Auswendiglernen

Antworte in der Sprache der Frage. Verwende Markdown-Formatierung mit Überschriften, Listen, Tabellen und LaTeX-Formeln ($..$ inline, $$...$$ block) wenn passend.`;

export default function SourcesPanel({ collapsed, onToggleCollapse }: { collapsed?: boolean; onToggleCollapse?: () => void }) {
  const { subject, sources, uploadSources, removeSource, updateSystemPrompt, refreshSources } = useSubject();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [saving, setSaving] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [panelView, setPanelView] = useState<"list" | "websearch">("list");
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadTypeRef = useRef<SourceType>("material");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Web search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"quick" | "deep">("quick");
  const [searching, setSearching] = useState(false);
  const [searchPhase, setSearchPhase] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState("");
  const [searchDone, setSearchDone] = useState(false);
  const wsRef = useRef<{ close: () => void } | null>(null);

  useEffect(() => {
    setPromptText(subject?.systemPrompt || "");
    setFilter("all");
    setPanelView("list");
  }, [subject?.id]);

  // Clean up websocket on unmount
  useEffect(() => () => { wsRef.current?.close(); }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const handleFiles = async (files: FileList | File[], sourceType: SourceType = "material") => {
    const arr = Array.from(files);
    if (!arr.length) return;
    setUploading(true);
    setUploadError(null);
    try {
      const warnings = await uploadSources(arr, sourceType);
      if (warnings?.length) {
        setUploadError(warnings.join("\n"));
        setTimeout(() => setUploadError(null), 8000);
      }
    } catch (e: any) {
      const msg = e instanceof Error ? e.message : String(e);
      setUploadError(msg);
      setTimeout(() => setUploadError(null), 8000);
    } finally {
      setUploading(false);
    }
  };

  const openFilePicker = (type: SourceType) => {
    uploadTypeRef.current = type;
    setDropdownOpen(false);
    inputRef.current?.click();
  };

  const startWebSearch = async () => {
    if (!subject || !searchQuery.trim() || searching) return;
    setSearching(true);
    setSearchPhase("Starting search...");
    setSearchResults([]);
    setSearchError("");
    setSearchDone(false);

    try {
      const { jobId } = await api.webSearchStart(subject.id, searchQuery.trim(), searchMode);
      const conn = api.connectWebSearchStream(jobId, (evt: WebSearchEvent) => {
        switch (evt.type) {
          case "phase":
            setSearchPhase(evt.value);
            break;
          case "result":
            setSearchResults(prev => [...prev, evt.result]);
            break;
          case "done":
            setSearchDone(true);
            setSearching(false);
            setSearchPhase("");
            refreshSources();
            conn.close();
            break;
          case "error":
            setSearchError(evt.error);
            setSearching(false);
            setSearchPhase("");
            conn.close();
            break;
        }
      });
      wsRef.current = conn;
    } catch (e: any) {
      setSearchError(e?.message || "Failed to start web search");
      setSearching(false);
      setSearchPhase("");
    }
  };

  // Compute type counts for filter tabs
  const typeCounts = sources.reduce<Record<string, number>>((acc, s) => {
    const t = s.sourceType || "material";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  const uniqueTypes = Object.keys(typeCounts);
  const showFilters = uniqueTypes.length > 1;

  const filteredSources = filter === "all" ? sources : sources.filter(s => (s.sourceType || "material") === filter);

  if (collapsed && onToggleCollapse) return <CollapsedColumn label="Sources" side="left" onExpand={onToggleCollapse} />;

  // --- Web Search View ---
  if (panelView === "websearch") {
    return (
      <div className="h-full flex flex-col border-r border-stone-800 bg-stone-950/50">
        {/* Header with back button */}
        <div className="px-4 py-3 border-b border-stone-800 flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setPanelView("list");
              wsRef.current?.close();
              setSearching(false);
            }}
            className="p-1 rounded hover:bg-stone-800 text-stone-500 hover:text-stone-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wider">Web Search</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Search input */}
          <div className="space-y-2">
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") startWebSearch(); }}
              placeholder="Search topic..."
              disabled={searching}
              autoFocus
              className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder:text-stone-600 outline-none focus:border-blue-700 disabled:opacity-50"
            />

            {/* Mode toggle */}
            <div className="flex gap-1.5">
              <button
                onClick={() => setSearchMode("quick")}
                disabled={searching}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  searchMode === "quick"
                    ? "bg-blue-900/30 border border-blue-700 text-blue-300"
                    : "bg-stone-900 border border-stone-800 text-stone-500 hover:text-stone-300"
                }`}
              >
                Quick Search
              </button>
              <button
                onClick={() => setSearchMode("deep")}
                disabled={searching}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  searchMode === "deep"
                    ? "bg-blue-900/30 border border-blue-700 text-blue-300"
                    : "bg-stone-900 border border-stone-800 text-stone-500 hover:text-stone-300"
                }`}
              >
                Deep Research
              </button>
            </div>
            <p className="text-[10px] text-stone-600">
              {searchMode === "quick" ? "Fast search, ~5 results" : "Thorough research, ~15 results"}
            </p>

            <button
              onClick={startWebSearch}
              disabled={searching || !searchQuery.trim()}
              className="w-full py-2 rounded-lg text-xs font-medium bg-blue-700 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Progress */}
          {searching && searchPhase && (
            <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-blue-900/10 border border-blue-900/30">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
              <span className="text-xs text-blue-400">{searchPhase}</span>
            </div>
          )}

          {/* Error */}
          {searchError && (
            <div className="px-3 py-2 rounded-lg bg-red-900/20 border border-red-900/30 text-xs text-red-400">
              {searchError}
            </div>
          )}

          {/* Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-stone-500 uppercase tracking-wider">
                {searchDone ? `${searchResults.length} results added as source` : `${searchResults.length} results found`}
              </p>
              {searchResults.map((r, i) => {
                let domain = "";
                try { domain = new URL(r.url).hostname.replace(/^www\./, ""); } catch { domain = r.url; }
                return (
                  <div key={i} className="p-2 rounded-lg bg-stone-900/50 border border-stone-800 space-y-1">
                    <p className="text-xs font-medium text-stone-200 line-clamp-1">{r.title}</p>
                    <p className="text-[10px] text-blue-400">{domain}</p>
                    <p className="text-[10px] text-stone-500 line-clamp-2">{r.content.slice(0, 200)}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Done */}
          {searchDone && (
            <button
              onClick={() => setPanelView("list")}
              className="w-full py-2 rounded-lg text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            >
              Back to Sources
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- Normal Sources List View ---
  return (
    <div className="h-full flex flex-col border-r border-stone-800 bg-stone-950/50">
      <div className="px-4 py-3 border-b border-stone-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          {onToggleCollapse && (
            <button onClick={onToggleCollapse} className="p-1 rounded hover:bg-stone-800 text-stone-500 hover:text-stone-300 transition-colors" aria-label="Collapse Sources" title="Collapse Sources">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
            </button>
          )}
          <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wider">Sources</h2>
        </div>

        {/* Dropdown Add Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            disabled={uploading}
            className="text-xs px-2.5 py-1 bg-stone-800 hover:bg-stone-700 rounded-md text-stone-300 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            {uploading ? "Uploading..." : "+ Add"}
            <svg className={`w-3 h-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-stone-900 border border-stone-700 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
              <button
                onClick={() => openFilePicker("material")}
                className="w-full text-left px-3 py-2 text-xs text-stone-300 hover:bg-stone-800 transition-colors flex items-center gap-2"
              >
                <span className="w-5 h-5 rounded bg-stone-800 flex items-center justify-center text-[9px] font-bold text-stone-400 shrink-0">FILE</span>
                Material
              </button>
              <button
                onClick={() => openFilePicker("exercise")}
                className="w-full text-left px-3 py-2 text-xs text-stone-300 hover:bg-stone-800 transition-colors flex items-center gap-2"
              >
                <span className="w-5 h-5 rounded bg-amber-900/40 flex items-center justify-center text-[9px] font-bold text-amber-400 shrink-0">EX</span>
                Exercise
              </button>
              <div className="border-t border-stone-800 my-0.5" />
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setSearchQuery("");
                  setSearchResults([]);
                  setSearchError("");
                  setSearchDone(false);
                  setPanelView("websearch");
                }}
                className="w-full text-left px-3 py-2 text-xs text-stone-300 hover:bg-stone-800 transition-colors flex items-center gap-2"
              >
                <span className="w-5 h-5 rounded bg-blue-900/40 flex items-center justify-center text-[9px] font-bold text-blue-400 shrink-0">WEB</span>
                Web Search
              </button>
            </div>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.md,.docx,.odt"
        onChange={e => {
          if (e.target.files) handleFiles(e.target.files, uploadTypeRef.current);
          e.target.value = "";
        }}
        className="hidden"
      />

      {/* Upload error/warning */}
      {uploadError && (
        <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-red-900/30 border border-red-800/40 text-xs text-red-300 whitespace-pre-line">
          {uploadError}
          <button onClick={() => setUploadError(null)} className="ml-2 text-red-500 hover:text-red-300">dismiss</button>
        </div>
      )}

      {/* Filter Tabs */}
      {showFilters && (
        <div className="px-3 pt-2 pb-1 flex gap-1 overflow-x-auto shrink-0">
          {[
            { key: "all" as FilterTab, label: "All", count: sources.length },
            ...uniqueTypes.map(t => ({
              key: t as FilterTab,
              label: t === "material" ? "Material" : t === "exercise" ? "Exercise" : "Web",
              count: typeCounts[t],
            })),
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                filter === tab.key
                  ? "bg-stone-800 text-stone-200"
                  : "text-stone-500 hover:text-stone-300 hover:bg-stone-800/50"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      )}

      <div
        className={`flex-1 overflow-y-auto p-3 space-y-2 ${dragOver ? "bg-stone-800/30" : ""}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
      >
        {sources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-stone-600 text-sm">
            <svg className="w-10 h-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p>No sources yet</p>
            <p className="text-xs mt-1">Drop files here or click + Add</p>
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-stone-600 text-sm">
            <p>No {filter} sources</p>
          </div>
        ) : (
          filteredSources.map(s => {
            const st = s.sourceType || "material";
            return (
              <div key={s.id} className={`flex items-center gap-2 p-2 rounded-lg bg-stone-900/50 border border-stone-800 group hover:border-stone-700 transition-colors ${rowBorder(st)}`}>
                <div className={`w-9 h-9 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${iconBg(st)}`}>
                  {fileIcon(s.mimeType, st)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-200 truncate">{s.originalName}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-stone-500">{formatSize(s.size)}</span>
                    {st === "exercise" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-900/30 text-amber-400 font-medium">Exercise</span>
                    )}
                    {st === "websearch" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-900/30 text-blue-400 font-medium">Web</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeSource(s.id)}
                  className="text-stone-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* System Prompt Editor */}
      <div className="border-t border-stone-800 shrink-0">
        <button
          onClick={() => setPromptOpen(o => !o)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-stone-400 hover:text-stone-300 transition-colors"
        >
          <span className="uppercase tracking-wider font-medium">System Prompt</span>
          <svg className={`w-3.5 h-3.5 transition-transform ${promptOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {promptOpen && (
          <div className="px-3 pb-3 space-y-2">
            <textarea
              value={promptText}
              onChange={e => setPromptText(e.target.value)}
              disabled={saving}
              placeholder={DEFAULT_PROMPT_PLACEHOLDER}
              rows={6}
              className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-300 placeholder:text-stone-600 outline-none focus:border-stone-700 resize-y min-h-[80px] max-h-[200px] disabled:opacity-50"
            />
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-stone-600">
                {promptText.trim() ? "Custom prompt active" : "Using default prompt"}
              </p>
              <div className="flex gap-1.5">
                {promptText.trim() && (
                  <button
                    onClick={() => setPromptText("")}
                    className="text-[10px] px-2 py-1 text-stone-500 hover:text-stone-300 transition-colors"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={async () => {
                    setSaving(true);
                    try {
                      await updateSystemPrompt(promptText);
                    } catch (e) {
                      console.error("Failed to save prompt:", e);
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="text-[10px] px-2.5 py-1 bg-accent hover:bg-accent-hover disabled:opacity-50 text-stone-950 rounded-md transition-colors"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
