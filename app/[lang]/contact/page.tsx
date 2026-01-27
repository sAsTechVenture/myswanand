"use client";

import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Send,
} from "lucide-react";
import { usePathname } from "next/navigation";
import PageBanner from "@/components/common/PageBanner";
import {
  getContactPhoneNumber,
  getContactPhoneNumberRaw,
  getContactPhoneNumberWhatsApp,
} from "@/lib/constants";
import { getCurrentLocale } from "@/lib/utils/i18n";
import { useDictionary } from "@/lib/hooks/useDictionary";

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
${t('common.fullName')}: ${formData.get("firstName")} ${formData.get("lastName")}
${t('common.emailAddress')}: ${formData.get("email")}
${t('common.mobileNumber')}: ${formData.get("phone")}
${t('common.selectSubject')}: ${formData.get("subject")}
${t('common.tellUsMessage')}: ${formData.get("message")}
    `;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      text
    )}`;

    window.open(url, "_blank");
  };

  return (
    <main className="w-full overflow-x-hidden">
      {/* ================= HERO ================= */}
      <PageBanner title={t('common.contact')} />

      {/* ================= INTRO ================= */}
      <section className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-600 leading-relaxed">
        <p>
          {t('common.contactIntro1')}
        </p>
        <p className="mt-4">
          {t('common.contactIntro2')}
        </p>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
      <div className="grid lg:grid-cols-[1fr_1.15fr] gap-10">

        {/* ================= LEFT INFO ================= */}
        <div className="space-y-6">

          {/* Contact Info */}
          <div className="bg-[#5E2D84] text-white rounded-2xl p-6 shadow-md">
            <h3 className="flex items-center gap-2 font-semibold mb-4">
              <MapPin size={18} />
              {t('common.contactInfo')}
            </h3>

            <p className="text-sm leading-relaxed">
              Unit No. 1, 101 / 102, Parth Regency, Shivaji Path, Opp. Nehru
              Maidan Main Gate, Dombivli (E), Thane – 421201.
            </p>

            <p className="mt-4 text-sm flex items-center gap-2">
              <Phone size={16} />
              {getContactPhoneNumber()} / {t('common.tollFree')}: 1800-890-7270
            </p>
          </div>

          {/* Email */}
          <div className="bg-[#5E2D84] text-white rounded-2xl p-6 shadow-md">
            <h3 className="flex items-center gap-2 font-semibold mb-4">
              <Mail size={18} />
              {t('common.email')}
            </h3>
            <p className="text-sm">hello@myswanand.com</p>
          </div>

          {/* Working Hours */}
          <div className="bg-[#5E2D84] text-white rounded-2xl p-6 shadow-md">
            <h3 className="flex items-center gap-2 font-semibold mb-4">
              <Clock size={18} />
              {t('common.workingHours')}
            </h3>

            <div className="text-sm grid grid-cols-2 gap-6">
              <div>
                <p className="font-medium">{t('common.mondaySaturday')}</p>
                <p>8:00 am – 4:00 pm</p>
              </div>
              <div>
                <p className="font-medium">{t('common.sunday')}</p>
                <p>9:00 am – 5:00 pm</p>
              </div>
            </div>
          </div>

        </div>

        {/* ================= RIGHT FORM ================= */}
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-10">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-[#5E2D84] mb-8">
            <MessageSquare size={20} />
            {t('common.sendUsMessage')}
          </h3>

          <form onSubmit={handleWhatsApp} className="space-y-6 text-sm">

            {/* Name */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <input
                  name="firstName"
                  placeholder={t('common.firstName')}
                  required
                  className="input"
                />
              </div>

              <div>
                <input
                  name="lastName"
                  placeholder={t('common.lastName')}
                  required
                  className="input"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <input
                name="email"
                required
                type="email"
                placeholder={t('common.enterYourEmail')}
                className="input"
              />
            </div>

            {/* Phone */}
            <div>
              <input
                name="phone"
                placeholder={t('common.enterMobileNumber')}
                required
                className="input"
              />
            </div>

            {/* Subject */}
            <div>
              <select 
              name="subject"
              required
              className="input text-gray-600"
              >
                <option>{t('common.selectSubject')}</option>
                <option>{t('common.testBooking')}</option>
                <option>{t('common.reportQuery')}</option>
                <option>{t('common.generalInquiry')}</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <textarea
                name="message"
                required 
                rows={4}
                placeholder={t('common.tellUsMessage')}
                className="input border-[#F4C430]"
              />
            </div>

            {/* Checkbox */}
            <label className="flex items-start gap-2 text-xs text-gray-600">
              <input type="checkbox" className="mt-1" />
              {t('common.agreePrivacy')}
            </label>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-[#5E2D84] hover:bg-[#4B236B] text-white py-3 rounded-xl flex items-center justify-center gap-2 font-medium"
            >
              <Send size={16} />
              {t('common.sendMessage')}
            </button>

          </form>
        </div>
      </div>
    </section>
    </main>
  );
}

/* ================= REUSABLE INFO CARD ================= */
function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#5E2D84] text-white rounded-2xl p-6 shadow-md text-sm">
      <h3 className="flex items-center gap-2 font-semibold mb-4">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}
