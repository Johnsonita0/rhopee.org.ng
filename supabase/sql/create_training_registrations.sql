-- Create table for event training registrations
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

ALTER TABLE public.training_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.training_registrations
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select" ON public.training_registrations
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated access" ON public.training_registrations
FOR ALL USING (auth.role() = 'authenticated');

GRANT SELECT, INSERT ON public.training_registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_registrations TO authenticated;
