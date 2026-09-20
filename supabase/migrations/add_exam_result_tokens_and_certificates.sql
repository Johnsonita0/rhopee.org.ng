ALTER TABLE public.cbt_exam_results ADD COLUMN IF NOT EXISTS result_token uuid DEFAULT gen_random_uuid();
ALTER TABLE public.cbt_exam_results ADD COLUMN IF NOT EXISTS certificate_published boolean NOT NULL DEFAULT false;
UPDATE public.cbt_exam_results SET result_token = gen_random_uuid() WHERE result_token IS NULL;
ALTER TABLE public.cbt_exam_results ALTER COLUMN result_token SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_cbt_exam_results_result_token ON public.cbt_exam_results (result_token);

DROP POLICY IF EXISTS "Allow authenticated exam result update" ON public.cbt_exam_results;
CREATE POLICY "Allow authenticated exam result update" ON public.cbt_exam_results
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

GRANT UPDATE ON public.cbt_exam_results TO authenticated;

CREATE OR REPLACE FUNCTION public.get_public_cbt_exam_result(p_result_token uuid)
RETURNS SETOF public.cbt_exam_results
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT * FROM public.cbt_exam_results WHERE result_token = p_result_token LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_cbt_exam_result(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_cbt_exam_result(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_public_cbt_exam_result_by_student_name(p_student_name text)
RETURNS SETOF public.cbt_exam_results
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT * FROM public.cbt_exam_results
  WHERE lower(trim(student_name)) = lower(trim(p_student_name))
  ORDER BY completed_at DESC
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_cbt_exam_result_by_student_name(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_cbt_exam_result_by_student_name(text) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';