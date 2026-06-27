-- Run this in your Supabase SQL editor to set up the database

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  source_file TEXT NOT NULL,
  question_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,  -- array of option strings
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by exam
CREATE INDEX IF NOT EXISTS questions_exam_id_idx ON questions(exam_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (adjust for production auth)
CREATE POLICY "Allow all" ON exams FOR ALL USING (true);
CREATE POLICY "Allow all" ON questions FOR ALL USING (true);
