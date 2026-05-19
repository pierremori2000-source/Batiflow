import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kyrjenbhskxczupfgnmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cmplbmJoc2t4Y3p1cGZnbm13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDUxMjcsImV4cCI6MjA5NDc4MTEyN30.Nec_SUhh6BCG1TrLwK6pK8zl_z2JS2P291S8al05uQY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth helpers
export const auth = {
  signUp: (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),
  signOut: () => supabase.auth.signOut(),
  getUser: () => supabase.auth.getUser(),
  onAuthStateChange: (cb: Parameters<typeof supabase.auth.onAuthStateChange>[0]) =>
    supabase.auth.onAuthStateChange(cb),
};

// Storage helpers
export const storage = {
  upload: async (file: File, path: string) => {
    const { data, error } = await supabase.storage.from('batiflow').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('batiflow').getPublicUrl(data.path);
    return urlData.publicUrl;
  },
};
