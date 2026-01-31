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
  data: {
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    transactionId?: string;
    merchantTransactionId?: string;
    bookingId?: string;
    bookingNumber?: string;
    message?: string;
  };
}

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const localizedRouter = useLocalizedRouter();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'SUCCESS' | 'FAILED' | 'PENDING' | null>(null);
  const [bookingId, setBookingId] = useState<string | undefined>();
  const [bookingNumber, setBookingNumber] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        setLoading(true);

        // Get transaction ID from URL params (PhonePe redirect)
        const transactionId = searchParams.get('transactionId');
        const merchantTransactionId = searchParams.get('merchantTransactionId');
        const code = searchParams.get('code');

        // If code is provided directly by PhonePe
        if (code) {
          // PhonePe success codes
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
          setLoading(false);
          return;
        }

        // If we have transaction ID, verify with backend
        if (transactionId || merchantTransactionId) {
          const token = getAuthToken();
          
          if (!token) {
            setStatus('FAILED');
            setErrorMessage('Session expired. Please login and try again.');
            setLoading(false);
            return;
          }

          try {
            const response = await apiClient.get<PaymentStatusResponse>(
              `/patient/payments/status?transactionId=${transactionId || merchantTransactionId}`,
              { token }
            );

            if (response.data.success && response.data.data) {
              const data = response.data.data;
              setStatus(data.status);
              setBookingId(data.bookingId);
              setBookingNumber(data.bookingNumber);
              
              if (data.status === 'SUCCESS') {
                setMessage(data.message || 'Your payment was successful!');
              } else if (data.status === 'PENDING') {
                setErrorMessage(data.message || 'Your payment is being processed.');
              } else {
                setErrorMessage(data.message || 'Payment failed. Please try again.');
              }
            } else {
              setStatus('FAILED');
              setErrorMessage('Unable to verify payment status. Please contact support.');
            }
          } catch (apiError: any) {
            console.error('Error verifying payment:', apiError);
            setStatus('FAILED');
            setErrorMessage(apiError?.message || 'Unable to verify payment status.');
          }
        } else {
          // No transaction info in URL
          setStatus('FAILED');
          setErrorMessage('Invalid payment callback. No transaction information found.');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('FAILED');
        setErrorMessage('An unexpected error occurred. Please contact support.');
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
