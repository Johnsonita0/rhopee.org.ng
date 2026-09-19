CREATE TABLE IF NOT EXISTS public.cbt_exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  score integer NOT NULL CHECK (score >= 0),
  total_questions integer NOT NULL CHECK (total_questions > 0),
  percentage numeric(5, 2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  passed boolean NOT NULL DEFAULT false,
  completion_reason text NOT NULL DEFAULT 'submitted',
  warning_count integer NOT NULL DEFAULT 0 CHECK (warning_count >= 0),
  started_at timestamptz,
  completed_at timestamptz NOT NULL DEFAULT now(),
  performance jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cbt_exam_results_student_name ON public.cbt_exam_results (lower(student_name));
CREATE INDEX IF NOT EXISTS idx_cbt_exam_results_completed_at ON public.cbt_exam_results (completed_at DESC);

ALTER TABLE public.cbt_exam_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public exam result insert" ON public.cbt_exam_results;
DROP POLICY IF EXISTS "Allow authenticated exam result select" ON public.cbt_exam_results;

CREATE POLICY "Allow public exam result insert" ON public.cbt_exam_results
FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated exam result select" ON public.cbt_exam_results
FOR SELECT TO authenticated USING (true);

GRANT INSERT ON public.cbt_exam_results TO anon, authenticated;
GRANT SELECT ON public.cbt_exam_results TO authenticated;