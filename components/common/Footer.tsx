'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentLocale, createLocalizedPath } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import {
  Phone,
  Mail,
  Facebook,
  Youtube,
  Twitter,
  Instagram,
} from 'lucide-react';
import { colors } from '@/config/theme';
import {
  getContactPhoneNumber,
  getContactPhoneNumberRaw,
} from '@/lib/constants';

export function Footer() {
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

  const socialLinks = [
    { name: 'Facebook', Icon: Facebook, href: '#' },
    { name: 'YouTube', Icon: Youtube, href: '#' },
    { name: 'Instagram', Icon: Instagram, href: '#' },
  ];

  const paymentMethods = [
    { name: 'MasterCard', image: '/mscard.png' },
    { name: 'PayPal', image: '/paypal.png' },
    { name: 'VISA', image: '/visa.png' },
  ];

  const privacyLinks = [
    {
      href: createLocalizedPath('/refund', locale),
      label: t('common.refundAndReturns'),
      id: 'refund-returns',
    },
    {
      href: createLocalizedPath('/refund', locale),
      label: t('common.policy'),
      id: 'policy',
    },
    {
      href: createLocalizedPath('/privacy', locale),
      label: t('common.privacyPolicy'),
      id: 'privacy',
    },
    {
      href: createLocalizedPath('/terms', locale),
      label: t('common.termsConditions'),
      id: 'terms',
    },
  ];

  const accountLinks = [
    {
      href: createLocalizedPath('/profile', locale),
      label: t('common.myAccount'),
    },
    {
      href: createLocalizedPath('/contact', locale),
      label: t('common.contact'),
    },
    {
      href: createLocalizedPath('/cart', locale),
      label: t('common.shoppingCart'),
    },
    { href: createLocalizedPath('/shop', locale), label: t('common.shop') },
  ];

  return (
    <footer className="w-full bg-white">
      {/* Top Section */}
      <div className="border-b border-gray-300">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Call Us */}
            <div className="text-center md:text-left">
              <h3 className="text-sm font-semibold mb-2 text-gray-800">
                {t('common.callUs247')}
              </h3>
              <a
                href={`tel:${getContactPhoneNumberRaw()}`}
                className="text-lg font-medium flex items-center justify-center md:justify-start gap-2"
                style={{ color: colors.yellow }}
              >
                <Phone className="w-4 h-4" />
                {getContactPhoneNumber()}
              </a>
            </div>

            {/* Email Us */}
            <div className="text-center md:text-left">
              <h3 className="text-sm font-semibold mb-2 text-gray-800">
                {t('common.emailUs')}
              </h3>
              <a
                href="mailto:hello@myswanand.com"
                className="text-base flex items-center justify-center md:justify-start gap-2 text-gray-700 hover:opacity-80"
              >
                <Mail className="w-4 h-4" />
                hello@myswanand.com
              </a>
            </div>

            {/* Follow Us */}
            <div className="text-center md:text-left">
              <h3 className="text-sm font-semibold mb-2 text-gray-800">
                {t('common.followUs')}
              </h3>
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                {socialLinks.map((social) => {
                  const Icon = social.Icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 shrink-0"
                      style={{ backgroundColor: colors.yellow }}
                      aria-label={social.name}
                    >
                      <Icon className="w-4 h-4 text-gray-800" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              {paymentMethods.map((method) => (
                <div
                  key={method.name}
                  className="h-6 flex items-center justify-center px-1.5 bg-white rounded overflow-hidden"
                  style={{ minWidth: '40px' }}
                >
                  <Image
                    src={method.image}
                    alt={method.name}
                    width={40}
                    height={24}
                    className="object-contain"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      maxHeight: '24px',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-b border-gray-300">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            {/* Left Column - Logo and Lab Location */}
            <div className="flex flex-col lg:flex-row lg:w-1/2 gap-6 lg:gap-8">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="swanand Pathology Laboratory"
                  width={120}
                  height={100}
                  className="object-contain"
                  style={{ width: 'auto', height: 'auto', maxWidth: '350px' }}
                  priority
                />
              </div>
              {/* Address and Time */}
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-3 text-gray-800 uppercase tracking-wide">
                  {t('common.labLocation')}
                </h3>
                <address className="text-sm text-gray-600 not-italic leading-relaxed mb-4">
                  Unit No. 1, 101/102,
                  <br />
                  Parth Regency, Shivaji Path,
                  <br />
                  Opp. Nehru Maidan Main Gate,
                  <br />
                  Dombivli (E), Thane - 421201.
                </address>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    <strong>Monday - Saturday:</strong> 7:00 am - 10:00pm
                  </p>
                  <p>
                    <strong>Sunday:</strong> 7:00 am - 5:00pm
                  </p>
                </div>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden lg:block w-px bg-gray-300"></div>

            {/* Right Column - Privacy Policy and My Account */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 lg:w-1/2">
              {/* Privacy Policy Section */}
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-3 text-gray-800">
                  {t('common.privacyPolicy')}
                </h3>
                <nav className="flex flex-col gap-2">
                  {privacyLinks.map((link) => (
                    <Link
                      key={link.id}
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* My Account Section */}
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-3 text-gray-800 uppercase tracking-wide">
                  {t('common.myAccount')}
                </h3>
                <nav className="flex flex-col gap-2">
                  {accountLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="container mx-auto px-4 py-4">
        <p className="text-center text-sm text-gray-600">
          Copyright © 2025 All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
