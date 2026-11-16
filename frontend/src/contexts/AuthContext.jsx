import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { supabase } from '../api/supabase';
import { getFrontendUrl } from '../config/urls';
import { useQueryClient } from '@tanstack/react-query';
import { clearAuthError, reportAuthError } from '../utils/authErrorEvents';
import { isDemoPath } from '../utils/appPath';

const AuthContext = createContext(null);
const DEMO_USER = {
  user_id: 'incomedesk-public-demo',
  is_authenticated: true,
  is_guest: false,
  is_demo: true,
  email: 'alex.morgan@example.com',
  full_name: 'Alex Morgan',
  base_currency: 'USD',
  user_type: 'demo',
};

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
  const location = useLocation();
  const isDemoMode = isDemoPath(location.pathname);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    queryClient.clear();
  }, [isDemoMode, queryClient]);

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
        const authError = new Error('The API returned a session without an authenticated user profile. Please sign in again.');
        authError.status = 401;
        throw authError;
      }
      setUser(data);
      return data;
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
        reportAuthError(error.message, 'Sign-in could not be verified');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const syncUserProfile = async (sessionUser) => {
    if (!sessionUser) return;
    const fullName = sessionUser.user_metadata?.full_name ||
      sessionUser.user_metadata?.name ||
      sessionUser.email?.split('@')[0]?.replace(/[._]/g, ' ') ||
      'Freelancer';

    await api.put('/auth/profile', { full_name: fullName });
  };

  const hydrateAuthenticatedUser = async (sessionUser, isActive = () => true) => {
    if (!sessionUser) return null;
    if (!isActive()) return null;

    // Keep the authenticated shell available if the API is briefly unavailable.
    setUser(getSessionUserFallback(sessionUser));

    try {
      await syncUserProfile(sessionUser);
    } catch (error) {
      if (error.status === 401) throw error;
      if (!isActive()) return null;
      reportAuthError(
        error.message || 'Google sign-in worked, but IncomeDesk could not sync your account profile.',
        'Account setup needs attention'
      );
    }

    try {
      if (!isActive()) return null;
      return await fetchCurrentUser();
    } catch (error) {
      if (error.status === 401) throw error;
      if (isActive()) {
        reportAuthError(
          error.message || 'Your sign-in worked, but IncomeDesk could not load your account yet.',
          'Account setup needs attention'
        );
      }
      return null;
    }
  };

  useEffect(() => {
    let isActive = true;

    const initAuth = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!isActive) return;
        if (data?.session?.user) {
          await hydrateAuthenticatedUser(data.session.user, () => isActive);
        } else {
          setUser(null);
        }
      } catch (error) {
        if (!isActive) return;
        if (error.status === 401) {
          setUser(null);
          reportAuthError(
            error.message || 'Your saved sign-in session is invalid or expired. Please sign in again.',
            'Sign-in could not be restored'
          );
          await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
        } else {
          reportAuthError(
            error.message || 'IncomeDesk could not restore your saved sign-in session. Please try signing in again.',
            'Could not restore sign-in'
          );
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    // Listen before reading the session so an OAuth callback event cannot be missed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (isDemoMode) return;
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

    if (isDemoMode) {
      setUser(DEMO_USER);
      setLoading(false);
    } else {
      void initAuth();
    }

    return () => {
      isActive = false;
      subscription?.unsubscribe();
    };
  }, [isDemoMode]);

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

  const activeUser = isDemoMode ? DEMO_USER : user?.is_demo ? null : user;
  const activeLoading = isDemoMode ? false : user?.is_demo ? true : loading;

  return (
    <AuthContext.Provider value={{
      user: activeUser,
      loading: activeLoading,
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
