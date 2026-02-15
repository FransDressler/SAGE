import { useEffect, useRef, useState } from "react";
import type { Source, SourceType } from "../../lib/api";
import * as api from "../../lib/api";
import { useSubject } from "../../context/SubjectContext";
import MarkdownView from "../Chat/MarkdownView";

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

function isPdf(mime: string) {
  return mime.includes("pdf");
}

function isTextLike(mime: string) {
  return mime.includes("text") || mime.includes("markdown");
}

export default function SourceViewer({ source, page, onClose }: {
  source: Source;
  page?: number;
  onClose: () => void;
}) {
  const { subject } = useSubject();
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const pdf = isPdf(source.mimeType);
  const text = isTextLike(source.mimeType);
  const st = source.sourceType || "material";

  // For text/markdown files, fetch the content
  useEffect(() => {
    if (!subject || !text) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setTextContent(null);

    api.getSourceContentText(subject.id, source.id)
      .then(t => { if (!cancelled) setTextContent(t); })
      .catch(err => { if (!cancelled) setError(err?.message || "Failed to load content"); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [subject, source.id, text]);

  // Build the URL for PDF iframe (with optional page fragment)
  const contentUrl = subject
    ? api.getSourceContentUrl(subject.id, source.id) + (pdf && page ? `#page=${page}` : "")
    : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-stone-800 flex items-center gap-2 shrink-0">
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-stone-800 text-stone-500 hover:text-stone-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold shrink-0 ${iconBg(st)}`}>
          {fileIcon(source.mimeType, st)}
        </div>
        <span className="text-xs text-stone-200 font-medium truncate flex-1">{source.originalName}</span>
      </div>

      {/* Content */}
      {pdf && contentUrl && (
        <iframe
          src={contentUrl}
          className="flex-1 min-h-0 w-full border-0 bg-stone-900"
          title={source.originalName}
        />
      )}

      {text && (
        <div ref={contentRef} className="flex-1 min-h-0 overflow-y-auto custom-scroll px-4 py-3">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="w-5 h-5 border-2 border-stone-600 border-t-stone-300 rounded-full animate-spin" />
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <svg className="w-8 h-8 text-stone-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-xs text-stone-500">{error}</p>
            </div>
          )}
          {textContent != null && !loading && (
            <div className="text-sm">
              <MarkdownView md={textContent} />
            </div>
          )}
        </div>
      )}

      {!pdf && !text && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <svg className="w-10 h-10 text-stone-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-xs text-stone-500 mb-2">Preview not available for this file type</p>
          {contentUrl && (
            <a
              href={contentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Download file
            </a>
          )}
        </div>
      )}
    </div>
  );
}
