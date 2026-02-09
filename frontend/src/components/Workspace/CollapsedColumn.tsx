interface CollapsedColumnProps {
  label: string;
  side: "left" | "center" | "right";
  onExpand: () => void;
}

export default function CollapsedColumn({ label, side, onExpand }: CollapsedColumnProps) {
  const border =
    side === "left" ? "border-r border-stone-800" :
    side === "right" ? "border-l border-stone-800" :
    "border-x border-stone-800";

  return (
    <div className={`h-full ${border}`}>
      <button
        onClick={onExpand}
        className={`h-full w-full flex flex-col items-center bg-stone-900/50 cursor-pointer hover:bg-stone-800/50 transition-colors`}
        aria-label={`Expand ${label}`}
        title={`Expand ${label}`}
      >
        <svg className="w-3.5 h-3.5 mt-3 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <span
          className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mt-3"
          style={{ writingMode: "vertical-rl" }}
        >
          {label}
        </span>
      </button>
    </div>
  );
}
