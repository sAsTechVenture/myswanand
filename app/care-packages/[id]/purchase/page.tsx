'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { colors } from '@/config/theme';
import { apiClient } from '@/lib/api';
import {
  getAuthToken,
  isAuthenticated,
  syncAuthTokenToCookie,
} from '@/lib/utils/auth';
import { toast } from '@/lib/toast';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { CheckoutSuccess } from '@/components/checkout/CheckoutSuccess';
import { CheckoutError } from '@/components/checkout/CheckoutError';

interface CarePackage {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  category?: { id: string; name: string };
}

type ViewState = 'checkout' | 'success' | 'error';

export default function PackagePurchasePage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id as string;

  const [viewState, setViewState] = useState<ViewState>('checkout');
  const [packageData, setPackageData] = useState<CarePackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<{
    bookingId?: string;
    bookingNumber?: string;
    message?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    syncAuthTokenToCookie();

    if (!isAuthenticated()) {
      const currentPath = window.location.pathname;
      router.replace(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    fetchPackage();
  }, [router, packageId]);

  const fetchPackage = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        router.push(`/auth/login?redirect=/care-packages/${packageId}/purchase`);
        return;
      }

      const response = await apiClient.get<{
        success?: boolean;
        data?: CarePackage;
      }>(`/patient/care-packages/${packageId}`);

      const res = response.data as { data?: CarePackage };
      const pkg = res?.data ?? (response.data as unknown as CarePackage);
      if (pkg?.id) {
        setPackageData(pkg);
      }
    } catch (err: unknown) {
      console.error('Error fetching package:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (orderData: {
    slotId?: string | null;
    centerId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    paymentMethod: 'ONLINE' | 'OFFLINE';
    homeSampleCollection: boolean;
    hardCopyReport: boolean;
  }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push(`/auth/login?redirect=/care-packages/${packageId}/purchase`);
        return;
      }

      const payload: {
        slotId?: string | null;
        centerId?: string;
        date?: string;
        startTime?: string;
        endTime?: string;
        paymentMethod: string;
        additionalService: string;
        hardCopyReport: boolean;
      } = {
        paymentMethod: orderData.paymentMethod,
        additionalService: orderData.homeSampleCollection
          ? 'HOME_SAMPLE_COLLECTION'
          : 'NOT_REQUIRED',
        hardCopyReport: orderData.hardCopyReport,
      };

      if (orderData.slotId) {
        payload.slotId = orderData.slotId;
      } else {
        payload.centerId = orderData.centerId;
        payload.date = orderData.date;
        payload.startTime = orderData.startTime;
        payload.endTime = orderData.endTime;
      }

      const response = await apiClient.post<{
        success: boolean;
        data: {
          message: string;
          booking: { id: string; status: string; slot?: unknown; package?: unknown };
          payment?: { id: string; amount: number; status: string; paymentMethod: string };
          redirectUrl?: string;
        };
      }>(`/patient/packages/${packageId}/purchase`, payload, { token });

      if (response.data.success && response.data.data) {
        const d = response.data.data;
        const redirectUrl = d.redirectUrl;

        if (orderData.paymentMethod === 'ONLINE' && redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }

        setOrderData({
          bookingId: d.booking?.id,
          bookingNumber: d.booking?.id,
          message: d.message,
        });

        toast.success(
          d.message ||
            (orderData.paymentMethod === 'ONLINE'
              ? 'Redirecting to payment gateway...'
              : 'Package booking confirmed! Payment will be collected by phlebotomist during visit.')
        );

        setViewState('success');
      } else {
        throw new Error('Failed to purchase package');
      }
    } catch (error: unknown) {
      console.error('Error purchasing package:', error);
      const err = error as { message?: string; data?: { message?: string } };
      let msg = 'Failed to purchase package. Please try again.';
      if (err?.message) msg = err.message;
      else if (err?.data?.message) msg = err.data.message;
      if (
        typeof msg === 'string' &&
        (msg.includes('Slot is full') || msg.includes('slot is full'))
      ) {
        msg = 'This time slot is full. Please select another time slot.';
      } else if (
        typeof msg === 'string' &&
        msg.toLowerCase().includes('already have a booking')
      ) {
        msg = 'You already have a booking for this time slot.';
      }
      setErrorMessage(msg);
      setViewState('error');
    }
  };

  const handleBackToPackage = () => {
    router.push(`/care-packages/${packageId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="mb-6 h-8 w-32" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="p-8 text-center">
            <p className="text-lg text-gray-600">Package not found.</p>
            <Link href="/care-packages">
              <Button
                className="mt-4"
                style={{ backgroundColor: colors.primary, color: colors.white }}
              >
                Back to Care Packages
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  if (viewState === 'success') {
    return (
      <CheckoutSuccess
        orderId={orderData?.bookingId}
        orderNumber={orderData?.bookingNumber}
        message={orderData?.message}
        onViewOrder={() => router.push('/profile?tab=history')}
      />
    );
  }

  if (viewState === 'error') {
    return (
      <CheckoutError
        errorMessage={errorMessage}
        onRetry={() => setViewState('checkout')}
        onBackToCart={handleBackToPackage}
        backLabel="Back to Package"
      />
    );
  }

  return (
    <CheckoutForm
      package={{ id: packageData.id, name: packageData.name, price: packageData.price }}
      onPlaceOrder={handlePlaceOrder}
      onBackToCart={handleBackToPackage}
      backLabel="Back to Package"
    />
  );
}
