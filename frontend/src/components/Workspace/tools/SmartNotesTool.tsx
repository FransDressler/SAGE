import { useState, useEffect } from "react";
import { useSubject } from "../../../context/SubjectContext";
import { useModels } from "../../../context/ModelContext";
import { smartnotesStart, connectSmartnotesStream, fetchMarkdownContent, type SmartNotesEvent, type SmartNotesMode } from "../../../lib/api";
import ModelSelector from "../ModelSelector";
import MarkdownView from "../../Chat/MarkdownView";

const MODES: { value: SmartNotesMode; label: string; desc: string }[] = [
  { value: "deep", label: "Deep Notes", desc: "Comprehensive notes with graph context, Wikipedia, and images" },
  { value: "summary", label: "Summary", desc: "Concise overview of key points" },
  { value: "study-guide", label: "Study Guide", desc: "Exam-focused with practice questions" },
];

const PHASE_LABELS: Record<string, string> = {
  planning: "Analyzing topic",
  gathering: "Retrieving sources",
  generating: "Writing notes",
  assembling: "Finalizing",
  done: "Complete",
};

export default function SmartNotesTool() {
  const { subject } = useSubject();
  const { chatModel } = useModels();
  const [toolModel, setToolModel] = useState(chatModel);
  const [topic, setTopic] = useState(subject?.name || "");
  const [mode, setMode] = useState<SmartNotesMode>("deep");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [phase, setPhase] = useState("");
  const [filePath, setFilePath] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);

  useEffect(() => {
    if (!filePath || filePath.endsWith(".pdf")) return;
    fetchMarkdownContent(filePath)
      .then(setMarkdown)
      .catch(e => setStatus(`Failed to load notes: ${e.message || e}`));
  }, [filePath]);

  const handleDownload = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic || "notes"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onGenerate = async () => {
    if (!topic.trim() || busy || !subject) return;
    setBusy(true);
    setStatus("Starting...");
    setPhase("");
    setFilePath(null);
    setMarkdown(null);

    try {
      const { noteId } = await smartnotesStart(subject.id, {
        topic,
        mode,
        provider: toolModel.provider || undefined,
        model: toolModel.model || undefined,
      });
      const { close } = connectSmartnotesStream(noteId, (ev: SmartNotesEvent) => {
        if (ev.type === "phase") {
          const label = PHASE_LABELS[ev.value] || ev.value;
          setPhase(ev.value);
          setStatus(ev.detail ? `${label}: ${ev.detail}` : `${label}...`);
        }
        if (ev.type === "file") { setFilePath(ev.file); setStatus("Ready!"); setPhase("done"); }
        if (ev.type === "done") { close(); setBusy(false); }
        if (ev.type === "error") { setStatus(`Error: ${ev.error}`); close(); setBusy(false); }
      });
    } catch (e: any) {
      setStatus(e.message || "Failed");
      setBusy(false);
    }
  };

  const phaseSteps = ["planning", "gathering", "generating", "assembling", "done"];
  const currentStep = phaseSteps.indexOf(phase);

  return (
    <div className="p-4 space-y-3">
      <ModelSelector
        value={toolModel.provider}
        onChange={(provider, model) => setToolModel({ provider, model })}
      />

      {/* Mode selector */}
      <div className="flex gap-1.5">
        {MODES.map(m => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            title={m.desc}
            className={`flex-1 py-1.5 px-2 text-xs rounded-lg border transition-colors ${
              mode === m.value
                ? "bg-accent/20 border-accent text-accent"
                : "bg-stone-900 border-stone-800 text-bone-muted hover:border-stone-600"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <input
        value={topic}
        onChange={e => setTopic(e.target.value)}
        placeholder="Notes topic..."
        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-sm text-bone placeholder:text-stone-600 outline-none focus:border-stone-600"
        onKeyDown={e => e.key === "Enter" && onGenerate()}
      />
      <button
        onClick={onGenerate}
        disabled={busy || !topic.trim()}
        className="w-full py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-stone-950 rounded-lg text-sm font-medium transition-colors"
      >
        {busy ? "Generating..." : "Generate Notes"}
      </button>

      {/* Progress indicator */}
      {busy && phase && (
        <div className="space-y-2">
          <div className="flex gap-1">
            {phaseSteps.slice(0, -1).map((step, i) => (
              <div
                key={step}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i < currentStep ? "bg-accent" :
                  i === currentStep ? "bg-accent/60 animate-pulse" :
                  "bg-stone-800"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {status && (
        <div className="p-3 rounded-lg bg-stone-800/40 border border-stone-700/40 text-bone-muted text-sm">
          {status}
        </div>
      )}

      {filePath && (
        <button
          onClick={handleDownload}
          disabled={!markdown}
          className="w-full py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium text-center transition-colors"
        >
          Download Notes (.md)
        </button>
      )}

      {markdown && (
        <div className="mt-4 p-4 rounded-lg bg-stone-900/50 border border-stone-800 overflow-y-auto custom-scroll max-h-[600px]">
          <MarkdownView md={markdown} />
        </div>
      )}
    </div>
  );
}
