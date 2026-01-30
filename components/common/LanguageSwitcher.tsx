'use client';

import { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Globe } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { locales, localeNames, type Locale } from '@/lib/i18n/config';
import { colors } from '@/config/theme';
import { getCurrentLocale } from '@/lib/utils/i18n';

function LanguageSwitcherContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract current locale from pathname
  const currentLocale = getCurrentLocale(pathname);

  const changeLanguage = (locale: Locale) => {
    // Don't do anything if already on this locale
    if (currentLocale === locale) {
      return;
    }

    // Remove current locale from pathname
    let pathWithoutLocale = pathname.replace(/^\/(en|hi|mr)/, '');

    // If path is empty or just '/', set it to empty string (will become just /locale)
    if (!pathWithoutLocale || pathWithoutLocale === '/') {
      pathWithoutLocale = '';
    }

    // Preserve query parameters
    const queryString = searchParams.toString();
    const newPath = `/${locale}${pathWithoutLocale}${queryString ? `?${queryString}` : ''}`;

    // Navigate to new locale - use replace to avoid adding to history
    router.replace(newPath);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center"
          style={{
            backgroundColor: '#f0ede4',
          }}
        >
          <Globe
            className="w-4 h-4 sm:w-5 sm:h-5"
            style={{ color: colors.green }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-44 p-1.5"
        align="end"
        sideOffset={8}
        side="bottom"
      >
        <div className="flex flex-col gap-0.5">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                changeLanguage(locale);
              }}
              className={`px-3 py-2.5 text-sm rounded-md transition-all text-left font-medium ${
                currentLocale === locale
                  ? 'bg-primary text-white shadow-sm'
                  : 'hover:bg-accent text-gray-700'
              }`}
              style={
                currentLocale === locale
                  ? {
                      backgroundColor: colors.primary,
                      color: colors.white,
                    }
                  : {}
              }
            >
              {localeNames[locale]}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Fallback component
function LanguageSwitcherFallback() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center"
      style={{
        backgroundColor: '#f0ede4',
      }}
      disabled
    >
      <Globe
        className="w-4 h-4 sm:w-5 sm:h-5"
        style={{ color: colors.green }}
      />
    </Button>
  );
}

export function LanguageSwitcher() {
  return (
    <Suspense fallback={<LanguageSwitcherFallback />}>
      <LanguageSwitcherContent />
    </Suspense>
  );
}
