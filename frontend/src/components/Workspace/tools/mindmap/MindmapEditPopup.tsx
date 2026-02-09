import { useState } from "react";
import { createPortal } from "react-dom";
import ModelSelector from "../../ModelSelector";
import { useModels } from "../../../../context/ModelContext";

type Props = {
  onSubmit: (instruction: string, model?: { provider?: string; model?: string }) => void;
  onClose: () => void;
  loading: boolean;
};

const EXAMPLES = [
  "Add a node about…",
  "Connect A to B",
  "Remove all low-importance nodes",
  "Add more detail to…",
  "Group related concepts together",
];

export default function MindmapEditPopup({ onSubmit, onClose, loading }: Props) {
  const { chatModel } = useModels();
  const [instruction, setInstruction] = useState("");
  const [toolModel, setToolModel] = useState(chatModel);

  const handleSubmit = () => {
    const trimmed = instruction.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed, {
      provider: toolModel.provider || undefined,
      model: toolModel.model || undefined,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-stone-900 rounded-xl border border-stone-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
          <h2 className="text-base font-semibold text-stone-200">AI Edit Mindmap</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-300 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <label className="block text-xs font-medium text-stone-400">
            What would you like to change?
          </label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Describe your changes…"
            rows={3}
            autoFocus
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
            }}
            className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder:text-stone-600 outline-none focus:border-cyan-600 resize-none disabled:opacity-50"
          />
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setInstruction(ex)}
                disabled={loading}
                className="text-[11px] px-2 py-1 rounded-md bg-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-700 transition-colors disabled:opacity-50"
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-medium text-stone-400 mb-1.5">Model</label>
            <ModelSelector
              value={toolModel.provider}
              onChange={(provider, model) => setToolModel({ provider, model })}
              className="w-full"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-stone-800">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-stone-500 hover:text-stone-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!instruction.trim() || loading}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-cyan-700 hover:bg-cyan-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {loading ? "Applying…" : "Apply"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
