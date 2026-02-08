import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Source, SourceType } from "../../lib/api";
import ModelSelector from "./ModelSelector";
import { useModels } from "../../context/ModelContext";

export type ToolConfig = {
  topic: string;
  difficulty?: "easy" | "medium" | "hard";
  length: "short" | "medium" | "long";
  sourceIds: string[];
  focusArea?: string;
  additionalInstructions?: string;
  tone?: string;
  provider?: string;
  model?: string;
};

type Props = {
  tool: "quiz" | "podcast" | "smartnotes" | "mindmap";
  sources: Source[];
  defaultTopic: string;
  onStart: (config: ToolConfig) => void;
  onClose: () => void;
};

const TOOL_META: Record<string, { label: string; color: string; btnClass: string; borderFocus: string }> = {
  quiz: { label: "New Quiz", color: "green", btnClass: "bg-green-700 hover:bg-green-600", borderFocus: "focus:border-green-600" },
  podcast: { label: "New Podcast", color: "purple", btnClass: "bg-purple-700 hover:bg-purple-600", borderFocus: "focus:border-purple-600" },
  smartnotes: { label: "New Notes", color: "bone", btnClass: "bg-accent hover:bg-accent-hover text-stone-950", borderFocus: "focus:border-stone-600" },
  mindmap: { label: "Generate Mindmap", color: "cyan", btnClass: "bg-cyan-700 hover:bg-cyan-600", borderFocus: "focus:border-cyan-600" },
};

const LENGTH_LABELS: Record<string, Record<string, string>> = {
  quiz: { short: "5 Qs", medium: "10 Qs", long: "20 Qs" },
  podcast: { short: "~3 min", medium: "~6 min", long: "~10 min" },
  smartnotes: { short: "Summary", medium: "Detailed", long: "Comprehensive" },
};

