-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- TABLES
-- ============================================================

-- Users (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  subscription_plan TEXT NOT NULL DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'pro')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_ends_at TIMESTAMPTZ,
  whatsapp_number TEXT,
  whatsapp_notifications BOOLEAN NOT NULL DEFAULT false,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  preferred_study_time INTEGER NOT NULL DEFAULT 120,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Modules (Anatomie, Biologie, Médecine, Chirurgie, Urgences)
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Courses
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  difficulty TEXT NOT NULL DEFAULT 'moyen' CHECK (difficulty IN ('facile', 'moyen', 'difficile')),
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  course_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- QCM Questions
CREATE TABLE public.qcm_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  difficulty TEXT NOT NULL DEFAULT 'moyen' CHECK (difficulty IN ('facile', 'moyen', 'difficile')),
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Flashcards
CREATE TABLE public.flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'moyen' CHECK (difficulty IN ('facile', 'moyen', 'difficile')),
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Programs (90j / 180j)
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('90j', '180j')),
  title TEXT NOT NULL,
  description TEXT,
  total_days INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Program Days
CREATE TABLE public.program_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  objectives TEXT[] DEFAULT '{}',
  course_ids UUID[] DEFAULT '{}',
  qcm_count INTEGER NOT NULL DEFAULT 10,
  estimated_hours NUMERIC(4,1) NOT NULL DEFAULT 3.0,
  UNIQUE(program_id, day_number)
);

-- User Progress (per course)
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  score NUMERIC(5,2),
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Day Completions (programme tracking)
CREATE TABLE public.day_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  score NUMERIC(5,2),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, program_id, day_number)
);

-- Journal Entries
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  ai_feedback TEXT,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mock Exam Results (Examen Blanc)
CREATE TABLE public.mock_exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module_scores JSONB NOT NULL DEFAULT '{}',
  total_score NUMERIC(5,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  question_results JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Flashcard Reviews (spaced repetition)
CREATE TABLE public.flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  review_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, flashcard_id)
);

-- User Uploads (PDF)
CREATE TABLE public.user_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  extracted_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Generated Content (from uploads)
CREATE TABLE public.user_generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  upload_id UUID REFERENCES public.user_uploads(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('mindmap', 'qcm', 'flashcards', 'summary')),
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_courses_module_id ON public.courses(module_id);
CREATE INDEX idx_courses_slug ON public.courses(slug);
CREATE INDEX idx_qcm_course_id ON public.qcm_questions(course_id);
CREATE INDEX idx_qcm_module_id ON public.qcm_questions(module_id);
CREATE INDEX idx_flashcards_course_id ON public.flashcards(course_id);
CREATE INDEX idx_flashcards_module_id ON public.flashcards(module_id);
CREATE INDEX idx_program_days_program_id ON public.program_days(program_id);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_course_id ON public.user_progress(course_id);
CREATE INDEX idx_day_completions_user_program ON public.day_completions(user_id, program_id);
CREATE INDEX idx_journal_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_mock_exam_user_id ON public.mock_exam_results(user_id);
CREATE INDEX idx_flashcard_reviews_user_id ON public.flashcard_reviews(user_id);
CREATE INDEX idx_flashcard_reviews_next ON public.flashcard_reviews(next_review_at);
CREATE INDEX idx_user_uploads_user_id ON public.user_uploads(user_id);
CREATE INDEX idx_generated_content_user_id ON public.user_generated_content(user_id);

-- Full text search on courses
CREATE INDEX idx_courses_fts ON public.courses USING gin(to_tsvector('french', coalesce(title, '') || ' ' || coalesce(summary, '')));

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER journal_entries_updated_at BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qcm_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_generated_content ENABLE ROW LEVEL SECURITY;

-- Users: can read/update own profile
CREATE POLICY "users_own" ON public.users
  FOR ALL USING (auth.uid() = id);

-- Modules: public read
CREATE POLICY "modules_public_read" ON public.modules
  FOR SELECT USING (is_active = true);

-- Courses: published courses readable by all; premium only for pro users
CREATE POLICY "courses_read" ON public.courses
  FOR SELECT USING (
    is_published = true AND (
      is_premium = false OR
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND subscription_plan = 'pro'
        AND subscription_status = 'active'
      )
    )
  );

-- QCM: active questions readable
CREATE POLICY "qcm_read" ON public.qcm_questions
  FOR SELECT USING (is_active = true);

-- Flashcards: active flashcards readable
CREATE POLICY "flashcards_read" ON public.flashcards
  FOR SELECT USING (is_active = true);

-- Programs: public read
CREATE POLICY "programs_read" ON public.programs
  FOR SELECT USING (is_active = true);

-- Program days: public read
CREATE POLICY "program_days_read" ON public.program_days
  FOR SELECT USING (true);

-- User Progress: own data only
CREATE POLICY "progress_own" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Day Completions: own data only
CREATE POLICY "day_completions_own" ON public.day_completions
  FOR ALL USING (auth.uid() = user_id);

-- Journal: own entries only
CREATE POLICY "journal_own" ON public.journal_entries
  FOR ALL USING (auth.uid() = user_id);

-- Mock exams: own results only
CREATE POLICY "mock_exam_own" ON public.mock_exam_results
  FOR ALL USING (auth.uid() = user_id);

-- Flashcard reviews: own data only
CREATE POLICY "flashcard_reviews_own" ON public.flashcard_reviews
  FOR ALL USING (auth.uid() = user_id);

-- User uploads: own files only
CREATE POLICY "uploads_own" ON public.user_uploads
  FOR ALL USING (auth.uid() = user_id);

-- Generated content: own content only
CREATE POLICY "generated_content_own" ON public.user_generated_content
  FOR ALL USING (auth.uid() = user_id);

-- Admin: bypass all RLS for admins
CREATE POLICY "admin_all_users" ON public.users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
