import { useState, useEffect } from "react";
import { fetchMarkdownContent } from "../../../lib/api";
import MarkdownView from "../../Chat/MarkdownView";

type Props = {
  filePath: string;
  topic: string;
  onClose: () => void;
};

export default function NotesViewer({ filePath, topic, onClose }: Props) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPdf = filePath.endsWith(".pdf");

  useEffect(() => {
    if (isPdf) return;
    fetchMarkdownContent(filePath)
      .then(setMarkdown)
      .catch(e => setError(e.message || "Failed to load notes"));
  }, [filePath, isPdf]);

  const handleDownload = () => {
    if (isPdf) {
      window.open(filePath, "_blank");
      return;
    }
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic || "notes"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Backward compat: old PDF files get a simple download link
  if (isPdf) {
    return (
      <div className="relative h-full flex flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 bg-stone-900/90 backdrop-blur-sm border-b border-stone-800">
          <h3 className="text-sm font-medium text-stone-200 truncate">{topic}</h3>
          <div className="flex items-center gap-2">
            <a
              href={filePath}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium transition-colors"
            >
              Download PDF
            </a>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-stone-500 text-sm">
          PDF notes (legacy) — download to view
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 bg-stone-900/90 backdrop-blur-sm border-b border-stone-800">
        <h3 className="text-sm font-medium text-stone-200 truncate">{topic}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={!markdown}
            className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
          >
            Download .md
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scroll px-6 py-4">
        {error && (
          <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400 text-sm">
            {error}
          </div>
        )}
        {!error && !markdown && (
          <div className="flex items-center justify-center h-32 text-stone-500 text-sm">
            Loading notes...
          </div>
        )}
        {markdown && <MarkdownView md={markdown} />}
      </div>
    </div>
  );
}
