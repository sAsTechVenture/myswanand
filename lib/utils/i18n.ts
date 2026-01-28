'use client';

import type { Locale } from '@/lib/i18n/config';

/**
 * Get current locale from pathname
 */
export function getCurrentLocale(pathname: string): Locale {
  const localeMatch = pathname.match(/^\/([^/]+)/);
  if (localeMatch && ['en', 'hi', 'mr'].includes(localeMatch[1])) {
    return localeMatch[1] as Locale;
  }
  return 'en';
}

/**
 * Create locale-aware URL
 */
export function createLocalizedPath(path: string, locale: Locale): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Remove locale if already present
  const pathWithoutLocale = cleanPath.replace(/^(en|hi|mr)\//, '');
  return `/${locale}${pathWithoutLocale ? `/${pathWithoutLocale}` : ''}`;
}