import { useState, useMemo, useCallback } from "react";
import QuizHeader from "../../Quiz/QuizHeader";
import ResultsPanel from "../../Quiz/ResultsPanel";
import ReviewModal from "../../Quiz/ReviewModal";

type Question = { id: number; question: string; options: string[]; correct: number; hint: string; explanation: string; imageHtml?: string };
type UA = { questionId: number; selectedAnswer: number; correct: boolean; question: string; selectedOption: string; correctOption: string; explanation: string };

type Props = {
  questions: Question[];
  topic: string;
  onClose: () => void;
};

export default function QuizPlayer({ questions, topic, onClose }: Props) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<UA[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);

  const total = questions.length;
  const q = questions[idx];
  const percentage = useMemo(() => (total ? Math.round((score / total) * 100) : 0), [score, total]);
  const resultVisual = useMemo(() => {
    if (percentage >= 90) return { msg: "Excellent!", cls: "bg-green-900/20 border border-green-700 text-green-200", icon: "A+" };
    if (percentage >= 70) return { msg: "Great job!", cls: "bg-stone-800/40 border border-stone-700 text-bone", icon: "B+" };
    if (percentage >= 50) return { msg: "Good effort!", cls: "bg-yellow-900/20 border border-yellow-700 text-yellow-200", icon: "C+" };
    return { msg: "Keep studying!", cls: "bg-red-900/20 border border-red-700 text-red-200", icon: "D" };
  }, [percentage]);

  function resetQ() { setIdx(0); setSelected(null); setShowHint(false); setAnswered(false); }

  const onSelect = useCallback((i: number) => {
    if (answered || !q) return;
    setSelected(i);
    setAnswered(true);

    const correct = i === q.correct;
    if (correct) setScore(s => s + 1);
    setAnswers(a => [...a, {
      questionId: q.id,
      selectedAnswer: i,
      correct,
      question: q.question,
      selectedOption: q.options[i],
      correctOption: q.options[q.correct],
      explanation: q.explanation,
    }]);

    // Auto-advance after showing feedback
    setTimeout(() => {
      if (idx === total - 1) {
        setDone(true);
      } else {
        setIdx(n => n + 1);
        setSelected(null);
        setShowHint(false);
        setAnswered(false);
      }
    }, 1800);
  }, [answered, q, idx, total]);

  return (
    <div className="relative h-full flex flex-col">
      {/* Close button */}
      <button
        onClick={onClose}
        className="sticky top-0 z-10 self-end m-2 p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors backdrop-blur-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex-1 overflow-y-auto custom-scroll px-4 pb-4 space-y-3">
        {!done && q && (
          <>
            <QuizHeader topic={topic} idx={idx} total={total} score={score} />

            {/* Inline question card with immediate feedback */}
            <div className="space-y-8">
              <div className="bg-stone-950 border border-stone-900 rounded-2xl p-5">
                <h2 className="text-lg font-semibold text-white mb-4">{q.question}</h2>
                {q.imageHtml && (
                  <div className="mb-4" dangerouslySetInnerHTML={{ __html: q.imageHtml }} />
                )}

                <div className="space-y-2.5">
                  {q.options.map((opt, i) => {
                    const isSelected = selected === i;
                    const isCorrect = i === q.correct;
                    const showCorrect = answered && isCorrect;
                    const showWrong = answered && isSelected && !isCorrect;

                    return (
                      <button
                        key={i}
                        onClick={() => onSelect(i)}
                        disabled={answered}
                        className={`w-full p-3.5 border rounded-xl text-left transition-all duration-200 ${
                          showCorrect
                            ? "border-green-500 bg-green-600/20"
                            : showWrong
                            ? "border-red-500 bg-red-600/20"
                            : isSelected
                            ? "border-bone-muted bg-bone/10"
                            : "border-stone-800 hover:border-stone-700 hover:bg-stone-900/50"
                        } ${answered ? "cursor-default" : "cursor-pointer"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                            showCorrect ? "border-green-500 text-green-400" :
                            showWrong ? "border-red-500 text-red-400" :
                            "border-stone-600 text-stone-400"
                          }`}>
                            {showCorrect ? (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            ) : showWrong ? (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            ) : (
                              String.fromCharCode(65 + i)
                            )}
                          </div>
                          <span className={`text-sm ${
                            showCorrect ? "text-green-200" :
                            showWrong ? "text-red-200" :
                            "text-stone-200"
                          }`}>{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Hint button (only before answering) */}
                {!answered && (
                  <div className="mt-4">
                    <button onClick={() => setShowHint(true)} className="text-xs text-stone-500 hover:text-stone-300 transition-colors">
                      Show hint
                    </button>
                  </div>
                )}

                {showHint && !answered && (
                  <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                    <p className="text-yellow-200 text-xs">{q.hint}</p>
                  </div>
                )}

                {/* Explanation after answering */}
                {answered && (
                  <div className="mt-4 p-3 bg-stone-900/50 border border-stone-800 rounded-lg animate-in fade-in duration-300">
                    <p className="text-xs font-medium text-stone-400 mb-1">Explanation</p>
                    <p className="text-sm text-stone-300">{q.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {done && (
          <ResultsPanel
            score={score} total={total} percentage={percentage} visual={resultVisual} answers={answers}
            onRetake={() => { resetQ(); setScore(0); setDone(false); setAnswers([]); }}
            onReview={() => setReviewOpen(true)}
            onNewTopic={onClose}
          />
        )}
      </div>

      {reviewOpen && <ReviewModal answers={answers} onClose={() => setReviewOpen(false)} />}
    </div>
  );
}
