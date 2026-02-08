import { useState, useRef, useCallback, useEffect } from "react";
import { useSubject } from "../../context/SubjectContext";
import CollapsedColumn from "./CollapsedColumn";
import {
  quizStart, connectQuizStream, type QuizEvent,
  podcastStart, connectPodcastStream, type PodcastEvent,
  smartnotesStart, connectSmartnotesStream, type SmartNotesEvent,
  mindmapStart, connectMindmapStream, type MindmapEvent,
  listTools, type ToolRecord,
} from "../../lib/api";
import ToolCard from "./ToolCard";
import StudyToolModal, { type ToolConfig, LENGTH_VALUES } from "./StudyToolModal";
import QuizPlayer from "./tools/QuizPlayer";
import PodcastPlayer from "./tools/PodcastPlayer";
import NotesViewer from "./tools/NotesViewer";
import FlashcardsTool from "./tools/FlashcardsTool";
import TranscriberTool from "./tools/TranscriberTool";
import MindmapPlayer from "./tools/MindmapPlayer";

type Question = { id: number; question: string; options: string[]; correct: number; hint: string; explanation: string; imageHtml?: string };

type GeneratedTool = {
  tool: "quiz" | "podcast" | "smartnotes" | "mindmap";
  config: ToolConfig;
  status: "loading" | "ready" | "error";
  result: any;
  label: string;
  createdAt?: number;
};

type SimplePanel = "flashcards" | "transcriber";

const TOOL_COLORS: Record<string, { text: string; bg: string; border: string; spinner: string }> = {
  quiz: { text: "text-green-400", bg: "bg-green-900/20", border: "border-green-800/40", spinner: "border-t-green-400" },
  podcast: { text: "text-purple-400", bg: "bg-purple-900/20", border: "border-purple-800/40", spinner: "border-t-purple-400" },
  smartnotes: { text: "text-bone", bg: "bg-stone-800/30", border: "border-stone-700/40", spinner: "border-t-bone" },
  mindmap: { text: "text-cyan-400", bg: "bg-cyan-900/20", border: "border-cyan-800/40", spinner: "border-t-cyan-400" },
};

const TOOL_LABELS: Record<string, string> = {
  quiz: "Quiz",
  podcast: "Podcast",
  smartnotes: "Notes",
  mindmap: "Mindmap",
};

const TOOL_ICONS: Record<string, string> = {
  quiz: "Q",
  podcast: "P",
  smartnotes: "N",
  mindmap: "M",
};

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function takeQuizArray(a: unknown): Question[] {
  if (Array.isArray(a)) return a as Question[];
  if (Array.isArray((a as any)?.quiz)) return (a as any).quiz as Question[];
  return [];
}

