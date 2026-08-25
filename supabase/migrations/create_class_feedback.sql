-- Store daily feedback submitted by students in each training track.
CREATE TABLE IF NOT EXISTS public.class_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  gender text NOT NULL,
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

ALTER TABLE public.class_feedback
ADD COLUMN IF NOT EXISTS gender text;

ALTER TABLE public.class_feedback
ALTER COLUMN class_date DROP DEFAULT;

ALTER TABLE public.class_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public feedback insert" ON public.class_feedback;
DROP POLICY IF EXISTS "Allow authenticated feedback select" ON public.class_feedback;

CREATE POLICY "Allow public feedback insert" ON public.class_feedback
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated feedback select" ON public.class_feedback
FOR SELECT USING (auth.role() = 'authenticated');

GRANT INSERT ON public.class_feedback TO anon;
GRANT SELECT ON public.class_feedback TO authenticated;
