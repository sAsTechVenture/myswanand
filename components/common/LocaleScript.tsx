'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getCurrentLocale } from '@/lib/utils/i18n';

export function LocaleScript() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Set lang attribute immediately on mount
    const locale = getCurrentLocale(pathname);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [pathname]);

  return null;
}
