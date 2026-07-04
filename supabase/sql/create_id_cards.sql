-- Create table for ID cards (includes storage URL for passport images)

CREATE TABLE IF NOT EXISTS public.id_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  membership_id text UNIQUE NOT NULL,
  position text,
  chapter text,
  local_government text,
  passport_url text,
  passport_data text,
  issued_at date,
  expires_at date,
  barcode text UNIQUE,
  status text,
  created_at timestamptz DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_id_cards_barcode ON public.id_cards (barcode);
CREATE INDEX IF NOT EXISTS idx_id_cards_membership_id ON public.id_cards (membership_id);
CREATE INDEX IF NOT EXISTS idx_id_cards_local_government ON public.id_cards (local_government);
CREATE INDEX IF NOT EXISTS idx_id_cards_position ON public.id_cards (position);

-- Notes:
-- - `passport_url` is recommended: stores a public or signed URL to the image in Supabase Storage.
-- - `passport_data` is kept for backwards compatibility if you previously stored base64 data.
-- - After migrating to Storage, you can DROP COLUMN `passport_data` if desired.

-- =====================================================
-- Example queries (INSERT / SELECT / UPDATE / DELETE)
-- =====================================================

-- Simple INSERT
-- Replace values as appropriate. Use `RETURNING *` to get the inserted row.
INSERT INTO public.id_cards (
  name, membership_id, position, chapter, local_government,
  passport_url, issued_at, expires_at, barcode, status
) VALUES (
  'Jane Doe', 'RHOPEE-MEM-AKS-0001', 'Member', 'AKWA IBOM STATE CHAPTER', 'Uyo',
  'https://your-bucket.storage.googleapis.com/passports/jane-doe.jpg', '2026-07-01', '2027-07-01', 'RHOPEE-MEM-AKS-123456', 'Verified Member'
);

-- INSERT and return the generated id
INSERT INTO public.id_cards (name, membership_id, barcode)
VALUES ('Alice Example', 'RHOPEE-MEM-AKS-0002', 'RHOPEE-MEM-AKS-654321')
RETURNING id;

-- Select by barcode
SELECT * FROM public.id_cards
WHERE barcode = 'RHOPEE-MEM-AKS-123456';

-- Select specific columns by membership_id
SELECT id, name, membership_id, chapter, status, passport_url
FROM public.id_cards
WHERE membership_id = 'RHOPEE-MEM-AKS-0001';

-- Update status based on expiry
UPDATE public.id_cards
SET status = 'Expired'
WHERE expires_at < (now()::date)
  AND status <> 'Expired';

-- Update passport_url for an existing row
UPDATE public.id_cards
SET passport_url = 'https://your-bucket.storage.googleapis.com/passports/new-image.jpg'
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Delete a record (use with caution)
DELETE FROM public.id_cards
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Insert within a transaction and return the created row
BEGIN;
WITH ins AS (
  INSERT INTO public.id_cards (name, membership_id, chapter, barcode)
  VALUES ('Transactional User', 'RHOPEE-MEM-AKS-0003', 'AKWA IBOM STATE CHAPTER', 'RHOPEE-MEM-AKS-999999')
  RETURNING *
)
SELECT * FROM ins;
COMMIT;

-- Lookup example for verification endpoint: fetch minimal public fields
SELECT name, membership_id, chapter, status, passport_url
FROM public.id_cards
WHERE barcode = 'RHOPEE-MEM-AKS-123456'
LIMIT 1;

-- =====================================================
