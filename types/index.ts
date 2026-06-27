export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  options: string[];
  correct_answer: string; // the correct option text
  created_at?: string;
}

export interface Exam {
  id: string;
  name: string;
  source_file: string;
  question_count: number;
  created_at: string;
}

export interface QuizSession {
  examId: string;
  examName: string;
  questions: Question[];
  mode: QuizMode;
  timeLimit: number; // seconds
}

export type QuizMode = "30q30m" | "50q50m";

export interface UserAnswer {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number; // percentage
  timeTaken: number; // seconds
  answers: UserAnswer[];
}
