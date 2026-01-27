'use client';

import { useState, useEffect } from 'react';
import type { Locale } from '@/lib/i18n/config';

type Dictionary = {
  common: Record<string, string>;
  [key: string]: Record<string, string>;
};

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('@/app/[lang]/dictionaries/en.json').then((module) => module.default),
  hi: () => import('@/app/[lang]/dictionaries/hi.json').then((module) => module.default),
  mr: () => import('@/app/[lang]/dictionaries/mr.json').then((module) => module.default),
};

export function useDictionary(locale: Locale) {
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDictionary = async () => {
      try {
        setLoading(true);
        const dict = await dictionaries[locale]();
        if (isMounted) {
          setDictionary(dict);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading dictionary:', error);
        // Fallback to English if loading fails
        if (isMounted) {
          const fallback = await dictionaries['en']();
          setDictionary(fallback);
          setLoading(false);
        }
      }
    };

    loadDictionary();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  return { dictionary, loading };
}
