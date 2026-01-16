/**
 * Application constants
 * Centralized place for constants that may come from environment variables
 */

/**
 * Get contact phone number from environment variable
 * Format: +91 84249 92930
 * For tel: links, use getContactPhoneNumberRaw() which returns +918424992930
 */
export function getContactPhoneNumber(): string {
  return (
    process.env.NEXT_PUBLIC_CONTACT_PHONE_NUMBER || '+91 84249 92930'
  );
}

/**
 * Get contact phone number in raw format (no spaces) for tel: and WhatsApp links
 * Returns: +918424992930
 */
export function getContactPhoneNumberRaw(): string {
  const phone = getContactPhoneNumber();
  // Remove all spaces and ensure +91 prefix
  return phone.replace(/\s+/g, '');
}

/**
 * Get contact phone number for WhatsApp (without +)
 * Returns: 918424992930
 */
export function getContactPhoneNumberWhatsApp(): string {
  const raw = getContactPhoneNumberRaw();
  // Remove + if present
  return raw.replace(/^\+/, '');
}
