import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listSubjects, createSubject, deleteSubject, renameSubject, type Subject } from "../lib/api";
import SubjectCard from "../components/Home/SubjectCard";
import CreateSubjectDialog from "../components/Home/CreateSubjectDialog";

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await listSubjects();
      setSubjects(res.subjects);
    } catch (e) {
      console.error("Failed to load subjects", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (name: string) => {
    try {
      const res = await createSubject(name);
      setShowCreate(false);
      navigate(`/subject/${res.subject.id}`);
    } catch (e) {
      console.error("Failed to create subject", e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubject(id);
      setSubjects(s => s.filter(x => x.id !== id));
    } catch (e) {
      console.error("Failed to delete subject", e);
    }
  };

  const handleRename = async (id: string, name: string) => {
    try {
      await renameSubject(id, name);
      setSubjects(s => s.map(x => x.id === id ? { ...x, name } : x));
    } catch (e) {
      console.error("Failed to rename subject", e);
    }
  };

  return (
    <div className="min-h-screen px-6 py-8 max-w-5xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-semibold text-bone-light tracking-tight">PageLM</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-stone-950 rounded-lg text-sm font-medium transition-colors"
        >
          + New Subject
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-stone-600 border-t-bone rounded-full animate-spin" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-stone-500">
          <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-lg mb-2">No subjects yet</p>
          <p className="text-sm mb-6">Create your first subject to get started</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-stone-950 rounded-lg text-sm font-medium transition-colors"
          >
            + Create Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(s => (
            <SubjectCard
              key={s.id}
              subject={s}
              onClick={() => navigate(`/subject/${s.id}`)}
              onDelete={() => handleDelete(s.id)}
              onRename={(name) => handleRename(s.id, name)}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateSubjectDialog
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
