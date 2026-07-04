/*
  Migration script: move base64 `passport_data` from the `id_cards` table
  into Supabase Storage (`passports` bucket) and write back `passport_url`.

  Usage:
    - Install dependencies: `npm install @supabase/supabase-js dotenv`
    - Set environment variables in .env: SUPABASE_URL and SUPABASE_SERVICE_KEY (service_role key)
    - Ensure `passports` bucket exists (public or private as required)
    - Run: `node migrate_passports.js`
*/

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // required for storage + admin updates
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

const BUCKET = 'passports';

async function fetchRowsWithBase64() {
  const { data, error } = await supabase
    .from('id_cards')
    .select('id, membership_id, passport_data')
    .not('passport_data', 'is', null)
    .limit(1000);

  if (error) throw error;
  return data || [];
}

function parseDataUrl(dataUrl) {
  // data:[<mediatype>][;base64],<data>
  if (!dataUrl) return null;
  const match = dataUrl.match(/^data:(image\/(png|jpeg|jpg|gif));base64,(.*)$/i);
  if (match) {
    return {
      mime: match[1],
      ext: match[2] === 'jpeg' ? 'jpg' : match[2],
      base64: match[3],
    };
  }
  // fallback: assume full base64 string without prefix
  return { mime: 'image/png', ext: 'png', base64: dataUrl };
}

async function uploadBuffer(buffer, destPath, contentType) {
  const { data, error } = await supabase.storage.from(BUCKET).upload(destPath, buffer, {
    contentType,
    upsert: false,
  });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(destPath);
  return urlData?.publicUrl || null;
}

async function migrate() {
  const rows = await fetchRowsWithBase64();
  console.log(`Found ${rows.length} rows with passport_data to migrate.`);

  for (const row of rows) {
    try {
      const parsed = parseDataUrl(row.passport_data);
      if (!parsed) {
        console.warn(`Skipping row ${row.id} — could not parse passport_data`);
        continue;
      }

      const buffer = Buffer.from(parsed.base64, 'base64');
      const safeName = (row.membership_id || row.id).replace(/[^a-zA-Z0-9-_\.]/g, '_');
      const filename = `${safeName}-${Date.now()}.${parsed.ext}`;

      console.log(`Uploading ${filename} for row ${row.id}...`);
      const publicUrl = await uploadBuffer(buffer, filename, parsed.mime);
      if (!publicUrl) {
        console.warn(`Failed to get public URL for ${filename}`);
        continue;
      }

      // Update the row with passport_url and null out passport_data
      const { error: updateErr } = await supabase
        .from('id_cards')
        .update({ passport_url: publicUrl, passport_data: null })
        .eq('id', row.id);

      if (updateErr) throw updateErr;
      console.log(`Row ${row.id} migrated to ${publicUrl}`);
    } catch (err) {
      console.error(`Error migrating row ${row.id}:`, err.message || err);
    }
  }

  console.log('Migration completed. Verify rows and consider dropping `passport_data` if no longer needed.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message || err);
  process.exit(1);
});
