-- Creates the `id_cards` table expected by the app.
-- Run this in the Supabase SQL editor (SQL > New Query) for the target project.

-- Ensure UUID generator is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.id_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tag text,
  membership_id text,
  chapter text,
  local_government text,
  status text DEFAULT 'active',
  issued_at date,
  expires_at date,
  barcode text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.id_cards ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to INSERT
CREATE POLICY "Allow public insert" ON public.id_cards
FOR INSERT WITH CHECK (true);

-- Policy: Allow anonymous users to SELECT
CREATE POLICY "Allow public select" ON public.id_cards
FOR SELECT USING (true);

-- Policy: Allow authenticated users full access
CREATE POLICY "Allow authenticated access" ON public.id_cards
FOR ALL USING (auth.role() = 'authenticated');

-- Grant privileges
GRANT SELECT, INSERT ON public.id_cards TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.id_cards TO authenticated;

-- Verify table
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'id_cards';
