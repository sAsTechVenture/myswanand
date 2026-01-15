'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Package,
  CreditCard,
  Edit,
  Trash2,
  Home,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { colors } from '@/config/theme';
import { apiClient } from '@/lib/api';
import { getAuthToken } from '@/lib/utils/auth';

// Types based on API responses
interface Address {
  id: string;
  label: string;
  name: string;
  address: string;
  pincode?: string;
  phone: string;
}

interface AvailableSlot {
  slotId: string | null;
  center: {
    id: string;
    name: string;
    address: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  availableCount: number;
  totalBookings: number;
  regularBookings: number;
  cancerBookings: number;
}

interface AvailableSlotsResponse {
  success: boolean;
  data: {
    availableSlots: AvailableSlot[];
    count: number;
    isCancerPatient: boolean;
  };
}

interface PatientProfileResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
      address: string | null;
      profileImage: string | null;
      healthCard: string | null;
      isCancerPatient: boolean;
      userType: string;
      userStatus: string;
    };
  };
}

interface CheckoutFormProps {
  cartItems: Array<{
    id: string;
    test: {
      id: string;
      name: string;
      price: number;
    };
  }>;
  subtotal: number;
  onPlaceOrder: (orderData: {
    slotId?: string | null;
    centerId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    additionalService:
      | 'HOME_SAMPLE_COLLECTION'
      | 'VISIT_LAB_CENTER'
      | 'NOT_REQUIRED';
    hardCopyReport: boolean;
  }) => Promise<void>;
  onBackToCart?: () => void;
}

