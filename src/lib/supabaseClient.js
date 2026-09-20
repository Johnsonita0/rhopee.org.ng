import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const missingSupabaseConfig = !supabaseUrl || !supabaseAnonKey;

export const ALLOWED_ADMIN_USER_ID = 'a9044df5-bf6b-42be-95d1-1f4337b2ff33';

export const supabase = missingSupabaseConfig
  ? null
  : createClient(supabaseUrl, supabaseAnonKey);

const LOCAL_REGISTRATIONS_KEY = 'rhopee_training_registrations';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function getPersistedRegistrations() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(LOCAL_REGISTRATIONS_KEY);
    return storedValue ? JSON.parse(storedValue) : [];
  } catch (error) {
    console.warn('Unable to read persisted registrations', error);
    return [];
  }
}

function savePersistedRegistrations(registrations = []) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(LOCAL_REGISTRATIONS_KEY, JSON.stringify(registrations));
  } catch (error) {
    console.warn('Unable to save persisted registrations', error);
  }
}

function notifyRegistrationChange() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent('rhopee:registrations-updated'));
}

function notifyFeedbackChange() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent('rhopee:feedback-updated'));
}

async function findDuplicateRegistrationByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || missingSupabaseConfig || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('training_registrations')
    .select('id, email')
    .ilike('email', normalizedEmail)
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  return data || null;
}

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
  const duplicateRegistration = await findDuplicateRegistrationByEmail(registration.email);
  if (duplicateRegistration) {
    return {
      data: null,
      error: new Error('This email address has already been used for a registration.'),
    };
  }

  if (missingSupabaseConfig || !supabase) {
    return {
      data: null,
      error: new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'),
    };
  }

  try {
    const { data, error } = await supabase
      .from('training_registrations')
      .insert(registration)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: new Error(
        'Unable to save registration to the database. Please check your connection and try again.'
      ),
    };
  }
}

export async function saveClassFeedback(feedback) {
  if (missingSupabaseConfig || !supabase) {
    return {
      data: null,
      error: new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'),
    };
  }

  try {
    const { data, error } = await supabase
      .rpc('submit_class_feedback', {
        p_student_name: feedback.student_name,
        p_gender: feedback.gender,
        p_training_track: feedback.training_track,
        p_training_track_name: feedback.training_track_name,
        p_class_date: feedback.class_date,
        p_class_rating: feedback.class_rating,
        p_favourite_moment: feedback.favourite_moment,
        p_class_spirit: feedback.class_spirit,
        p_challenges: feedback.challenges,
        p_additional_notes: feedback.additional_notes,
      });

    if (!error) {
      notifyFeedbackChange();
    }

    return { data, error };
  } catch (error) {
    return { data: null, error: new Error('Unable to save class feedback. Please try again later.') };
  }
}

export async function getAllClassFeedback() {
  if (missingSupabaseConfig || !supabase) {
    return { data: [], error: new Error('Supabase is not configured.') };
  }

  try {
    const { data, error } = await supabase.rpc('get_class_feedback');

    return { data: data || [], error };
  } catch (error) {
    return { data: [], error };
  }
}

