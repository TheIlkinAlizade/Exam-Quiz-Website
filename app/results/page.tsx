"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuizResult, Question, UserAnswer } from "@/types";
import { CheckCircle, XCircle, Clock, Trophy, RotateCcw, Home, ChevronDown, ChevronUp } from "lucide-react";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  useEffect(() => {
    const r = sessionStorage.getItem("quizResult");
    const q = sessionStorage.getItem("quizQuestions");
    if (!r) { router.push("/"); return; }
    setResult(JSON.parse(r));
    if (q) setQuestions(JSON.parse(q));
  }, []);

  if (!result) return null;

  const passed = result.score >= 70;
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  const scoreColor =
    result.score >= 80 ? "#10b981" :
    result.score >= 60 ? "#f59e0b" : "#ef4444";

  const answerMap = new Map<string, UserAnswer>(
    result.answers.map((a) => [a.questionId, a])
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-bold text-white">Exam Results</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-muted)] hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-sm text-white font-medium transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        {/* Score card */}
        <div className="animate-slide-up text-center">
          <div
            className="w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center mx-auto mb-4"
            style={{ borderColor: scoreColor }}
          >
            <span className="text-3xl font-black" style={{ color: scoreColor }}>
              {result.score}%
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            {passed
              ? <Trophy className="w-5 h-5 text-yellow-400" />
              : <XCircle className="w-5 h-5 text-red-400" />
            }
            <h2 className="text-xl font-bold text-white">
              {passed ? "Passed!" : "Not passed"}
            </h2>
          </div>
          <p className="text-[var(--text-muted)] text-sm">
            {passed ? "Great work, keep it up!" : "Review the answers below and try again"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: "80ms" }}>
          {[
            { label: "Correct", value: result.correctAnswers, color: "#10b981" },
            { label: "Wrong", value: result.totalQuestions - result.correctAnswers, color: "#ef4444" },
            { label: "Time", value: formatTime(result.timeTaken), color: "#818cf8" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold mb-1" style={{ color }}>{value}</div>
              <div className="text-xs text-[var(--text-muted)]">{label}</div>
            </div>
          ))}
        </div>

        {/* Question review */}
        {questions.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: "160ms" }}>
            <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-4">
              Review Answers
            </h3>
            <div className="space-y-2">
              {questions.map((q, i) => {
                const ua = answerMap.get(q.id);
                const isCorrect = ua?.isCorrect || false;
                const isExpanded = expandedQ === q.id;

                return (
                  <div
                    key={q.id}
                    className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface)]"
                  >
                    <button
                      onClick={() => setExpandedQ(isExpanded ? null : q.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--surface-2)] transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {isCorrect
                          ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                          : <XCircle className="w-4 h-4 text-red-400" />
                        }
                      </div>
                      <span className="text-xs font-mono text-[var(--text-muted)] w-8 flex-shrink-0">Q{i + 1}</span>
                      <span className="text-sm text-[var(--text)] flex-1 line-clamp-1">{q.question_text}</span>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                      }
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-[var(--border)] pt-3 space-y-1.5">
                        <p className="text-sm text-white mb-3">{q.question_text}</p>
                        {q.options.map((opt) => {
                          const isAnswer = opt === q.correct_answer;
                          const isPicked = opt === ua?.selectedOption;
                          return (
                            <div
                              key={opt}
                              className={`px-3 py-2 rounded-lg text-sm border ${
                                isAnswer
                                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                                  : isPicked && !isAnswer
                                  ? "border-red-500/50 bg-red-500/10 text-red-300"
                                  : "border-[var(--border)] text-[var(--text-muted)]"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isAnswer
                                  ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                  : isPicked
                                  ? <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                  : <span className="w-3.5 h-3.5" />
                                }
                                {opt}
                              </div>
                            </div>
                          );
                        })}
                        {!ua?.selectedOption && (
                          <p className="text-xs text-[var(--text-muted)] italic mt-1">Not answered</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
