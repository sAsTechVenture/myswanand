'use client';

import { usePathname } from 'next/navigation';
import { getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import PageBanner from '@/components/common/PageBanner';
import { colors } from '@/config/theme';

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
    <main className="w-full overflow-x-hidden bg-white">
      {/* Page Banner */}
      <PageBanner title={translatedTitle} />

      {/* Content Container */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <article className="policy-content">
          {children}
        </article>

        {/* Styles for policy content */}
        <style jsx global>{`
          .policy-content {
            font-size: 0.95rem;
            line-height: 1.8;
            color: #4B5563;
          }

          .policy-content > p {
            margin-bottom: 1rem;
          }

          .policy-content h2 {
            color: ${colors.primary};
            font-size: 1.25rem;
            font-weight: 600;
            margin-top: 2.5rem;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid ${colors.primaryLight};
          }

          .policy-content h3 {
            color: #1F2937;
            font-size: 1.1rem;
            font-weight: 600;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
          }

          .policy-content ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin-bottom: 1rem;
          }

          .policy-content ul li {
            margin-bottom: 0.5rem;
            position: relative;
          }

          .policy-content ul li::marker {
            color: ${colors.primary};
          }

          .policy-content strong {
            color: #1F2937;
            font-weight: 600;
          }

          .policy-content a {
            color: ${colors.primary};
            text-decoration: underline;
            transition: opacity 0.2s;
          }

          .policy-content a:hover {
            opacity: 0.8;
          }

          .policy-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 0.9rem;
          }

          .policy-content table th {
            background-color: ${colors.primaryLight};
            color: ${colors.primary};
            font-weight: 600;
            text-align: left;
            padding: 0.75rem 1rem;
            border: 1px solid #E5E7EB;
          }

          .policy-content table td {
            padding: 0.75rem 1rem;
            border: 1px solid #E5E7EB;
          }

          .policy-content table tr:nth-child(even) {
            background-color: #F9FAFB;
          }

          .policy-content .text-sm {
            font-size: 0.875rem;
          }

          .policy-content .text-gray-500 {
            color: #6B7280;
          }

          .policy-content .mt-2 {
            margin-top: 0.5rem;
          }

          .policy-content .mt-4 {
            margin-top: 1rem;
          }

          .policy-content .mt-6 {
            margin-top: 1.5rem;
          }

          .policy-content .mt-8 {
            margin-top: 2rem;
          }

          .policy-content .pl-6 {
            padding-left: 1.5rem;
          }

          .policy-content .font-semibold {
            font-weight: 600;
          }

          .policy-content .font-medium {
            font-weight: 500;
          }
        `}</style>
      </div>
    </main>
  );
}
