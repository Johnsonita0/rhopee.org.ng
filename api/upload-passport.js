import { createClient } from '@supabase/supabase-js';

// Serverless endpoint for Vercel to accept base64 image data and upload
// to Supabase Storage using the service_role key. Do NOT expose
// SUPABASE_SERVICE_ROLE_KEY to the client — set it in Vercel Environment Variables.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'passports';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('SUPABASE service variables not set for upload-passport endpoint');
}

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

function parseDataUrl(dataUrl) {
  if (!dataUrl) return null;
  const match = dataUrl.match(/^data:(image\/(png|jpeg|jpg|gif));base64,(.*)$/i);
  if (match) {
    return {
      mime: match[1],
      ext: match[2] === 'jpeg' ? 'jpg' : match[2],
      base64: match[3],
    };
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!supabaseAdmin) {
    res.status(500).json({ error: 'Server not configured for uploads' });
    return;
  }

  try {
    const { membershipId, filename, dataUrl } = req.body || {};
    if (!dataUrl) return res.status(400).json({ error: 'Missing dataUrl' });

    const parsed = parseDataUrl(dataUrl);
    if (!parsed) return res.status(400).json({ error: 'Invalid dataUrl' });

    const safeName = (membershipId || 'member').replace(/[^a-zA-Z0-9-_.]/g, '_');
    const finalName = filename || `${safeName}-${Date.now()}.${parsed.ext}`;
    const buffer = Buffer.from(parsed.base64, 'base64');

    const { data, error } = await supabaseAdmin.storage.from(SUPABASE_BUCKET).upload(finalName, buffer, {
      contentType: parsed.mime,
      upsert: false,
    });

    if (error) {
      console.error('Server upload error', error);
      return res.status(500).json({ error: error.message || error });
    }

    const { data: urlData } = supabaseAdmin.storage.from(SUPABASE_BUCKET).getPublicUrl(data.path);
    return res.status(200).json({ publicUrl: urlData?.publicUrl || null, path: data.path });
  } catch (err) {
    console.error('Upload endpoint error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
