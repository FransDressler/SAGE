import { useState, useEffect } from "react";
import { useSubject } from "../../../context/SubjectContext";
import { useModels } from "../../../context/ModelContext";
import { smartnotesStart, connectSmartnotesStream, fetchMarkdownContent, type SmartNotesEvent } from "../../../lib/api";
import ModelSelector from "../ModelSelector";
import MarkdownView from "../../Chat/MarkdownView";

export default function SmartNotesTool() {
  const { subject } = useSubject();
  const { chatModel } = useModels();
  const [toolModel, setToolModel] = useState(chatModel);
  const [topic, setTopic] = useState(subject?.name || "");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
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
    setFilePath(null);
    setMarkdown(null);

    try {
      const { noteId } = await smartnotesStart(subject.id, {
        topic,
        provider: toolModel.provider || undefined,
        model: toolModel.model || undefined,
      });
      const { close } = connectSmartnotesStream(noteId, (ev: SmartNotesEvent) => {
        if (ev.type === "phase") setStatus(`${ev.value}...`);
        if (ev.type === "file") { setFilePath(ev.file); setStatus("Ready!"); }
        if (ev.type === "done") { close(); setBusy(false); }
        if (ev.type === "error") { setStatus(`Error: ${ev.error}`); close(); setBusy(false); }
      });
    } catch (e: any) {
      setStatus(e.message || "Failed");
      setBusy(false);
    }
  };

  return (
    <div className="p-4 space-y-3">
      <ModelSelector
        value={toolModel.provider}
        onChange={(provider, model) => setToolModel({ provider, model })}
      />
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
        <div className="mt-4 p-4 rounded-lg bg-stone-900/50 border border-stone-800 overflow-y-auto custom-scroll max-h-96">
          <MarkdownView md={markdown} />
        </div>
      )}
    </div>
  );
}
