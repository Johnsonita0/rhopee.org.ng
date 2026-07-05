import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseBucket = import.meta.env.VITE_SUPABASE_BUCKET || 'passports';

const missingSupabaseConfig = !supabaseUrl || !supabaseAnonKey;

export const supabase = missingSupabaseConfig
  ? null
  : createClient(supabaseUrl, supabaseAnonKey);

export async function verifyIdCode(code) {
  if (missingSupabaseConfig) {
    throw new Error(
      'Supabase credentials are missing. Copy .env.example to .env.local and add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }

  return supabase
    .from('id_cards')
    .select('id, name, position, membership_id, chapter, status, issued_at, expires_at')
    .eq('barcode', code)
    .limit(1)
    .single();
}

export async function registerMember(member) {
  if (missingSupabaseConfig) {
    throw new Error(
      'Supabase credentials are missing. Copy .env.example to .env.local and add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }

  return supabase
    .from('id_cards')
    .insert(member)
    .select()
    .single();
}

export async function uploadPassportFile(file, membershipId) {
  if (missingSupabaseConfig) {
    throw new Error(
      'Supabase credentials are missing. Copy .env.example to .env.local and add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }

  const bucket = supabaseBucket;
  const fileExt = (file.name && file.name.split('.').pop()) || 'png';
  const filename = `${membershipId || 'member'}-${Date.now()}.${fileExt}`;
  const path = filename;

  // If server-side signed upload endpoint is enabled, request a signed URL
  // from the API and upload the file directly to Supabase Storage.
  const useServer = import.meta.env.VITE_USE_SERVER_UPLOAD === 'true';
  if (useServer) {
    try {
      const resp = await fetch('/api/signed-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membershipId,
          filename: path,
          contentType: file.type || 'application/octet-stream',
        }),
      });

      const json = await resp.json();
      if (!resp.ok || !json?.signedUrl) {
        console.error('Signed upload request failed', json);
        return { publicUrl: null, error: json, context: { bucket, path } };
      }

      const uploadResp = await fetch(json.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });

      if (!uploadResp.ok) {
        const uploadText = await uploadResp.text();
        console.error('Signed upload failed', { status: uploadResp.status, body: uploadText });
        return { publicUrl: null, error: { message: uploadText || 'Signed upload failed' }, context: { bucket, path } };
      }

      return { publicUrl: json.publicUrl || null };
    } catch (err) {
      console.error('Signed upload exception', { err, bucket, path });
      return { publicUrl: null, error: err, context: { bucket, path } };
    }
  }

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (uploadError) {
      console.error('Passport upload error', { supabaseUrl, bucket, path, err: uploadError });
      return { publicUrl: null, error: uploadError, context: { supabaseUrl, bucket, path } };
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
    return { publicUrl: urlData?.publicUrl || null };
  } catch (err) {
    console.error('Passport upload exception', { supabaseUrl, bucket, path, err });
    return { publicUrl: null, error: err, context: { supabaseUrl, bucket, path } };
  }
}
