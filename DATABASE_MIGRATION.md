# Supabase Database Setup

The complete project schema is consolidated in `supabase/schema.sql`. Run that single file in the Supabase SQL Editor for a repeatable setup or upgrade of all project tables, policies, grants, indexes, and RPC functions.

The files under `supabase/migrations/` are retained as historical incremental migrations. They are not required when `supabase/schema.sql` has been run.

## Legacy migration notes

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

## CBT exam results

Run `supabase/schema.sql` in the Supabase SQL Editor before using the CBT exam links. It creates the results table, one-attempt-per-name protection, UUID result links, completion/report RPCs, certificate publication state, and policies that allow students to submit scores while restricting result reads to the token RPC and authenticated admins.

For an existing CBT table, run `supabase/migrations/add_exam_result_tokens_and_certificates.sql` once. New exam links include their UUID and certificate metadata in the URL, so students can reopen the same submitted result page. Admins publish certificates from the CBT results tab; the certificate download becomes visible on the student link after publication. The certificate PDF uses `public/cert/cert.jpeg` as its artwork and its QR verifies the published certificate at `/certificate-verify`.
