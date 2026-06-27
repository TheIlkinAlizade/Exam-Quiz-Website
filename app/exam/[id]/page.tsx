"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Question, QuizMode, UserAnswer } from "@/types";
import { Clock, ChevronRight, ChevronLeft, Flag } from "lucide-react";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ExamPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = (searchParams.get("mode") || "30q30m") as QuizMode;

  const questionCount = mode === "50q50m" ? 50 : 30;
  const timeLimit = questionCount * 60; // seconds

  const [questions, setQuestions] = useState<Question[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<string[][]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [started, setStarted] = useState(false);
  const [examName, setExamName] = useState("");
  const [loading, setLoading] = useState(true);
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    loadQuestions();
  }, [id]);

  async function loadQuestions() {
    setLoading(true);
    const [examRes, questionsRes] = await Promise.all([
      supabase.from("exams").select("name").eq("id", id).single(),
      supabase.from("questions").select("*").eq("exam_id", id),
    ]);

    if (examRes.data) setExamName(examRes.data.name);
    if (questionsRes.data) {
      const shuffled = shuffle(questionsRes.data).slice(0, questionCount);
      setQuestions(shuffled);
      setShuffledOptions(shuffled.map((q) => shuffle(q.options)));
    }
    setLoading(false);
  }

  // Timer
  useEffect(() => {
    if (!started) return;
    if (timeLeft <= 0) {
      submitQuiz();
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [started, timeLeft]);

  function startQuiz() {
    startTime.current = Date.now();
    setStarted(true);
  }

  function selectOption(opt: string) {
    if (!started) return;
    setSelected(opt);
  }

  function goNext() {
    if (selected) {
      setAnswers((prev) => new Map(prev).set(questions[current].id, selected));
    }
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(answers.get(questions[current + 1]?.id) || null);
    }
  }

  function goPrev() {
    if (selected) {
      setAnswers((prev) => new Map(prev).set(questions[current].id, selected));
    }
    if (current > 0) {
      setCurrent((c) => c - 1);
      setSelected(answers.get(questions[current - 1]?.id) || null);
    }
  }

  function submitQuiz() {
    const finalAnswers = new Map(answers);
    if (selected) finalAnswers.set(questions[current].id, selected);

    const userAnswers: UserAnswer[] = questions.map((q) => {
      const picked = finalAnswers.get(q.id) || "";
      return {
        questionId: q.id,
        selectedOption: picked,
        isCorrect: picked === q.correct_answer,
      };
    });

    const correct = userAnswers.filter((a) => a.isCorrect).length;
    const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);

    const result = {
      totalQuestions: questions.length,
      correctAnswers: correct,
      score: Math.round((correct / questions.length) * 100),
      timeTaken,
      answers: userAnswers,
    };

    // Store result and questions for results page
    sessionStorage.setItem("quizResult", JSON.stringify(result));
    sessionStorage.setItem("quizQuestions", JSON.stringify(questions));
    router.push(`/results`);
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const timerPct = (timeLeft / timeLimit) * 100;
  const timerColor = timerPct > 50 ? "#10b981" : timerPct > 20 ? "#f59e0b" : "#ef4444";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[var(--text-muted)] text-sm">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Start screen
  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center mx-auto mb-5">
            <Clock className="w-7 h-7 text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{examName}</h1>
          <p className="text-[var(--text-muted)] text-sm mb-6">Ready to start your exam?</p>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 mb-6 space-y-2.5 text-sm">
            {[
              ["Questions", `${questions.length}`],
              ["Time Limit", formatTime(timeLimit)],
              ["Per Question", "~60 seconds"],
              ["Passing Score", "70%"],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-[var(--text-muted)]">{label}</span>
                <span className="font-medium text-white">{val}</span>
              </div>
            ))}
          </div>

          <button
            onClick={startQuiz}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors"
          >
            Start Exam
          </button>
          <button
            onClick={() => router.push("/")}
            className="mt-3 w-full py-2 text-[var(--text-muted)] hover:text-white text-sm transition-colors"
          >
            ← Back to exams
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const opts = shuffledOptions[current] || q.options;
  const answered = answers.size + (selected ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3">
          {/* Timer bar */}
          <div className="h-1 rounded-full bg-[var(--border)] mb-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)] font-mono">
              {current + 1} / {questions.length}
            </span>
            <div
              className="flex items-center gap-1.5 font-mono font-bold"
              style={{ color: timerColor }}
            >
              <Clock className="w-3.5 h-3.5" />
              {formatTime(timeLeft)}
            </div>
            <span className="text-[var(--text-muted)] text-xs">
              {answered} answered
            </span>
          </div>
        </div>
      </header>

      {/* Question */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="animate-fade-in" key={current}>
          <div className="mb-6">
            <span className="text-xs font-mono text-brand-400 mb-2 block">
              Q{current + 1}
            </span>
            <h2 className="text-lg font-semibold text-white leading-relaxed">
              {q.question_text}
            </h2>
          </div>

          <div className="space-y-2.5">
            {opts.map((opt, i) => (
              <button
                key={i}
                onClick={() => selectOption(opt)}
                className={`option-card w-full text-left px-4 py-3.5 rounded-xl ${
                  selected === opt ? "selected" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-md border text-xs font-bold flex items-center justify-center mt-0.5 transition-colors ${
                    selected === opt
                      ? "bg-brand-500 border-brand-500 text-white"
                      : "border-[var(--border)] text-[var(--text-muted)]"
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm text-[var(--text)] leading-relaxed">{opt}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom nav */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur sticky bottom-0">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={goPrev}
            disabled={current === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-muted)] hover:text-white hover:border-brand-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          <div className="flex-1 flex gap-1 overflow-x-auto py-1">
            {questions.map((_, i) => {
              const isAnswered = answers.has(questions[i].id) || (i === current && selected);
              const isCurrent = i === current;
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (selected) setAnswers((prev) => new Map(prev).set(q.id, selected));
                    setCurrent(i);
                    setSelected(answers.get(questions[i].id) || null);
                  }}
                  className={`flex-shrink-0 w-6 h-6 rounded text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-brand-500 text-white"
                      : isAnswered
                      ? "bg-brand-500/25 text-brand-400"
                      : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--border)]"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {current < questions.length - 1 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-sm text-white font-medium transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submitQuiz}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm text-white font-semibold transition-colors"
            >
              <Flag className="w-4 h-4" />
              Submit
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
