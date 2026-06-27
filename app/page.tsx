"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Exam, QuizMode } from "@/types";
import UploadModal from "@/components/UploadModal";
import ExamCard from "@/components/ExamCard";
import { BookOpen, Plus, Zap, Clock, Brain } from "lucide-react";

export default function HomePage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  async function fetchExams() {
    setLoading(true);
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setExams(data);
    setLoading(false);
  }

  function handleUploadComplete() {
    setShowUpload(false);
    fetchExams();
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">QuizForge</span>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload PDF
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-extrabold text-white mb-3 leading-tight">
            Turn your PDFs into<br />
            <span className="text-brand-400">practice exams</span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg max-w-xl">
            Upload an exam PDF, Parser extracts every question, then take timed quizzes with randomized options.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 mt-6">
            {[
              { icon: Clock, label: "30 questions · 30 min" },
              { icon: BookOpen, label: "50 questions · 50 min" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Icon className="w-4 h-4 text-brand-400" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Exams list */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-widest">
              Your Exams
            </h2>
            <span className="text-xs text-[var(--text-muted)]">{exams.length} loaded</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 rounded-xl bg-[var(--surface)] animate-pulse border border-[var(--border)]" />
              ))}
            </div>
          ) : exams.length === 0 ? (
            <div
              onClick={() => setShowUpload(true)}
              className="border-2 border-dashed border-[var(--border)] rounded-2xl p-12 text-center cursor-pointer hover:border-brand-500 hover:bg-brand-500/5 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center mx-auto mb-4 group-hover:border-brand-500 transition-colors">
                <Plus className="w-6 h-6 text-[var(--text-muted)] group-hover:text-brand-400" />
              </div>
              <p className="text-white font-semibold mb-1">Upload your first exam</p>
              <p className="text-sm text-[var(--text-muted)]">Drop a PDF and we'll extract all questions automatically</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map((exam, i) => (
                <ExamCard key={exam.id} exam={exam} index={i} onDeleted={fetchExams} />
              ))}
              {/* Add new card */}
              <button
                onClick={() => setShowUpload(true)}
                className="h-40 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-brand-500 hover:bg-brand-500/5 transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <Plus className="w-5 h-5 text-[var(--text-muted)] group-hover:text-brand-400 transition-colors" />
                <span className="text-sm text-[var(--text-muted)] group-hover:text-brand-400 transition-colors">Add another exam</span>
              </button>
            </div>
          )}
        </section>
      </main>

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onComplete={handleUploadComplete} />
      )}
    </div>
  );
}
