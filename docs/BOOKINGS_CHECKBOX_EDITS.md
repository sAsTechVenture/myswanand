# Add checkboxes to patient bookings API (route.ts)

The **frontend** (CheckoutForm + cart page) is already updated with checkboxes and payload. Apply the edits below to your **server** `route.ts` for `POST /api/patient/bookings` (or equivalent).

---

## 1. Add checkbox fields to the POST body type

In the `parseJsonBody<{ ... }>(body)` type, add (e.g. after `healthDisorderDetails`):

```ts
agreeToTerms?: boolean;
sendSMSReminder?: boolean;
sendEmailReminder?: boolean;
```

---

## 2. Validate “agree to terms” before creating the booking

After the block that returns “Please specify other health disorder when ‘Other’ is selected.”, add:

```ts
// Require terms agreement (checkbox must be checked)
if (data.agreeToTerms !== true) {
  return errorResponse(
    'You must agree to the terms and conditions to place a booking.',
    400,
    undefined,
    origin
  );
}
```

---

## 3. (Optional) Persist checkbox values on the booking

If your Prisma `Booking` model has columns for these, add them to the `tx.booking.create` `data` object:

```ts
agreeToTerms: data.agreeToTerms ?? false,
sendSMSReminder: data.sendSMSReminder ?? false,
sendEmailReminder: data.sendEmailReminder ?? false,
```

If you don’t have these columns, skip this step; the API will still accept and validate the checkboxes.
