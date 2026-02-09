import { useState } from "react";
import { createPortal } from "react-dom";

type NewNode = {
  label: string;
  description: string;
  category: string;
  importance: "high" | "medium" | "low";
};

type Props = {
  onAdd: (node: NewNode) => void;
  onClose: () => void;
};

const CATEGORIES = ["theory", "person", "event", "term", "process", "principle", "method"];

export default function AddNodeForm({ onAdd, onClose }: Props) {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("term");
  const [importance, setImportance] = useState<"high" | "medium" | "low">("medium");

  const handleSubmit = () => {
    if (!label.trim()) return;
    onAdd({ label: label.trim(), description: description.trim(), category, importance });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-stone-900 rounded-xl border border-stone-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
          <h2 className="text-base font-semibold text-stone-200">Add Concept</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-300 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-stone-400 mb-1">Label</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Concept name"
              autoFocus
              className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder:text-stone-600 outline-none focus:border-cyan-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description…"
              rows={2}
              className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder:text-stone-600 outline-none focus:border-cyan-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-400 mb-1">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    category === c
                      ? "bg-cyan-700/30 border border-cyan-600 text-cyan-300"
                      : "bg-stone-900 border border-stone-800 text-stone-500 hover:text-stone-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-400 mb-1">Importance</label>
            <div className="flex gap-1.5">
              {(["high", "medium", "low"] as const).map((imp) => (
                <button
                  key={imp}
                  onClick={() => setImportance(imp)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    importance === imp
                      ? "bg-cyan-700/30 border border-cyan-600 text-cyan-300"
                      : "bg-stone-900 border border-stone-800 text-stone-500 hover:text-stone-300"
                  }`}
                >
                  {imp.charAt(0).toUpperCase() + imp.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-stone-800">
          <button onClick={onClose} className="px-4 py-2 text-sm text-stone-500 hover:text-stone-300 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!label.trim()}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-cyan-700 hover:bg-cyan-600 transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
