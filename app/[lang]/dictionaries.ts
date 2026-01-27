import 'server-only';
import type { Locale } from '@/lib/i18n/config';

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  hi: () => import('./dictionaries/hi.json').then((module) => module.default),
  mr: () => import('./dictionaries/mr.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]();
};

export const hasLocale = (locale: string): locale is Locale => {
  return locale in dictionaries;
};