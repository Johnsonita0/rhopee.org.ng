-- Install the RPC used by the public class feedback form.
-- Run this once in the Supabase SQL Editor.

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
NOTIFY pgrst, 'reload schema';
