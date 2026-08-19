-- ==========================================
-- PRIME AI - PRODUCTION SUPABASE DATABASE SCHEMA
-- ==========================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  university TEXT,
  study_level TEXT DEFAULT 'Undergraduate (100 Level)',
  learning_style TEXT DEFAULT 'Visual & Active Recall',
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CHAT THREADS TABLE
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Study Session',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.chat_threads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FLASHCARDS TABLE
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  deck_title TEXT NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  ease_factor FLOAT DEFAULT 2.5,
  interval INT DEFAULT 0,
  repetitions INT DEFAULT 0,
  next_review TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTES TABLE
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. STUDY MATERIALS TABLE (Study Fetch)
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  summary TEXT NOT NULL,
  questions JSONB DEFAULT '[]'::jsonb,
  extracted_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. QUIZ RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_title TEXT NOT NULL,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AI USAGE LOGS TABLE
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_name TEXT NOT NULL,
  model_used TEXT NOT NULL,
  tokens_used INT DEFAULT 0,
  success BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_chat_threads_user_id ON public.chat_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON public.chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON public.flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_user_id ON public.study_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON public.ai_usage(user_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))
);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))
);

-- 2. CHAT THREADS POLICIES
CREATE POLICY "Users can view own chat threads" ON public.chat_threads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat threads" ON public.chat_threads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat threads" ON public.chat_threads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat threads" ON public.chat_threads FOR DELETE USING (auth.uid() = user_id);

-- 3. CHAT MESSAGES POLICIES
CREATE POLICY "Users can view own chat messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);

-- 4. FLASHCARDS POLICIES
CREATE POLICY "Users can view own flashcards" ON public.flashcards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flashcards" ON public.flashcards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flashcards" ON public.flashcards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own flashcards" ON public.flashcards FOR DELETE USING (auth.uid() = user_id);

-- 5. NOTES POLICIES
CREATE POLICY "Users can view own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);

-- 6. STUDY MATERIALS POLICIES
CREATE POLICY "Users can view own study materials" ON public.study_materials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study materials" ON public.study_materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own study materials" ON public.study_materials FOR DELETE USING (auth.uid() = user_id);

-- 7. QUIZ RESULTS POLICIES
CREATE POLICY "Users can view own quiz results" ON public.quiz_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz results" ON public.quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. SUBSCRIPTIONS POLICIES
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))
);

-- 9. AI USAGE POLICIES
CREATE POLICY "Users can view own AI usage" ON public.ai_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all AI usage" ON public.ai_usage FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))
);
CREATE POLICY "Users can insert own AI usage" ON public.ai_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, university, is_admin, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'university', 'UNIZIK'),
    FALSE,
    'student'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- INDEX & STATUS COLUMN FOR FEATURE USAGE ATOMICITY
-- ==========================================
ALTER TABLE public.ai_usage ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_feature_time ON public.ai_usage(user_id, feature_name, created_at, success, status);

