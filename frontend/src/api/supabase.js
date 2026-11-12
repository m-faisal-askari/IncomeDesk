import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.');
}

const AUTH_STORAGE_KEY = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`;

/**
 * Prefer durable browser storage, but tolerate browsers that block it. The
 * sessionStorage path also migrates sessions written by older app versions.
 */
function createAuthStorage() {
  const memoryStorage = new Map();

  const getBrowserStorage = (name) => {
    try {
      return typeof window === 'undefined' ? null : window[name];
    } catch {
      return null;
    }
  };

  return {
    getItem(key) {
      const localStorage = getBrowserStorage('localStorage');
      if (localStorage) {
        try {
          const value = localStorage.getItem(key);
          if (value !== null) return value;
        } catch {
          // Try the less durable browser store below.
        }
      }

      const sessionStorage = getBrowserStorage('sessionStorage');
      if (sessionStorage) {
        try {
          const value = sessionStorage.getItem(key);
          if (value !== null) {
            // Move an older tab-only session to durable storage when possible.
            if (localStorage) {
              try {
                localStorage.setItem(key, value);
                sessionStorage.removeItem(key);
              } catch {
                // Keep using the sessionStorage copy if localStorage is blocked.
              }
            }
            return value;
          }
        } catch {
          // Fall through to the in-memory copy.
        }
      }

      return memoryStorage.get(key) ?? null;
    },

    setItem(key, value) {
      for (const storageName of ['localStorage', 'sessionStorage']) {
        const storage = getBrowserStorage(storageName);
        if (!storage) continue;
        try {
          storage.setItem(key, value);
          return;
        } catch {
          // Try the next storage option.
        }
      }
      memoryStorage.set(key, value);
    },

    removeItem(key) {
      for (const storageName of ['localStorage', 'sessionStorage']) {
        const storage = getBrowserStorage(storageName);
        try {
          storage?.removeItem(key);
        } catch {
          // A blocked browser store must not prevent clearing other stores.
        }
      }
      memoryStorage.delete(key);
    },
  };
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storageKey: AUTH_STORAGE_KEY,
    storage: createAuthStorage(),
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // OAuth uses a one-time code and the verifier stored before redirect.
    flowType: 'pkce',
  }
});
