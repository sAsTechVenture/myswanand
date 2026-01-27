'use client';

import { usePathname } from 'next/navigation';
import { getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import PolicyLayout from "@/components/privacy/PolicyLayout";

export default function PrivacyPolicy() {
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

  return (
    <PolicyLayout title="common.privacyPolicy">

      <p className="text-sm text-gray-500">
        {t('common.swanandPathology')} <br />
      </p>

      <p>
        At <strong>Swanand Pathology</strong> (“Swanand”, “we”, “our”, “us”),
        we are committed to protecting your privacy and ensuring the
        confidentiality of your personal and health information. This Privacy
        Policy explains how we collect, use, store, share, and protect your data
        when you use our website, mobile application, and related services
        (collectively, the “Platform”).
      </p>

      <p>
        {t('common.privacyIntro2')}
      </p>

      {/* 1 */}
      <h2 className="font-semibold text-lg mt-8">
        1. Scope of This Privacy Policy
      </h2>
      <p>This Privacy Policy applies to:</p>
      <ul className="list-disc pl-6">
        <li>Users who browse our Platform</li>
        <li>Users who book lab tests or health packages</li>
        <li>Users who book doctor or lab appointments</li>
        <li>Users who upload prescriptions or medical records</li>
        <li>Users who access test reports and health dashboards</li>
      </ul>

      {/* 2 */}
      <h2 className="font-semibold text-lg mt-8">
        2. Information We Collect
      </h2>
      <p>
        We collect information that is necessary to provide safe, accurate, and
        reliable healthcare services.
      </p>

      <h3 className="font-semibold mt-4">
        2.1 Personal Information
      </h3>
      <ul className="list-disc pl-6">
        <li>Full name</li>
        <li>Date of birth</li>
        <li>Gender</li>
        <li>Mobile number</li>
        <li>Email address</li>
        <li>Residential address</li>
      </ul>

      <h3 className="font-semibold mt-6">
        2.2 Health & Medical Information (Sensitive Personal Data)
      </h3>
      <ul className="list-disc pl-6">
        <li>Lab test bookings and reports</li>
        <li>Health package details</li>
        <li>Medical history provided by the user</li>
        <li>Prescriptions uploaded</li>
        <li>Doctor consultation records</li>
        <li>Sample collection details</li>
      </ul>

      <p className="mt-2">
        ⚠️ Health data is treated as sensitive personal data and processed with
        enhanced security and consent mechanisms.
      </p>

      <h3 className="font-semibold mt-6">
        2.3 Payment Information
      </h3>
      <ul className="list-disc pl-6">
        <li>Payment method used (UPI, card, net banking, wallet)</li>
        <li>Transaction IDs and billing details</li>
      </ul>
      <p className="mt-2">
        We do not store complete card or bank details. Payments are processed via
        secure third-party payment gateways.
      </p>

      <h3 className="font-semibold mt-6">
        2.4 Device & Technical Information
      </h3>
      <ul className="list-disc pl-6">
        <li>IP address</li>
        <li>Device type and operating system</li>
        <li>App version</li>
        <li>Log files and crash reports</li>
      </ul>

      <h3 className="font-semibold mt-6">
        2.5 Location Information
      </h3>
      <ul className="list-disc pl-6">
        <li>Location details for home sample collection or appointments</li>
        <li>Approximate location derived from IP address</li>
      </ul>

      <h3 className="font-semibold mt-6">
        2.6 Cookies & Analytics
      </h3>
      <p>
        We use cookies and similar technologies to maintain user sessions,
        improve platform performance, and understand usage patterns. You may
        manage cookies through your browser or app settings.
      </p>

      {/* 3 */}
      <h2 className="font-semibold text-lg mt-8">
        3. How We Use Your Information
      </h2>
      <ul className="list-disc pl-6">
        <li>Booking and managing lab tests and health packages</li>
        <li>Collecting samples and generating diagnostic reports</li>
        <li>Sharing reports with doctors or labs at your request</li>
        <li>Managing appointments and reminders</li>
        <li>Processing payments and refunds</li>
        <li>Providing customer support</li>
        <li>Improving platform functionality and security</li>
        <li>Complying with legal and regulatory obligations</li>
      </ul>

      <p className="mt-2">
        We do not use your health data for advertising without explicit consent.
      </p>

      {/* 4 */}
      <h2 className="font-semibold text-lg mt-8">
        4. Legal Basis for Processing
      </h2>
      <ul className="list-disc pl-6">
        <li>User consent (especially for health data)</li>
        <li>Contractual necessity to deliver services</li>
        <li>Legal obligations under applicable Indian laws</li>
        <li>Legitimate interests such as fraud prevention and security</li>
      </ul>

      {/* 5 */}
      <h2 className="font-semibold text-lg mt-8">
        5. Sharing of Information
      </h2>
      <p>We do not sell your personal data.</p>

      <h3 className="font-semibold mt-4">
        5.1 Healthcare Partners
      </h3>
      <ul className="list-disc pl-6">
        <li>Partner laboratories</li>
        <li>Doctors and healthcare professionals</li>
      </ul>

      <h3 className="font-semibold mt-6">
        5.2 Service Providers
      </h3>
      <ul className="list-disc pl-6">
        <li>Payment gateways</li>
        <li>Cloud hosting providers</li>
        <li>SMS/email notification services</li>
        <li>Analytics providers</li>
      </ul>

      <h3 className="font-semibold mt-6">
        5.3 Legal & Regulatory Authorities
      </h3>
      <p>
        When required by law, court orders, or government authorities.
      </p>

      {/* 6 */}
      <h2 className="font-semibold text-lg mt-8">
        6. Data Retention Policy
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border mt-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Data Type</th>
              <th className="border px-4 py-2 text-left">Retention Period</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Medical & diagnostic records</td>
              <td className="border px-4 py-2">Up to 7 years or as required by law</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Account & profile data</td>
              <td className="border px-4 py-2">Until account deletion or inactivity</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Payment records</td>
              <td className="border px-4 py-2">As per tax and legal requirements</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Logs & analytics</td>
              <td className="border px-4 py-2">90–180 days</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 7 */}
      <h2 className="font-semibold text-lg mt-8">
        7. User Rights
      </h2>
      <ul className="list-disc pl-6">
        <li>Access your personal data</li>
        <li>Correct inaccurate or incomplete information</li>
        <li>Download reports and records</li>
        <li>Request deletion of your account or data</li>
        <li>Withdraw consent (where applicable)</li>
        <li>Opt out of non-essential communications</li>
      </ul>

      {/* 8 */}
      <h2 className="font-semibold text-lg mt-8">
        8. Children’s Privacy
      </h2>
      <p>
        Our Platform is intended for users 18 years and above. We do not
        knowingly collect data from minors. Any such data will be deleted upon
        verification.
      </p>

      {/* 9 */}
      <h2 className="font-semibold text-lg mt-8">
        9. Data Security Measures
      </h2>
      <ul className="list-disc pl-6">
        <li>HTTPS / SSL encryption</li>
        <li>Secure cloud infrastructure</li>
        <li>Access control and authentication</li>
        <li>Regular security audits</li>
        <li>Limited employee access</li>
      </ul>

      {/* 10 */}
      <h2 className="font-semibold text-lg mt-8">
        10. Data Breach Notification
      </h2>
      <p>
        In the event of a data breach, affected users will be notified and all
        legal obligations will be followed.
      </p>

      {/* 11 */}
      <h2 className="font-semibold text-lg mt-8">
        11. Third-Party Links
      </h2>
      <p>
        We are not responsible for the privacy practices of third-party websites
        linked on our Platform.
      </p>

      {/* 12 */}
      <h2 className="font-semibold text-lg mt-8">
        12. Changes to This Privacy Policy
      </h2>
      <p>
        We may update this policy periodically. Continued use of the Platform
        constitutes acceptance of the revised policy.
      </p>

      {/* 13 */}
      <h2 className="font-semibold text-lg mt-8">
        13. Contact & Grievance Redressal
      </h2>
      <p>
        <strong>Grievance Officer / Data Protection Contact</strong><br />
        Swanand Pathology<br />
        📧 Email: privacy@swanandpathology.com<br />
        📞 Phone: +91-XXXXXXXXXX<br />
        📍 Address: Unit No. 1, 101/102,
Parth Regency, Shivaji Path,
Opp. Nehru Maidan Main Gate,
Dombivli (E), Thane - 421201.
      </p>

      {/* 14 */}
      <h2 className="font-semibold text-lg mt-8">
        14. Consent Statement
      </h2>
      <p>
        By using the Swanand Pathology Platform, you consent to the collection
        and processing of your personal and health data and acknowledge that you
        have read and understood this Privacy Policy.
      </p>

    </PolicyLayout>
  );
}