export async function saveCbtExamResult(result) {
  if (missingSupabaseConfig || !supabase) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  try {
    const { data, error } = await supabase
      .from('cbt_exam_results')
      .insert(result);

    if (error) {
      return {
        data: null,
        error: new Error(error.code === '23505'
          ? 'This student name has already completed the exam and cannot submit another attempt.'
          : error.code === '42P01' || error.message?.includes('cbt_exam_results')
            ? 'The cbt_exam_results table is missing. Run supabase/schema.sql in Supabase SQL Editor.'
          : error.message || 'Unable to save the exam result.'),
      };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getPublicCbtExamResult(resultToken) {
  if (missingSupabaseConfig || !supabase) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  try {
    const { data, error } = await supabase.rpc('get_public_cbt_exam_result', {
      p_result_token: resultToken,
    });
    return { data: data?.[0] || null, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getPublicCbtExamResultByStudentName(studentName) {
  if (missingSupabaseConfig || !supabase) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  try {
    const { data, error } = await supabase.rpc('get_public_cbt_exam_result_by_student_name', {
      p_student_name: studentName,
    });
    return { data: data?.[0] || null, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function hasCompletedCbtExam(studentName) {
  if (missingSupabaseConfig || !supabase) {
    return { data: false, error: new Error('Supabase is not configured.') };
  }

  try {
    const { data, error } = await supabase.rpc('has_completed_cbt_exam', {
      p_student_name: studentName,
    });
    return { data: Boolean(data), error };
  } catch (error) {
    return { data: false, error };
  }
}

export async function getAllCbtExamResults() {
  if (missingSupabaseConfig || !supabase) {
    return { data: [], error: new Error('Supabase is not configured.') };
  }

  try {
    const { data, error } = await supabase
      .from('cbt_exam_results')
      .select('*')
      .order('completed_at', { ascending: false });

    return { data: data || [], error };
  } catch (error) {
    return { data: [], error };
  }
}

export async function publishCbtCertificate(resultId, published) {
  if (missingSupabaseConfig || !supabase) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  try {
    const { data, error } = await supabase
      .from('cbt_exam_results')
      .update({ certificate_published: published })
      .eq('id', resultId)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteClassFeedback(feedbackId) {
  if (missingSupabaseConfig || !supabase) {
    return { error: new Error('Supabase is not configured.') };
  }

  try {
    const { error } = await supabase.rpc('delete_class_feedback', {
      p_feedback_id: feedbackId,
    });
    return { error };
  } catch (error) {
    return { error: new Error('Unable to delete class feedback. Please try again.') };
  }
}

export async function deleteTrainingRegistration(registrationId) {
  if (String(registrationId || '').startsWith('local-')) {
    return {
      data: null,
      error: new Error('Cannot delete a local pending registration from Supabase.'),
    };
  }

  if (missingSupabaseConfig || !supabase) {
    return {
      data: null,
      error: new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'),
    };
  }

  try {
    const { data, error } = await supabase
      .from('training_registrations')
      .delete()
      .eq('id', registrationId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return {
      data: null,
      error: new Error('Unable to delete registration. Please try again.'),
    };
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

  try {
    const { data, error } = await supabase
      .from('training_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: getPersistedRegistrations(), error };
    }

    return { data: data || [], error: null };
  } catch (err) {
    return { data: getPersistedRegistrations(), error: err };
  }
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

export async function pushPendingRegistrations() {
  if (missingSupabaseConfig || !supabase) {
    return { pushed: 0, error: new Error('Supabase not configured') };
  }

  const persisted = getPersistedRegistrations();
  const pending = persisted.filter((r) => String(r.id || '').startsWith('local-') || !r.id);
  if (!pending.length) {
    return { pushed: 0 };
  }

  let pushed = 0;

  for (const entry of pending) {
    // prepare payload: remove local id and created_at to let Supabase assign values
    const payload = { ...entry };
    delete payload.id;
    // keep created_at if present

    try {
      const { data, error } = await supabase.from('training_registrations').insert(payload).select().single();
      if (error) {
        // if duplicate by unique constraint, attempt to skip
        console.warn('Failed to push pending registration', error);
        continue;
      }

      // Replace local entry with remote data in persisted store
      try {
        const current = getPersistedRegistrations();
        const others = current.filter((c) => c.id !== entry.id);
        savePersistedRegistrations([data, ...others]);
      } catch (persistError) {
        console.warn('Unable to persist pushed registration locally', persistError);
      }

      pushed += 1;
      notifyRegistrationChange();
    } catch (err) {
      console.warn('Error pushing pending registration', err);
    }
  }

  return { pushed };
}
