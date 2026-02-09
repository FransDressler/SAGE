import { useState, useRef, useCallback, useEffect } from "react";
import { useSubject } from "../../context/SubjectContext";
import CollapsedColumn from "./CollapsedColumn";
import {
  quizStart, connectQuizStream, type QuizEvent,
  podcastStart, connectPodcastStream, type PodcastEvent,
  smartnotesStart, connectSmartnotesStream, type SmartNotesEvent,
  mindmapStart, connectMindmapStream, type MindmapEvent,
  examStart, connectExamStream, type ExamEvent,
  listTools, deleteTool, type ToolRecord,
} from "../../lib/api";
import ToolCard from "./ToolCard";
import StudyToolModal, { type ToolConfig, type ExamToolConfig, LENGTH_VALUES } from "./StudyToolModal";
import QuizPlayer from "./tools/QuizPlayer";
import PodcastPlayer from "./tools/PodcastPlayer";
import NotesViewer from "./tools/NotesViewer";
import FlashcardsTool from "./tools/FlashcardsTool";
import TranscriberTool from "./tools/TranscriberTool";
import MindmapPlayer from "./tools/MindmapPlayer";
import ExamPlayer from "./tools/ExamPlayer";

type Question = { id: number; question: string; options: string[]; correct: number; hint: string; explanation: string; imageHtml?: string };

type GeneratedTool = {
  tool: "quiz" | "podcast" | "smartnotes" | "mindmap" | "exam";
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
  exam: { text: "text-rose-400", bg: "bg-rose-900/20", border: "border-rose-800/40", spinner: "border-t-rose-400" },
};

const TOOL_LABELS: Record<string, string> = {
  quiz: "Quiz",
  podcast: "Podcast",
  smartnotes: "Notes",
  mindmap: "Mindmap",
  exam: "Exam",
};

