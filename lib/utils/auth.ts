/**
 * Decode JWT token without verification (for checking expiration)
 */
function decodeJWT(token: string): { exp?: number; iat?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  return currentTime >= expirationTime;
}

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
    // Check if token is expired
    if (isTokenExpired(token)) {
      // Token expired, clear everything
      logout();
      return;
    }

    // Set cookie with 7 days expiration
    const expires = new Date();
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
    document.cookie = `patient_token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }
}

/**
 * Check if user is authenticated (has valid, non-expired token in localStorage)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const token = localStorage.getItem('patient_token');
  if (!token) {
    return false;
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    // Token expired, clear everything
    logout();
    return false;
  }

  return true;
}

/**
 * Get authentication token from localStorage
 * Returns null if token is expired
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem('patient_token');
  if (!token) {
    return null;
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    logout();
    return null;
  }

  return token;
}

/**
 * Logout user - clear all auth data
 */
export function logout(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Clear localStorage
  localStorage.removeItem('patient_token');
  localStorage.removeItem('patient_user');

  // Clear cookie
  document.cookie =
    'patient_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

  // Dispatch auth change event
  window.dispatchEvent(new Event('auth-change'));
}

/**
 * Check token validity and auto-logout if expired
 * Call this on app initialization or route changes
 */
export function checkTokenValidity(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const token = localStorage.getItem('patient_token');
  if (!token) {
    return false;
  }

  if (isTokenExpired(token)) {
    logout();
    return false;
  }

  return true;
}