-- ==========================================
-- ATOMIC CONCURRENCY-SAFE AI USAGE RESERVATION RPC
-- ==========================================
CREATE OR REPLACE FUNCTION public.check_and_increment_ai_usage(
  p_user_id UUID,
  p_feature_name TEXT,
  p_plan_limit INT,
  p_rate_limit_per_min INT DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_effective_plan TEXT := 'free';
  v_usage_count INT := 0;
  v_recent_rate_count INT := 0;
  v_window_start TIMESTAMPTZ := NOW() - INTERVAL '24 hours';
  v_rate_window_start TIMESTAMPTZ := NOW() - INTERVAL '1 minute';
  v_ai_enabled_val TEXT;
  v_oldest_timestamp TIMESTAMPTZ;
  v_seconds_until_reset INT := 0;
  v_reservation_id UUID;
BEGIN
  -- 0. Acquire Transaction Advisory Lock (prevents concurrent race conditions)
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text || '_' || p_feature_name));

  -- 1. Check Emergency Shutdown (ai_provider_enabled in system_settings)
  SELECT value INTO v_ai_enabled_val
  FROM public.system_settings
  WHERE key = 'ai_provider_enabled';

  IF v_ai_enabled_val = 'false' OR v_ai_enabled_val = '"false"' THEN
    RETURN jsonb_build_object(
      'allowed', FALSE,
      'reason', 'emergency_shutdown',
      'message', 'Prime AI is currently undergoing safety maintenance. Non-AI tools remain fully functional.'
    );
  END IF;

  -- 2. Fetch server-side user plan from subscriptions table
  SELECT COALESCE(plan, 'free') INTO v_effective_plan
  FROM public.subscriptions
  WHERE user_id = p_user_id;

  IF v_effective_plan IS NULL THEN
    v_effective_plan := 'free';
  END IF;

  -- 3. Server-side Rate Limiting (rapid request protection)
  SELECT COUNT(*) INTO v_recent_rate_count
  FROM public.ai_usage
  WHERE user_id = p_user_id
    AND created_at >= v_rate_window_start;

  IF v_recent_rate_count >= p_rate_limit_per_min THEN
    RETURN jsonb_build_object(
      'allowed', FALSE,
      'reason', 'rate_limited',
      'message', 'You are making AI requests too quickly. Please wait a moment before sending another request.',
      'plan', v_effective_plan
    );
  END IF;

  -- 4. Calculate usage in current 24-hour window (includes completed requests and recent pending reservations)
  SELECT COUNT(*), MIN(created_at)
  INTO v_usage_count, v_oldest_timestamp
  FROM public.ai_usage
  WHERE user_id = p_user_id
    AND feature_name = p_feature_name
    AND created_at >= v_window_start
    AND (
      status = 'completed' 
      OR (status = 'pending' AND created_at >= NOW() - INTERVAL '5 minutes')
      OR (status IS NULL AND success = TRUE)
    );

  IF v_oldest_timestamp IS NOT NULL THEN
    v_seconds_until_reset := GREATEST(0, EXTRACT(EPOCH FROM (v_oldest_timestamp + INTERVAL '24 hours' - NOW()))::INT);
  ELSE
    v_seconds_until_reset := 0;
  END IF;

  -- 5. Enforce 24-hour limit
  IF v_usage_count >= p_plan_limit THEN
    RETURN jsonb_build_object(
      'allowed', FALSE,
      'reason', 'limit_exceeded',
      'message', FORMAT('Daily limit reached for %s (%s requests per 24 hours).', p_feature_name, p_plan_limit),
      'usage_count', v_usage_count,
      'limit', p_plan_limit,
      'plan', v_effective_plan,
      'seconds_until_reset', v_seconds_until_reset
    );
  END IF;

  -- 6. Atomically reserve quota slot before OpenAI call
  INSERT INTO public.ai_usage (
    user_id,
    feature_name,
    model_used,
    success,
    status
  ) VALUES (
    p_user_id,
    p_feature_name,
    'gpt-4o-mini',
    FALSE,
    'pending'
  )
  RETURNING id INTO v_reservation_id;

  -- Request allowed and atomically reserved!
  RETURN jsonb_build_object(
    'allowed', TRUE,
    'reservation_id', v_reservation_id,
    'usage_count', v_usage_count + 1,
    'limit', p_plan_limit,
    'plan', v_effective_plan,
    'remaining', GREATEST(0, p_plan_limit - (v_usage_count + 1)),
    'seconds_until_reset', v_seconds_until_reset
  );
END;
$$;

-- ==========================================
-- FINALIZE RESERVED AI USAGE RPC
-- ==========================================
CREATE OR REPLACE FUNCTION public.finalize_ai_usage_reservation(
  p_reservation_id UUID,
  p_model_used TEXT,
  p_success BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ai_usage
  SET 
    model_used = COALESCE(p_model_used, 'gpt-4o-mini'),
    success = p_success,
    status = CASE WHEN p_success THEN 'completed' ELSE 'failed' END
  WHERE id = p_reservation_id;
END;
$$;

