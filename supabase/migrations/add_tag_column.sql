-- Migration: Replace 'position' column with 'tag' column
-- Run this in Supabase SQL editor to update the schema

-- Step 1: Add new 'tag' column if it doesn't exist
ALTER TABLE public.id_cards 
ADD COLUMN IF NOT EXISTS tag text;

-- Step 2: Copy data from 'position' to 'tag' (if position column exists)
UPDATE public.id_cards 
SET tag = position 
WHERE tag IS NULL AND position IS NOT NULL;

-- Step 3: Drop the old 'position' column if you want to fully migrate
-- Uncomment this line after verifying the data was copied correctly
-- ALTER TABLE public.id_cards DROP COLUMN IF EXISTS position;

-- Verify the changes
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'id_cards'
ORDER BY ordinal_position;
