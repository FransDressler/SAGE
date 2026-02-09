import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { ExamQuestion } from "../../../lib/api";
import MarkdownView from "../../Chat/MarkdownView";

type Props = {
  questions: ExamQuestion[];
  totalPoints: number;
  timeLimit: number;
  onClose: () => void;
  onChatAbout?: () => void;
};

type AnswerMap = Record<number, string>;

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ExamPlayer({ questions, totalPoints, timeLimit, onClose, onChatAbout }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [hintsShown, setHintsShown] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const q = questions[currentIdx];
  const total = questions.length;

  // Timer
  useEffect(() => {
    if (timeLimit <= 0 || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLimit, submitted]);

  const setAnswer = useCallback((qId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  }, []);

  const toggleFlag = useCallback((qId: number) => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitted(true);
  }, []);

  // Scoring
  const { score, maxScore, breakdown } = useMemo(() => {
    if (!submitted) return { score: 0, maxScore: totalPoints, breakdown: [] };
    let sc = 0;
    const bd = questions.map(q => {
      const userAnswer = answers[q.id] ?? "";
      let correct = false;
      if (q.type === "mcq" && q.correctAnswer) {
        correct = userAnswer === q.correctAnswer;
      }
      if (correct) sc += q.points;
      return { ...q, userAnswer, correct };
    });
    return { score: sc, maxScore: totalPoints, breakdown: bd };
  }, [submitted, questions, answers, totalPoints]);

  const answeredCount = Object.keys(answers).length;
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  // Results view
  if (submitted) {
    return (
      <div className="relative h-full flex flex-col">
        <div className="sticky top-0 z-10 self-end m-2 flex gap-1">
          {onChatAbout && (
            <button onClick={onChatAbout} className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors backdrop-blur-sm" title="Chat about this">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors backdrop-blur-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll px-4 pb-6 space-y-4">
          {/* Score summary */}
          <div className={`p-5 rounded-2xl border text-center ${
            percentage >= 70 ? "bg-green-900/20 border-green-700" :
            percentage >= 50 ? "bg-yellow-900/20 border-yellow-700" :
            "bg-red-900/20 border-red-700"
          }`}>
            <div className="text-4xl font-bold text-white mb-1">{percentage}%</div>
            <div className="text-sm text-stone-400">
              {score} / {maxScore} points
            </div>
            <div className="text-xs text-stone-500 mt-1">
              {questions.filter(q => q.type === "mcq").length} auto-graded MCQ
              {questions.filter(q => q.type === "open").length > 0 && ` · ${questions.filter(q => q.type === "open").length} open-ended (self-grade)`}
            </div>
          </div>

          {/* Per-question review */}
          <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider">Review</h3>
          {breakdown.map((item, i) => (
            <div key={item.id} className={`p-4 rounded-xl border ${
              item.type === "open" ? "bg-stone-900/50 border-stone-800" :
              item.correct ? "bg-green-900/10 border-green-800/40" :
              "bg-red-900/10 border-red-800/40"
            }`}>
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xs font-bold text-stone-500 shrink-0 mt-0.5">Q{i + 1}</span>
                <div className="flex-1">
                  <div className="text-sm text-stone-200 [&_p]:my-0.5 [&_p]:text-stone-200"><MarkdownView md={item.question} /></div>
                  <p className="text-[11px] text-stone-600 mt-0.5">From: {item.source} · {item.points} pt{item.points !== 1 ? "s" : ""}</p>
                </div>
                {item.type === "mcq" && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${item.correct ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                    {item.correct ? "Correct" : "Wrong"}
                  </span>
                )}
                {item.type === "open" && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-stone-800 text-stone-400">Self-grade</span>
                )}
              </div>

              {item.type === "mcq" && (
                <div className="space-y-1 ml-5">
                  <div className="text-xs text-stone-400">
                    Your answer: <span className={`${item.correct ? "text-green-400" : "text-red-400"} [&_p]:my-0 [&_p]:inline`}>
                      {item.userAnswer ? <MarkdownView md={item.userAnswer} /> : "(no answer)"}
                    </span>
                  </div>
                  {!item.correct && item.correctAnswer && (
                    <div className="text-xs text-green-400 [&_p]:my-0 [&_p]:inline">Correct: <MarkdownView md={item.correctAnswer} /></div>
                  )}
                </div>
              )}

              {item.type === "open" && (
                <div className="space-y-1 ml-5">
                  <p className="text-xs text-stone-400">Your answer:</p>
                  <p className="text-xs text-stone-300 bg-stone-950 rounded p-2 whitespace-pre-wrap">{item.userAnswer || "(no answer)"}</p>
                  {item.correctAnswer && (
                    <>
                      <p className="text-xs text-stone-400 mt-2">Reference answer:</p>
                      <div className="text-xs bg-green-950/30 rounded p-2 [&_p]:my-0.5 [&_p]:text-green-300/80"><MarkdownView md={item.correctAnswer} /></div>
                    </>
                  )}
                </div>
              )}

              {/* Solution */}
              {item.solution && (
                <div className="mt-3 ml-5 p-3 bg-blue-950/20 border border-blue-800/30 rounded-lg">
                  <p className="text-[11px] font-semibold text-blue-400/80 uppercase tracking-wider mb-2">Solution</p>
                  <div className="text-xs [&_p]:my-1 [&_p]:text-stone-300 [&_li]:text-stone-300 [&_strong]:text-stone-200"><MarkdownView md={item.solution} /></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Exam view
  return (
    <div className="relative h-full flex flex-col">
      {/* Header bar */}
      <div className="px-4 py-3 border-b border-stone-800 shrink-0 flex items-center gap-3">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-xs text-stone-400">
            Question {currentIdx + 1} / {total} · {answeredCount} answered
          </div>
        </div>

        {timeLimit > 0 && (
          <div className={`text-sm font-mono font-bold ${timeRemaining < 60 ? "text-red-400 animate-pulse" : timeRemaining < 300 ? "text-yellow-400" : "text-stone-300"}`}>
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      {/* Question navigation dots */}
      <div className="px-4 py-2 border-b border-stone-800 shrink-0">
        <div className="flex flex-wrap gap-1">
          {questions.map((qi, i) => {
            const isAnswered = answers[qi.id] != null && answers[qi.id] !== "";
            const isFlagged = flagged.has(qi.id);
            const isCurrent = i === currentIdx;
            return (
              <button
                key={qi.id}
                onClick={() => setCurrentIdx(i)}
                className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all ${
                  isCurrent
                    ? "bg-rose-700 text-white ring-2 ring-rose-500/50"
                    : isAnswered
                    ? "bg-green-900/30 text-green-400 border border-green-800/40"
                    : isFlagged
                    ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800/40"
                    : "bg-stone-900 text-stone-500 border border-stone-800"
                }`}
                title={`Q${i + 1}${isAnswered ? " (answered)" : ""}${isFlagged ? " (flagged)" : ""}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question content */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scroll px-4 py-4 space-y-4">
        {q && (
          <div className="bg-stone-950 border border-stone-900 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-[10px] font-bold text-stone-600 uppercase">
                {q.type === "mcq" ? "Multiple Choice" : "Open-Ended"} · {q.points} pt{q.points !== 1 ? "s" : ""}
              </span>
              <span className="text-[10px] text-stone-600 truncate max-w-[50%]">{q.source}</span>
            </div>

            <div className="text-base font-semibold text-white mb-4 [&_p]:my-1 [&_p]:text-white">
              <MarkdownView md={q.question} />
            </div>

            {q.type === "mcq" && q.options && (
              <div className="space-y-2">
                {q.options.map((opt, i) => {
                  const isSelected = answers[q.id] === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => setAnswer(q.id, opt)}
                      className={`w-full p-3 border rounded-xl text-left transition-all ${
                        isSelected
                          ? "border-rose-500 bg-rose-600/20"
                          : "border-stone-800 hover:border-stone-700 hover:bg-stone-900/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected ? "border-rose-500 text-rose-400" : "border-stone-600 text-stone-400"
                        }`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-sm text-stone-200 [&_p]:my-0 [&_p]:inline"><MarkdownView md={opt} /></span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === "open" && (
              <textarea
                value={answers[q.id] ?? ""}
                onChange={e => setAnswer(q.id, e.target.value)}
                rows={5}
                placeholder="Write your answer here..."
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-200 placeholder:text-stone-600 outline-none focus:border-rose-600 resize-none"
              />
            )}

            {/* Hint */}
            {q.hint && !hintsShown.has(q.id) && (
              <div className="mt-4">
                <button
                  onClick={() => setHintsShown(prev => new Set(prev).add(q.id))}
                  className="text-xs text-stone-500 hover:text-yellow-400 transition-colors"
                >
                  Show hint
                </button>
              </div>
            )}
            {q.hint && hintsShown.has(q.id) && (
              <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                <p className="text-xs font-medium text-yellow-400/80 mb-1">Hint</p>
                <div className="text-xs [&_p]:my-0.5 [&_p]:text-yellow-200"><MarkdownView md={q.hint} /></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="px-4 py-3 border-t border-stone-800 shrink-0 flex items-center gap-2">
        <button
          onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-800 text-stone-300 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-default transition-colors"
        >
          Prev
        </button>

        <button
          onClick={() => toggleFlag(q.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            flagged.has(q.id)
              ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800/40"
              : "bg-stone-800 text-stone-400 hover:text-yellow-400"
          }`}
        >
          {flagged.has(q.id) ? "Flagged" : "Flag"}
        </button>

        <div className="flex-1" />

        {currentIdx < total - 1 ? (
          <button
            onClick={() => setCurrentIdx(i => Math.min(total - 1, i + 1))}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-rose-700 text-white hover:bg-rose-600 transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-rose-600 text-white hover:bg-rose-500 transition-colors"
          >
            Submit Exam
          </button>
        )}
      </div>
    </div>
  );
}
