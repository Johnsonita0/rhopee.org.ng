-- RHOPEE backend schema
-- Run this file in the Supabase SQL Editor for a complete, repeatable setup.
-- It creates the tables used by ID verification, training registration,
-- class feedback, and the admin dashboard.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ID cards and public verification records
-- =====================================================
CREATE TABLE IF NOT EXISTS public.id_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tag text,
  membership_id text UNIQUE,
  chapter text,
  local_government text,
  status text DEFAULT 'active',
  issued_at date,
  expires_at date,
  barcode text UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.id_cards ADD COLUMN IF NOT EXISTS tag text;
ALTER TABLE public.id_cards ADD COLUMN IF NOT EXISTS membership_id text;
ALTER TABLE public.id_cards ADD COLUMN IF NOT EXISTS chapter text;
ALTER TABLE public.id_cards ADD COLUMN IF NOT EXISTS local_government text;
ALTER TABLE public.id_cards ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE public.id_cards ADD COLUMN IF NOT EXISTS issued_at date;
ALTER TABLE public.id_cards ADD COLUMN IF NOT EXISTS expires_at date;
ALTER TABLE public.id_cards ADD COLUMN IF NOT EXISTS barcode text;
ALTER TABLE public.id_cards ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Copy the legacy position value into tag when upgrading an older table.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'id_cards' AND column_name = 'position'
  ) THEN
    EXECUTE 'UPDATE public.id_cards SET tag = position WHERE tag IS NULL AND position IS NOT NULL';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_id_cards_barcode ON public.id_cards (barcode);
CREATE INDEX IF NOT EXISTS idx_id_cards_membership_id ON public.id_cards (membership_id);
CREATE INDEX IF NOT EXISTS idx_id_cards_local_government ON public.id_cards (local_government);
CREATE INDEX IF NOT EXISTS idx_id_cards_tag ON public.id_cards (tag);

ALTER TABLE public.id_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert" ON public.id_cards;
DROP POLICY IF EXISTS "Allow public select" ON public.id_cards;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.id_cards;

CREATE POLICY "Allow public insert" ON public.id_cards
FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public select" ON public.id_cards
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow authenticated access" ON public.id_cards
FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT ON public.id_cards TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.id_cards TO authenticated;

-- =====================================================
-- Training registrations used by the admin dashboard
-- =====================================================
CREATE TABLE IF NOT EXISTS public.training_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  surname text,
  first_name text,
  middle_name text,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  role text,
  lga text,
  ward text,
  training_track text,
  training_track_name text,
  accommodation_needed boolean DEFAULT false,
  dietary_preferences text,
  emergency_contact text,
  emergency_phone text,
  confirmation_code text UNIQUE,
  status text DEFAULT 'registered',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.training_registrations ADD COLUMN IF NOT EXISTS surname text;
ALTER TABLE public.training_registrations ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.training_registrations ADD COLUMN IF NOT EXISTS middle_name text;

ALTER TABLE public.training_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert" ON public.training_registrations;
DROP POLICY IF EXISTS "Allow public select" ON public.training_registrations;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.training_registrations;

CREATE POLICY "Allow public insert" ON public.training_registrations
FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public select" ON public.training_registrations
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow authenticated access" ON public.training_registrations
FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT ON public.training_registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_registrations TO authenticated;

-- =====================================================
-- Daily student class feedback
-- =====================================================
CREATE TABLE IF NOT EXISTS public.class_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  gender text,
  training_track text NOT NULL CHECK (training_track IN ('webdev', 'cinematography', 'photography')),
  training_track_name text NOT NULL,
  class_date date NOT NULL,
  class_rating integer NOT NULL CHECK (class_rating BETWEEN 1 AND 5),
  favourite_moment text NOT NULL,
  class_spirit text NOT NULL,
  challenges text,
  additional_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.class_feedback ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.class_feedback ALTER COLUMN class_date DROP DEFAULT;

ALTER TABLE public.class_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public feedback insert" ON public.class_feedback;
DROP POLICY IF EXISTS "Allow authenticated feedback select" ON public.class_feedback;

CREATE POLICY "Allow public feedback insert" ON public.class_feedback
FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow authenticated feedback select" ON public.class_feedback
FOR SELECT TO authenticated USING (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.class_feedback TO anon, authenticated;
GRANT SELECT ON public.class_feedback TO authenticated;

-- Public submission goes through a constrained function so it is not affected
-- by table RLS policies while dashboard reads remain authenticated-only.
CREATE OR REPLACE FUNCTION public.submit_class_feedback(
  p_student_name text,
  p_gender text,
  p_training_track text,
  p_training_track_name text,
  p_class_date date,
  p_class_rating integer,
  p_favourite_moment text,
  p_class_spirit text,
  p_challenges text DEFAULT NULL,
  p_additional_notes text DEFAULT NULL
)
RETURNS public.class_feedback
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  inserted_feedback public.class_feedback;
BEGIN
  INSERT INTO public.class_feedback (
    student_name, gender, training_track, training_track_name,
    class_date, class_rating, favourite_moment, class_spirit,
    challenges, additional_notes
  ) VALUES (
    trim(p_student_name), trim(p_gender), p_training_track,
    trim(p_training_track_name), p_class_date, p_class_rating,
    trim(p_favourite_moment), trim(p_class_spirit),
    nullif(trim(p_challenges), ''), nullif(trim(p_additional_notes), '')
  )
  RETURNING * INTO inserted_feedback;

  RETURN inserted_feedback;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_class_feedback(text, text, text, text, date, integer, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_class_feedback(text, text, text, text, date, integer, text, text, text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_class_feedback()
RETURNS SETOF public.class_feedback
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM 'a9044df5-bf6b-42be-95d1-1f4337b2ff33'::uuid THEN
    RAISE EXCEPTION 'Not authorized to view class feedback';
  END IF;

  RETURN QUERY
  SELECT *
  FROM public.class_feedback
  ORDER BY class_date DESC, created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_class_feedback() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_class_feedback() TO authenticated;

-- =====================================================
-- Verification
-- =====================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('id_cards', 'training_registrations', 'class_feedback')
ORDER BY table_name;
