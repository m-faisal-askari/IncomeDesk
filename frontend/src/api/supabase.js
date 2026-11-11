import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.');
}

const AUTH_STORAGE_KEY = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
let authStorage;
let persistentStorageAvailable = false;

if (typeof window !== 'undefined') {
  try {
    authStorage = window.localStorage;
    persistentStorageAvailable = true;
  } catch {
    try {
      authStorage = window.sessionStorage;
    } catch {
      authStorage = undefined;
    }
  }

  if (persistentStorageAvailable) {
    try {
      const existingSession = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (existingSession && !authStorage.getItem(AUTH_STORAGE_KEY)) {
        authStorage.setItem(AUTH_STORAGE_KEY, existingSession);
      }
    } catch {
      // A blocked legacy session should not prevent using persistent storage.
    }
  }
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storageKey: AUTH_STORAGE_KEY,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: authStorage,
  }
});
