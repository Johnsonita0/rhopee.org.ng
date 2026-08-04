import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const missingSupabaseConfig = !supabaseUrl || !supabaseAnonKey;
const STORAGE_KEY = 'rhopee_training_registrations';

export const ALLOWED_ADMIN_USER_ID = 'a9044df5-bf6b-42be-95d1-1f4337b2ff33';

function getPersistedRegistrations() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : [];
  } catch (error) {
    console.warn('Unable to read persisted registrations', error);
    return [];
  }
}

function savePersistedRegistrations(registrations) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
}

function notifyRegistrationChange() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent('rhopee:registrations-updated'));
}

export const supabase = missingSupabaseConfig
  ? null
  : createClient(supabaseUrl, supabaseAnonKey);

export async function verifyIdCode(code) {
  if (missingSupabaseConfig || !supabase) {
    throw new Error(
      'Supabase credentials are missing. Copy .env.example to .env.local and add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }

  return supabase
    .from('id_cards')
    .select('id, name, tag, position, membership_id, chapter, status, issued_at, expires_at')
    .eq('barcode', code)
    .limit(1)
    .single();
}

export async function registerMember(member) {
  if (missingSupabaseConfig || !supabase) {
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

export async function saveTrainingRegistration(registration) {
  const buildLocalRegistration = (entry) => ({
    ...entry,
    id: entry.id || `local-${Date.now()}`,
    created_at: entry.created_at || new Date().toISOString(),
  });

  if (missingSupabaseConfig || !supabase) {
    const nextRegistration = buildLocalRegistration(registration);
    const storedRegistrations = getPersistedRegistrations();
    savePersistedRegistrations([nextRegistration, ...storedRegistrations]);
    notifyRegistrationChange();
    return { data: nextRegistration, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('training_registrations')
      .insert(registration)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.warn('Supabase registration save failed; storing the registration locally instead.', error);
    const nextRegistration = buildLocalRegistration(registration);
    const storedRegistrations = getPersistedRegistrations();
    savePersistedRegistrations([nextRegistration, ...storedRegistrations]);
    notifyRegistrationChange();
    return { data: nextRegistration, error: null };
  }
}

export async function signInAdmin(email, password) {
  if (missingSupabaseConfig || !supabase) {
    throw new Error('Supabase credentials are missing. Add your Supabase URL and anon key to the environment.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { data: null, error };
  }

  const user = data?.user;
  if (!user) {
    return { data: null, error: new Error('No active Supabase user was returned.') };
  }

  return { data: { session: data.session, user }, error: null };
}

export async function signUpAdmin(email, password) {
  if (missingSupabaseConfig || !supabase) {
    throw new Error('Supabase credentials are missing. Add your Supabase URL and anon key to the environment.');
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { data: null, error };
  }

  const user = data?.user;
  if (!user) {
    return { data: null, error: new Error('Supabase did not return a user for this signup.') };
  }

  return { data: { session: data.session, user }, error: null };
}

export async function signOutAdmin() {
  if (!supabase) {
    return { error: null };
  }

  return supabase.auth.signOut();
}

export async function getAdminSession() {
  if (!supabase) {
    return { data: null, error: null };
  }

  return supabase.auth.getSession();
}

export async function getAllTrainingRegistrations() {
  if (missingSupabaseConfig || !supabase) {
    return { data: getPersistedRegistrations(), error: null };
  }

  return supabase
    .from('training_registrations')
    .select('*')
    .order('created_at', { ascending: false });
}

export async function getTrainingRegistrationById(id) {
  if (missingSupabaseConfig || !supabase) {
    const registrations = getPersistedRegistrations();
    const matchingRegistration = registrations.find((entry) => entry.id === id);
    return { data: matchingRegistration || null, error: null };
  }

  return supabase
    .from('training_registrations')
    .select('*')
    .eq('id', id)
    .single();
}
