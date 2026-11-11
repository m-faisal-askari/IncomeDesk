import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { supabase } from '../api/supabase';
import { FRONTEND_URL, getFrontendUrl } from '../config/urls';
import { useQueryClient } from '@tanstack/react-query';
import { clearAuthError } from '../utils/authErrorEvents';

const AuthContext = createContext(null);

function getSessionUserFallback(sessionUser) {
  const metadata = sessionUser?.user_metadata || {};
  const email = sessionUser?.email || '';
  const fullName = metadata.full_name || metadata.name || email.split('@')[0] || 'Freelancer';

  return {
    user_id: sessionUser.id,
    is_authenticated: true,
    is_guest: false,
    email,
    full_name: fullName,
    avatar_url: metadata.avatar_url || null,
    base_currency: 'USD',
    user_type: metadata.user_type || 'beta',
    beta_until: metadata.beta_until || '2026-12-31'
  };
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    if (!sessionData?.session?.access_token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const data = await api.get('/auth/me');
      if (!data?.is_authenticated || data.is_guest) {
        const authError = new Error('The server did not accept this sign-in session.');
        authError.status = 401;
        throw authError;
      }
      setUser(data);
      return data;
    } catch (error) {
      if (error.status === 401) setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const syncOAuthProfile = async (sessionUser) => {
    if (!sessionUser) return;
    const fullName = sessionUser.user_metadata?.full_name ||
      sessionUser.user_metadata?.name ||
      sessionUser.email?.split('@')[0]?.replace(/[._]/g, ' ') ||
      'Freelancer';

    await api.put('/auth/profile', { full_name: fullName });
  };

  const hydrateAuthenticatedUser = async (sessionUser) => {
    if (!sessionUser) return null;

    // Keep the authenticated shell available if the API is briefly unavailable.
    setUser(getSessionUserFallback(sessionUser));

    try {
      await syncOAuthProfile(sessionUser);
    } catch (error) {
      if (error.status === 401) throw error;
    }

    try {
      return await fetchCurrentUser();
    } catch (error) {
      if (error.status === 401) throw error;
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (data?.session?.user) {
          await hydrateAuthenticatedUser(data.session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        if (error.status === 401) {
          setUser(null);
          await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
        clearAuthError();
        if (session?.user) {
          setUser((currentUser) => currentUser || getSessionUserFallback(session.user));
        }
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        queryClient.clear();
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    if (error) throw error;
    if (!data?.session?.access_token) {
      throw new Error('Sign-in did not return an active session.');
    }

    try {
      await hydrateAuthenticatedUser(data.session.user);
    } catch (error) {
      if (error.status === 401) {
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
      }
      throw error;
    }
    queryClient.invalidateQueries();
    return data;
  };

  const register = async (email, password, full_name) => {
    const emailRedirectTo = getFrontendUrl('/login') || undefined;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name },
        emailRedirectTo
      }
    });
    if (error) throw error;

    // Supabase intentionally returns an obfuscated user with no identities when
    // an email already belongs to an account. Never fall back to local signup.
    if (Array.isArray(data?.user?.identities) && data.user.identities.length === 0) {
      throw new Error('This email may already have an account. Sign in using its existing method.');
    }

    if (data?.session?.access_token) {
      try {
        await hydrateAuthenticatedUser(data.user);
      } catch (error) {
        if (error.status === 401) {
          await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
        }
        throw error;
      }
      queryClient.invalidateQueries();
      return { ...data, confirmation_required: false };
    }

    return { ...data, confirmation_required: true };
  };

  const loginWithGoogle = async () => {
    const redirectTo = getFrontendUrl('/') || undefined;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
    if (error) throw error;
    return data;
  };

  const requestPasswordReset = async (email) => {
    const redirectTo = getFrontendUrl('/reset-password') || undefined;
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo }
    );
    if (error) throw error;
    return data;
  };

  const updatePassword = async (password) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      queryClient.clear();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      requestPasswordReset,
      updatePassword,
      logout,
      refreshUser: fetchCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
