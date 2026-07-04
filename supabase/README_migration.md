Supabase passport migration notes

Overview
- If you previously stored base64 images in the `passport_data` column, this document explains how to migrate those images into Supabase Storage and write public URLs to `passport_url`.

Recommended approach
1. Create a `passports` bucket in Supabase Storage.
   - Decide whether the bucket is public (easier for direct image links) or private (use signed URLs).
2. Add a new `passport_url` column to the `id_cards` table if it doesn't exist:

   ```sql
   ALTER TABLE public.id_cards
     ADD COLUMN IF NOT EXISTS passport_url text;
   ```

3. Use the provided Node.js migration script `supabase/migrations/migrate_passports.js` to:
   - Read rows with non-null `passport_data`.
   - Decode the base64 image, upload it to the `passports` bucket, get a public URL.
   - Update the `passport_url` column and null out `passport_data`.

Security note
- The migration script requires a Supabase service role key (`SUPABASE_SERVICE_KEY`) because it needs permission to write to Storage and update rows. Keep that key secure and run the script from a trusted environment.

After migration
- Verify a sample of migrated rows in the Supabase table and that images are accessible.
- When satisfied, you may remove the `passport_data` column:

  ```sql
  ALTER TABLE public.id_cards DROP COLUMN IF EXISTS passport_data;
  ```

Running the migration
- Install deps:

  ```bash
  npm install @supabase/supabase-js dotenv
  ```

- Create a `.env` file with:

  ```env
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_KEY=your-service-role-key
  ```

- Run:

  ```bash
  node supabase/migrations/migrate_passports.js
  ```

Additional notes
- If your stored base64 values are large or numerous, run the script in batches and monitor bandwidth and storage usage.
- For private buckets, you can adjust the script to create signed URLs and store them instead of public URLs.