const LENGTH_VALUES: Record<string, number> = { short: 5, medium: 10, long: 20 };

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function StudyToolModal({ tool, sources, defaultTopic, onStart, onClose }: Props) {
  const { chatModel } = useModels();
  const meta = TOOL_META[tool];

  const [topic, setTopic] = useState(defaultTopic);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [allSources, setAllSources] = useState(true);
  const [focusArea, setFocusArea] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [tone, setTone] = useState("casual");
  const [toolModel, setToolModel] = useState(chatModel);
  const [sourceFilter, setSourceFilter] = useState<"all" | SourceType>("all");

  useEffect(() => {
    if (allSources) setSelectedSources(new Set(sources.map(s => s.id)));
  }, [allSources, sources]);

  const toggleSource = (id: string) => {
    setAllSources(false);
    setSelectedSources(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSources) {
      setAllSources(false);
      setSelectedSources(new Set());
    } else {
      setAllSources(true);
    }
  };

  const handleStart = () => {
    if (tool !== "mindmap" && !topic.trim()) return;
    onStart({
      topic: tool === "mindmap" ? (topic.trim() || "Knowledge Map") : topic.trim(),
      ...(tool === "quiz" ? { difficulty } : {}),
      length,
      sourceIds: allSources ? [] : Array.from(selectedSources),
      focusArea: focusArea.trim() || undefined,
      additionalInstructions: additionalInstructions.trim() || undefined,
      ...(tool === "podcast" ? { tone } : {}),
      provider: toolModel.provider || undefined,
      model: toolModel.model || undefined,
    });
  };

  const lengths = LENGTH_LABELS[tool];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-stone-900 rounded-xl border border-stone-800 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
          <h2 className="text-base font-semibold text-stone-200">{meta.label}</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-300 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scroll">
          {/* Topic */}
          <div>
            <label className="block text-xs font-medium text-stone-400 mb-1.5">Topic</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder={tool === "mindmap" ? "e.g. Machine Learning concepts..." : "Enter topic..."}
              className={`w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder:text-stone-600 outline-none ${meta.borderFocus}`}
              autoFocus
            />
          </div>

          {/* Sources */}
          {sources.length > 0 && (() => {
            const typeCounts = sources.reduce<Record<string, number>>((acc, s) => {
              const t = s.sourceType || "material";
              acc[t] = (acc[t] || 0) + 1;
              return acc;
            }, {});
            const uniqueTypes = Object.keys(typeCounts);
            const showFilter = uniqueTypes.length > 1;
            const visibleSources = sourceFilter === "all" ? sources : sources.filter(s => (s.sourceType || "material") === sourceFilter);

            return (
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">Sources</label>
              {showFilter && (
                <div className="flex gap-1 mb-1.5">
                  {[
                    { key: "all" as const, label: "All" },
                    ...uniqueTypes.map(t => ({
                      key: t as "all" | SourceType,
                      label: t === "material" ? "Material" : t === "exercise" ? "Exercise" : "Web",
                    })),
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setSourceFilter(tab.key)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        sourceFilter === tab.key
                          ? "bg-stone-700 text-stone-200"
                          : "text-stone-500 hover:text-stone-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="bg-stone-950 border border-stone-800 rounded-lg overflow-hidden">
                <label className="flex items-center gap-2 px-3 py-2 border-b border-stone-800 cursor-pointer hover:bg-stone-800/30">
                  <input
                    type="checkbox"
                    checked={allSources}
                    onChange={toggleAll}
                    className="rounded border-stone-700 bg-stone-800 text-green-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-sm text-stone-300 font-medium">All sources</span>
                </label>
                <div className="max-h-32 overflow-y-auto custom-scroll">
                  {visibleSources.map(s => {
                    const st = s.sourceType || "material";
                    return (
                    <label key={s.id} className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-stone-800/30">
                      <input
                        type="checkbox"
                        checked={allSources || selectedSources.has(s.id)}
                        onChange={() => toggleSource(s.id)}
                        disabled={allSources}
                        className="rounded border-stone-700 bg-stone-800 text-green-500 focus:ring-0 focus:ring-offset-0 disabled:opacity-50"
                      />
                      {st === "exercise" && (
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-900/30 text-amber-400 shrink-0">EX</span>
                      )}
                      {st === "websearch" && (
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-blue-900/30 text-blue-400 shrink-0">WEB</span>
                      )}
                      <span className="text-xs text-stone-400 truncate flex-1">{s.originalName || s.filename}</span>
                      <span className="text-xs text-stone-600 shrink-0">{formatSize(s.size)}</span>
                    </label>
                    );
                  })}
                </div>
              </div>
            </div>
            );
          })()}

          {/* Focus Area */}
          <div>
            <label className="block text-xs font-medium text-stone-400 mb-1.5">Focus Area <span className="text-stone-600">(optional)</span></label>
            <input
              value={focusArea}
              onChange={e => setFocusArea(e.target.value)}
              placeholder={
                tool === "quiz" ? "e.g. chapters 3-5, only photosynthesis..." :
                tool === "podcast" ? "e.g. focus on key breakthroughs..." :
                tool === "smartnotes" ? "e.g. only cover section 2 and 3..." :
                "e.g. neural networks and backpropagation..."
              }
              className={`w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder:text-stone-600 outline-none ${meta.borderFocus}`}
            />
          </div>

          {/* Tone & Style (podcast only) */}
          {tool === "podcast" && (
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">Tone & Style</label>
              <select
                value={tone}
                onChange={e => setTone(e.target.value)}
                className={`w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-200 outline-none ${meta.borderFocus}`}
              >
                <option value="casual">Casual & Fun</option>
                <option value="formal">Formal Academic</option>
                <option value="debate">Debate-Style</option>
                <option value="teacher-student">Teacher-Student</option>
                <option value="storytelling">Storytelling</option>
              </select>
            </div>
          )}

          {/* Difficulty (quiz only) */}
          {tool === "quiz" && (
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">Difficulty</label>
              <div className="flex gap-1.5">
                {(["easy", "medium", "hard"] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      difficulty === d
                        ? "bg-green-700/30 border border-green-600 text-green-300"
                        : "bg-stone-950 border border-stone-800 text-stone-500 hover:text-stone-300"
                    }`}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Length (hidden for mindmap) */}
          {tool !== "mindmap" && <div>
            <label className="block text-xs font-medium text-stone-400 mb-1.5">Length</label>
            <div className="flex gap-1.5">
              {(["short", "medium", "long"] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    length === l
                      ? "bg-stone-700/50 border border-stone-600 text-stone-200"
                      : "bg-stone-950 border border-stone-800 text-stone-500 hover:text-stone-300"
                  }`}
                >
                  {lengths[l]}
                </button>
              ))}
            </div>
          </div>}

          {/* Additional Instructions */}
          <div>
            <label className="block text-xs font-medium text-stone-400 mb-1.5">Additional Instructions <span className="text-stone-600">(optional)</span></label>
            <textarea
              value={additionalInstructions}
              onChange={e => setAdditionalInstructions(e.target.value)}
              rows={2}
              placeholder="e.g. explain in simple terms, include real-world examples..."
              className={`w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder:text-stone-600 outline-none resize-none ${meta.borderFocus}`}
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-medium text-stone-400 mb-1.5">Model</label>
            <ModelSelector
              value={toolModel.provider}
              onChange={(provider, model) => setToolModel({ provider, model })}
              className="w-full"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-stone-800">
          <button onClick={onClose} className="px-4 py-2 text-sm text-stone-500 hover:text-stone-300 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={tool !== "mindmap" && !topic.trim()}
            className={`px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${meta.btnClass}`}
          >
            {tool === "mindmap" ? "Generate" : "Start"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export { LENGTH_VALUES };
