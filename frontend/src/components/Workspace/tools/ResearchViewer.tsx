import { useState, useEffect, useMemo } from "react";
import { fetchMarkdownContent } from "../../../lib/api";
import MarkdownView from "../../Chat/MarkdownView";

type Props = {
  filePath: string;
  topic: string;
  onClose: () => void;
  onChatAbout?: () => void;
};

type TocEntry = { level: number; text: string; id: string };

function extractToc(md: string): TocEntry[] {
  const entries: TocEntry[] = [];
  const lines = md.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/\*\*/g, "").trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      entries.push({ level, text, id });
    }
  }
  return entries;
}

export default function ResearchViewer({ filePath, topic, onClose, onChatAbout }: Props) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToc, setShowToc] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setMarkdown(null);
    setError(null);
    fetchMarkdownContent(filePath)
      .then(md => { if (!cancelled) setMarkdown(md); })
      .catch(e => { if (!cancelled) setError(e.message || "Failed to load research paper"); });
    return () => { cancelled = true; };
  }, [filePath]);

  const toc = useMemo(() => (markdown ? extractToc(markdown) : []), [markdown]);

  const handleDownload = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic || "research"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 bg-stone-900/90 backdrop-blur-sm border-b border-stone-800">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 rounded flex items-center justify-center bg-blue-900/30 text-blue-400 text-xs font-bold shrink-0">R</span>
          <h3 className="text-sm font-medium text-stone-200 truncate">{topic}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {toc.length > 0 && (
            <button
              onClick={() => setShowToc(v => !v)}
              className={`p-1.5 rounded-lg transition-colors ${showToc ? "bg-blue-900/30 text-blue-400" : "bg-stone-800/80 text-stone-400 hover:text-stone-200"}`}
              title="Table of Contents"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </button>
          )}
          <button
            onClick={handleDownload}
            disabled={!markdown}
            className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
          >
            Download
          </button>
          {onChatAbout && (
            <button onClick={onChatAbout} className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors" title="Chat about this">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content with optional TOC */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Table of Contents sidebar */}
        {showToc && toc.length > 0 && (
          <div className="w-56 shrink-0 border-r border-stone-800 overflow-y-auto custom-scroll p-3">
            <div className="text-[10px] font-medium text-stone-500 uppercase tracking-wider mb-2">Contents</div>
            <nav className="space-y-0.5">
              {toc.map((entry, i) => (
                <button
                  key={`${entry.id}-${i}`}
                  onClick={() => scrollToHeading(entry.id)}
                  className={`block w-full text-left text-xs truncate rounded px-2 py-1 hover:bg-stone-800/50 transition-colors ${
                    entry.level === 1
                      ? "text-stone-200 font-medium"
                      : entry.level === 2
                      ? "text-stone-400 pl-4"
                      : "text-stone-500 pl-6"
                  }`}
                  title={entry.text}
                >
                  {entry.text}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-y-auto custom-scroll px-6 py-4">
          {error && (
            <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400 text-sm">
              {error}
            </div>
          )}
          {!error && !markdown && (
            <div className="flex items-center justify-center h-32 text-stone-500 text-sm">
              Loading research paper...
            </div>
          )}
          {markdown && <MarkdownView md={markdown} />}
        </div>
      </div>
    </div>
  );
}
