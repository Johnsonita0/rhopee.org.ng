-- Run this once if the deployed feedback form reports an RLS insert error.
-- This removes any older or differently named policies on this table first.
DO $$
DECLARE
	policy_record record;
BEGIN
	FOR policy_record IN
		SELECT policyname
		FROM pg_policies
		WHERE schemaname = 'public' AND tablename = 'class_feedback'
	LOOP
		EXECUTE format('DROP POLICY IF EXISTS %I ON public.class_feedback', policy_record.policyname);
	END LOOP;
END $$;

CREATE POLICY "Allow public feedback insert" ON public.class_feedback
FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "Allow authenticated feedback select" ON public.class_feedback
FOR SELECT TO authenticated USING (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.class_feedback TO anon, authenticated;