export default function ToolsPanel({ collapsed, onToggleCollapse }: { collapsed?: boolean; onToggleCollapse?: () => void }) {
  const { subject, sources } = useSubject();

  const [modalTool, setModalTool] = useState<"quiz" | "podcast" | "smartnotes" | "mindmap" | null>(null);
  const [generated, setGenerated] = useState<Map<string, GeneratedTool>>(new Map());
  const [viewingTool, setViewingTool] = useState<string | null>(null);
  const [simplePanel, setSimplePanel] = useState<SimplePanel | null>(null);
  const closersRef = useRef<Map<string, () => void>>(new Map());

  // Cleanup WebSocket connections on unmount
  useEffect(() => {
    return () => {
      closersRef.current.forEach(close => { try { close(); } catch {} });
      closersRef.current.clear();
    };
  }, []);

  // Load persisted tools on subject change
  useEffect(() => {
    if (!subject) return;
    listTools(subject.id).then(res => {
      const saved = new Map<string, GeneratedTool>();
      for (const t of res.tools) {
        saved.set(t.id, {
          tool: t.tool,
          config: { topic: t.topic, length: (t.config.length || "medium") as ToolConfig["length"], sourceIds: [], difficulty: t.config.difficulty as ToolConfig["difficulty"] },
          status: "ready",
          result:
            t.tool === "quiz"
              ? (t.result.questions || []).map((q: any) => ({ ...q, correct: typeof q.correct === "number" ? Math.max(0, q.correct - 1) : 0 }))
              : t.tool === "podcast"
              ? { file: t.result.url, filename: t.result.filename }
              : t.tool === "mindmap"
              ? t.result.data
              : { file: t.result.url },
          label: t.topic,
          createdAt: t.createdAt,
        });
      }
      setGenerated(prev => {
        const merged = new Map(prev);
        for (const [k, v] of saved) {
          if (!merged.has(k)) merged.set(k, v);
        }
        return merged;
      });
    }).catch(e => console.warn("[ToolsPanel] failed to load saved tools:", e));
  }, [subject?.id]);

  const updateGenerated = useCallback((key: string, updater: (prev: GeneratedTool) => GeneratedTool) => {
    setGenerated(prev => {
      const next = new Map(prev);
      const cur = next.get(key);
      if (cur) next.set(key, updater(cur));
      return next;
    });
  }, []);

  const startGeneration = useCallback((config: ToolConfig) => {
    if (!subject) return;
    const tool = modalTool!;
    const key = `${tool}-${Date.now()}`;

    setGenerated(prev => {
      const next = new Map(prev);
      next.set(key, { tool, config, status: "loading", result: null, label: config.topic });
      return next;
    });
    setModalTool(null);

    const subjectId = subject.id;

    const instructions = (config.focusArea || config.additionalInstructions)
      ? { focusArea: config.focusArea, additionalInstructions: config.additionalInstructions }
      : undefined;

    if (tool === "quiz") {
      const length = LENGTH_VALUES[config.length] || 5;
      quizStart(subjectId, {
        topic: config.topic,
        difficulty: config.difficulty,
        length,
        sourceIds: config.sourceIds.length ? config.sourceIds : undefined,
        instructions,
        provider: config.provider,
        model: config.model,
      }).then(s => {
        const { close } = connectQuizStream(s.quizId, (ev: QuizEvent) => {
          if (ev.type === "quiz") {
            const arr = takeQuizArray(ev.quiz).map(q => ({ ...q, correct: typeof q.correct === "number" ? Math.max(0, q.correct - 1) : 0 }));
            updateGenerated(key, g => ({ ...g, status: "ready", result: arr, label: `${arr.length} Qs on ${config.topic}` }));
          }
          if (ev.type === "error") updateGenerated(key, g => ({ ...g, status: "error" }));
        });
        closersRef.current.set(key, close);
      }).catch(() => updateGenerated(key, g => ({ ...g, status: "error" })));
    }

    if (tool === "podcast") {
      podcastStart(subjectId, {
        topic: config.topic,
        sourceIds: config.sourceIds.length ? config.sourceIds : undefined,
        length: config.length,
        instructions: (config.focusArea || config.additionalInstructions || config.tone)
          ? { focusArea: config.focusArea, additionalInstructions: config.additionalInstructions, tone: config.tone }
          : undefined,
        provider: config.provider,
        model: config.model,
      }).then(({ pid }) => {
        setTimeout(() => {
          const { close } = connectPodcastStream(pid, (ev: PodcastEvent) => {
            if (ev.type === "audio") {
              updateGenerated(key, g => ({
                ...g,
                status: "ready",
                result: { file: ev.file || ev.staticUrl || "", filename: ev.filename || "podcast.mp3" },
                label: config.topic,
              }));
            }
            if (ev.type === "done") { const c = closersRef.current.get(key); if (c) setTimeout(c, 1000); }
            if (ev.type === "error") updateGenerated(key, g => ({ ...g, status: "error" }));
          });
          closersRef.current.set(key, close);
        }, 100);
      }).catch(() => updateGenerated(key, g => ({ ...g, status: "error" })));
    }

    if (tool === "smartnotes") {
      smartnotesStart(subjectId, {
        topic: config.topic,
        sourceIds: config.sourceIds.length ? config.sourceIds : undefined,
        length: config.length,
        instructions,
        provider: config.provider,
        model: config.model,
      }).then(({ noteId }) => {
        const { close } = connectSmartnotesStream(noteId, (ev: SmartNotesEvent) => {
          if (ev.type === "file") {
            updateGenerated(key, g => ({ ...g, status: "ready", result: { file: ev.file }, label: config.topic }));
          }
          if (ev.type === "done") { const c = closersRef.current.get(key); if (c) c(); }
          if (ev.type === "error") updateGenerated(key, g => ({ ...g, status: "error" }));
        });
        closersRef.current.set(key, close);
      }).catch(() => updateGenerated(key, g => ({ ...g, status: "error" })));
    }

    if (tool === "mindmap") {
      mindmapStart(subjectId, {
        topic: config.topic !== "Knowledge Map" ? config.topic : undefined,
        sourceIds: config.sourceIds.length ? config.sourceIds : undefined,
        instructions,
        provider: config.provider,
        model: config.model,
      }).then(({ mindmapId }) => {
        const { close } = connectMindmapStream(mindmapId, (ev: MindmapEvent) => {
          if (ev.type === "phase") {
            updateGenerated(key, g => ({ ...g, label: ev.detail || ev.value || "Generating..." }));
          }
          if (ev.type === "mindmap") {
            updateGenerated(key, g => ({
              ...g,
              status: "ready",
              result: ev.data,
              label: `${ev.data?.nodes?.length || 0} concepts`,
            }));
          }
          if (ev.type === "done") { const c = closersRef.current.get(key); if (c) setTimeout(c, 1000); }
          if (ev.type === "error") updateGenerated(key, g => ({ ...g, status: "error" }));
        });
        closersRef.current.set(key, close);
      }).catch(() => updateGenerated(key, g => ({ ...g, status: "error" })));
    }
  }, [subject, modalTool, updateGenerated]);

  // Collect all generated items, newest first
  const generatedList = Array.from(generated.entries()).reverse();

  // Collapsed state — must be checked before any other return path
  if (collapsed && onToggleCollapse) return <CollapsedColumn label="Tools" side="right" onExpand={onToggleCollapse} />;

  // Render inline tool output
  if (viewingTool) {
    const gen = generated.get(viewingTool);
    if (gen?.tool === "quiz" && gen.status === "ready") {
      return (
        <div className="h-full flex flex-col border-l border-stone-800 bg-stone-950/50">
          <QuizPlayer questions={gen.result} topic={gen.config.topic} onClose={() => setViewingTool(null)} />
        </div>
      );
    }
    if (gen?.tool === "podcast" && gen.status === "ready") {
      return (
        <div className="h-full flex flex-col border-l border-stone-800 bg-stone-950/50">
          <PodcastPlayer audioFile={gen.result.file} audioFilename={gen.result.filename} topic={gen.config.topic} onClose={() => setViewingTool(null)} />
        </div>
      );
    }
    if (gen?.tool === "smartnotes" && gen.status === "ready") {
      return (
        <div className="h-full flex flex-col border-l border-stone-800 bg-stone-950/50">
          <NotesViewer filePath={gen.result.file} topic={gen.config.topic} onClose={() => setViewingTool(null)} />
        </div>
      );
    }
    if (gen?.tool === "mindmap" && gen.status === "ready") {
      return (
        <div className="h-full flex flex-col border-l border-stone-800 bg-stone-950/50">
          <MindmapPlayer data={gen.result} topic={gen.config.topic} toolId={viewingTool} subjectId={subject?.id} onClose={() => setViewingTool(null)} />
        </div>
      );
    }
  }

  // Render simple panel (flashcards / transcriber)
  if (simplePanel) {
    return (
      <div className="h-full flex flex-col border-l border-stone-800 bg-stone-950/50">
        <div className="relative">
          <button
            onClick={() => setSimplePanel(null)}
            className="absolute right-2 top-2 z-10 p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scroll">
          {simplePanel === "flashcards" && <FlashcardsTool />}
          {simplePanel === "transcriber" && <TranscriberTool />}
        </div>
      </div>
    );
  }

  // Default: card grid overview
  return (
    <div className="h-full flex flex-col border-l border-stone-800 bg-stone-950/50">
      <div className="px-4 py-3 border-b border-stone-800 shrink-0 flex items-center gap-1.5">
        {onToggleCollapse && (
          <button onClick={onToggleCollapse} className="p-1 rounded hover:bg-stone-800 text-stone-500 hover:text-stone-300 transition-colors" aria-label="Collapse Tools" title="Collapse Tools">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
          </button>
        )}
        <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wider">Study Tools</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-4">
        {/* Tool launcher cards — always clickable to create new */}
        <div className="grid grid-cols-2 gap-2">
          <ToolCard tool="quiz" status="idle" onClick={() => setModalTool("quiz")} />
          <ToolCard tool="podcast" status="idle" onClick={() => setModalTool("podcast")} />
          <ToolCard tool="smartnotes" status="idle" onClick={() => setModalTool("smartnotes")} />
          <ToolCard tool="flashcards" status="idle" onClick={() => setSimplePanel("flashcards")} />
          <ToolCard tool="transcriber" status="idle" onClick={() => setSimplePanel("transcriber")} />
          <ToolCard tool="mindmap" status="idle" onClick={() => setModalTool("mindmap")} />
        </div>

        {/* Generated items list */}
        {generatedList.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2 px-1">Generated</h3>
            <div className="space-y-1.5">
              {generatedList.map(([key, gen]) => {
                const style = TOOL_COLORS[gen.tool];
                return (
                  <button
                    key={key}
                    onClick={() => { if (gen.status === "ready") setViewingTool(key); }}
                    disabled={gen.status !== "ready"}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all ${
                      gen.status === "ready"
                        ? `${style.bg} ${style.border} hover:brightness-110 cursor-pointer`
                        : gen.status === "loading"
                        ? "bg-stone-900/50 border-stone-800 cursor-default"
                        : "bg-red-900/10 border-red-800/30 cursor-default"
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      gen.status === "error" ? "bg-red-900/30" : style.bg
                    }`}>
                      {gen.status === "loading" ? (
                        <div className={`w-3.5 h-3.5 border-2 border-stone-600 ${style.spinner} rounded-full animate-spin`} />
                      ) : gen.status === "error" ? (
                        <span className="text-red-400 text-xs font-bold">!</span>
                      ) : (
                        <span className={`text-xs font-bold ${style.text}`}>{TOOL_ICONS[gen.tool]}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-medium truncate ${
                        gen.status === "ready" ? "text-stone-200" :
                        gen.status === "loading" ? "text-stone-400" :
                        "text-red-400"
                      }`}>
                        {gen.label || gen.config.topic}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {gen.status === "loading" ? `${TOOL_LABELS[gen.tool]} · Generating...` :
                         gen.status === "error" ? `${TOOL_LABELS[gen.tool]} · Failed` :
                         gen.createdAt ? `${TOOL_LABELS[gen.tool]} · ${relativeTime(gen.createdAt)}` :
                         TOOL_LABELS[gen.tool]}
                      </div>
                    </div>

                    {/* Arrow for ready items */}
                    {gen.status === "ready" && (
                      <svg className="w-3.5 h-3.5 text-stone-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalTool && subject && (
        <StudyToolModal
          tool={modalTool}
          sources={sources}
          defaultTopic={subject.name || ""}
          onStart={startGeneration}
          onClose={() => setModalTool(null)}
        />
      )}
    </div>
  );
}
