'use client';

import { usePathname } from 'next/navigation';
import { getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import PolicyLayout from "@/components/privacy/PolicyLayout";

export default function TermsAndConditions() {
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
    <PolicyLayout title="common.termsConditions">

      <p className="text-sm text-gray-500">
        {t('common.swanandPathology')} <br />
      </p>

      <p>
        Welcome to <strong>Swanand Pathology</strong> (“Swanand”, “we”, “our”,
        “us”). These Terms & Conditions (“Terms”) govern your access to and use
        of our website, mobile application, and related services (collectively,
        the “Platform”).
      </p>

      <p>
        {t('common.termsIntro2')}
      </p>

      {/* 1 */}
      <h2 className="font-semibold text-lg mt-8">
        1. Eligibility to Use the Platform
      </h2>
      <ul className="list-disc pl-6">
        <li>You must be at least 18 years old to use the Platform.</li>
        <li>You confirm that all information provided is accurate and complete.</li>
        <li>
          If you use the Platform on behalf of another person, you confirm that
          you have their consent.
        </li>
      </ul>

      {/* 2 */}
      <h2 className="font-semibold text-lg mt-8">
        2. Nature of Services
      </h2>
      <p>Swanand Pathology provides:</p>
      <ul className="list-disc pl-6">
        <li>Diagnostic laboratory test booking</li>
        <li>Health check-up packages</li>
        <li>Home sample collection services</li>
        <li>Doctor and lab appointment booking</li>
        <li>Digital access to diagnostic reports and health records</li>
      </ul>

      <p className="mt-2">
        ⚠️ Swanand Pathology does not provide medical diagnosis or treatment
        advice. All medical interpretation should be done by a qualified
        healthcare professional.
      </p>

      {/* 3 */}
      <h2 className="font-semibold text-lg mt-8">
        3. User Account & Responsibilities
      </h2>
      <p>
        To access certain features, you may be required to create an account.
      </p>
      <ul className="list-disc pl-6">
        <li>Maintain confidentiality of login credentials</li>
        <li>Provide accurate personal and patient information</li>
        <li>Update information when required</li>
      </ul>
      <p className="mt-2">
        You are responsible for all activities carried out through your account.
      </p>

      {/* 4 */}
      <h2 className="font-semibold text-lg mt-8">
        4. Booking & Service Fulfilment
      </h2>
      <ul className="list-disc pl-6">
        <li>All bookings are subject to availability and confirmation.</li>
        <li>
          Sample collection time slots are indicative and may vary due to
          operational reasons.
        </li>
        <li>
          Test results are generated based on samples collected and laboratory
          analysis procedures.
        </li>
        <li>
          Report timelines are estimated and may change due to technical,
          medical, or operational factors.
        </li>
      </ul>

      {/* 5 */}
      <h2 className="font-semibold text-lg mt-8">
        5. Payments
      </h2>
      <ul className="list-disc pl-6">
        <li>Payments must be made in full at the time of booking unless stated otherwise.</li>
        <li>Prices are inclusive or exclusive of taxes as displayed on the Platform.</li>
        <li>Payments are processed via secure third-party gateways.</li>
        <li>Swanand Pathology does not store complete card or banking details.</li>
      </ul>

      {/* 6 */}
      <h2 className="font-semibold text-lg mt-8">
        6. Cancellation & Refunds
      </h2>
      <p>
        Cancellations and refunds are governed by our Return, Cancellation &
        Refund Policy, which forms an integral part of these Terms.
      </p>
      <p className="mt-2">
        Once a sample is collected, cancellations are not permitted and refunds
        are not applicable.
      </p>

      {/* 7 */}
      <h2 className="font-semibold text-lg mt-8">
        7. User Conduct
      </h2>
      <p>You agree not to:</p>
      <ul className="list-disc pl-6">
        <li>Misuse or interfere with the Platform</li>
        <li>Upload false, misleading, or fraudulent information</li>
        <li>Attempt unauthorized access to systems or data</li>
        <li>Use the Platform for unlawful or abusive activities</li>
      </ul>
      <p className="mt-2">
        Violations may result in suspension or termination of your account.
      </p>

      {/* 8 */}
      <h2 className="font-semibold text-lg mt-8">
        8. Medical Data & Reports
      </h2>
      <ul className="list-disc pl-6">
        <li>Reports are generated based on laboratory analysis.</li>
        <li>No guarantee of specific medical outcomes is provided.</li>
        <li>
          Reports are for informational purposes and should be reviewed by a
          qualified doctor.
        </li>
        <li>
          Users are responsible for ensuring correct patient details during
          booking.
        </li>
      </ul>

      {/* 9 */}
      <h2 className="font-semibold text-lg mt-8">
        9. Third-Party Services
      </h2>
      <p>
        The Platform may include third-party labs, doctors, and payment service
        providers. Swanand Pathology is not responsible for services provided by
        third parties beyond platform facilitation.
      </p>

      {/* 10 */}
      <h2 className="font-semibold text-lg mt-8">
        10. Intellectual Property
      </h2>
      <p>
        All content on the Platform, including logos, text, design, and
        software, is the intellectual property of Swanand Pathology or its
        licensors.
      </p>
      <p className="mt-2">
        You may not copy, modify, distribute, or reproduce content without prior
        written permission.
      </p>

      {/* 11 */}
      <h2 className="font-semibold text-lg mt-8">
        11. Privacy & Data Protection
      </h2>
      <p>
        Your use of the Platform is governed by our Privacy Policy. By using the
        Platform, you consent to the collection, processing, storage, and
        sharing of data as described therein.
      </p>

      {/* 12 */}
      <h2 className="font-semibold text-lg mt-8">
        12. Limitation of Liability
      </h2>
      <ul className="list-disc pl-6">
        <li>
          Swanand Pathology shall not be liable for indirect, incidental, or
          consequential damages.
        </li>
        <li>
          We are not liable for delays, report variations, or outcomes arising
          from medical interpretation.
        </li>
        <li>
          Liability, if any, shall not exceed the amount paid for the specific
          service.
        </li>
      </ul>

      {/* 13 */}
      <h2 className="font-semibold text-lg mt-8">
        13. Indemnity
      </h2>
      <p>
        You agree to indemnify and hold harmless Swanand Pathology from claims,
        losses, damages, or liabilities arising from misuse of the Platform,
        incorrect information provided by you, or violation of these Terms.
      </p>

      {/* 14 */}
      <h2 className="font-semibold text-lg mt-8">
        14. Suspension & Termination
      </h2>
      <p>
        We reserve the right to suspend or terminate accounts without prior
        notice if misuse or violation of these Terms is detected.
      </p>

      {/* 15 */}
      <h2 className="font-semibold text-lg mt-8">
        15. Force Majeure
      </h2>
      <p>
        Swanand Pathology shall not be liable for failure or delay in services
        due to events beyond reasonable control, including natural disasters,
        government restrictions, technical failures, or pandemics.
      </p>

      {/* 16 */}
      <h2 className="font-semibold text-lg mt-8">
        16. Governing Law & Jurisdiction
      </h2>
      <p>
        These Terms shall be governed by the laws of India. Courts located in
        [Your City/State] shall have exclusive jurisdiction.
      </p>

      {/* 17 */}
      <h2 className="font-semibold text-lg mt-8">
        17. Changes to Terms
      </h2>
      <p>
        We may update these Terms from time to time. Continued use of the
        Platform constitutes acceptance of the updated Terms.
      </p>

      {/* 18 */}
      <h2 className="font-semibold text-lg mt-8">
        18. Contact & Grievance Redressal
      </h2>
      <p>
        <strong>Customer Support / Grievance Officer</strong><br />
        Swanand Pathology<br />
        📧 Email: support@swanandpathology.com<br />
        📞 Phone: +91-XXXXXXXXXX<br />
        📍 Address: Unit No. 1, 101/102,
Parth Regency, Shivaji Path,
Opp. Nehru Maidan Main Gate,
Dombivli (E), Thane - 421201.
      </p>

      {/* 19 */}
      <h2 className="font-semibold text-lg mt-8">
        19. Acceptance of Terms
      </h2>
      <p>
        By using the Swanand Pathology Platform, you confirm that you have read,
        understood, and agree to be legally bound by these Terms.
      </p>

    </PolicyLayout>
  );
}
