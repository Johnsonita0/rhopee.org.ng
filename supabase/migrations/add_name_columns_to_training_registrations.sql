-- Migration: Add separate name fields for training registrations
-- Run this in Supabase SQL editor to update the schema

ALTER TABLE public.training_registrations
ADD COLUMN IF NOT EXISTS surname text;

ALTER TABLE public.training_registrations
ADD COLUMN IF NOT EXISTS first_name text;

ALTER TABLE public.training_registrations
ADD COLUMN IF NOT EXISTS middle_name text;

SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'training_registrations'
ORDER BY ordinal_position;
