import { useState } from "react";

type NodeData = {
  label: string;
  description: string;
  category: string;
  importance: "high" | "medium" | "low";
};

type Props = {
  nodeId: string;
  nodeData: NodeData;
  position: { x: number; y: number };
  onEdit: (nodeId: string, data: NodeData) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
};

const CATEGORIES = ["theory", "person", "event", "term", "process", "principle", "method"];

export default function NodeContextMenu({ nodeId, nodeData, position, onEdit, onDelete, onClose }: Props) {
  const [mode, setMode] = useState<"menu" | "edit">("menu");
  const [label, setLabel] = useState(nodeData.label);
  const [description, setDescription] = useState(nodeData.description);
  const [category, setCategory] = useState(nodeData.category);
  const [importance, setImportance] = useState(nodeData.importance);

  const handleSave = () => {
    if (!label.trim()) return;
    onEdit(nodeId, { label: label.trim(), description: description.trim(), category, importance });
    onClose();
  };

  const handleDelete = () => {
    onDelete(nodeId);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-stone-900 border border-stone-700 rounded-lg shadow-2xl overflow-hidden"
        style={{ left: position.x, top: position.y, minWidth: mode === "edit" ? 280 : 160 }}
      >
        {mode === "menu" ? (
          <div className="py-1">
            <button
              onClick={() => setMode("edit")}
              className="w-full px-3 py-2 text-left text-xs text-stone-300 hover:bg-stone-800 transition-colors flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              Edit Node
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Delete Node
            </button>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            <div>
              <label className="block text-[10px] font-medium text-stone-500 mb-0.5">Label</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                autoFocus
                className="w-full bg-stone-950 border border-stone-800 rounded px-2 py-1 text-xs text-stone-200 outline-none focus:border-cyan-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-stone-500 mb-0.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-stone-950 border border-stone-800 rounded px-2 py-1 text-xs text-stone-200 outline-none focus:border-cyan-600 resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-stone-500 mb-0.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded px-2 py-1 text-xs text-stone-200 outline-none focus:border-cyan-600"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-stone-500 mb-0.5">Importance</label>
              <div className="flex gap-1">
                {(["high", "medium", "low"] as const).map((imp) => (
                  <button
                    key={imp}
                    onClick={() => setImportance(imp)}
                    className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${
                      importance === imp
                        ? "bg-cyan-700/30 border border-cyan-600 text-cyan-300"
                        : "bg-stone-950 border border-stone-800 text-stone-500"
                    }`}
                  >
                    {imp}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={onClose} className="px-2 py-1 text-[11px] text-stone-500 hover:text-stone-300">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!label.trim()}
                className="px-3 py-1 rounded text-[11px] font-medium text-white bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
