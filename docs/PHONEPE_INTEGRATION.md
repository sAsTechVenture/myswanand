# PhonePe Payment Gateway Integration Guide

This document provides a comprehensive guide for securely integrating PhonePe payment gateway into your Next.js application for production use.

## Table of Contents

1. [Overview](#overview)
2. [Security Best Practices](#security-best-practices)
3. [Integration Architecture](#integration-architecture)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Testing](#testing)
6. [Production Checklist](#production-checklist)

## Overview

PhonePe is a popular UPI-based payment gateway in India. For production use, you should integrate PhonePe's Payment Gateway API, which supports:

- UPI payments
- Credit/Debit cards
- Net Banking
- Wallets
- EMI options

## Security Best Practices

### 1. **Never Store Sensitive Data on Client-Side**

- Never store API keys, merchant IDs, or salt keys in client-side code
- All payment-related secrets must be stored in environment variables on the server
- Use Next.js API routes for all payment operations

### 2. **Use Server-Side Payment Processing**

- Payment initiation should happen on the server
- Payment verification must be done on the server
- Client should only receive payment URLs/redirects

### 3. **Implement Webhook Verification**

- Always verify webhook signatures from PhonePe
- Use HTTPS for all webhook endpoints
- Implement idempotency checks for webhook processing

### 4. **Environment Variables**

Store these in `.env.local` (development) and your production environment:

```env
# PhonePe Configuration
PHONEPE_MERCHANT_ID=your_merchant_id
PHONEPE_SALT_KEY=your_salt_key
PHONEPE_SALT_INDEX=1
PHONEPE_API_URL=https://api.phonepe.com/apis/hermes
PHONEPE_REDIRECT_URL=https://yourdomain.com/api/payments/callback
PHONEPE_WEBHOOK_URL=https://yourdomain.com/api/payments/webhook
```

## Integration Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Initiate Payment Request
       ▼
┌─────────────────────┐
│  Next.js API Route   │
│  /api/payments/init  │
│  (Server-Side)       │
└──────┬──────────────┘
       │
       │ 2. Create Payment Request
       │    (with server-side hash)
       ▼
┌─────────────────────┐
│   PhonePe Gateway    │
└──────┬──────────────┘
       │
       │ 3. Payment Processing
       │
       │ 4. Redirect/Callback
       ▼
┌─────────────────────┐
│  /api/payments/     │
│  callback            │
│  (Verify & Update)   │
└──────┬──────────────┘
       │
       │ 5. Webhook Notification
       ▼
┌─────────────────────┐
│  /api/payments/      │
│  webhook             │
│  (Final Verification)│
└──────────────────────┘
```

## Step-by-Step Implementation

### Step 1: Install Required Dependencies

```bash
npm install crypto-js
# or
npm install crypto
```

### Step 2: Create Payment Utility Functions

Create `lib/payments/phonepe.ts`:

```typescript
import crypto from 'crypto';

interface PhonePeConfig {
  merchantId: string;
  saltKey: string;
  saltIndex: number;
  apiUrl: string;
  redirectUrl: string;
}

const getConfig = (): PhonePeConfig => {
  return {
    merchantId: process.env.PHONEPE_MERCHANT_ID!,
    saltKey: process.env.PHONEPE_SALT_KEY!,
    saltIndex: parseInt(process.env.PHONEPE_SALT_INDEX || '1'),
    apiUrl:
      process.env.PHONEPE_API_URL || 'https://api.phonepe.com/apis/hermes',
    redirectUrl: process.env.PHONEPE_REDIRECT_URL || '',
  };
};

/**
 * Generate X-VERIFY header for PhonePe API
 */
export function generatePhonePeHash(base64Payload: string): string {
  const config = getConfig();
  const stringToHash = base64Payload + config.saltKey;
  const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
  return hash + '###' + config.saltIndex;
}

/**
 * Verify PhonePe callback/webhook signature
 */
export function verifyPhonePeHash(
  base64Payload: string,
  xVerifyHeader: string
): boolean {
  const config = getConfig();
  const [receivedHash, saltIndex] = xVerifyHeader.split('###');

  if (parseInt(saltIndex) !== config.saltIndex) {
    return false;
  }

  const stringToHash = base64Payload + config.saltKey;
  const calculatedHash = crypto
    .createHash('sha256')
    .update(stringToHash)
    .digest('hex');

  return calculatedHash === receivedHash;
}

/**
 * Create payment request payload
 */
export interface PaymentRequest {
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number; // in paise (multiply by 100)
  redirectUrl: string;
  redirectMode: 'POST' | 'REDIRECT';
  callbackUrl: string;
  mobileNumber?: string;
  paymentInstrument: {
    type: 'PAY_PAGE';
  };
}

export function createPaymentPayload(
  orderId: string,
  userId: string,
  amount: number,
  mobileNumber?: string
): PaymentRequest {
  const config = getConfig();

  return {
    merchantTransactionId: orderId,
    merchantUserId: userId,
    amount: amount * 100, // Convert to paise
    redirectUrl: config.redirectUrl,
    redirectMode: 'POST',
    callbackUrl: config.redirectUrl,
    mobileNumber,
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };
}
```

### Step 3: Create API Route for Payment Initiation

Create `app/api/payments/init/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withPatientAuth } from '@/lib/middleware/patient-auth';
import { apiClient } from '@/lib/api';
import {
  createPaymentPayload,
  generatePhonePeHash,
} from '@/lib/payments/phonepe';
import { prisma } from '@/lib/prisma';

export const POST = withPatientAuth(async (request: NextRequest, patient) => {
  try {
    const body = await request.json();
    const { orderId, amount } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        { success: false, message: 'Order ID and amount are required' },
        { status: 400 }
      );
    }

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: patient.userId,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Create payment payload
    const paymentPayload = createPaymentPayload(
      orderId,
      patient.userId,
      amount,
      patient.phone || undefined
    );

    // Convert to base64
    const base64Payload = Buffer.from(JSON.stringify(paymentPayload)).toString(
      'base64'
    );

    // Generate hash
    const xVerify = generatePhonePeHash(base64Payload);

    // Get PhonePe config
    const config = {
      merchantId: process.env.PHONEPE_MERCHANT_ID!,
      apiUrl:
        process.env.PHONEPE_API_URL || 'https://api.phonepe.com/apis/hermes',
    };

    // Call PhonePe API
    const response = await fetch(`${config.apiUrl}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        request: base64Payload,
      }),
    });

    const data = await response.json();

    if (data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
      // Update order with payment transaction ID
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentTransactionId: data.data.merchantTransactionId,
          paymentStatus: 'PENDING',
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          paymentUrl: data.data.instrumentResponse.redirectInfo.url,
          transactionId: data.data.merchantTransactionId,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: 'Failed to initiate payment' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { success: false, message: 'Payment initiation failed' },
      { status: 500 }
    );
  }
});
```

### Step 4: Create Payment Callback Handler

Create `app/api/payments/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyPhonePeHash } from '@/lib/payments/phonepe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const xVerify = request.headers.get('X-VERIFY');

    if (!xVerify) {
      return NextResponse.json(
        { success: false, message: 'Missing verification header' },
        { status: 400 }
      );
    }

    // PhonePe sends response in base64
    const base64Payload = body.response || body.request;

    if (!base64Payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Verify signature
    if (!verifyPhonePeHash(base64Payload, xVerify)) {
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Decode payload
    const decodedPayload = JSON.parse(
      Buffer.from(base64Payload, 'base64').toString('utf-8')
    );

    const { merchantTransactionId, transactionId, state, code, responseCode } =
      decodedPayload;

    // Update order status
    const order = await prisma.order.update({
      where: { id: merchantTransactionId },
      data: {
        paymentTransactionId: transactionId,
        paymentStatus: state === 'COMPLETED' ? 'SUCCESS' : 'FAILED',
        paymentResponseCode: code || responseCode,
      },
    });

    // Redirect to success/error page
    const redirectUrl =
      state === 'COMPLETED'
        ? `/cart?status=success&orderId=${order.id}`
        : `/cart?status=error&orderId=${order.id}`;

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error: any) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      { success: false, message: 'Callback processing failed' },
      { status: 500 }
    );
  }
}
```

### Step 5: Create Webhook Handler

Create `app/api/payments/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyPhonePeHash } from '@/lib/payments/phonepe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const xVerify = request.headers.get('X-VERIFY');

    if (!xVerify) {
      return NextResponse.json(
        { success: false, message: 'Missing verification header' },
        { status: 400 }
      );
    }

    const base64Payload = body.response || body.request;

    if (!base64Payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    if (!verifyPhonePeHash(base64Payload, xVerify)) {
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Decode and process
    const decodedPayload = JSON.parse(
      Buffer.from(base64Payload, 'base64').toString('utf-8')
    );

    const { merchantTransactionId, state, transactionId } = decodedPayload;

    // Update order with final status
    await prisma.order.update({
      where: { id: merchantTransactionId },
      data: {
        paymentStatus: state === 'COMPLETED' ? 'SUCCESS' : 'FAILED',
        paymentTransactionId: transactionId,
        paymentCompletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { success: false, message: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
```

### Step 6: Update CheckoutForm Component

Add payment initiation to `components/checkout/CheckoutForm.tsx`:

```typescript
// In handlePlaceOrder function, after creating order:
if (orderData.paymentMethod === 'online') {
  try {
    const paymentResponse = await apiClient.post(
      '/api/payments/init',
      {
        orderId: createdOrder.id,
        amount: total,
      },
      { token }
    );

    if (paymentResponse.data.success && paymentResponse.data.data?.paymentUrl) {
      // Redirect to PhonePe payment page
      window.location.href = paymentResponse.data.data.paymentUrl;
      return;
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    throw error;
  }
}
```

## Testing

### Test Environment

- Use PhonePe's sandbox/test environment for development
- Test with PhonePe test credentials
- Verify all payment flows (success, failure, cancellation)

### Test Cases

1. ✅ Successful payment flow
2. ✅ Payment failure handling
3. ✅ Payment cancellation
4. ✅ Webhook verification
5. ✅ Signature validation
6. ✅ Duplicate transaction handling

## Production Checklist

- [ ] All environment variables set in production
- [ ] HTTPS enabled for all payment endpoints
- [ ] Webhook URL configured in PhonePe dashboard
- [ ] Signature verification implemented
- [ ] Error handling and logging in place
- [ ] Order status tracking implemented
- [ ] Payment reconciliation process set up
- [ ] Security audit completed
- [ ] Load testing performed
- [ ] Monitoring and alerts configured

## Additional Resources

- [PhonePe Developer Documentation](https://developer.phonepe.com/)
- [PhonePe API Reference](https://developer.phonepe.com/v1/reference)
- [PhonePe Webhook Guide](https://developer.phonepe.com/v1/reference/webhook)

## Important Notes

1. **Never log sensitive data**: Don't log payment payloads, hashes, or API keys
2. **Use HTTPS only**: All payment endpoints must use HTTPS in production
3. **Implement rate limiting**: Protect payment endpoints from abuse
4. **Monitor transactions**: Set up alerts for failed payments
5. **Regular security updates**: Keep dependencies updated

## Support

For PhonePe integration support:

- Email: support@phonepe.com
- Developer Portal: https://developer.phonepe.com/
