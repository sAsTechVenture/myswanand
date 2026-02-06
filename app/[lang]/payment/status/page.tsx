'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useLocalizedRouter } from '@/lib/hooks/useLocalizedRouter';
import { getCurrentLocale, createLocalizedPath } from '@/lib/utils/i18n';
import { CheckoutSuccess } from '@/components/checkout/CheckoutSuccess';
import { CheckoutError } from '@/components/checkout/CheckoutError';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api';
import { getAuthToken } from '@/lib/utils/auth';

interface PaymentStatusResponse {
  success: boolean;
  payment?: {
    id: string;
    status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'INITIATED';
    amount: number;
    bookingId?: string;
    bookingStatus?: string;
    errorCode?: string;
  };
  phonePeStatus?: string;
  message?: string;
  phonePeError?: string;
}

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const localizedRouter = useLocalizedRouter();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'SUCCESS' | 'FAILED' | 'PENDING' | null>(
    null
  );
  const [bookingId, setBookingId] = useState<string | undefined>();
  const [bookingNumber, setBookingNumber] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        setLoading(true);

        // Get transaction ID from URL params (PhonePe redirect)
        // PhonePe may return different parameter names
        const transactionId = searchParams.get('transactionId');
        const merchantTransactionId = searchParams.get('merchantTransactionId');
        const merchantOrderId = searchParams.get('merchantOrderId');
        const code = searchParams.get('code');

        // Determine the order ID to use for verification
        const orderId =
          merchantOrderId || merchantTransactionId || transactionId;

        // If code is provided directly by PhonePe (and we have an order ID to verify)
        if (code && orderId) {
          // Still verify with backend even if we have a code
          // PhonePe success codes: PAYMENT_SUCCESS, PAYMENT_ERROR, PAYMENT_PENDING
        }

        // If we have an order ID, verify with backend
        if (orderId) {
          const token = getAuthToken();

          if (!token) {
            // If no token but we have a success code, show success anyway
            if (code === 'PAYMENT_SUCCESS') {
              setStatus('SUCCESS');
              setMessage('Your payment was successful!');
              setLoading(false);
              return;
            }
            setStatus('FAILED');
            setErrorMessage('Session expired. Please login and try again.');
            setLoading(false);
            return;
          }

          try {
            // Call the correct backend endpoint
            const response = await apiClient.get<PaymentStatusResponse>(
              `/payments/phonepe/status?merchantOrderId=${orderId}`,
              { token }
            );

            if (response.data.success && response.data.payment) {
              const payment = response.data.payment;

              // Map backend status to frontend status
              const paymentStatus = payment.status;

              if (paymentStatus === 'SUCCESS') {
                setStatus('SUCCESS');
                setBookingId(payment.bookingId);
                setMessage(
                  response.data.message || 'Your payment was successful!'
                );
              } else if (
                paymentStatus === 'PENDING' ||
                paymentStatus === 'INITIATED'
              ) {
                setStatus('PENDING');
                setErrorMessage(
                  response.data.message ||
                    'Your payment is being processed. Please wait.'
                );
              } else {
                setStatus('FAILED');
                setErrorMessage(
                  response.data.message || 'Payment failed. Please try again.'
                );
              }
            } else if (response.data.success) {
              // Success response but no payment object - check phonePeStatus
              const phonePeStatus = response.data.phonePeStatus;

              if (phonePeStatus === 'COMPLETED') {
                setStatus('SUCCESS');
                setMessage(
                  response.data.message || 'Your payment was successful!'
                );
              } else if (phonePeStatus === 'PENDING') {
                setStatus('PENDING');
                setErrorMessage(
                  response.data.message || 'Your payment is being processed.'
                );
              } else {
                setStatus('FAILED');
                setErrorMessage(
                  response.data.message || 'Payment failed. Please try again.'
                );
              }
            } else {
              setStatus('FAILED');
              setErrorMessage(
                'Unable to verify payment status. Please contact support.'
              );
            }
          } catch (apiError: any) {
            console.error('Error verifying payment:', apiError);

            // Fallback to code-based status if API fails
            if (code === 'PAYMENT_SUCCESS') {
              setStatus('SUCCESS');
              setMessage('Your payment was successful!');
            } else if (code === 'PAYMENT_PENDING') {
              setStatus('PENDING');
              setErrorMessage('Your payment is being processed. Please wait.');
            } else {
              setStatus('FAILED');
              setErrorMessage(
                apiError?.message || 'Unable to verify payment status.'
              );
            }
          }
        } else if (code) {
          // No order ID but we have a code - use code-based status
          if (code === 'PAYMENT_SUCCESS') {
            setStatus('SUCCESS');
            setMessage('Your payment was successful!');
          } else if (code === 'PAYMENT_PENDING') {
            setStatus('PENDING');
            setErrorMessage('Your payment is being processed. Please wait.');
          } else {
            setStatus('FAILED');
            setErrorMessage('Payment failed. Please try again.');
          }
        } else {
          // No transaction info in URL
          setStatus('FAILED');
          setErrorMessage(
            'Invalid payment callback. No transaction information found.'
          );
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('FAILED');
        setErrorMessage(
          'An unexpected error occurred. Please contact support.'
        );
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  const handleViewOrder = () => {
    if (bookingId) {
      localizedRouter.push(`/profile?tab=history`);
    } else {
      localizedRouter.push('/profile?tab=history');
    }
  };

  const handleRetry = () => {
    localizedRouter.push('/cart');
  };

  const handleBackToCart = () => {
    localizedRouter.push('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-4 mt-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            <p className="text-center text-gray-500 mt-6">
              Verifying your payment status...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'SUCCESS') {
    return (
      <CheckoutSuccess
        orderId={bookingId}
        orderNumber={bookingNumber}
        message={message}
        onViewOrder={handleViewOrder}
      />
    );
  }

  // Show error for FAILED or PENDING status
  return (
    <CheckoutError
      errorMessage={errorMessage}
      onRetry={handleRetry}
      onBackToCart={handleBackToCart}
      backLabel="Back to Cart"
    />
  );
}

// Loading fallback for Suspense
function PaymentStatusFallback() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-4 mt-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <p className="text-center text-gray-500 mt-6">
            Loading payment status...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<PaymentStatusFallback />}>
      <PaymentStatusContent />
    </Suspense>
  );
}