export function CheckoutForm({
  cartItems,
  subtotal,
  onPlaceOrder,
  onBackToCart,
}: CheckoutFormProps) {
  const [address, setAddress] = useState<Address | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [homeSampleCollection, setHomeSampleCollection] =
    useState<string>('none'); // 'home', 'lab', or 'none'
  const [hardcopyReport, setHardcopyReport] = useState<string>('no'); // 'yes' or 'no'
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'pay_at_lab'>(
    'pay_at_lab'
  );
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Fetch address and available slots from server
  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();

        if (!token) {
          return;
        }

        // Fetch patient profile to get address
        const profileResponse = await apiClient.get<PatientProfileResponse>(
          '/patient/me',
          { token }
        );

        if (profileResponse.data.success && profileResponse.data.data?.user) {
          const user = profileResponse.data.data.user;
          if (user.address) {
            setAddress({
              id: user.id,
              label: 'Home',
              name: user.name,
              address: user.address,
              phone: user.phone || '',
            });
          }
        }

        // Fetch available slots
        const slotsResponse = await apiClient.get<AvailableSlotsResponse>(
          '/patient/bookings/available-slots',
          { token }
        );

        if (
          slotsResponse.data.success &&
          slotsResponse.data.data?.availableSlots
        ) {
          const slots = slotsResponse.data.data.availableSlots;
          setAvailableSlots(slots);

          // Group slots by date
          const datesMap = new Map<string, AvailableSlot[]>();
          slots.forEach((slot) => {
            if (!datesMap.has(slot.date)) {
              datesMap.set(slot.date, []);
            }
            datesMap.get(slot.date)!.push(slot);
          });

          // Set default date (first available date)
          if (datesMap.size > 0) {
            const firstDate = Array.from(datesMap.keys()).sort()[0];
            setSelectedDate(firstDate);
          }
        }
      } catch (error) {
        console.error('Error fetching checkout data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutData();
  }, []);

  // Update time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      const slotsForDate = availableSlots.filter(
        (slot) => slot.date === selectedDate
      );
      // Reset selected slot when date changes
      setSelectedSlot(null);
    }
  }, [selectedDate, availableSlots]);

  const handlePlaceOrder = async () => {
    if (!address || !selectedDate || !selectedSlot) {
      return;
    }

    try {
      setPlacingOrder(true);

      // Map homeSampleCollection to API format
      let additionalService:
        | 'HOME_SAMPLE_COLLECTION'
        | 'VISIT_LAB_CENTER'
        | 'NOT_REQUIRED';
      if (homeSampleCollection === 'home') {
        additionalService = 'HOME_SAMPLE_COLLECTION';
      } else if (homeSampleCollection === 'lab') {
        additionalService = 'VISIT_LAB_CENTER';
      } else {
        additionalService = 'NOT_REQUIRED';
      }

      await onPlaceOrder({
        slotId: selectedSlot.slotId || null,
        centerId: selectedSlot.center.id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        additionalService,
        hardCopyReport: hardcopyReport === 'yes',
      });
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setPlacingOrder(false);
    }
  };

  // Get unique dates from available slots
  const uniqueDates = Array.from(
    new Set(availableSlots.map((slot) => slot.date))
  ).sort();

  // Get slots for selected date
  const slotsForSelectedDate = availableSlots.filter(
    (slot) => slot.date === selectedDate
  );

  // Format date label
  const formatDateLabel = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time (convert 24h to 12h)
  const formatTime = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  const gst = subtotal * 0.18; // 18% GST
  const total =
    subtotal +
    gst +
    (homeSampleCollection === 'home' ? 200 : 0) +
    (hardcopyReport === 'yes' ? 100 : 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBackToCart}
            className="mb-4 inline-flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
            style={{ color: colors.primary }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </button>
          <h1
            className="text-3xl font-bold md:text-4xl text-center"
            style={{ color: colors.primary }}
          >
            Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Select Address Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin
                    className="h-5 w-5"
                    style={{ color: colors.primary }}
                  />
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: colors.black }}
                  >
                    Select Address
                  </h2>
                </div>

                {loading ? (
                  <Skeleton className="h-32 w-full" />
                ) : address ? (
                  <div
                    className="p-4 rounded-lg relative"
                    style={{ backgroundColor: colors.primaryLight }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        <span className="font-semibold">{address.label}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            // TODO: Open edit address modal
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm mb-1">{address.name}</p>
                    <p className="text-sm mb-1">{address.address}</p>
                    {address.pincode && (
                      <p className="text-sm mb-1">Pincode: {address.pincode}</p>
                    )}
                    {address.phone && (
                      <p className="text-sm">Phone: {address.phone}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    No address found. Please update your profile with an
                    address.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Select Date & Time Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar
                    className="h-5 w-5"
                    style={{ color: colors.primary }}
                  />
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: colors.black }}
                  >
                    Select Date & Time
                  </h2>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : (
                  <>
                    {/* Date Selection */}
                    <div className="mb-6">
                      <Label className="mb-2 block">
                        Select Date <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {uniqueDates.map((dateStr) => (
                          <Button
                            key={dateStr}
                            variant={
                              selectedDate === dateStr ? 'default' : 'outline'
                            }
                            size="sm"
                            className="rounded-full"
                            style={{
                              backgroundColor:
                                selectedDate === dateStr
                                  ? colors.primary
                                  : 'transparent',
                              color:
                                selectedDate === dateStr
                                  ? colors.white
                                  : colors.black,
                              borderColor: colors.primary,
                            }}
                            onClick={() => setSelectedDate(dateStr)}
                          >
                            {formatDateLabel(dateStr)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Time Slot Selection */}
                    {selectedDate && (
                      <div>
                        <Label className="mb-2 block">
                          Select Time Slot{' '}
                          <span className="text-red-500">*</span>
                        </Label>
                        {slotsForSelectedDate.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {slotsForSelectedDate.map((slot) => (
                              <Button
                                key={`${slot.date}-${slot.startTime}`}
                                variant={
                                  selectedSlot?.date === slot.date &&
                                  selectedSlot?.startTime === slot.startTime
                                    ? 'default'
                                    : 'outline'
                                }
                                size="sm"
                                className="rounded-full"
                                style={{
                                  backgroundColor:
                                    selectedSlot?.date === slot.date &&
                                    selectedSlot?.startTime === slot.startTime
                                      ? colors.primary
                                      : 'transparent',
                                  color:
                                    selectedSlot?.date === slot.date &&
                                    selectedSlot?.startTime === slot.startTime
                                      ? colors.white
                                      : colors.black,
                                  borderColor: colors.primary,
                                }}
                                onClick={() => setSelectedSlot(slot)}
                              >
                                {formatTime(slot.startTime)}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600 text-sm">
                            No available slots for this date.
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Additional Services Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package
                    className="h-5 w-5"
                    style={{ color: colors.primary }}
                  />
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: colors.black }}
                  >
                    Additional Services
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Home Sample Collection - Optional */}
                  <RadioGroup
                    value={homeSampleCollection}
                    onValueChange={(value) => setHomeSampleCollection(value)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-4 border rounded-lg">
                        <RadioGroupItem value="home" id="home" />
                        <Label htmlFor="home" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                Home Sample Collection
                              </p>
                              <p className="text-sm text-gray-600">
                                Our phlebotomist will visit your location
                              </p>
                            </div>
                            <span className="font-semibold">+₹200</span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-start gap-3 p-4 border rounded-lg">
                        <RadioGroupItem value="lab" id="lab" />
                        <Label htmlFor="lab" className="flex-1 cursor-pointer">
                          <div>
                            <p className="font-medium">Visit Lab Center</p>
                            <p className="text-sm text-gray-600">
                              Visit our lab center for sample collection
                            </p>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-start gap-3 p-4 border rounded-lg">
                        <RadioGroupItem value="none" id="none" />
                        <Label htmlFor="none" className="flex-1 cursor-pointer">
                          <div>
                            <p className="font-medium">Not Required</p>
                            <p className="text-sm text-gray-600">
                              Skip sample collection service
                            </p>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>

                  {/* Hard Copy Report - Radio Group */}
                  <div className="mt-6">
                    <Label className="mb-3 block text-sm font-medium">
                      Hard Copy Report
                    </Label>
                    <RadioGroup
                      value={hardcopyReport}
                      onValueChange={(value) => setHardcopyReport(value)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-4 border rounded-lg">
                          <RadioGroupItem value="yes" id="hardcopy_yes" />
                          <Label
                            htmlFor="hardcopy_yes"
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">
                                  Yes, I want hardcopy
                                </p>
                                <p className="text-sm text-gray-600">
                                  Get physical report delivered to your address
                                </p>
                              </div>
                              <span className="font-semibold">+₹100</span>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-start gap-3 p-4 border rounded-lg">
                          <RadioGroupItem value="no" id="hardcopy_no" />
                          <Label
                            htmlFor="hardcopy_no"
                            className="flex-1 cursor-pointer"
                          >
                            <div>
                              <p className="font-medium">
                                No, digital report only
                              </p>
                              <p className="text-sm text-gray-600">
                                Receive report via email/online portal
                              </p>
                            </div>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard
                    className="h-5 w-5"
                    style={{ color: colors.primary }}
                  />
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: colors.black }}
                  >
                    Payment Method
                  </h2>
                </div>

                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) =>
                    setPaymentMethod(value as 'online' | 'pay_at_lab')
                  }
                >
                  <div className="space-y-4">
                    {/* Online Payment - Commented out for now */}
                    {/* <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium mb-1">Online Payment</p>
                          <p className="text-sm text-gray-600 mb-3">
                            Pay securely using UPI, Cards, Net Banking, or Wallet
                          </p>
                          {paymentMethod === 'online' && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {['UPI', 'Cards', 'Net Banking', 'Wallet'].map((method) => (
                                <Button
                                  key={method}
                                  variant="outline"
                                  size="sm"
                                  className="rounded-full"
                                  style={{
                                    borderColor: colors.primary,
                                    color: colors.black,
                                  }}
                                >
                                  {method}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </Label>
                    </div> */}
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <RadioGroupItem value="pay_at_lab" id="pay_at_lab" />
                      <Label
                        htmlFor="pay_at_lab"
                        className="flex-1 cursor-pointer"
                      >
                        <div>
                          <p className="font-medium">Pay at Lab Center</p>
                          <p className="text-sm text-gray-600">
                            Pay in cash when you visit the lab for sample
                            collection
                          </p>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2
                  className="text-xl font-bold mb-6"
                  style={{ color: colors.black }}
                >
                  Order Summary
                </h2>

                {/* Items List */}
                <div className="space-y-2 mb-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.test.name}</span>
                      <span className="font-medium">
                        ₹{item.test.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Summary Totals */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-medium">
                      ₹{gst.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Total */}
                <div className="flex justify-between mb-6">
                  <span
                    className="text-lg font-bold"
                    style={{ color: colors.black }}
                  >
                    Total Amount
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: colors.black }}
                  >
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Place Order Button */}
                <Button
                  className="w-full py-6 text-base font-semibold rounded-lg"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.white,
                  }}
                  onClick={handlePlaceOrder}
                  disabled={
                    placingOrder || !address || !selectedDate || !selectedSlot
                  }
                >
                  {placingOrder ? 'Placing Order...' : 'Place Order'}
                </Button>

                {/* Disclaimer */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing order, you agree to our Terms & Conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
