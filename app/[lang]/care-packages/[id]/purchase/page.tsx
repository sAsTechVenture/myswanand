'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { useLocalizedRouter } from '@/lib/hooks/useLocalizedRouter';
import { createLocalizedPath, getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
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
import { VoucherAssignmentModal } from '@/components/checkout/VoucherAssignmentModal';

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
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const localizedRouter = useLocalizedRouter();
  const { dictionary } = useDictionary(locale);
  const packageId = params.id as string;

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

  const [viewState, setViewState] = useState<ViewState>('checkout');
  const [packageData, setPackageData] = useState<CarePackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<{
    bookingId?: string;
    bookingNumber?: string;
    message?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [assignedVoucherIds, setAssignedVoucherIds] = useState<string[]>([]);

  useEffect(() => {
    syncAuthTokenToCookie();

    if (!isAuthenticated()) {
      const currentPath = window.location.pathname;
      localizedRouter.replace(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    fetchPackage();
  }, [localizedRouter, packageId]);

  const fetchPackage = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        localizedRouter.push(`/auth/login?redirect=/care-packages/${packageId}/purchase`);
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
    coinsToRedeem?: number; // Optional: coins to redeem for discount
  }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        localizedRouter.push(`/auth/login?redirect=/care-packages/${packageId}/purchase`);
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
        coinsToRedeem?: number;
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

      // Add coins to redeem if provided
      if (orderData.coinsToRedeem && orderData.coinsToRedeem > 0) {
        payload.coinsToRedeem = orderData.coinsToRedeem;
      }

      const response = await apiClient.post<{
        success: boolean;
        data: {
          message: string;
          booking: { id: string; status: string; slot?: unknown; package?: unknown };
          payment?: { id: string; amount: number; status: string; paymentMethod: string };
          redirectUrl?: string;
          assignedVouchers?: string[]; // Array of assigned voucher IDs
        };
      }>(`/patient/packages/${packageId}/purchase`, payload, { token });

      if (response.data.success && response.data.data) {
        const d = response.data.data;
        const redirectUrl = d.redirectUrl;
        const assignedVouchers = d.assignedVouchers || [];

        // Check if vouchers were assigned
        if (assignedVouchers.length > 0) {
          setAssignedVoucherIds(assignedVouchers);
          setVoucherModalOpen(true);
        }

        if (orderData.paymentMethod === 'ONLINE' && redirectUrl) {
          // Show voucher modal before redirect if vouchers were assigned
          if (assignedVouchers.length > 0) {
            // Wait a bit for modal to show, then redirect
            setTimeout(() => {
              window.location.href = redirectUrl;
            }, 2000);
            return;
          }
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
              ? t('common.redirectingToPayment')
              : t('common.packageBookingConfirmed'))
        );

        setViewState('success');
      } else {
        throw new Error(t('common.failedToPurchasePackage'));
      }
    } catch (error: unknown) {
      console.error('Error purchasing package:', error);
      const err = error as { message?: string; data?: { message?: string } };
      let msg = t('common.failedToPurchasePackage');
      if (err?.message) msg = err.message;
      else if (err?.data?.message) msg = err.data.message;
      if (
        typeof msg === 'string' &&
        (msg.includes('Slot is full') || msg.includes('slot is full'))
      ) {
        msg = t('common.timeSlotFull');
      } else if (
        typeof msg === 'string' &&
        msg.toLowerCase().includes('already have a booking')
      ) {
        msg = t('common.alreadyHaveBooking');
      }
      setErrorMessage(msg);
      setViewState('error');
    }
  };

  const handleBackToPackage = () => {
    localizedRouter.push(`/care-packages/${packageId}`);
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
            <p className="text-lg text-gray-600">{t('common.packageNotFound')}</p>
            <Link href={createLocalizedPath('/care-packages', locale)}>
              <Button
                className="mt-4"
                style={{ backgroundColor: colors.primary, color: colors.white }}
              >
                {t('common.backToCarePackages')}
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      {viewState === 'success' && (
        <CheckoutSuccess
          orderId={orderData?.bookingId}
          orderNumber={orderData?.bookingNumber}
          message={orderData?.message}
          onViewOrder={() => localizedRouter.push('/profile?tab=history')}
        />
      )}

      {viewState === 'error' && (
        <CheckoutError
          errorMessage={errorMessage}
          onRetry={() => setViewState('checkout')}
          onBackToCart={handleBackToPackage}
          backLabel={t('common.backToPackage')}
        />
      )}

      {viewState === 'checkout' && (
        <CheckoutForm
          package={{ id: packageData.id, name: packageData.name, price: packageData.price }}
          onPlaceOrder={handlePlaceOrder}
          onBackToCart={handleBackToPackage}
          backLabel={t('common.backToPackage')}
        />
      )}

      {/* Voucher Assignment Modal */}
      <VoucherAssignmentModal
        open={voucherModalOpen}
        onOpenChange={setVoucherModalOpen}
        assignedVoucherIds={assignedVoucherIds}
      />
    </>
  );
}
