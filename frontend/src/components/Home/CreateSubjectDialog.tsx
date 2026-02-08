import { useState } from "react";

type Props = {
  onClose: () => void;
  onCreate: (name: string) => void;
};

export default function CreateSubjectDialog({ onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;
    setLoading(true);
    try {
      await onCreate(name.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-stone-900 border border-stone-800 rounded-xl p-6 w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-medium text-bone-light mb-4">New Subject</h2>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Biology 101, History of Art..."
            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-bone-light placeholder:text-stone-600 outline-none focus:border-stone-600 transition-colors mb-4"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-stone-400 hover:text-stone-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:hover:bg-accent text-stone-950 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
