import { useEffect, useState, useCallback, useRef } from "react";
import { useSubject } from "../../context/SubjectContext";
import CollapsedColumn from "./CollapsedColumn";
import MarkdownView from "../Chat/MarkdownView";
import {
  getStudyPlan,
  generateStudyPlan,
  addStudyPlanTopic,
  deleteStudyPlanTopic,
  addStudyPlanSubtopic,
  deleteStudyPlanSubtopic,
  generateSubtopicContent,
  generateAllStudyPlanContent,
  deleteEntireStudyPlan,
  saveStudyPlan,
  connectStudyPlanStream,
  type StudyPlan,
  type StudyPlanTopic,
  type StudyPlanEvent,
  type Source,
} from "../../lib/api";

type Props = {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

export default function StudyPlanColumn({ collapsed, onToggleCollapse }: Props) {
  const { subject, sources } = useSubject();
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [addingTopicTitle, setAddingTopicTitle] = useState("");
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [addingSubtopicFor, setAddingSubtopicFor] = useState<string | null>(null);
  const [addingSubtopicTitle, setAddingSubtopicTitle] = useState("");
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [primaryIds, setPrimaryIds] = useState<Set<string>>(new Set());
  const [backgroundIds, setBackgroundIds] = useState<Set<string>>(new Set());
  const [genPrompt, setGenPrompt] = useState("");
  const wsRef = useRef<{ close: () => void } | null>(null);

  // Fetch plan on mount / subject change
  useEffect(() => {
    if (!subject) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getStudyPlan(subject.id);
        if (cancelled) return;
        setPlan(res.plan);
        if (res.plan) {
          setExpanded(new Set(res.plan.topics.map(t => t.id)));
        }
      } catch {
        if (!cancelled) setPlan(null);
      }
    })();
    return () => { cancelled = true; };
  }, [subject?.id]);

  // WebSocket for streaming updates
  useEffect(() => {
    if (!subject) return;
    const conn = connectStudyPlanStream(subject.id, (ev: StudyPlanEvent) => {
      if (ev.type === "phase") {
        setPhase(ev.detail || ev.value);
        setLoading(true);
      } else if (ev.type === "plan") {
        setPlan(ev.plan);
        setExpanded(new Set(ev.plan.topics.map(t => t.id)));
        setLoading(false);
        setPhase("");
      } else if (ev.type === "subtopic-content") {
        setPlan(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            topics: prev.topics.map(t =>
              t.id === ev.topicId
                ? {
                    ...t,
                    subtopics: t.subtopics.map(s =>
                      s.id === ev.subtopicId
                        ? { ...s, content: ev.content, status: "ready" as const, generatedAt: Date.now() }
                        : s
                    ),
                  }
                : t
            ),
          };
        });
      } else if (ev.type === "done") {
        setLoading(false);
        setPhase("");
      } else if (ev.type === "error") {
        setLoading(false);
        setPhase("");
        setError(ev.error);
        setTimeout(() => setError(null), 5000);
      }
    });
    wsRef.current = conn;
    return () => conn.close();
  }, [subject?.id]);

  const handleGenerate = useCallback(async () => {
    if (!subject || loading) return;
    setLoading(true);
    setPhase("Starting plan generation...");
    setError(null);
    setShowGenerateForm(false);
    try {
      await generateStudyPlan(subject.id, {
        primarySourceIds: primaryIds.size > 0 ? [...primaryIds] : undefined,
        backgroundSourceIds: backgroundIds.size > 0 ? [...backgroundIds] : undefined,
        prompt: genPrompt.trim() || undefined,
      });
    } catch (e: any) {
      setError(e?.message || "Generation failed");
      setLoading(false);
      setPhase("");
    }
  }, [subject, loading, primaryIds, backgroundIds, genPrompt]);

  const handleDeletePlan = useCallback(async () => {
    if (!subject || loading) return;
    if (!confirm("Delete the entire study plan? This cannot be undone.")) return;
    try {
      await deleteEntireStudyPlan(subject.id);
      setPlan(null);
    } catch (e: any) {
      setError(e?.message || "Failed to delete plan");
    }
  }, [subject, loading]);

  const handleCreateManual = useCallback(async () => {
    if (!subject) return;
    const emptyPlan: StudyPlan = { topics: [], sourceCount: 0 };
    try {
      await saveStudyPlan(subject.id, emptyPlan);
      setPlan(emptyPlan);
      setShowAddTopic(true);
    } catch (e: any) {
      setError(e?.message || "Failed to create plan");
    }
  }, [subject]);

  const handleGenerateAll = useCallback(async () => {
    if (!subject || loading) return;
    setLoading(true);
    setPhase("Generating content...");
    setError(null);
    try {
      await generateAllStudyPlanContent(subject.id);
    } catch (e: any) {
      setError(e?.message || "Generation failed");
      setLoading(false);
      setPhase("");
    }
  }, [subject, loading]);

  const handleGenerateSubtopic = useCallback(async (topicId: string, subtopicId: string) => {
    if (!subject || loading) return;
    setLoading(true);
    setPhase("Generating content...");
    setPlan(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        topics: prev.topics.map(t =>
          t.id === topicId
            ? { ...t, subtopics: t.subtopics.map(s => s.id === subtopicId ? { ...s, status: "generating" as const } : s) }
            : t
        ),
      };
    });
    try {
      await generateSubtopicContent(subject.id, topicId, subtopicId);
    } catch (e: any) {
      setError(e?.message || "Generation failed");
      setLoading(false);
      setPhase("");
    }
  }, [subject, loading]);

  const handleAddTopic = useCallback(async () => {
    if (!subject || !addingTopicTitle.trim()) return;
    try {
      const res = await addStudyPlanTopic(subject.id, addingTopicTitle.trim());
      setPlan(prev => {
        if (!prev) return { topics: [res.topic], sourceCount: 0 };
        return { ...prev, topics: [...prev.topics, res.topic] };
      });
      setExpanded(prev => new Set([...prev, res.topic.id]));
      setAddingTopicTitle("");
      setShowAddTopic(false);
    } catch (e: any) {
      setError(e?.message || "Failed to add topic");
    }
  }, [subject, addingTopicTitle]);

  const handleDeleteTopic = useCallback(async (topicId: string) => {
    if (!subject) return;
    try {
      await deleteStudyPlanTopic(subject.id, topicId);
      setPlan(prev => prev ? { ...prev, topics: prev.topics.filter(t => t.id !== topicId) } : prev);
    } catch (e: any) {
      setError(e?.message || "Failed to delete topic");
    }
  }, [subject]);

  const handleAddSubtopic = useCallback(async (topicId: string) => {
    if (!subject || !addingSubtopicTitle.trim()) return;
    try {
      const res = await addStudyPlanSubtopic(subject.id, topicId, addingSubtopicTitle.trim());
      setPlan(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          topics: prev.topics.map(t =>
            t.id === topicId ? { ...t, subtopics: [...t.subtopics, res.subtopic] } : t
          ),
        };
      });
      setAddingSubtopicTitle("");
      setAddingSubtopicFor(null);
    } catch (e: any) {
      setError(e?.message || "Failed to add subtopic");
    }
  }, [subject, addingSubtopicTitle]);

  const handleDeleteSubtopic = useCallback(async (topicId: string, subtopicId: string) => {
    if (!subject) return;
    try {
      await deleteStudyPlanSubtopic(subject.id, topicId, subtopicId);
      setPlan(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          topics: prev.topics.map(t =>
            t.id === topicId
              ? { ...t, subtopics: t.subtopics.filter(s => s.id !== subtopicId) }
              : t
          ),
        };
      });
    } catch (e: any) {
      setError(e?.message || "Failed to delete subtopic");
    }
  }, [subject]);

  const toggleExpand = useCallback((topicId: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  }, []);

  const emptySubtopicCount = plan
    ? plan.topics.reduce((acc, t) => acc + t.subtopics.filter(s => s.status === "empty" || s.status === "error").length, 0)
    : 0;

  if (collapsed && onToggleCollapse) return <CollapsedColumn label="Plan" side="right" onExpand={onToggleCollapse} />;

  return (
    <div className="h-full min-h-0 min-w-0 overflow-hidden flex flex-col border-l border-stone-800 bg-stone-900/50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-800 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {onToggleCollapse && (
            <button onClick={onToggleCollapse} className="p-1 rounded hover:bg-stone-800 text-stone-500 hover:text-stone-300 transition-colors" aria-label="Collapse Plan" title="Collapse Plan">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
            </button>
          )}
          <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wider">Study Plan</h2>
          {plan && (
            <span className="text-[10px] text-stone-600">{plan.topics.length} topics</span>
          )}
          {loading && (
            <div className="w-3 h-3 border-2 border-stone-600 border-t-stone-300 rounded-full animate-spin shrink-0" />
          )}
        </div>
        {plan && (
          <button
            onClick={() => setShowAddTopic(true)}
            className="sunset-fill-btn border border-stone-500 text-[11px] text-stone-500 font-medium px-2.5 py-0.5"
            title="Add topic"
          >
            + Topic
          </button>
        )}
      </div>

      {/* Progress */}
      {loading && phase && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-stone-800 bg-stone-900/50">
          <div className="w-3 h-3 border-2 border-stone-600 border-t-stone-300 rounded-full animate-spin shrink-0" />
          <span className="text-xs text-stone-400 truncate">{phase}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-red-900/30 border border-red-800/40 text-xs text-red-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-300">dismiss</button>
        </div>
      )}

      {/* Empty state / Generate form */}
      {!plan && !loading && (
        <div className="flex flex-col h-full">
          {!showGenerateForm ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-600 text-sm">
              <svg className="w-10 h-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <p>No study plan yet</p>
              <p className="text-xs mt-1">
                {sources.length ? "Click below to generate one" : "Add sources first"}
              </p>
              <div className="flex flex-col items-center gap-2 mt-3">
                {sources.length > 0 && (
                  <button
                    onClick={() => setShowGenerateForm(true)}
                    className="sunset-fill-btn border border-stone-500 text-[11px] text-stone-500 font-medium px-2.5 py-0.5"
                  >
                    Generate Study Plan
                  </button>
                )}
                <button
                  onClick={handleCreateManual}
                  className="text-[11px] text-stone-500 hover:text-stone-300 transition-colors"
                >
                  or create manually
                </button>
              </div>
            </div>
          ) : (
            <SourcePickerForm
              sources={sources}
              primaryIds={primaryIds}
              backgroundIds={backgroundIds}
              prompt={genPrompt}
              onTogglePrimary={(id) => setPrimaryIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
              onToggleBackground={(id) => setBackgroundIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
              onPromptChange={setGenPrompt}
              onGenerate={handleGenerate}
              onCancel={() => setShowGenerateForm(false)}
            />
          )}
        </div>
      )}

      {/* Plan content */}
      {plan && (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scroll">
          <div className="p-3 space-y-1">
            {plan.topics.map(topic => (
              <TopicItem
                key={topic.id}
                topic={topic}
                isExpanded={expanded.has(topic.id)}
                onToggle={() => toggleExpand(topic.id)}
                onDeleteTopic={() => handleDeleteTopic(topic.id)}
                onDeleteSubtopic={(sid) => handleDeleteSubtopic(topic.id, sid)}
                onGenerateSubtopic={(sid) => handleGenerateSubtopic(topic.id, sid)}
                addingSubtopicFor={addingSubtopicFor}
                addingSubtopicTitle={addingSubtopicTitle}
                onStartAddSubtopic={() => { setAddingSubtopicFor(topic.id); setAddingSubtopicTitle(""); }}
                onChangeSubtopicTitle={setAddingSubtopicTitle}
                onConfirmAddSubtopic={() => handleAddSubtopic(topic.id)}
                onCancelAddSubtopic={() => setAddingSubtopicFor(null)}
                loading={loading}
              />
            ))}

            {/* Add topic input */}
            {showAddTopic && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  autoFocus
                  value={addingTopicTitle}
                  onChange={e => setAddingTopicTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleAddTopic(); if (e.key === "Escape") setShowAddTopic(false); }}
                  placeholder="Topic title..."
                  className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-300 placeholder:text-stone-600 outline-none focus:border-stone-600"
                />
                <button onClick={handleAddTopic} className="text-xs text-green-400 hover:text-green-300 font-medium">Add</button>
                <button onClick={() => setShowAddTopic(false)} className="text-xs text-stone-500 hover:text-stone-300">Cancel</button>
              </div>
            )}
          </div>

          {/* Bottom actions */}
          <div className="sticky bottom-0 p-3 border-t border-stone-800 bg-stone-900/90 backdrop-blur-sm space-y-2">
            {emptySubtopicCount > 0 && (
              <button
                onClick={handleGenerateAll}
                disabled={loading}
                className="w-full sunset-fill-btn border border-stone-500 text-[11px] text-stone-500 font-medium px-3 py-2 disabled:opacity-50"
              >
                Generate Content ({emptySubtopicCount} remaining)
              </button>
            )}
            <button
              onClick={handleDeletePlan}
              disabled={loading}
              className="w-full text-[11px] text-red-500/60 hover:text-red-400 font-medium px-3 py-1.5 disabled:opacity-50"
            >
              Delete Study Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- TopicItem ---

type TopicItemProps = {
  topic: StudyPlanTopic;
  isExpanded: boolean;
  onToggle: () => void;
  onDeleteTopic: () => void;
  onDeleteSubtopic: (subtopicId: string) => void;
  onGenerateSubtopic: (subtopicId: string) => void;
  addingSubtopicFor: string | null;
  addingSubtopicTitle: string;
  onStartAddSubtopic: () => void;
  onChangeSubtopicTitle: (v: string) => void;
  onConfirmAddSubtopic: () => void;
  onCancelAddSubtopic: () => void;
  loading: boolean;
};

function TopicItem({
  topic, isExpanded, onToggle, onDeleteTopic, onDeleteSubtopic, onGenerateSubtopic,
  addingSubtopicFor, addingSubtopicTitle, onStartAddSubtopic, onChangeSubtopicTitle,
  onConfirmAddSubtopic, onCancelAddSubtopic, loading,
}: TopicItemProps) {
  return (
    <div className="rounded-lg border border-stone-800/50">
      {/* Topic header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-stone-800/30 transition-colors rounded-lg group"
      >
        <svg
          className={`w-3.5 h-3.5 text-stone-500 shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-sm font-medium text-stone-200 flex-1 truncate">{topic.title}</span>
        <span className="text-[10px] text-stone-600 shrink-0">{topic.subtopics.length}</span>
        <button
          onClick={e => { e.stopPropagation(); onDeleteTopic(); }}
          className="p-1 rounded text-stone-600 hover:text-red-400 hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all shrink-0"
          title="Delete topic"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </button>

      {/* Subtopics */}
      {isExpanded && (
        <div className="pb-2 px-2 space-y-1">
          {topic.subtopics.map(sub => (
            <SubtopicItem
              key={sub.id}
              subtopic={sub}
              onDelete={() => onDeleteSubtopic(sub.id)}
              onGenerate={() => onGenerateSubtopic(sub.id)}
              loading={loading}
            />
          ))}

          {/* Add subtopic */}
          {addingSubtopicFor === topic.id ? (
            <div className="flex items-center gap-2 ml-5 mt-1">
              <input
                autoFocus
                value={addingSubtopicTitle}
                onChange={e => onChangeSubtopicTitle(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") onConfirmAddSubtopic(); if (e.key === "Escape") onCancelAddSubtopic(); }}
                placeholder="Subtopic title..."
                className="flex-1 bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-stone-300 placeholder:text-stone-600 outline-none focus:border-stone-600"
              />
              <button onClick={onConfirmAddSubtopic} className="text-[11px] text-green-400 hover:text-green-300 font-medium">Add</button>
              <button onClick={onCancelAddSubtopic} className="text-[11px] text-stone-500 hover:text-stone-300">Cancel</button>
            </div>
          ) : (
            <button
              onClick={onStartAddSubtopic}
              className="ml-5 mt-1 text-[11px] text-stone-600 hover:text-stone-400 transition-colors"
            >
              + Subtopic
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// --- SubtopicItem ---

type SubtopicItemProps = {
  subtopic: { id: string; title: string; content: string; status: string; generatedAt?: number };
  onDelete: () => void;
  onGenerate: () => void;
  loading: boolean;
};

function SubtopicItem({ subtopic, onDelete, onGenerate, loading }: SubtopicItemProps) {
  const [contentExpanded, setContentExpanded] = useState(false);

  return (
    <div className="ml-3 rounded-lg border border-stone-800/30 bg-stone-900/30">
      {/* Subtopic header */}
      <div className="flex items-center gap-2 px-3 py-2 group">
        {subtopic.status === "ready" ? (
          <button onClick={() => setContentExpanded(v => !v)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
            <svg
              className={`w-3 h-3 text-stone-500 shrink-0 transition-transform ${contentExpanded ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-xs text-stone-300 truncate">{subtopic.title}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {subtopic.status === "generating" ? (
              <div className="w-3 h-3 border-2 border-stone-600 border-t-stone-300 rounded-full animate-spin shrink-0" />
            ) : (
              <div className="w-3 h-3 rounded-full border border-stone-700 shrink-0" />
            )}
            <span className={`text-xs truncate ${subtopic.status === "error" ? "text-red-400" : "text-stone-400"}`}>
              {subtopic.title}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1 shrink-0">
          {(subtopic.status === "empty" || subtopic.status === "error") && (
            <button
              onClick={onGenerate}
              disabled={loading}
              className="p-1 rounded text-stone-600 hover:text-stone-300 hover:bg-stone-800 transition-colors disabled:opacity-50"
              title="Generate content"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </button>
          )}
          {subtopic.status === "ready" && (
            <button
              onClick={onGenerate}
              disabled={loading}
              className="p-1 rounded text-stone-600 hover:text-stone-300 hover:bg-stone-800 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
              title="Regenerate"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1 rounded text-stone-600 hover:text-red-400 hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
            title="Delete subtopic"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {contentExpanded && subtopic.status === "ready" && subtopic.content && (
        <div className="px-3 pb-3 border-t border-stone-800/30">
          <div className="mt-2 text-xs text-stone-300 prose prose-invert prose-xs max-w-none">
            <MarkdownView md={subtopic.content} />
          </div>
        </div>
      )}
    </div>
  );
}

// --- SourcePickerForm ---

type SourcePickerFormProps = {
  sources: Source[];
  primaryIds: Set<string>;
  backgroundIds: Set<string>;
  prompt: string;
  onTogglePrimary: (id: string) => void;
  onToggleBackground: (id: string) => void;
  onPromptChange: (v: string) => void;
  onGenerate: () => void;
  onCancel: () => void;
};

function SourcePickerForm({
  sources, primaryIds, backgroundIds, prompt,
  onTogglePrimary, onToggleBackground, onPromptChange, onGenerate, onCancel,
}: SourcePickerFormProps) {
  const exerciseSources = sources.filter(s => s.sourceType === "exercise");
  const materialSources = sources.filter(s => s.sourceType === "material");

  const renderSourceRow = (s: Source) => {
    const isPrimary = primaryIds.has(s.id);
    const isBackground = backgroundIds.has(s.id);
    return (
      <div key={s.id} className="flex items-center gap-2 py-1.5 px-1 rounded hover:bg-stone-800/30">
        <span className="flex-1 text-xs text-stone-300 truncate" title={s.originalName}>
          {s.originalName}
        </span>
        <button
          onClick={() => onTogglePrimary(s.id)}
          className={`text-[10px] font-medium px-2 py-0.5 rounded border transition-colors ${
            isPrimary
              ? "border-amber-600 bg-amber-900/40 text-amber-300"
              : "border-stone-700 text-stone-500 hover:border-stone-600 hover:text-stone-400"
          }`}
          title="Primary: defines study plan topics"
        >
          Primary
        </button>
        <button
          onClick={() => onToggleBackground(s.id)}
          className={`text-[10px] font-medium px-2 py-0.5 rounded border transition-colors ${
            isBackground
              ? "border-blue-600 bg-blue-900/40 text-blue-300"
              : "border-stone-700 text-stone-500 hover:border-stone-600 hover:text-stone-400"
          }`}
          title="Background: used to fill in explanations"
        >
          Background
        </button>
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scroll p-4 space-y-4">
      <div>
        <p className="text-xs text-stone-400 mb-2">
          Select which sources define the topics (<span className="text-amber-400">Primary</span>) and which provide background knowledge (<span className="text-blue-400">Background</span>).
        </p>
      </div>

      {exerciseSources.length > 0 && (
        <div>
          <h3 className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-1.5">Exercises</h3>
          <div className="space-y-0.5">
            {exerciseSources.map(renderSourceRow)}
          </div>
        </div>
      )}

      {materialSources.length > 0 && (
        <div>
          <h3 className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-1.5">Materials</h3>
          <div className="space-y-0.5">
            {materialSources.map(renderSourceRow)}
          </div>
        </div>
      )}

      <div>
        <label className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block mb-1.5">
          Instructions (optional)
        </label>
        <textarea
          value={prompt}
          onChange={e => onPromptChange(e.target.value)}
          placeholder="e.g. Focus on exam topics, use materials as background knowledge..."
          rows={3}
          className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-300 placeholder:text-stone-600 outline-none focus:border-stone-600 resize-none"
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onGenerate}
          disabled={primaryIds.size === 0 && backgroundIds.size === 0}
          className="flex-1 sunset-fill-btn border border-stone-500 text-[11px] text-stone-500 font-medium px-3 py-2 disabled:opacity-40"
        >
          Generate Plan{primaryIds.size > 0 ? ` (${primaryIds.size} primary)` : ""}
        </button>
        <button
          onClick={onCancel}
          className="text-xs text-stone-500 hover:text-stone-300 px-3 py-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
