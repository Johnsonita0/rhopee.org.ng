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
