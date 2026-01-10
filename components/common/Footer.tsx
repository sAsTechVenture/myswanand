import Image from 'next/image';
import Link from 'next/link';
import {
  Phone,
  Mail,
  Facebook,
  Youtube,
  Twitter,
  Instagram,
} from 'lucide-react';
import { colors } from '@/config/theme';

export function Footer() {
  const socialLinks = [
    { name: 'Facebook', Icon: Facebook, href: '#' },
    { name: 'YouTube', Icon: Youtube, href: '#' },
    { name: 'Twitter', Icon: Twitter, href: '#' },
    { name: 'Instagram', Icon: Instagram, href: '#' },
  ];

  const paymentMethods = [
    { name: 'MasterCard', image: '/mscard.png' },
    { name: 'PayPal', image: '/paypal.png' },
    { name: 'VISA', image: '/visa.png' },
  ];

  const privacyLinks = [
    { href: '/refund', label: 'Refund and Returns', id: 'refund-returns' },
    { href: '/refund', label: 'Policy', id: 'policy' },
    { href: '/privacy', label: 'Privacy Policy', id: 'privacy' },
    { href: '/terms', label: 'Terms and Conditions', id: 'terms' },
  ];

  const accountLinks = [
    { href: '/account', label: 'My Account' },
    { href: '/contact', label: 'Contact' },
    { href: '/cart', label: 'Shopping cart' },
    { href: '/shop', label: 'Shop' },
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
                CALL US 24/7
              </h3>
              <a
                href="tel:+919022800100"
                className="text-lg font-medium flex items-center justify-center md:justify-start gap-2"
                style={{ color: colors.yellow }}
              >
                <Phone className="w-4 h-4" />
                +91 9022800100
              </a>
            </div>

            {/* Email Us */}
            <div className="text-center md:text-left">
              <h3 className="text-sm font-semibold mb-2 text-gray-800">
                EMAIL US
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
                FOLLOW US
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Store Location */}
            <div className="flex flex-col justify-between">
              <div className="mb-4">
                <Image
                  src="/logo.png"
                  alt="Swanand Pathology Laboratory"
                  width={120}
                  height={100}
                  className="object-contain"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2 text-gray-800">
                  STORE LOCATION
                </h3>
                <address className="text-sm text-gray-600 not-italic leading-relaxed">
                  Unit No. 1, 101 / 102,
                  <br />
                  Parth Regency, Shivaji
                  <br />
                  Path,
                  <br />
                  Opp. Nehru Maidan Main
                  <br />
                  Gate,
                  <br />
                  Dombivli (E), Thane -
                  <br />
                  421201.
                </address>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    <strong>Monday - Saturday:</strong>
                    <br />
                    8:00 am - 4:00pm
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Sunday:</strong>
                    <br />
                    9:00 am - 5:00pm
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Column - Privacy Policy */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-800">
                Privacy Policy
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

            {/* Right Column - My Account */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-800">
                MY ACCOUNT
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

      {/* Copyright */}
      <div className="container mx-auto px-4 py-4">
        <p className="text-center text-sm text-gray-600">
          Copyright © 2025 All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