const TOOL_ICONS: Record<string, string> = {
  quiz: "Q",
  podcast: "P",
  smartnotes: "N",
  mindmap: "M",
  exam: "E",
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

export default function ToolsPanel({ collapsed, onToggleCollapse, onChatAboutTool }: { collapsed?: boolean; onToggleCollapse?: () => void; onChatAboutTool?: (ctx: { tool: string; topic: string; content: string }) => void }) {
  const { subject, sources } = useSubject();

  const [modalTool, setModalTool] = useState<"quiz" | "podcast" | "smartnotes" | "mindmap" | "exam" | null>(null);
  const [generated, setGenerated] = useState<Map<string, GeneratedTool>>(new Map());
  const [viewingTool, setViewingTool] = useState<string | null>(null);
  const [simplePanel, setSimplePanel] = useState<SimplePanel | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
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
    setConfirmingDelete(null);
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
              : t.tool === "exam"
              ? { questions: t.result.questions || [], totalPoints: t.result.totalPoints || 0, timeLimit: t.result.timeLimit || 0 }
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

  const startExamGeneration = useCallback((config: ExamToolConfig) => {
    if (!subject) return;
    const key = `exam-${Date.now()}`;

    setGenerated(prev => {
      const next = new Map(prev);
      next.set(key, {
        tool: "exam",
        config: { topic: "Exam", length: "medium", sourceIds: config.sourceIds },
        status: "loading",
        result: null,
        label: "Generating exam...",
      });
      return next;
    });
    setModalTool(null);

    const subjectId = subject.id;
    const instructions = (config.focusArea || config.additionalInstructions)
      ? { focusArea: config.focusArea, additionalInstructions: config.additionalInstructions }
      : undefined;

    examStart(subjectId, {
      sourceIds: config.sourceIds,
      timeLimit: config.timeLimit,
      shuffle: config.shuffle,
      maxQuestions: config.maxQuestions,
      instructions,
      provider: config.provider,
      model: config.model,
    }).then(({ examId }) => {
      const { close } = connectExamStream(examId, (ev: ExamEvent) => {
        if (ev.type === "exam") {
          const exam = ev.exam;
          updateGenerated(key, g => ({
            ...g,
            status: "ready",
            result: { questions: exam.questions, totalPoints: exam.totalPoints, timeLimit: exam.timeLimit },
            label: `Exam · ${exam.questions.length} questions`,
          }));
        }
        if (ev.type === "error") updateGenerated(key, g => ({ ...g, status: "error" }));
      });
      closersRef.current.set(key, close);
    }).catch(() => updateGenerated(key, g => ({ ...g, status: "error" })));
  }, [subject, updateGenerated]);

  const handleDeleteTool = useCallback(async (key: string) => {
    if (!subject) return;
    try {
      await deleteTool(subject.id, key);
    } catch (e) {
      console.warn("[ToolsPanel] failed to delete tool:", e);
    }
    setGenerated(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
    const closer = closersRef.current.get(key);
    if (closer) {
      try { closer(); } catch {}
      closersRef.current.delete(key);
    }
    setViewingTool(prev => prev === key ? null : prev);
    setConfirmingDelete(null);
  }, [subject]);

  // Collect all generated items, newest first
  const generatedList = Array.from(generated.entries()).reverse();

  // Collapsed state — must be checked before any other return path
  if (collapsed && onToggleCollapse) return <CollapsedColumn label="Tools" side="right" onExpand={onToggleCollapse} />;

  // Render inline tool output
  if (viewingTool) {
    const gen = generated.get(viewingTool);
    if (gen?.tool === "quiz" && gen.status === "ready") {
      return (
        <div className="h-full min-h-0 min-w-0 overflow-hidden flex flex-col border-l border-stone-800 bg-stone-900/50">
          <QuizPlayer questions={gen.result} topic={gen.config.topic} onClose={() => setViewingTool(null)} onChatAbout={onChatAboutTool ? () => onChatAboutTool({ tool: "quiz", topic: gen.config.topic, content: gen.result.map((q: any, i: number) => `Q${i+1}: ${q.question}\nAnswer: ${q.options[q.correct]}\nExplanation: ${q.explanation}`).join("\n\n") }) : undefined} />
        </div>
      );
    }
    if (gen?.tool === "podcast" && gen.status === "ready") {
      return (
        <div className="h-full min-h-0 min-w-0 overflow-hidden flex flex-col border-l border-stone-800 bg-stone-900/50">
          <PodcastPlayer audioFile={gen.result.file} audioFilename={gen.result.filename} topic={gen.config.topic} onClose={() => setViewingTool(null)} onChatAbout={onChatAboutTool ? () => onChatAboutTool({ tool: "podcast", topic: gen.config.topic, content: `Podcast about: ${gen.config.topic}` }) : undefined} />
        </div>
      );
    }
    if (gen?.tool === "smartnotes" && gen.status === "ready") {
      return (
        <div className="h-full min-h-0 min-w-0 overflow-hidden flex flex-col border-l border-stone-800 bg-stone-900/50">
          <NotesViewer filePath={gen.result.file} topic={gen.config.topic} onClose={() => setViewingTool(null)} onChatAbout={onChatAboutTool ? () => onChatAboutTool({ tool: "smartnotes", topic: gen.config.topic, content: `Notes about: ${gen.config.topic}` }) : undefined} />
        </div>
      );
    }
    if (gen?.tool === "mindmap" && gen.status === "ready") {
      return (
        <div className="h-full min-h-0 min-w-0 overflow-hidden flex flex-col border-l border-stone-800 bg-stone-900/50">
          <MindmapPlayer data={gen.result} topic={gen.config.topic} toolId={viewingTool} subjectId={subject?.id} onClose={() => setViewingTool(null)} onChatAbout={onChatAboutTool ? () => onChatAboutTool({ tool: "mindmap", topic: gen.config.topic, content: gen.result.nodes?.map((n: any) => `${n.label}: ${n.description}`).join("\n") || "" }) : undefined} />
        </div>
      );
    }
    if (gen?.tool === "exam" && gen.status === "ready") {
      return (
        <div className="h-full min-h-0 min-w-0 overflow-hidden flex flex-col border-l border-stone-800 bg-stone-900/50">
          <ExamPlayer
            questions={gen.result.questions}
            totalPoints={gen.result.totalPoints}
            timeLimit={gen.result.timeLimit}
            onClose={() => setViewingTool(null)}
            onChatAbout={onChatAboutTool ? () => onChatAboutTool({ tool: "exam", topic: "Exam", content: gen.result.questions?.map((q: any, i: number) => `Q${i+1} (${q.points}pts): ${q.question}`).join("\n") || "" }) : undefined}
          />
        </div>
      );
    }
  }

  // Render simple panel (flashcards / transcriber)
  if (simplePanel) {
    return (
      <div className="h-full flex flex-col border-l border-stone-800 bg-stone-900/50">
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
    <div className="h-full min-h-0 min-w-0 overflow-hidden flex flex-col border-l border-stone-800 bg-stone-900/50">
      <div className="px-4 py-3 border-b border-stone-800 shrink-0 flex items-center gap-1.5">
        {onToggleCollapse && (
          <button onClick={onToggleCollapse} className="p-1 rounded hover:bg-stone-800 text-stone-500 hover:text-stone-300 transition-colors" aria-label="Collapse Tools" title="Collapse Tools">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
          </button>
        )}
        <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wider">Study Tools</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scroll p-3 space-y-4">
        {/* Tool launcher cards — always clickable to create new */}
        <div className="grid grid-cols-2 gap-2">
          <ToolCard tool="quiz" status="idle" onClick={() => setModalTool("quiz")} />
          <ToolCard tool="podcast" status="idle" onClick={() => setModalTool("podcast")} />
          <ToolCard tool="smartnotes" status="idle" onClick={() => setModalTool("smartnotes")} />
          <ToolCard tool="flashcards" status="idle" onClick={() => setSimplePanel("flashcards")} />
          <ToolCard tool="transcriber" status="idle" onClick={() => setSimplePanel("transcriber")} />
          <ToolCard tool="mindmap" status="idle" onClick={() => setModalTool("mindmap")} />
          <ToolCard tool="exam" status="idle" onClick={() => setModalTool("exam")} />
        </div>

        {/* Generated items list */}
        {generatedList.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2 px-1">Generated</h3>
            <div className="space-y-1.5">
              {generatedList.map(([key, gen]) => {
                const style = TOOL_COLORS[gen.tool];
                const isConfirming = confirmingDelete === key;

                return (
                  <div
                    key={key}
                    className={`group relative w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all ${
                      gen.status === "ready"
                        ? `${style.bg} ${style.border} hover:brightness-110`
                        : gen.status === "loading"
                        ? "bg-stone-900/50 border-stone-800"
                        : "bg-red-900/10 border-red-800/30"
                    }`}
                  >
                    {isConfirming ? (
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-stone-300">
                            Delete this {TOOL_LABELS[gen.tool].toLowerCase()}?
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => handleDeleteTool(key)}
                            className="px-2.5 py-1 text-[11px] font-medium bg-red-700/80 hover:bg-red-600 text-white rounded-md transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmingDelete(null)}
                            className="px-2.5 py-1 text-[11px] font-medium bg-stone-700 hover:bg-stone-600 text-stone-300 rounded-md transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { if (gen.status === "ready") setViewingTool(key); }}
                          disabled={gen.status !== "ready"}
                          className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer disabled:cursor-default"
                        >
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

                          {gen.status === "ready" && (
                            <svg className="w-3.5 h-3.5 text-stone-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmingDelete(key);
                          }}
                          className="p-1 rounded-md text-stone-600 hover:text-red-400 hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
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
          onStartExam={startExamGeneration}
          onClose={() => setModalTool(null)}
        />
      )}
    </div>
  );
}
