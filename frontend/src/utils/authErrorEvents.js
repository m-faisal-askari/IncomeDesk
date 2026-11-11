export const AUTH_ERROR_EVENT = 'incomedesk:auth-error';

let authErrorReported = false;

export function reportAuthError() {
  if (typeof window === 'undefined' || authErrorReported) return;

  authErrorReported = true;

  window.dispatchEvent(new CustomEvent(AUTH_ERROR_EVENT));
}

export function clearAuthError() {
  authErrorReported = false;
}
