import { useState } from "react";
import type { RagSource } from "../../lib/api";

function typeBadge(sourceType?: string) {
  if (sourceType === "exercise") return { label: "EX", cls: "bg-amber-900/30 text-amber-400 border-amber-800" };
  if (sourceType === "websearch") return { label: "WEB", cls: "bg-blue-900/30 text-blue-400 border-blue-800" };
  return null;
}

export default function SourcesList({ sources }: { sources: RagSource[] }) {
  const [open, setOpen] = useState(false);

  if (!sources.length) return null;

  return (
    <div className="mt-1.5 ml-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-300 transition-colors"
      >
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <span>{sources.length} {sources.length === 1 ? "source" : "sources"} used</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {sources.map((s, i) => {
            if (!s?.sourceFile) return null;
            const badge = typeBadge(s.sourceType);
            return (
            <span
              key={s.sourceId || `${s.sourceFile}-${i}`}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md bg-stone-900 border text-xs text-stone-400 ${
                badge ? (s.sourceType === "exercise" ? "border-amber-800/50" : "border-blue-800/50") : "border-stone-800"
              }`}
            >
              {badge && (
                <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${badge.cls}`}>{badge.label}</span>
              )}
              <span className="font-medium text-stone-300 truncate max-w-[200px]">{s.sourceFile}</span>
              {s.pageNumber != null && <span className="text-stone-500">p.{s.pageNumber}</span>}
              {s.heading && <span className="text-stone-600 truncate max-w-[150px]">{s.heading}</span>}
            </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
