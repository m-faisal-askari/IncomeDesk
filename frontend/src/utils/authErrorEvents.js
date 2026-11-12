export const AUTH_ERROR_EVENT = 'incomedesk:auth-error';

let authErrorReported = false;

export function reportAuthError(
  message = 'Your sign-in session could not be verified. Please sign in again.',
  title = 'Sign-in required'
) {
  if (typeof window === 'undefined' || authErrorReported) return;

  authErrorReported = true;

  window.dispatchEvent(new CustomEvent(AUTH_ERROR_EVENT, {
    detail: { title, message }
  }));
}

export function clearAuthError() {
  authErrorReported = false;
}
