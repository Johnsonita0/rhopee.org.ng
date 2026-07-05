-- Creates the `id_cards` table expected by the app.
-- Run this in the Supabase SQL editor (SQL > New Query) for the target project.

-- Ensure UUID generator is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.id_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text,
  membership_id text,
  chapter text,
  local_government text,
  status text DEFAULT 'active',
  issued_at date,
  expires_at date,
  barcode text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Optional: grant minimal privileges to anon role (use with caution)
-- GRANT SELECT, INSERT ON public.id_cards TO anon;

-- Verify table
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'id_cards';
