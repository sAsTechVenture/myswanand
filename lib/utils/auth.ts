/**
 * Sync authentication token from localStorage to cookie
 * This ensures middleware can access the token for server-side route protection
 */
export function syncAuthTokenToCookie(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const token = localStorage.getItem('patient_token');

  if (token) {
    // Set cookie with 7 days expiration
    const expires = new Date();
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
    document.cookie = `patient_token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }
}

/**
 * Check if user is authenticated (has token in localStorage)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const token = localStorage.getItem('patient_token');
  return !!token;
}

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('patient_token');
}
