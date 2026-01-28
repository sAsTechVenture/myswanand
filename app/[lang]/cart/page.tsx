'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLocalizedRouter } from '@/lib/hooks/useLocalizedRouter';
import { createLocalizedPath, getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import Link from 'next/link';
import { ArrowLeft, Plus, Minus, Trash2, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { colors } from '@/config/theme';
import { apiClient } from '@/lib/api';
import {
  getAuthToken,
  isAuthenticated,
  syncAuthTokenToCookie,
} from '@/lib/utils/auth';
import { toast } from '@/lib/toast';
import { CartSummary } from '@/components/checkout/CartSummary';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { CheckoutSuccess } from '@/components/checkout/CheckoutSuccess';
import { CheckoutError } from '@/components/checkout/CheckoutError';
import { VoucherAssignmentModal } from '@/components/checkout/VoucherAssignmentModal';

// Cart item type based on API response
interface CartItem {
  id: string;
  userId: string;
  testId: string;
  createdAt: string;
  test: {
    id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    category?: {
      id: string;
      name: string;
    };
  };
}

interface CartResponse {
  success: boolean;
  data: {
    cartItems: CartItem[];
    count: number;
    totalPrice: number;
  };
}

type ViewState = 'cart' | 'checkout' | 'success' | 'error';

export default function CartPage() {
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const localizedRouter = useLocalizedRouter();
  const { dictionary } = useDictionary(locale);
  const [viewState, setViewState] = useState<ViewState>('cart');

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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [orderData, setOrderData] = useState<{
    bookingId?: string;
    bookingNumber?: string;
    message?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [assignedVoucherIds, setAssignedVoucherIds] = useState<string[]>([]);

  // Sync token to cookie on mount
  useEffect(() => {
    syncAuthTokenToCookie();

    // If not authenticated, redirect to login
    if (!isAuthenticated()) {
      const currentPath = window.location.pathname;
      localizedRouter.replace(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    fetchCartItems();
  }, [router]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        localizedRouter.push('/auth/login?redirect=/cart');
        return;
      }

      const response = await apiClient.get<CartResponse>('/patient/cart', {
        token,
      });

      if (response.data.success && response.data.data) {
        setCartItems(response.data.data.cartItems);
        setTotalPrice(response.data.data.totalPrice);
      }
    } catch (error: any) {
      console.error('Error fetching cart items:', error);
      // If unauthorized, redirect to login
      if (
        error?.message?.includes('401') ||
        error?.message?.includes('Unauthorized')
      ) {
        localizedRouter.push('/auth/login?redirect=/cart');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (testId: string, change: number) => {
    // Note: The API doesn't support quantity updates yet
    // This is a placeholder for future functionality
    // For now, we'll just update the local state if needed
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.testId === testId) {
          // Since API doesn't support quantity, we'll keep it at 1
          // This can be updated when quantity API is available
          return item;
        }
        return item;
      })
    );
  };

  const handleRemoveItem = async (testId: string) => {
    try {
      setRemovingId(testId);
      const token = getAuthToken();

      if (!token) {
        localizedRouter.push('/auth/login?redirect=/cart');
        return;
      }

      await apiClient.delete(`/patient/cart/${testId}`, {
        token,
      });

      toast.success('Item removed from cart');
      // Refresh cart items after deletion
      await fetchCartItems();
      // Dispatch event to update cart count in header
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-change'));
      }
    } catch (error: any) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleProceedCheckout = () => {
    setViewState('checkout');
  };

  const handlePlaceOrder = async (orderData: {
    // Either slotId OR slot details (for dynamically generated slots)
    slotId?: string | null;
    centerId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    paymentMethod: 'ONLINE' | 'OFFLINE'; // Required
    homeSampleCollection: boolean;
    hardCopyReport: boolean;
    coinsToRedeem?: number; // Optional: coins to redeem for discount
    agreeToTerms?: boolean;
    sendSMSReminder?: boolean;
    sendEmailReminder?: boolean;
  }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        localizedRouter.push('/auth/login?redirect=/cart');
        return;
      }

      // Prepare booking payload - use slotId if available, otherwise use slot details
      const bookingPayload: {
        slotId?: string | null;
        centerId?: string;
        date?: string;
        startTime?: string;
        endTime?: string;
        paymentMethod: string;
        type: string;
        additionalService: string;
        hardCopyReport: boolean;
        coinsToRedeem?: number;
        agreeToTerms?: boolean;
        sendSMSReminder?: boolean;
        sendEmailReminder?: boolean;
      } = {
        paymentMethod: orderData.paymentMethod, // 'ONLINE' or 'OFFLINE'
        type: 'DIAGNOSTIC',
        additionalService: orderData.homeSampleCollection
          ? 'HOME_SAMPLE_COLLECTION'
          : 'NOT_REQUIRED',
        hardCopyReport: orderData.hardCopyReport,
        agreeToTerms: orderData.agreeToTerms,
        sendSMSReminder: orderData.sendSMSReminder,
        sendEmailReminder: orderData.sendEmailReminder,
      };

      // Add coins to redeem if provided
      if (orderData.coinsToRedeem && orderData.coinsToRedeem > 0) {
        bookingPayload.coinsToRedeem = orderData.coinsToRedeem;
      }

      // If slotId exists, use it; otherwise use slot details for dynamic slot creation
      if (orderData.slotId) {
        bookingPayload.slotId = orderData.slotId;
      } else {
        // Use slot details for dynamically generated slots
        bookingPayload.centerId = orderData.centerId;
        bookingPayload.date = orderData.date;
        bookingPayload.startTime = orderData.startTime;
        bookingPayload.endTime = orderData.endTime;
      }

      // Call the booking API
      const response = await apiClient.post<{
        success: boolean;
        data: {
          message: string;
          booking: {
            id: string;
            status: string;
            type: string;
            additionalService: string;
            hardCopyReport: boolean;
            dateTime: string;
            slot: {
              id: string;
              date: string;
              startTime: string;
              endTime: string;
              center: {
                id: string;
                name: string;
                address: string;
              };
            };
            tests: Array<{
              id: string;
              testId: string;
              test: {
                id: string;
                name: string;
                description: string | null;
                price: number;
                imageUrl: string | null;
                category: {
                  id: string;
                  name: string;
                } | null;
              };
            }>;
          };
          payment?: {
            id: string;
            amount: number;
            status: string;
            paymentMethod: string;
          };
          redirectUrl?: string; // Only for ONLINE payments
          assignedVouchers?: string[]; // Array of assigned voucher IDs
        };
      }>('/patient/bookings', bookingPayload, { token });

      if (response.data.success && response.data.data?.booking) {
        const booking = response.data.data.booking;
        const redirectUrl = response.data.data.redirectUrl;
        const assignedVouchers = response.data.data.assignedVouchers || [];

        console.log('Assigned vouchers from API:', assignedVouchers);

        // Check if vouchers were assigned
        if (assignedVouchers.length > 0) {
          console.log('Setting voucher modal to open with IDs:', assignedVouchers);
          setAssignedVoucherIds(assignedVouchers);
          // Use setTimeout to ensure state updates are processed
          setTimeout(() => {
            setVoucherModalOpen(true);
          }, 100);
        }

        // If ONLINE payment and redirectUrl exists, redirect to PhonePe
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

        // For OFFLINE payment or if no redirectUrl, show success
        setOrderData({
          bookingId: booking.id,
          bookingNumber: booking.id,
          message: response.data.data.message,
        });

        toast.success(
          response.data.data.message ||
            (orderData.paymentMethod === 'ONLINE'
              ? 'Redirecting to payment gateway...'
              : 'Booking created successfully! Payment will be collected by phlebotomist during visit.')
        );

        // For OFFLINE payments, show success page
        if (orderData.paymentMethod === 'OFFLINE') {
          setViewState('success');
        }

        // Clear cart after successful booking (API already clears it, but refresh UI)
        await fetchCartItems();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-change'));
        }
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error: any) {
      console.error('Error placing order:', error);

      // Handle specific error messages from API
      let errorMessage = 'Failed to place order. Please try again.';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }

      // Check for specific error cases
      if (
        errorMessage.includes('Cart is empty') ||
        errorMessage.includes('cart is empty')
      ) {
        errorMessage =
          'Your cart is empty. Please add tests to cart before booking.';
      } else if (
        errorMessage.includes('Slot is full') ||
        errorMessage.includes('slot is full')
      ) {
        errorMessage =
          'This time slot is full. Please select another time slot.';
      } else if (errorMessage.includes('already have a booking')) {
        errorMessage = 'You already have a booking for this time slot.';
      } else if (
        errorMessage.includes('slotId') ||
        errorMessage.includes('slot')
      ) {
        errorMessage = 'Please select a valid time slot.';
      }

      setErrorMessage(errorMessage);
      setViewState('error');
    }
  };

  const handleBackToCart = () => {
    setViewState('cart');
    setErrorMessage('');
  };

  const handleRetry = () => {
    setViewState('checkout');
    setErrorMessage('');
  };

  const hardcopyReport = 0;
  const subtotal = totalPrice;
  const total = subtotal + hardcopyReport;

  // Render different components based on view state
  return (
    <>
      {viewState === 'checkout' && (
        <CheckoutForm
          cartItems={cartItems}
          subtotal={subtotal}
          onPlaceOrder={handlePlaceOrder}
          onBackToCart={handleBackToCart}
        />
      )}

      {viewState === 'success' && (
        <CheckoutSuccess
          orderId={orderData?.bookingId}
          orderNumber={orderData?.bookingNumber}
          message={orderData?.message}
          onViewOrder={() => {
            // Navigate to bookings page or profile with bookings tab
            localizedRouter.push('/profile?tab=bookings');
          }}
        />
      )}

      {viewState === 'error' && (
        <CheckoutError
          errorMessage={errorMessage}
          onRetry={handleRetry}
          onBackToCart={handleBackToCart}
        />
      )}

      {viewState === 'cart' && (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Header */}
            <div className="mb-6">
              <Link
                href="/"
                className="mb-4 inline-flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
                style={{ color: colors.primary }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
              <h1
                className="text-3xl font-bold md:text-4xl text-center"
                style={{ color: colors.primary }}
              >
                Shopping Cart
              </h1>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items - Left Section */}
              <div className="lg:col-span-2 space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <Card key={i} className="p-4">
                        <CardContent className="p-0">
                          <div className="flex items-start gap-4">
                            <Skeleton className="w-12 h-12 rounded-lg" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-6 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <Skeleton className="h-6 w-20" />
                              <Skeleton className="h-8 w-32" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : cartItems.length === 0 ? (
                  <Card className="p-12 text-center">
                    <p className="text-gray-600 mb-4">{t('common.yourCartIsEmpty')}</p>
                    <Link href={createLocalizedPath('/diagnostic-tests', locale)}>
                      <Button
                        style={{
                          backgroundColor: colors.primary,
                          color: colors.white,
                        }}
                      >
                        {t('common.browseDiagnosticTests')}
                      </Button>
                    </Link>
                  </Card>
                ) : (
                  cartItems.map((item) => (
                    <Card key={item.id} className="p-4">
                      <CardContent className="p-0">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: colors.primary }}
                          >
                            <FileText className="w-6 h-6 text-white" />
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <h3
                              className="text-lg font-semibold mb-1"
                              style={{ color: colors.black }}
                            >
                              {item.test.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Home sample collection available
                            </p>
                          </div>

                          {/* Price and Controls */}
                          <div className="flex flex-col items-end gap-3">
                            {/* Price */}
                            <p
                              className="text-lg font-bold"
                              style={{ color: colors.black }}
                            >
                              ₹{item.test.price.toLocaleString('en-IN')}
                            </p>

                            {/* Quantity Controls and Delete */}
                            <div className="flex items-center gap-3">
                              {/* Quantity Controls - Disabled for now as API doesn't support quantity */}
                              <div className="flex items-center gap-2 border rounded-lg opacity-50">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-l-lg rounded-r-none"
                                  disabled
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                                  1
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-r-lg rounded-l-none"
                                  disabled
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Delete Button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRemoveItem(item.testId)}
                                disabled={removingId === item.testId}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Order Summary - Right Section */}
              <div className="lg:col-span-1">
                <CartSummary
                  cartItems={cartItems}
                  subtotal={subtotal}
                  hardcopyReport={hardcopyReport}
                  total={total}
                  onProceedCheckout={handleProceedCheckout}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Bottom Banner */}
            <div
              className="mt-8 p-4 rounded-lg"
              style={{ backgroundColor: colors.lightestGreen }}
            >
              <p className="text-sm text-center" style={{ color: colors.black }}>
                Have questions about these tests? Connect with us for guidance!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Voucher Assignment Modal - Always available */}
      <VoucherAssignmentModal
        open={voucherModalOpen}
        onOpenChange={setVoucherModalOpen}
        assignedVoucherIds={assignedVoucherIds}
      />
    </>
  );
}
