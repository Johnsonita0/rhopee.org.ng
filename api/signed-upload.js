import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'passports';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('SUPABASE service variables not set for signed upload endpoint');
}

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

function sanitizePathSegment(value) {
  return String(value || 'member')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildStoragePath({ membershipId, filename }) {
  if (filename) {
    const normalized = String(filename)
      .replace(/\\/g, '/')
      .split('/')
      .pop()
      .replace(/[^a-zA-Z0-9._-]/g, '-');
    return normalized || `${sanitizePathSegment(membershipId)}-${Date.now()}`;
  }

  const safeName = sanitizePathSegment(membershipId || 'member');
  return `${safeName}-${Date.now()}.png`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!supabaseAdmin) {
    res.status(500).json({ error: 'Server not configured for signed uploads' });
    return;
  }

  try {
    const { membershipId, filename, contentType } = req.body || {};
    const path = buildStoragePath({ membershipId, filename });

    const { data, error } = await supabaseAdmin.storage
      .from(SUPABASE_BUCKET)
      .createSignedUploadUrl(path, {
        upsert: false,
        contentType: contentType || 'application/octet-stream',
      });

    if (error) {
      console.error('Signed upload URL error', error);
      return res.status(500).json({ error: error.message || error });
    }

    const { data: urlData } = supabaseAdmin.storage.from(SUPABASE_BUCKET).getPublicUrl(path);

    return res.status(200).json({
      signedUrl: data?.signedUrl || null,
      path,
      publicUrl: urlData?.publicUrl || null,
    });
  } catch (err) {
    console.error('Signed upload endpoint error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
