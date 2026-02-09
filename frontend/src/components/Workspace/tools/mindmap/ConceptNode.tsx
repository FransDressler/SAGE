import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

type ConceptData = {
  label: string;
  description: string;
  category: string;
  importance: "high" | "medium" | "low";
  sources: { file: string; page?: number }[];
  degree?: number;
  maxDegree?: number;
};

const CATEGORY_COLORS: Record<string, { border: string; text: string; bg: string }> = {
  theory:    { border: "border-blue-500/60",   text: "text-blue-400",   bg: "bg-blue-900/20" },
  person:    { border: "border-amber-500/60",  text: "text-amber-400",  bg: "bg-amber-900/20" },
  event:     { border: "border-rose-500/60",   text: "text-rose-400",   bg: "bg-rose-900/20" },
  term:      { border: "border-stone-500/60",  text: "text-stone-300",  bg: "bg-stone-800/30" },
  process:   { border: "border-green-500/60",  text: "text-green-400",  bg: "bg-green-900/20" },
  principle: { border: "border-purple-500/60", text: "text-purple-400", bg: "bg-purple-900/20" },
  method:    { border: "border-cyan-500/60",   text: "text-cyan-400",   bg: "bg-cyan-900/20" },
};

const SIZE_MAP: Record<string, string> = {
  high: "min-w-[160px]",
  medium: "min-w-[140px]",
  low: "min-w-[120px]",
};

function degreeScale(degree: number, maxDegree: number): number {
  if (!maxDegree || maxDegree <= 1) return 1;
  const ratio = degree / maxDegree;
  return 0.85 + ratio * 0.75;
}

function ConceptNode({ data }: NodeProps) {
  const [expanded, setExpanded] = useState(false);
  const d = data as unknown as ConceptData;
  const colors = CATEGORY_COLORS[d.category] || CATEGORY_COLORS.term;
  const size = SIZE_MAP[d.importance] || SIZE_MAP.medium;

  // Degree-based scaling: present in knowledge graph, absent in mindmap
  const hasDegree = d.degree != null && d.maxDegree != null;
  const scale = hasDegree ? degreeScale(d.degree!, d.maxDegree!) : 1;
  const isHub = hasDegree && scale > 1.3;

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-stone-600 !w-2 !h-2 !border-0" />
      <div
        onClick={() => setExpanded(!expanded)}
        style={hasDegree ? { transform: `scale(${scale})`, transformOrigin: "center center" } : undefined}
        className={`
          rounded-xl border-2 ${colors.border} ${colors.bg} backdrop-blur-sm
          px-3 py-2 cursor-pointer transition-all duration-200
          hover:brightness-125 hover:shadow-lg hover:shadow-stone-900/50
          ${size} max-w-[260px]
          ${expanded ? "ring-1 ring-stone-500/30" : ""}
          ${isHub ? "shadow-md shadow-stone-900/60" : ""}
        `}
      >
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${colors.text} shrink-0`}>
            {d.category.slice(0, 3)}
          </span>
          <span className={`font-semibold text-stone-200 truncate leading-tight ${isHub ? "text-sm" : "text-xs"}`}>
            {d.label}
          </span>
        </div>

        {expanded && (
          <div className="mt-2 space-y-1.5 animate-in fade-in duration-200">
            {d.description && (
              <p className="text-[11px] text-stone-400 leading-relaxed">{d.description}</p>
            )}
            {d.sources.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {d.sources.map((s, i) => (
                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-500">
                    {s.file}{s.page != null ? ` p.${s.page}` : ""}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-stone-600 !w-2 !h-2 !border-0" />
    </>
  );
}

export default memo(ConceptNode);
