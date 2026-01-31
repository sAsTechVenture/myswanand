'use client';

import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Send,
  SquareStack,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import PageBanner from '@/components/common/PageBanner';
import {
  getContactPhoneNumber,
  getContactPhoneNumberWhatsApp,
} from '@/lib/constants';
import { getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import { colors } from '@/config/theme';

export default function ContactPage() {
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const { dictionary } = useDictionary(locale);
  const WHATSAPP_NUMBER = getContactPhoneNumberWhatsApp();

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

  const handleWhatsApp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const text = `
${t('common.fullName')}: ${formData.get('firstName')} ${formData.get(
      'lastName'
    )}
${t('common.emailAddress')}: ${formData.get('email')}
${t('common.mobileNumber')}: ${formData.get('phone')}
${t('common.selectSubject')}: ${formData.get('subject')}
${t('common.tellUsMessage')}: ${formData.get('message')}
    `;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      text
    )}`;

    window.open(url, '_blank');
  };

  return (
    <main className="w-full overflow-x-hidden bg-white">
      {/* ================= HERO ================= */}
      <PageBanner title={t('common.contact')} />

      {/* ================= INTRO ================= */}
      <section className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-600 leading-relaxed">
        <p>{t('common.contactIntro1')}</p>
        <p className="mt-4">{t('common.contactIntro2')}</p>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-[1fr_1.25fr] gap-8">
          {/* ================= LEFT INFO CARDS ================= */}
          <div className="space-y-5">
            {/* Contact Info Card */}
            <div
              className="rounded-2xl p-6 shadow-md"
              style={{ backgroundColor: colors.primary }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <SquareStack className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg">
                  {t('common.contactInfo')}
                </h3>
              </div>

              <div className="space-y-4 text-white/90 text-sm">
                <p className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/70" />
                  <span className="leading-relaxed">
                    Unit No. 1, 101 / 102, Parth Regency, Shivaji Path, Opp.
                    NehruMaidan Main Gate, Dombivli (E), Thane – 421201.
                  </span>
                </p>
                <p className="flex items-start gap-3">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/70" />
                  <span className="leading-relaxed">
                    <a href="tel:+91-8419970311">+91-8419970311</a>
                  </span>
                </p>
              </div>
            </div>

            {/* Email Card */}
            <div
              className="rounded-2xl p-6 shadow-md"
              style={{ backgroundColor: colors.primary }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <SquareStack className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg">
                  {t('common.email')}
                </h3>
              </div>

              <p className="flex items-center gap-3 text-white/90 text-sm">
                <Mail className="w-4 h-4 flex-shrink-0 text-white/70" />
                <span>
                  <a href="mailto:hello@myswanand.com">hello@myswanand.com</a>
                </span>
              </p>
            </div>

            {/* Working Hours Card */}
            <div
              className="rounded-2xl p-6 shadow-md"
              style={{ backgroundColor: colors.primary }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <SquareStack className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg">
                  {t('common.workingHours')}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-6 text-sm text-white/90">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/70" />
                  <div>
                    <p className="font-medium text-white">
                      {t('common.mondaySaturday')}:
                    </p>
                    <p>7:00 am – 10:00pm</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-white">
                    {t('common.sunday')}:
                  </p>
                  <p>7:00 am – 5:00pm</p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT FORM ================= */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
            {/* Form Header */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: colors.primaryLight }}
              >
                <MessageSquare
                  className="w-5 h-5"
                  style={{ color: colors.primary }}
                />
              </div>
              <h3
                className="text-xl font-semibold"
                style={{ color: colors.primary }}
              >
                {t('common.sendUsMessage')}
              </h3>
            </div>

            <form onSubmit={handleWhatsApp} className="space-y-5">
              {/* First Name & Last Name */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: '#0D9488' }}
                  >
                    {t('common.firstName')}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="firstName"
                    placeholder="John"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: '#0D9488' }}
                  >
                    {t('common.lastName')}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="lastName"
                    placeholder="Doe"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#0D9488' }}
                >
                  {t('common.email')}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  required
                  type="email"
                  placeholder={t('common.enterYourEmail')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#0D9488' }}
                >
                  {t('common.mobileNumber')}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  placeholder="+91 98765 43210"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>

              {/* Subject */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#0D9488' }}
                >
                  {t('common.subject')} <span className="text-red-500">*</span>
                </label>
                <select
                  name="subject"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 focus:outline-none focus:border-purple-400 transition-colors bg-white"
                >
                  <option value="">{t('common.selectSubject')}</option>
                  <option value="test-booking">
                    {t('common.testBooking')}
                  </option>
                  <option value="report-query">
                    {t('common.reportQuery')}
                  </option>
                  <option value="general-inquiry">
                    {t('common.generalInquiry')}
                  </option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#0D9488' }}
                >
                  {t('common.message')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder={t('common.tellUsMessage')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 transition-colors resize-none"
                />
              </div>

              {/* Checkbox */}
              <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span>
                  {t('common.agreePrivacy')}{' '}
                  <span className="text-red-500">*</span>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl flex items-center justify-center gap-3 font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: colors.primary }}
              >
                <Send className="w-5 h-5" />
                {t('common.sendMessage')}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
