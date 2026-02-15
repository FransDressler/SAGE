import { useState } from "react";
import type { ChatPhase, AgentStep } from "../../lib/api";

const PHASE_META: Record<string, { label: string; icon: string }> = {
  thinking: { label: "Understanding your question", icon: "thought" },
  listing_sources: { label: "Looking up available sources", icon: "read" },
  searching_sources: { label: "Searching your materials", icon: "search" },
  searching_web: { label: "Searching the web", icon: "globe" },
  reading_results: { label: "Reading results", icon: "read" },
  generating: { label: "Writing answer", icon: "write" },
};

function StepIcon({ icon, active, done }: { icon: string; active: boolean; done: boolean }) {
  const color = done ? "text-emerald-400" : active ? "text-accent" : "text-stone-600";
  const cls = `w-4 h-4 shrink-0 ${color}`;

  if (done) {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    );
  }

  switch (icon) {
    case "thought":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      );
    case "search":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      );
    case "globe":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      );
    case "read":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    default:
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
        </svg>
      );
  }
}

function getMeta(phase: ChatPhase) {
  return PHASE_META[phase] ?? { label: phase, icon: "write" };
}

export default function LoadingIndicator({
  label = "Preparing your answer\u2026",
  steps,
  finished,
}: { label?: string; steps: AgentStep[]; finished?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  if (steps.length === 0) {
    return (
      <div className="w-full max-w-4xl rounded-2xl p-6 border border-stone-900 bg-stone-900">
        <div className="flex items-center gap-4">
          <div className="relative h-5 w-5">
            <span className="absolute inset-0 rounded-full border-2 border-stone-700 animate-ping" />
            <span className="absolute inset-0 rounded-full border-2 border-stone-500" />
          </div>
          <div className="text-stone-300">{label}</div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 rounded bg-stone-800/60 animate-pulse" />
          <div className="h-3 w-5/6 rounded bg-stone-800/60 animate-pulse" />
          <div className="h-3 w-2/3 rounded bg-stone-800/60 animate-pulse" />
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="w-full max-w-4xl mb-1">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-2 text-xs text-stone-500 hover:text-stone-300 transition-colors py-1"
        >
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span>{steps.length} step{steps.length !== 1 ? "s" : ""}</span>
          <span className="text-stone-600">
            {steps.map(s => getMeta(s.phase).label).join(" \u2192 ")}
          </span>
        </button>
        {expanded && (
          <div className="rounded-xl p-3 border border-stone-800 bg-stone-900/60 mt-1 space-y-1.5">
            {steps.map((step) => {
              const meta = getMeta(step.phase);
              return (
                <div key={step.stepId} className="flex items-center gap-2.5 opacity-60">
                  <StepIcon icon={meta.icon} active={false} done={true} />
                  <span className="text-xs text-stone-400">
                    {meta.label}
                    {step.detail && (
                      <span className="text-stone-500 ml-1.5">
                        — &ldquo;{step.detail.length > 40 ? step.detail.slice(0, 40) + "\u2026" : step.detail}&rdquo;
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl rounded-2xl p-5 border border-stone-800 bg-stone-900/80">
      <div className="space-y-2.5">
        {steps.map((step) => {
          const meta = getMeta(step.phase);
          const isActive = step.status === "active";
          const isDone = step.status === "done";

          return (
            <div
              key={step.stepId}
              className={`flex items-center gap-3 transition-all duration-300 ${
                isActive ? "opacity-100" : "opacity-60"
              }`}
            >
              <div className={`relative ${isActive ? "animate-pulse" : ""}`}>
                <StepIcon icon={meta.icon} active={isActive} done={isDone} />
              </div>
              <span className={`text-sm ${
                isActive ? "text-bone font-medium" : "text-stone-400"
              }`}>
                {meta.label}
                {step.detail && (
                  <span className="text-stone-500 ml-1.5 font-normal">
                    — &ldquo;{step.detail.length > 40 ? step.detail.slice(0, 40) + "\u2026" : step.detail}&rdquo;
                  </span>
                )}
              </span>
              {isActive && (
                <div className="ml-auto flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:300ms]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
