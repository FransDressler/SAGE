type Props = {
  tool: "quiz" | "podcast" | "smartnotes" | "flashcards" | "transcriber" | "mindmap" | "exam";
  status: "idle" | "loading" | "ready" | "error";
  label?: string;
  onClick: () => void;
};

const TOOL_STYLES: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  quiz: { icon: "Q", color: "text-green-400", bg: "bg-green-900/20", border: "border-green-800/40" },
  podcast: { icon: "P", color: "text-purple-400", bg: "bg-purple-900/20", border: "border-purple-800/40" },
  smartnotes: { icon: "N", color: "text-bone", bg: "bg-stone-800/30", border: "border-stone-700/40" },
  flashcards: { icon: "F", color: "text-amber-400", bg: "bg-amber-900/20", border: "border-amber-800/40" },
  transcriber: { icon: "T", color: "text-orange-400", bg: "bg-orange-900/20", border: "border-orange-800/40" },
  mindmap: { icon: "M", color: "text-cyan-400", bg: "bg-cyan-900/20", border: "border-cyan-800/40" },
  exam: { icon: "E", color: "text-rose-400", bg: "bg-rose-900/20", border: "border-rose-800/40" },
};

const TOOL_NAMES: Record<string, string> = {
  quiz: "Quiz",
  podcast: "Podcast",
  smartnotes: "Notes",
  flashcards: "Cards",
  transcriber: "Transcribe",
  mindmap: "Mindmap",
  exam: "Exam",
};

export default function ToolCard({ tool, status, label, onClick }: Props) {
  const style = TOOL_STYLES[tool];
  const name = TOOL_NAMES[tool];
  const isClickable = status !== "loading";

  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={`w-full p-3 rounded-xl border transition-all text-left ${
        isClickable
          ? "hover:bg-stone-800/50 hover:border-stone-700 cursor-pointer"
          : "cursor-default"
      } ${
        status === "ready"
          ? `${style.bg} ${style.border}`
          : status === "error"
          ? "bg-red-900/10 border-red-800/30"
          : "bg-stone-900/50 border-stone-800"
      }`}
    >
      <div className="flex items-center gap-2.5">
        {/* Icon */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
          status === "error" ? "bg-red-900/30 text-red-400" : `${style.bg} ${style.color}`
        }`}>
          {status === "loading" ? (
            <div className={`w-4 h-4 border-2 border-stone-600 rounded-full animate-spin ${
              style.color === "text-green-400" ? "border-t-green-400" :
              style.color === "text-purple-400" ? "border-t-purple-400" :
              style.color === "text-amber-400" ? "border-t-amber-400" :
              style.color === "text-orange-400" ? "border-t-orange-400" :
              style.color === "text-rose-400" ? "border-t-rose-400" :
              "border-t-bone"
            }`} />
          ) : status === "ready" ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : status === "error" ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          ) : (
            style.icon
          )}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <div className={`text-xs font-medium ${
            status === "error" ? "text-red-400" :
            status === "ready" ? style.color :
            "text-stone-400"
          }`}>
            {name}
          </div>
          <div className="text-[11px] text-stone-600 truncate">
            {status === "loading" ? "Generating..." :
             status === "ready" ? (label || "Ready") :
             status === "error" ? "Failed" :
             "Generate"}
          </div>
        </div>
      </div>
    </button>
  );
}
