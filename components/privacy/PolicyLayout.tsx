'use client';

import { usePathname } from 'next/navigation';
import { getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';

interface PolicyLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function PolicyLayout({ title, children }: PolicyLayoutProps) {
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const { dictionary } = useDictionary(locale);

  // Helper function to get translation
  const t = (key: string): string => {
    if (!dictionary) return key;
    const keys = key.split('.');
    let value: any = dictionary;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  // If title is a translation key, translate it; otherwise use as-is
  const translatedTitle = title.includes('.') ? t(title) : title;

  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-8">
        {translatedTitle}
      </h1>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        {children}
      </div>
    </main>
  );
}
