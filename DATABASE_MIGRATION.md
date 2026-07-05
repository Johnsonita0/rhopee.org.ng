# How to Update Your Supabase Database Schema

Your database currently has a `position` column, but the app now uses a `tag` column. Follow these steps:

## Step 1: Go to Supabase SQL Editor
1. Open your Supabase dashboard
2. Go to your project for rhopee-org-ng
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

## Step 2: Run the Migration

Copy and paste this SQL code into the editor:

```sql
-- Add new 'tag' column
ALTER TABLE public.id_cards 
ADD COLUMN IF NOT EXISTS tag text;

-- Copy data from 'position' to 'tag'
UPDATE public.id_cards 
SET tag = position 
WHERE tag IS NULL AND position IS NOT NULL;

-- Verify the changes
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'id_cards'
ORDER BY ordinal_position;
```

## Step 3: Execute
Click **Run** or press `Ctrl+Enter`

You should see output showing both `position` and `tag` columns.

## Step 4: Optional - Drop Old Column (After Verifying)

Once you confirm everything works, you can remove the old `position` column:

```sql
ALTER TABLE public.id_cards DROP COLUMN position;
```

## Done! ✅

Your database is now updated. The app should work perfectly and show the "Member Tag/Position" field correctly.
