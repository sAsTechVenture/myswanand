'use client';

import { usePathname } from 'next/navigation';
import { getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import PolicyLayout from '@/components/privacy/PolicyLayout';

export default function RefundAndCancellationPolicy() {
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
    <PolicyLayout title="common.refundPolicy">
      <p className="text-sm text-gray-500 mb-6">
        {t('common.swanandPathology')}
      </p>

      <p>{t('common.refundIntro1')}</p>

      <p>{t('common.refundIntro2')}</p>

      <h2>1. Applicability of This Policy</h2>
      <p>This policy applies to:</p>
      <ul>
        <li>Diagnostic lab tests</li>
        <li>Health check-up packages</li>
        <li>Home sample collection services</li>
        <li>Doctor and lab appointments</li>
        <li>Payments made online through Swanand Pathology</li>
      </ul>

      <h2>2. Cancellation of Lab Tests &amp; Health Packages</h2>

      <h3>2.1 Cancellation Before Sample Collection</h3>
      <p>
        You may cancel your booking before sample collection through the app,
        website, or by contacting customer support.
      </p>

      <p className="font-medium mt-4">Refund:</p>
      <ul>
        <li>100% refund of the amount paid</li>
        <li>
          Payment gateway or convenience charges (if any) may be non-refundable
        </li>
      </ul>

      <h3>2.2 Cancellation After Sample Collection</h3>
      <p>Once a sample has been collected:</p>
      <ul>
        <li>The test process begins immediately</li>
        <li>
          Lab resources, consumables, and professional services are utilized
        </li>
      </ul>

      <p className="mt-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
        <strong>Important:</strong> Cancellations are not permitted after sample collection and no refunds will be
        issued. This is standard practice across diagnostic and pathology
        platforms.
      </p>

      <h2>3. Refunds for Tests Not Conducted</h2>
      <p>You may be eligible for a full or partial refund if:</p>
      <ul>
        <li>Sample could not be processed due to technical reasons</li>
        <li>Sample was damaged, contaminated, or insufficient</li>
        <li>Home sample collection was missed by our team</li>
        <li>
          Service was cancelled by Swanand Pathology for operational reasons
        </li>
      </ul>

      <p className="mt-2">
        In such cases, we may offer a full refund or a free re-collection of the
        sample.
      </p>

      <h2>4. Incorrect or Failed Service</h2>
      <p>Refunds may be considered if:</p>
      <ul>
        <li>An incorrect test was conducted due to our error</li>
        <li>Duplicate payment was made</li>
        <li>
          Test could not be completed due to internal system or lab issues
        </li>
      </ul>

      <p className="mt-2">
        Each request will be reviewed on a case-by-case basis.
      </p>

      <h2>5. No Refund Scenarios</h2>
      <p>Refunds will not be provided in the following cases:</p>
      <ul>
        <li>Cancellation requested after sample collection</li>
        <li>Change of mind by the user</li>
        <li>Incorrect test selection by the user</li>
        <li>User unavailable during scheduled collection</li>
        <li>Correct reports generated and delivered</li>
        <li>Delay caused due to incorrect patient details</li>
      </ul>

      <h2>6. Doctor &amp; Lab Appointment Refunds</h2>
      <p>
        Appointments booked through Swanand Pathology can be cancelled only
        within the time window specified during booking and are subject to the
        doctor&apos;s or lab&apos;s individual cancellation policy.
      </p>

      <p className="mt-2">
        If cancellation is allowed, refunds will be processed after deducting
        applicable platform or convenience charges. Missed or late-cancelled
        appointments are non-refundable.
      </p>

      <h2>7. Partial Refunds</h2>
      <p>Partial refunds may apply when:</p>
      <ul>
        <li>Only some tests from a package are completed</li>
        <li>Promotional discounts or bundled offers were applied</li>
        <li>Services are partially availed</li>
      </ul>

      <p className="mt-2">
        Refunds will be calculated proportionately at Swanand Pathology&apos;s
        discretion.
      </p>

      <h2>8. Refund Processing Timeline</h2>

      <div className="mt-4 p-6 bg-green-50 rounded-xl border border-green-200">
        <p className="font-semibold text-gray-900 mb-3">Refund Method</p>
        <p className="text-gray-700 mb-4">
          Refunds will be credited to the original payment method used at the time
          of booking (UPI, debit/credit card, wallet, or net banking).
        </p>

        <p className="font-semibold text-gray-900 mb-3">Timeline</p>
        <ul>
          <li>Refund initiation: within 3–5 working days after approval</li>
          <li>
            Credit completion: within 5–10 working days, depending on the bank or
            payment provider
          </li>
        </ul>
      </div>

      <h2>9. How to Request a Refund</h2>
      <p>To request a refund, please contact us with:</p>
      <ul>
        <li>Order ID</li>
        <li>Registered mobile number or email</li>
        <li>Reason for cancellation or refund request</li>
      </ul>

      <div className="mt-4 p-4 bg-purple-50 rounded-lg">
        <p className="text-gray-700">
          📧 Email:{' '}
          <strong>
            <a href="mailto:hello@myswanand.com">hello@myswanand.com</a>
          </strong>
          <br />
          📞 Phone:{' '}
          <strong>
            <a href="tel:+91-8419970311">+91-8419970311</a>
          </strong>
        </p>
      </div>

      <h2>10. Policy Modifications</h2>
      <p>
        Swanand Pathology reserves the right to modify this policy at any time.
        Any changes will be updated on our website or application with a revised
        &quot;Last Updated&quot; date.
      </p>

      <h2>11. Contact &amp; Grievance Redressal</h2>
      <p>For refund-related concerns or grievances:</p>

      <div className="mt-4 p-6 bg-gray-50 rounded-xl">
        <p className="font-semibold text-gray-900 mb-3">Customer Support / Grievance Officer</p>
        <p className="text-gray-700">
          <strong>Swanand Pathology</strong>
          <br /><br />
          📧 Email: <a href="mailto:hello@myswanand.com">hello@myswanand.com</a>
          <br />
          📞 Phone: <a href="tel:+91-8419970311">+91-8419970311</a>
          <br />
          📍 Address: Unit No. 1, 101/102, Parth Regency, Shivaji Path, Opp. Nehru
          Maidan Main Gate, Dombivli (E), Thane - 421201.
        </p>
      </div>
    </PolicyLayout>
  );
}
