import { useState, useRef } from "react";
import { useSubject } from "../../../context/SubjectContext";
import { useModels } from "../../../context/ModelContext";
import { podcastStart, connectPodcastStream, type PodcastEvent } from "../../../lib/api";
import ModelSelector from "../ModelSelector";

export default function PodcastTool() {
  const { subject } = useSubject();
  const { chatModel } = useModels();
  const [toolModel, setToolModel] = useState(chatModel);
  const [topic, setTopic] = useState(subject?.name || "");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [status, setStatus] = useState("");
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [audioFilename, setAudioFilename] = useState<string | null>(null);

  const onGenerate = async () => {
    if (!topic.trim() || busy || !subject) return;
    setBusy(true);
    busyRef.current = true;
    setStatus("Starting...");
    setAudioFile(null);
    setAudioFilename(null);

    try {
      const { pid } = await podcastStart(subject.id, {
        topic,
        provider: toolModel.provider || undefined,
        model: toolModel.model || undefined,
      });
      await new Promise(r => setTimeout(r, 100));

      const { close } = connectPodcastStream(pid, (ev: PodcastEvent) => {
        if (ev.type === "ready") setStatus("Generating script...");
        if (ev.type === "script") setStatus("Creating audio...");
        if (ev.type === "audio") {
          setAudioFile(ev.file || ev.staticUrl || "");
          setAudioFilename(ev.filename || "podcast.mp3");
          setStatus("Ready!");
        }
        if (ev.type === "done") { setBusy(false); busyRef.current = false; setTimeout(() => close(), 1000); }
        if (ev.type === "error") { setStatus(`Error: ${ev.error}`); close(); setBusy(false); busyRef.current = false; }
      });

      setTimeout(() => { if (busyRef.current) { setStatus("Timeout"); setBusy(false); busyRef.current = false; close(); } }, 120000);
    } catch (e: any) {
      setStatus(e.message || "Failed");
      setBusy(false);
      busyRef.current = false;
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
        placeholder="Podcast topic..."
        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder:text-stone-600 outline-none focus:border-purple-600"
        onKeyDown={e => e.key === "Enter" && onGenerate()}
      />
      <button
        onClick={onGenerate}
        disabled={busy || !topic.trim()}
        className="w-full py-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
      >
        {busy ? "Generating..." : "Generate Podcast"}
      </button>

      {status && (
        <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-800/40 text-purple-200 text-sm">
          {status}
        </div>
      )}

      {audioFile && (
        <div className="space-y-2">
          <audio controls className="w-full" src={audioFile} />
          <a
            href={audioFile}
            download={audioFilename || "podcast.mp3"}
            className="block py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium text-center transition-colors"
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
}
