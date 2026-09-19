CREATE UNIQUE INDEX IF NOT EXISTS idx_cbt_exam_results_one_attempt_per_student
ON public.cbt_exam_results (lower(trim(student_name)));

CREATE OR REPLACE FUNCTION public.has_completed_cbt_exam(p_student_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cbt_exam_results
    WHERE lower(trim(student_name)) = lower(trim(p_student_name))
  );
$$;

REVOKE ALL ON FUNCTION public.has_completed_cbt_exam(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_completed_cbt_exam(text) TO anon, authenticated;