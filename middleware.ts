import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Decode JWT token without verification (for checking expiration only)
 * In production, you should verify the signature, but for middleware
 * we just check expiration to avoid blocking requests unnecessarily
 */
function decodeJWT(token: string): { exp?: number; iat?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true; // Consider expired if we can't decode or no exp
  }

  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();

  return currentTime >= expirationTime;
}

/**
 * Check if token is valid (exists and not expired)
 */
function isValidToken(token: string | null | undefined): boolean {
  if (!token) {
    return false;
  }

  return !isTokenExpired(token);
}

/**
 * Public routes that don't require authentication
 */
const publicRoutes = [
  '/',
  '/about',
  '/contact-us',
  '/contact',
  '/auth/login',
  '/auth/register',
  '/privacy',
  '/pp',
  '/terms',
  '/verify-email',
  '/refund',
  '/shop',
  '/blog',
  '/diagnostic-tests',
  '/care-packages',
];

/**
 * Protected routes that explicitly require authentication
 * Note: Any route NOT in publicRoutes is automatically protected
 */
const protectedRoutes = [
  '/upload-prescription',
  '/liked-items',
  '/profile',
  '/cart',
  '/doctor-consultation',
  '/dietitian-consultation',
  '/swanand-card/*',
  '/womens-care/*',
  '/my-happiness-corner'
];

/**
 * Check if a path is a public route
 */
function isPublicRoute(pathname: string): boolean {
  // First check if it's explicitly a protected route
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected) {
    return false; // Protected routes are never public
  }

  // Exact match
  if (publicRoutes.includes(pathname)) {
    return true;
  }

  // Check if pathname starts with any public route
  return publicRoutes.some((route) => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Allow static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.match(
      /\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/
    )
  ) {
    return NextResponse.next();
  }

  // Get token from cookie (set by API) or Authorization header
  // Note: localStorage is not accessible in middleware, so we rely on cookies
  // The login API should set a cookie, or we need to handle auth on client-side
  const token =
    request.cookies.get('patient_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  // Check if token is valid
  if (!isValidToken(token)) {
    // For protected routes, redirect to login with return URL
    // The client-side will handle localStorage-based auth as a fallback
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token is valid, allow request
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)).*)',
  ],
};
