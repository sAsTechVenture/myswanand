'use client';

import { usePathname } from 'next/navigation';
import { getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import PolicyLayout from '@/components/privacy/PolicyLayout';

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
      <p className="text-sm text-gray-500 mb-6">
        {t('common.swanandPathology')}
      </p>

      <p>
        Welcome to <strong>Swanand Pathology</strong> (&quot;Swanand&quot;,
        &quot;we&quot;, &quot;our&quot;, &quot;us&quot;). These Terms &amp;
        Conditions (&quot;Terms&quot;) govern your access to and use of our
        website, mobile application, and related services (collectively, the
        &quot;Platform&quot;).
      </p>

      <p>{t('common.termsIntro2')}</p>

      <h2>1. Eligibility to Use the Platform</h2>
      <ul>
        <li>You must be at least 18 years old to use the Platform.</li>
        <li>
          You confirm that all information provided is accurate and complete.
        </li>
        <li>
          If you use the Platform on behalf of another person, you confirm that
          you have their consent.
        </li>
      </ul>

      <h2>2. Nature of Services</h2>
      <p>Swanand Pathology provides:</p>
      <ul>
        <li>Diagnostic laboratory test booking</li>
        <li>Health check-up packages</li>
        <li>Home sample collection services</li>
        <li>Doctor and lab appointment booking</li>
        <li>Digital access to diagnostic reports and health records</li>
      </ul>

      <p className="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
        <strong>⚠️ Important:</strong> Swanand Pathology does not provide
        medical diagnosis or treatment advice. All medical interpretation should
        be done by a qualified healthcare professional.
      </p>

      <h2>3. User Account &amp; Responsibilities</h2>
      <p>
        To access certain features, you may be required to create an account.
      </p>
      <ul>
        <li>Maintain confidentiality of login credentials</li>
        <li>Provide accurate personal and patient information</li>
        <li>Update information when required</li>
      </ul>
      <p className="mt-2">
        You are responsible for all activities carried out through your account.
      </p>

      <h2>4. Booking &amp; Service Fulfilment</h2>
      <ul>
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

      <h2>5. Payments</h2>
      <ul>
        <li>
          Payments must be made in full at the time of booking unless stated
          otherwise.
        </li>
        <li>
          Prices are inclusive or exclusive of taxes as displayed on the
          Platform.
        </li>
        <li>Payments are processed via secure third-party gateways.</li>
        <li>
          Swanand Pathology does not store complete card or banking details.
        </li>
      </ul>

      <h2>6. Cancellation &amp; Refunds</h2>
      <p>
        Cancellations and refunds are governed by our Return, Cancellation &amp;
        Refund Policy, which forms an integral part of these Terms.
      </p>
      <p className="mt-2">
        Once a sample is collected, cancellations are not permitted and refunds
        are not applicable.
      </p>

      <h2>7. User Conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Misuse or interfere with the Platform</li>
        <li>Upload false, misleading, or fraudulent information</li>
        <li>Attempt unauthorized access to systems or data</li>
        <li>Use the Platform for unlawful or abusive activities</li>
      </ul>
      <p className="mt-2">
        Violations may result in suspension or termination of your account.
      </p>

      <h2>8. Medical Data &amp; Reports</h2>
      <ul>
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

      <h2>9. Third-Party Services</h2>
      <p>
        The Platform may include third-party labs, doctors, and payment service
        providers. Swanand Pathology is not responsible for services provided by
        third parties beyond platform facilitation.
      </p>

      <h2>10. Intellectual Property</h2>
      <p>
        All content on the Platform, including logos, text, design, and
        software, is the intellectual property of Swanand Pathology or its
        licensors.
      </p>
      <p className="mt-2">
        You may not copy, modify, distribute, or reproduce content without prior
        written permission.
      </p>

      <h2>11. Privacy &amp; Data Protection</h2>
      <p>
        Your use of the Platform is governed by our Privacy Policy. By using the
        Platform, you consent to the collection, processing, storage, and
        sharing of data as described therein.
      </p>

      <h2>12. Limitation of Liability</h2>
      <ul>
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

      <h2>13. Indemnity</h2>
      <p>
        You agree to indemnify and hold harmless Swanand Pathology from claims,
        losses, damages, or liabilities arising from misuse of the Platform,
        incorrect information provided by you, or violation of these Terms.
      </p>

      <h2>14. Suspension &amp; Termination</h2>
      <p>
        We reserve the right to suspend or terminate accounts without prior
        notice if misuse or violation of these Terms is detected.
      </p>

      <h2>15. Force Majeure</h2>
      <p>
        Swanand Pathology shall not be liable for failure or delay in services
        due to events beyond reasonable control, including natural disasters,
        government restrictions, technical failures, or pandemics.
      </p>

      <h2>16. Governing Law &amp; Jurisdiction</h2>
      <p>
        These Terms shall be governed by the laws of India. Courts located in
        Thane, Maharashtra shall have exclusive jurisdiction.
      </p>

      <h2>17. Changes to Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the
        Platform constitutes acceptance of the updated Terms.
      </p>

      <h2>18. Contact &amp; Grievance Redressal</h2>
      <div className="mt-4 p-6 bg-gray-50 rounded-xl">
        <p className="font-semibold text-gray-900 mb-3">
          Customer Support / Grievance Officer
        </p>
        <p className="text-gray-700">
          <strong>Swanand Pathology</strong>
          <br />
          <br />
          📧 Email: <a href="mailto:hello@myswanand.com">hello@myswanand.com</a>
          <br />
          📞 Phone: <a href="tel:+91-8419970311">+91-8419970311</a>
          <br />
          📍 Address: Unit No. 1, 101/102, Parth Regency, Shivaji Path, Opp.
          Nehru Maidan Main Gate, Dombivli (E), Thane - 421201.
        </p>
      </div>

      <h2>19. Acceptance of Terms</h2>
      <p>
        By using the Swanand Pathology Platform, you confirm that you have read,
        understood, and agree to be legally bound by these Terms.
      </p>
    </PolicyLayout>
  );
}
