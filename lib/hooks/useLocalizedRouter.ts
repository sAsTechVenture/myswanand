'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useParams } from 'next/navigation';
import { getCurrentLocale, createLocalizedPath } from '@/lib/utils/i18n';
import type { Locale } from '@/lib/i18n/config';

export function useLocalizedRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  
  // Get locale from params (for [lang] routes) or pathname (fallback)
  const locale = (params?.lang as Locale) || getCurrentLocale(pathname) || 'en';

  return {
    push: (path: string) => {
      router.push(createLocalizedPath(path, locale));
    },
    replace: (path: string) => {
      router.replace(createLocalizedPath(path, locale));
    },
    locale,
    router, // Expose original router if needed
  };
}
