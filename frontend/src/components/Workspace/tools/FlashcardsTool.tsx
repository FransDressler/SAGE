import { useEffect, useState } from "react";
import { useSubject } from "../../../context/SubjectContext";
import { createFlashcard, listFlashcards, deleteFlashcard, type SavedFlashcard } from "../../../lib/api";

export default function FlashcardsTool() {
  const { subject } = useSubject();
  const [cards, setCards] = useState<SavedFlashcard[]>([]);
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [tag, setTag] = useState("core");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subject) return;
    setLoading(true);
    listFlashcards(subject.id)
      .then(res => setCards(res.flashcards || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subject]);

  const handleCreate = async () => {
    if (!q.trim() || !a.trim() || !subject) return;
    try {
      const res = await createFlashcard(subject.id, { question: q.trim(), answer: a.trim(), tag });
      setCards(prev => [res.flashcard, ...prev]);
      setQ("");
      setA("");
    } catch (e) {
      console.error("Failed to create flashcard", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!subject) return;
    try {
      await deleteFlashcard(subject.id, id);
      setCards(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error("Failed to delete flashcard", e);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Create form */}
      <div className="space-y-2">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Question..."
          className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder:text-stone-600 outline-none focus:border-amber-600"
        />
        <textarea
          value={a}
          onChange={e => setA(e.target.value)}
          placeholder="Answer..."
          rows={2}
          className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder:text-stone-600 outline-none focus:border-amber-600 resize-none"
        />
        <button
          onClick={handleCreate}
          disabled={!q.trim() || !a.trim()}
          className="w-full py-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Add Card
        </button>
      </div>

      {/* Cards list */}
      {loading ? (
        <div className="text-center text-stone-500 text-sm py-4">Loading...</div>
      ) : cards.length === 0 ? (
        <div className="text-center text-stone-600 text-sm py-4">No flashcards yet</div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs text-stone-500 font-medium">{cards.length} card{cards.length !== 1 ? "s" : ""}</div>
          {cards.map(c => (
            <div key={c.id} className="p-3 rounded-lg bg-stone-900/50 border border-stone-800 group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-200 font-medium">{c.question}</p>
                  <p className="text-xs text-stone-400 mt-1">{c.answer}</p>
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-stone-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
