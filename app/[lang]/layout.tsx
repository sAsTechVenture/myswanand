import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Toaster } from '@/components/ui/sonner';
import { LocaleScript } from '@/components/common/LocaleScript';
import { locales, defaultLocale } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';

export async function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export default async function LangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const locale = (locales.includes(lang as Locale) ? lang : defaultLocale) as Locale;

  return (
    <>
      <LocaleScript />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <Toaster />
    </>
  );
}