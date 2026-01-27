'use client';

import { usePathname } from 'next/navigation';
import { getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import PolicyLayout from "@/components/privacy/PolicyLayout";

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

      <p className="text-sm text-gray-500">
        {t('common.swanandPathology')} <br />
      </p>

      <p>
        {t('common.refundIntro1')}
      </p>

      <p>
        {t('common.refundIntro2')}
      </p>

      {/* 1 */}
      <h2 className="font-semibold text-lg mt-8">
        1. Applicability of This Policy
      </h2>
      <p>This policy applies to:</p>
      <ul className="list-disc pl-6">
        <li>Diagnostic lab tests</li>
        <li>Health check-up packages</li>
        <li>Home sample collection services</li>
        <li>Doctor and lab appointments</li>
        <li>Payments made online through Swanand Pathology</li>
      </ul>

      {/* 2 */}
      <h2 className="font-semibold text-lg mt-8">
        2. Cancellation of Lab Tests & Health Packages
      </h2>

      <h3 className="font-semibold mt-4">
        2.1 Cancellation Before Sample Collection
      </h3>
      <p>
        You may cancel your booking before sample collection through the app,
        website, or by contacting customer support.
      </p>

      <p className="font-medium mt-2">Refund:</p>
      <ul className="list-disc pl-6">
        <li>100% refund of the amount paid</li>
        <li>
          Payment gateway or convenience charges (if any) may be non-refundable
        </li>
      </ul>

      <h3 className="font-semibold mt-6">
        2.2 Cancellation After Sample Collection
      </h3>
      <p>Once a sample has been collected:</p>
      <ul className="list-disc pl-6">
        <li>The test process begins immediately</li>
        <li>Lab resources, consumables, and professional services are utilized</li>
      </ul>

      <p className="mt-2">
        Therefore, cancellations are not permitted and no refunds will be issued.
        This is standard practice across diagnostic and pathology platforms.
      </p>

      {/* 3 */}
      <h2 className="font-semibold text-lg mt-8">
        3. Refunds for Tests Not Conducted
      </h2>
      <p>You may be eligible for a full or partial refund if:</p>
      <ul className="list-disc pl-6">
        <li>Sample could not be processed due to technical reasons</li>
        <li>Sample was damaged, contaminated, or insufficient</li>
        <li>Home sample collection was missed by our team</li>
        <li>Service was cancelled by Swanand Pathology for operational reasons</li>
      </ul>

      <p className="mt-2">
        In such cases, we may offer a full refund or a free re-collection of the
        sample.
      </p>

      {/* 4 */}
      <h2 className="font-semibold text-lg mt-8">
        4. Incorrect or Failed Service
      </h2>
      <p>Refunds may be considered if:</p>
      <ul className="list-disc pl-6">
        <li>An incorrect test was conducted due to our error</li>
        <li>Duplicate payment was made</li>
        <li>Test could not be completed due to internal system or lab issues</li>
      </ul>

      <p className="mt-2">
        Each request will be reviewed on a case-by-case basis.
      </p>

      {/* 5 */}
      <h2 className="font-semibold text-lg mt-8">
        5. No Refund Scenarios
      </h2>
      <p>Refunds will not be provided in the following cases:</p>
      <ul className="list-disc pl-6">
        <li>Cancellation requested after sample collection</li>
        <li>Change of mind by the user</li>
        <li>Incorrect test selection by the user</li>
        <li>User unavailable during scheduled collection</li>
        <li>Correct reports generated and delivered</li>
        <li>Delay caused due to incorrect patient details</li>
      </ul>

      {/* 6 */}
      <h2 className="font-semibold text-lg mt-8">
        6. Doctor & Lab Appointment Refunds
      </h2>
      <p>
        Appointments booked through Swanand Pathology can be cancelled only within
        the time window specified during booking and are subject to the doctor’s
        or lab’s individual cancellation policy.
      </p>

      <p className="mt-2">
        If cancellation is allowed, refunds will be processed after deducting
        applicable platform or convenience charges. Missed or late-cancelled
        appointments are non-refundable.
      </p>

      {/* 7 */}
      <h2 className="font-semibold text-lg mt-8">
        7. Partial Refunds
      </h2>
      <p>Partial refunds may apply when:</p>
      <ul className="list-disc pl-6">
        <li>Only some tests from a package are completed</li>
        <li>Promotional discounts or bundled offers were applied</li>
        <li>Services are partially availed</li>
      </ul>

      <p className="mt-2">
        Refunds will be calculated proportionately at Swanand Pathology’s
        discretion.
      </p>

      {/* 8 */}
      <h2 className="font-semibold text-lg mt-8">
        8. Refund Processing Timeline
      </h2>

      <p className="font-medium mt-2">Refund Method</p>
      <p>
        Refunds will be credited to the original payment method used at the time
        of booking (UPI, debit/credit card, wallet, or net banking).
      </p>

      <p className="font-medium mt-4">Timeline</p>
      <ul className="list-disc pl-6">
        <li>Refund initiation: within 3–5 working days after approval</li>
        <li>
          Credit completion: within 5–10 working days, depending on the bank or
          payment provider
        </li>
      </ul>

      {/* 9 */}
      <h2 className="font-semibold text-lg mt-8">
        9. How to Request a Refund
      </h2>
      <p>To request a refund, please contact us with:</p>
      <ul className="list-disc pl-6">
        <li>Order ID</li>
        <li>Registered mobile number or email</li>
        <li>Reason for cancellation or refund request</li>
      </ul>

      <p className="mt-2">
        📧 Email: <strong>support@swanandpathology.com</strong>
        <br />
        📞 Phone: <strong>+91-XXXXXXXXXX</strong>
      </p>

      {/* 10 */}
      <h2 className="font-semibold text-lg mt-8">
        10. Policy Modifications
      </h2>
      <p>
        Swanand Pathology reserves the right to modify this policy at any time.
        Any changes will be updated on our website or application with a revised
        “Last Updated” date.
      </p>

      {/* 11 */}
      <h2 className="font-semibold text-lg mt-8">
        11. Contact & Grievance Redressal
      </h2>
      <p>
        For refund-related concerns or grievances:
      </p>

      <p className="mt-2">
        <strong>Customer Support / Grievance Officer</strong>
        <br />
        Swanand Pathology
        <br />
        📧 Email: support@swanandpathology.com
        <br />
        📞 Phone: +91-XXXXXXXXXX
        <br />
        📍 Address: Unit No. 1, 101/102,
Parth Regency, Shivaji Path,
Opp. Nehru Maidan Main Gate,
Dombivli (E), Thane - 421201.
      </p>

    </PolicyLayout>
  );
}
