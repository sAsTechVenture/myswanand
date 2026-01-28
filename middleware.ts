import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { locales, defaultLocale } from '@/lib/i18n/config';

/**
 * Get locale from Accept-Language header
 */
function getLocale(request: NextRequest): string {
  const headers = {
    'accept-language': request.headers.get('accept-language') || 'en',
  };
  const languages = new Negotiator({ headers }).languages();
  return match(languages, locales, defaultLocale);
}

/**
 * Decode JWT token without verification (for checking expiration only)
 */
function decodeJWT(token: string): { exp?: number; iat?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  return currentTime >= expirationTime;
}

function isValidToken(token: string | null | undefined): boolean {
  if (!token) {
    return false;
  }
  return !isTokenExpired(token);
}

function hasLocale(pathname: string): boolean {
  return locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
}

function removeLocale(pathname: string): string {
  const localeMatch = pathname.match(/^\/([^/]+)/);
  if (localeMatch && locales.includes(localeMatch[1] as any)) {
    return pathname.replace(/^\/[^/]+/, '') || '/';
  }
  return pathname;
}

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
  '/blogs',
  '/diagnostic-tests',
  '/care-packages',
];

const protectedRoutes = [
  '/upload-prescription',
  '/liked-items',
  '/profile',
  '/cart',
  '/doctor-consultation',
  '/dietitian-consultation',
  '/swanand-card/*',
  '/womens-care/*',
  '/my-happiness-corner',
];

function isPublicRoute(pathname: string): boolean {
  const pathWithoutLocale = removeLocale(pathname);
  const isProtected = protectedRoutes.some(
    (route) =>
      pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );
  if (isProtected) {
    return false;
  }
  if (publicRoutes.includes(pathWithoutLocale)) {
    return true;
  }
  return publicRoutes.some((route) => pathWithoutLocale.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  // LOCALE DETECTION: Check if pathname has a locale
  const pathnameHasLocale = hasLocale(pathname);

  // If no locale, redirect to add locale
  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // Get pathname without locale for route checking
  const pathWithoutLocale = removeLocale(pathname);

  // Allow public routes
  if (isPublicRoute(pathWithoutLocale)) {
    return NextResponse.next();
  }

  // Get token from cookie or Authorization header
  const token =
    request.cookies.get('patient_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  // Check if token is valid
  if (!isValidToken(token)) {
    // Preserve locale if present
    const currentLocale = hasLocale(pathname)
      ? pathname.split('/')[1]
      : defaultLocale;
    const loginUrl = new URL(`/${currentLocale}/auth/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token is valid, allow request
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)).*)',
  ],
};