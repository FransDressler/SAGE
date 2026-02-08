import { useRef, useState } from "react";
import { useSubject } from "../../../context/SubjectContext";
import { transcribeAudio } from "../../../lib/api";

export default function TranscriberTool() {
  const { subject } = useSubject();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [transcription, setTranscription] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file || !subject) return;
    setBusy(true);
    setStatus("Transcribing...");
    setTranscription(null);
    setConfidence(null);

    try {
      const result = await transcribeAudio(subject.id, file);
      if (result.ok && result.transcription) {
        setTranscription(result.transcription);
        setConfidence(result.confidence || null);
        setStatus("Done!");
      } else {
        setStatus(`Error: ${result.error || "Failed"}`);
      }
    } catch (e: any) {
      setStatus(`Error: ${e.message || "Failed"}`);
    } finally {
      setBusy(false);
    }
  };

  const copyToClipboard = () => {
    if (transcription) {
      navigator.clipboard.writeText(transcription);
      setStatus("Copied!");
    }
  };

  return (
    <div className="p-4 space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,video/*"
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ""; }}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={busy}
        className="w-full py-2 bg-orange-700 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        {busy ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Audio/Video
          </>
        )}
      </button>

      {status && (
        <div className={`p-3 rounded-lg text-sm ${
          status.startsWith("Error")
            ? "bg-red-950/40 border border-red-800/40 text-red-200"
            : "bg-orange-950/40 border border-orange-800/40 text-orange-200"
        }`}>
          {status}
          {confidence != null && (
            <span className="block text-xs mt-1 opacity-75">
              Confidence: {Math.round(confidence * 100)}%
            </span>
          )}
        </div>
      )}

      {transcription && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">Transcription</span>
            <button
              onClick={copyToClipboard}
              className="text-xs px-2 py-1 rounded bg-stone-800 text-stone-300 hover:bg-stone-700 transition-colors"
            >
              Copy
            </button>
          </div>
          <div className="text-sm text-stone-200 bg-stone-900/50 border border-stone-800 rounded-lg p-3 max-h-48 overflow-y-auto">
            {transcription}
          </div>
        </div>
      )}
    </div>
  );
}
