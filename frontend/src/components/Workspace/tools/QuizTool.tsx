import { useEffect, useMemo, useRef, useState } from "react";
import { useSubject } from "../../../context/SubjectContext";
import { useModels } from "../../../context/ModelContext";
import { quizStart, connectQuizStream, type QuizEvent } from "../../../lib/api";
import ModelSelector from "../ModelSelector";
import QuestionCard from "../../Quiz/QuestionCard";
import QuizHeader from "../../Quiz/QuizHeader";
import ResultsPanel from "../../Quiz/ResultsPanel";
import ReviewModal from "../../Quiz/ReviewModal";

type Question = { id: number; question: string; options: string[]; correct: number; hint: string; explanation: string; imageHtml?: string };
type UA = { questionId: number; selectedAnswer: number; correct: boolean; question: string; selectedOption: string; correctOption: string; explanation: string };

function takeQuizArray(a: unknown): Question[] {
  if (Array.isArray(a)) return a as Question[];
  if (Array.isArray((a as any)?.quiz)) return (a as any).quiz as Question[];
  return [];
}

export default function QuizTool() {
  const { subject } = useSubject();
  const { chatModel } = useModels();
  const [toolModel, setToolModel] = useState(chatModel);
  const [topic, setTopic] = useState(subject?.name || "");
  const [qs, setQs] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExp, setShowExp] = useState(false);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<UA[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const closeRef = useRef<null | (() => void)>(null);

  const total = qs.length;
  const q = qs[idx];
  const percentage = useMemo(() => (total ? Math.round((score / total) * 100) : 0), [score, total]);
  const resultVisual = useMemo(() => {
    if (percentage >= 90) return { msg: "Excellent!", cls: "bg-green-900/20 border border-green-700 text-green-200", icon: "A+" };
    if (percentage >= 70) return { msg: "Great job!", cls: "bg-stone-800/40 border border-stone-700 text-bone", icon: "B+" };
    if (percentage >= 50) return { msg: "Good effort!", cls: "bg-yellow-900/20 border border-yellow-700 text-yellow-200", icon: "C+" };
    return { msg: "Keep studying!", cls: "bg-red-900/20 border border-red-700 text-red-200", icon: "D" };
  }, [percentage]);

  useEffect(() => () => { if (closeRef.current) closeRef.current(); }, []);

  function resetQ() { setIdx(0); setSelected(null); setShowHint(false); setShowExp(false); }

  async function start() {
    if (!topic.trim() || !subject) return;
    if (closeRef.current) closeRef.current();
    setQs([]); resetQ(); setScore(0); setDone(false); setAnswers([]); setConnecting(true);
    try {
      const s = await quizStart(subject.id, { topic: topic.trim(), provider: toolModel.provider || undefined, model: toolModel.model || undefined });
      const { close } = connectQuizStream(s.quizId, (ev: QuizEvent) => {
        if (ev.type === "quiz") {
          const arr = takeQuizArray(ev.quiz).map(q => ({ ...q, correct: typeof q.correct === "number" ? Math.max(0, q.correct - 1) : 0 }));
          setQs(arr); resetQ(); setConnecting(false);
        }
        if (ev.type === "done" || ev.type === "error") setConnecting(false);
      });
      closeRef.current = close;
    } catch { setConnecting(false); }
  }

  const onSelect = (i: number) => { if (!showExp) setSelected(i); };
  const onNext = () => {
    if (selected == null || !q) return;
    const correct = selected === q.correct;
    setAnswers(a => [...a, { questionId: q.id, selectedAnswer: selected, correct, question: q.question, selectedOption: q.options[selected], correctOption: q.options[q.correct], explanation: q.explanation }]);
    setShowExp(true);
    if (correct) setScore(s => s + 1);
    setTimeout(() => { if (idx === total - 1) setDone(true); else { setIdx(n => n + 1); setSelected(null); setShowHint(false); setShowExp(false); } }, 350);
  };

  return (
    <div className="p-4 space-y-4">
      {qs.length === 0 && !connecting && !done && (
        <div className="space-y-3">
          <ModelSelector
            value={toolModel.provider}
            onChange={(provider, model) => setToolModel({ provider, model })}
          />
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Quiz topic..."
            className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder:text-stone-600 outline-none focus:border-green-600"
            onKeyDown={e => e.key === "Enter" && start()}
          />
          <button
            onClick={start}
            disabled={!topic.trim() || connecting}
            className="w-full py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Start Quiz
          </button>
        </div>
      )}

      {connecting && (
        <div className="py-8 text-center text-stone-500 text-sm">
          <div className="w-5 h-5 border-2 border-stone-600 border-t-green-600 rounded-full animate-spin mx-auto mb-2" />
          Building quiz...
        </div>
      )}

      {qs.length > 0 && !done && q && (
        <div className="space-y-3">
          <QuizHeader topic={topic} idx={idx} total={total} score={score} />
          <QuestionCard q={q} selected={selected} showExp={showExp} showHint={showHint} onSelect={onSelect} onHint={() => setShowHint(true)} onNext={onNext} isLast={idx === total - 1} />
        </div>
      )}

      {done && (
        <div className="space-y-3">
          <ResultsPanel score={score} total={total} percentage={percentage} visual={resultVisual} answers={answers} onRetake={() => { resetQ(); setScore(0); setDone(false); setAnswers([]); }} onReview={() => setReviewOpen(true)} onNewTopic={() => { setDone(false); setQs([]); setTopic(""); setAnswers([]); resetQ(); setScore(0); }} />
        </div>
      )}

      {reviewOpen && <ReviewModal answers={answers} onClose={() => setReviewOpen(false)} />}
    </div>
  );
}
