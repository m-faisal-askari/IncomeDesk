import { supabase } from './supabase';
import { API_BASE_URL } from '../config/urls';
import { reportAuthError } from '../utils/authErrorEvents';

const BASE_URL = API_BASE_URL ? `${API_BASE_URL.replace(/\/$/, '')}/api/v1` : '/api/v1';

export async function getAuthToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data?.session?.access_token || '';
}

let refreshSessionPromise = null;

function refreshAuthSession() {
  if (!refreshSessionPromise) {
    refreshSessionPromise = supabase.auth.refreshSession().finally(() => {
      refreshSessionPromise = null;
    });
  }
  return refreshSessionPromise;
}

async function fetchWithAuth(url, options = {}, { jsonBody = false } = {}) {
  const token = await getAuthToken();
  const baseHeaders = new Headers(options.headers || {});
  if (jsonBody && !baseHeaders.has('Content-Type')) {
    baseHeaders.set('Content-Type', 'application/json');
  }

  const sendRequest = (accessToken) => {
    const headers = new Headers(baseHeaders);
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    } else {
      headers.delete('Authorization');
    }
    return fetch(url, { ...options, headers });
  };

  let response = await sendRequest(token);
  let recoveryToken = '';
  if (response.status === 401 && token) {
    try {
      // Another request may already have refreshed the session after this
      // request was sent. Reuse that newer token before rotating again.
      const { data: latestSessionData, error: latestSessionError } = await supabase.auth.getSession();
      recoveryToken = !latestSessionError ? latestSessionData?.session?.access_token : '';

      if (!recoveryToken || recoveryToken === token) {
        const { data, error } = await refreshAuthSession();
        recoveryToken = error ? '' : data?.session?.access_token;
      }

      // Retry once even when Supabase returns the same token. This prevents
      // rejecting a session just because the backend's first 401 was transient.
      if (recoveryToken) response = await sendRequest(recoveryToken);
    } catch {
      // Keep the original 401 so callers can handle an expired/revoked session.
    }

    // A different request can refresh the session while this retry is in
    // flight. If that happened, give the newest token one final attempt.
    if (response.status === 401 && recoveryToken) {
      try {
        const latestToken = await getAuthToken();
        if (latestToken && latestToken !== recoveryToken) {
          recoveryToken = latestToken;
          response = await sendRequest(latestToken);
        }
      } catch {
        // Keep the last API response for the normal unauthorized handling below.
      }
    }
  }

  if (response.status === 401) {
    const message = await getResponseErrorMessage(
      response,
      token
        ? 'The API rejected your sign-in token. Please sign in again.'
        : 'No access token was sent to the API. Please sign in again.'
    );
    reportAuthError(message, 'Sign-in could not be verified');
    // A 401 after refresh means the backend explicitly rejected the token.
    // Temporary verifier failures now use 503 and leave the session intact.
    supabase.auth.signOut({ scope: 'local' }).catch(() => {});
  } else if (response.status === 503) {
    const message = await getResponseErrorMessage(
      response,
      'The authentication service is temporarily unavailable. Your session was kept; please retry shortly.'
    );
    reportAuthError(message, 'Sign-in check unavailable');
  }

  return response;
}

/**
 * Sanitizes payload objects: converts empty strings to null for IDs, dates, and optional relations
 * so FastAPI / Pydantic validation and PostgreSQL foreign keys never reject them.
 */
function sanitizePayload(data) {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizePayload);

  const cleaned = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === '') {
      // Empty strings for dates or foreign key IDs must be null
      if (
        key.endsWith('_id') || 
        key.endsWith('_date') || 
        key === 'date' || 
        key === 'due_date' || 
        key === 'target_date' || 
        key === 'start_date' || 
        key === 'end_date' ||
        key === 'next_payment_date' ||
        key === 'client_id' ||
        key === 'project_id' ||
        key === 'category_id' ||
        key === 'source_account_id' ||
        key === 'destination_account_id' ||
        key === 'account_id'
      ) {
        cleaned[key] = null;
      } else {
        cleaned[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = sanitizePayload(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Parses and normalizes error responses from backend into friendly readable strings
 */
function extractErrorMessage(errorData, fallbackText = 'An unexpected error occurred') {
  if (!errorData) return fallbackText;
  
  if (typeof errorData === 'string') return errorData;
  
  if (errorData.detail) {
    if (typeof errorData.detail === 'string') return errorData.detail;
    if (Array.isArray(errorData.detail)) {
      // FastAPI / Pydantic validation error list
      return errorData.detail
        .map((err) => {
          const field = err.loc ? err.loc[err.loc.length - 1] : '';
          return field ? `${field}: ${err.msg}` : err.msg;
        })
        .join('; ');
    }
  }
  
  if (errorData.message) return errorData.message;
  return fallbackText;
}

async function getResponseErrorMessage(response, fallbackText) {
  try {
    const errorData = await response.clone().json();
    return extractErrorMessage(errorData, fallbackText);
  } catch {
    return fallbackText;
  }
}

export async function fetchApi(endpoint, options = {}) {
  const response = await fetchWithAuth(
    `${BASE_URL}${endpoint}`,
    options,
    { jsonBody: true }
  );

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    let errorDetail = `Request failed (${response.status})`;
    try {
      const errorData = await response.json();
      errorDetail = extractErrorMessage(errorData, errorDetail);
    } catch (e) {
      // Non-json response
    }
    const requestError = new Error(errorDetail);
    requestError.status = response.status;
    throw requestError;
  }

  return response.json();
}

export const api = {
  get: (url, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, v);
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchApi(`${url}${qs}`, { method: 'GET' });
  },

  post: (url, data) => fetchApi(url, {
    method: 'POST',
    body: JSON.stringify(sanitizePayload(data))
  }),

  put: (url, data) => fetchApi(url, {
    method: 'PUT',
    body: JSON.stringify(sanitizePayload(data))
  }),

  delete: (url) => fetchApi(url, {
    method: 'DELETE'
  }),

  uploadFile: async (url, file, extraData = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(extraData).forEach(([k, v]) => {
      if (v) formData.append(k, v);
    });

    const response = await fetchWithAuth(`${BASE_URL}${url}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      let msg = 'Upload failed';
      try {
        const err = await response.json();
        msg = extractErrorMessage(err, msg);
      } catch (e) {}
      throw new Error(msg);
    }
    return response.json();
  },

  downloadBlob: async (url, filename) => {
    const response = await fetchWithAuth(`${BASE_URL}${url}`);

    if (!response.ok) throw new Error('Download failed');
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  }
};
