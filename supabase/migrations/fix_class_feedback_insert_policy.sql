-- Run this once if the deployed feedback form reports an RLS insert error.
DROP POLICY IF EXISTS "Allow public feedback insert" ON public.class_feedback;

CREATE POLICY "Allow public feedback insert" ON public.class_feedback
FOR INSERT TO anon, authenticated
WITH CHECK (true);

GRANT INSERT ON public.class_feedback TO anon, authenticated;