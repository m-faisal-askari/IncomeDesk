const trimTrailingSlashes = (url = '') => (url || '').replace(/\/+$/, '');

const getFallbackFrontendUrl = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return trimTrailingSlashes(window.location.origin);
  }
  return '';
};

/**
 * Returns the configured frontend base URL from environment variables
 * (VITE_SITE_URL, VITE_FRONTEND_URL, or VITE_APP_URL), falling back to
 * window.location.origin when running in the browser.
 */
export const getFrontendBaseUrl = () => {
  const envUrl =
    import.meta.env.VITE_SITE_URL ||
    import.meta.env.VITE_FRONTEND_URL ||
    import.meta.env.VITE_APP_URL;

  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return trimTrailingSlashes(envUrl.trim());
  }
  return getFallbackFrontendUrl();
};

/**
 * Constructs a full redirect or page URL using the configured frontend base URL.
 * Ensures consistent base URL resolution for all OAuth and auth redirects.
 */
export const getFrontendUrl = (path = '') => {
  const base = getFrontendBaseUrl();
  if (!path) return base;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${cleanPath}` : cleanPath;
};

export const FRONTEND_URL = getFrontendBaseUrl();

export const BACKEND_URL = trimTrailingSlashes(
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  ''
);

export const API_BASE_URL = import.meta.env.DEV ? '' : BACKEND_URL;
