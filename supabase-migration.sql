-- ============================================================
-- Mock Test App — Supabase Migration
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. Exam categories (CTET, Assam GT, Assam PGT, etc.)
CREATE TABLE exam_categories (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_group    TEXT NOT NULL,
  sub_category  TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(exam_group, sub_category)
);

-- 2. Mock tests
CREATE TABLE mock_tests (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id   UUID REFERENCES exam_categories(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  time_limit    INT,                    -- in minutes, NULL = no limit
  passing_mark  INT,                    -- NULL = no passing threshold
  is_published  BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 3. Questions
CREATE TABLE questions (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mock_test_id      UUID REFERENCES mock_tests(id) ON DELETE CASCADE NOT NULL,
  question          TEXT NOT NULL,
  options           JSONB NOT NULL,      -- [{id: string, text: string}, ...]
  correct_option_id TEXT NOT NULL,
  explanation       TEXT NOT NULL,
  sort_order        INT DEFAULT 0
);

-- ============================================================
-- Row Level Security
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE exam_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_tests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions        ENABLE ROW LEVEL SECURITY;

-- Public read (anon + authenticated)
CREATE POLICY "Public read categories"
  ON exam_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read mocks"
  ON mock_tests FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read questions"
  ON questions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated write
CREATE POLICY "Auth insert categories"
  ON exam_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Auth update categories"
  ON exam_categories FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Auth delete categories"
  ON exam_categories FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Auth insert mocks"
  ON mock_tests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Auth update mocks"
  ON mock_tests FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Auth delete mocks"
  ON mock_tests FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Auth insert questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Auth update questions"
  ON questions FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Auth delete questions"
  ON questions FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- Indexes for common queries
-- ============================================================
CREATE INDEX idx_mock_tests_category   ON mock_tests(category_id);
CREATE INDEX idx_mock_tests_published  ON mock_tests(is_published);
CREATE INDEX idx_questions_mock_test   ON questions(mock_test_id);
CREATE INDEX idx_questions_sort_order  ON questions(mock_test_id, sort_order);
