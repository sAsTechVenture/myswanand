"use client";

import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Send,
} from "lucide-react";
import PageBanner from "@/components/common/PageBanner";
import {
  getContactPhoneNumber,
  getContactPhoneNumberRaw,
  getContactPhoneNumberWhatsApp,
} from "@/lib/constants";

export default function ContactPage() {
  const WHATSAPP_NUMBER = getContactPhoneNumberWhatsApp();

  const handleWhatsApp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const text = `
Name: ${formData.get("firstName")} ${formData.get("lastName")}
Email: ${formData.get("email")}
Phone: ${formData.get("phone")}
Subject: ${formData.get("subject")}
Message: ${formData.get("message")}
    `;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      text
    )}`;

    window.open(url, "_blank");
  };

  return (
    <main className="w-full overflow-x-hidden">
      {/* ================= HERO ================= */}
      <PageBanner title="Contact Us" />

      {/* ================= INTRO ================= */}
      <section className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-600 leading-relaxed">
        <p>
          We’re here to help you! Whether you have questions about our pathology
          services, booking a test, or need assistance with your report, our team
          is always ready to support you.
        </p>
        <p className="mt-4">
          At MY SWANAND, we believe in providing quick, reliable, and
          patient-friendly communication. Feel free to reach out to us — we’ll
          get back to you as soon as possible.
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
              Contact Info
            </h3>

            <p className="text-sm leading-relaxed">
              Unit No. 1, 101 / 102, Parth Regency, Shivaji Path, Opp. Nehru
              Maidan Main Gate, Dombivli (E), Thane – 421201.
            </p>

            <p className="mt-4 text-sm flex items-center gap-2">
              <Phone size={16} />
              {getContactPhoneNumber()} / Toll Free No.: 1800-890-7270
            </p>
          </div>

          {/* Email */}
          <div className="bg-[#5E2D84] text-white rounded-2xl p-6 shadow-md">
            <h3 className="flex items-center gap-2 font-semibold mb-4">
              <Mail size={18} />
              Email
            </h3>
            <p className="text-sm">hello@myswanand.com</p>
          </div>

          {/* Working Hours */}
          <div className="bg-[#5E2D84] text-white rounded-2xl p-6 shadow-md">
            <h3 className="flex items-center gap-2 font-semibold mb-4">
              <Clock size={18} />
              Working Hours
            </h3>

            <div className="text-sm grid grid-cols-2 gap-6">
              <div>
                <p className="font-medium">Monday – Saturday:</p>
                <p>8:00 am – 4:00 pm</p>
              </div>
              <div>
                <p className="font-medium">Sunday:</p>
                <p>9:00 am – 5:00 pm</p>
              </div>
            </div>
          </div>

        </div>

        {/* ================= RIGHT FORM ================= */}
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-10">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-[#5E2D84] mb-8">
            <MessageSquare size={20} />
            Send us a Message
          </h3>

          <form onSubmit={handleWhatsApp} className="space-y-6 text-sm">

            {/* Name */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <input
                  name="firstName"
                  placeholder="John"
                  required
                  className="input"
                />
              </div>

              <div>
                <input
                  name="lastName"
                  placeholder="Doe"
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
                placeholder="Enter Your Email"
                className="input"
              />
            </div>

            {/* Phone */}
            <div>
              <input
                name="phone"
                placeholder="+91 98765 43210"
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
                <option>Select Subject</option>
                <option>Test Booking</option>
                <option>Report Query</option>
                <option>General Inquiry</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <textarea
                name="message"
                required 
                rows={4}
                placeholder="Tell us about message..."
                className="input border-[#F4C430]"
              />
            </div>

            {/* Checkbox */}
            <label className="flex items-start gap-2 text-xs text-gray-600">
              <input type="checkbox" className="mt-1" />
              I agree to the privacy policy and consent to be contacted.
            </label>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-[#5E2D84] hover:bg-[#4B236B] text-white py-3 rounded-xl flex items-center justify-center gap-2 font-medium"
            >
              <Send size={16} />
              Send Message
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
