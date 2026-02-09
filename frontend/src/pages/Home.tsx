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
    <div className="h-screen relative">
      {/* Grid lines — two vertical + two horizontal spanning the full viewport */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Vertical lines */}
        <div className="absolute top-0 bottom-0 left-[8%] sm:left-[12%] w-px bg-stone-700/40" />
        <div className="absolute top-0 bottom-0 right-[8%] sm:right-[12%] w-px bg-stone-700/40" />
        {/* Horizontal lines */}
        <div className="absolute left-0 right-0 top-[18%] h-px bg-stone-700/40" />
        <div className="absolute left-0 right-0 bottom-[14%] h-px bg-stone-700/40" />
      </div>

      {/* Content — positioned in the center cell */}
      <div className="relative h-full flex flex-col items-center justify-center px-[10%] sm:px-[14%]">
        {/* Title area — upper center */}
        <div className="flex flex-col items-center mb-8">
          <h1
            className="text-6xl sm:text-7xl font-bold tracking-[0.08em] mb-3 bg-clip-text text-transparent select-none"
            style={{
              fontFamily: "'Permanent Marker', cursive",
              backgroundImage: `
                radial-gradient(ellipse at 15% 50%, #E8956A 0%, transparent 50%),
                radial-gradient(ellipse at 85% 40%, #6A8CB8 0%, transparent 50%),
                radial-gradient(ellipse at 45% 80%, #D4704A 0%, transparent 45%),
                radial-gradient(ellipse at 65% 15%, #8AACC8 0%, transparent 45%),
                linear-gradient(135deg, #E8A06A 0%, #D07850 25%, #C85A5A 50%, #9068A0 75%, #5878A8 100%)
              `,
            }}
          >
            S.A.G.E.
          </h1>
          <p className="text-sm text-stone-500 tracking-wide">Study Aid for Guided Education</p>
        </div>

        {/* Subjects area — lower center, inside the inner rectangle */}
        <div className="w-full max-w-3xl">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-stone-600 border-t-bone rounded-full animate-spin" />
            </div>
          ) : subjects.length === 0 ? (
            <div className="flex flex-col items-center text-stone-500">
              <p className="text-sm text-stone-600 mb-6">Create your first subject to get started</p>
              <button
                onClick={() => setShowCreate(true)}
                className="px-5 py-2 bg-accent hover:bg-accent-hover text-stone-950 rounded-lg text-sm font-medium transition-colors"
              >
                + Create Subject
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-stone-500 uppercase tracking-wider font-medium">Subjects</span>
                <button
                  onClick={() => setShowCreate(true)}
                  className="sunset-btn text-xs text-stone-500 font-medium px-3 py-1 rounded-md"
                >
                  + New
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-16">
                {subjects.map((s, i) => (
                  <div key={s.id} className="animate-[fadeIn_300ms_ease_both]" style={{ animationDelay: `${i * 50}ms` }}>
                    <SubjectCard
                      subject={s}
                      onClick={() => navigate(`/subject/${s.id}`)}
                      onDelete={() => handleDelete(s.id)}
                      onRename={(name) => handleRename(s.id, name)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateSubjectDialog
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
