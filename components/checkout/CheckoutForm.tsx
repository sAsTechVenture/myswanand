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
  Coins,
  Activity,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { colors } from '@/config/theme';
import { apiClient } from '@/lib/api';
import { getAuthToken } from '@/lib/utils/auth';
import { toast } from '@/lib/toast';

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
  slotId: string | null; // Can be null for dynamically generated slots
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
  // For cart/booking: pass cartItems + subtotal
  cartItems?: Array<{
    id: string;
    test: {
      id: string;
      name: string;
      price: number;
    };
  }>;
  subtotal?: number;
  // For package purchase: pass package (cartItems and subtotal ignored)
  package?: { id: string; name: string; price: number };
  onPlaceOrder: (orderData: {
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
    existingMedicines?: string | null; // Optional: patient's current medicines
    healthDisorder?: string | null; // Optional: any health disorder
  }) => Promise<void>;
  onBackToCart?: () => void;
  /** Label for back button. Default: "Back to Cart" */
  backLabel?: string;
}

export function CheckoutForm({
  cartItems,
  subtotal,
  package: pkg,
  onPlaceOrder,
  onBackToCart,
  backLabel = 'Back to Cart',
}: CheckoutFormProps) {
  // Package mode: single package; cart mode: cartItems + subtotal
  const displayItems = pkg
    ? [{ id: pkg.id, test: { id: pkg.id, name: pkg.name, price: pkg.price } }]
    : cartItems ?? [];
  const effectiveSubtotal = pkg ? pkg.price : subtotal ?? 0;
  const isPackagePurchase = !!pkg;
  const [address, setAddress] = useState<Address | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  // Home sample collection is now mandatory
  const [homeSampleCollection] = useState<boolean>(true);
  const [hardcopyReport, setHardcopyReport] = useState<string>('no'); // 'yes' or 'no'
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'OFFLINE'>(
    'OFFLINE'
  );
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [editAddressModalOpen, setEditAddressModalOpen] = useState(false);
  const [editAddressValue, setEditAddressValue] = useState('');
  const [updatingAddress, setUpdatingAddress] = useState(false);

  // Coin redemption state
  const [totalCoins, setTotalCoins] = useState<number>(0);
  const [useCoins, setUseCoins] = useState<boolean>(false);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [finalAmount, setFinalAmount] = useState<number>(0); // Will be updated when baseTotal is calculated
  const [validatingCoins, setValidatingCoins] = useState(false);
  const [coinsToRedeem, setCoinsToRedeem] = useState<number>(0);

  // Optional health info (existing medicines, health disorder)
  const [showExistingMedicines, setShowExistingMedicines] = useState(false);
  const [existingMedicines, setExistingMedicines] = useState('');
  const [showHealthDisorder, setShowHealthDisorder] = useState(false);
  const [healthDisorder, setHealthDisorder] = useState('');

  // Swanand health card - 20% discount applied by backend
  const [userHealthCard, setUserHealthCard] = useState<string | null>(null);

  // Check URL parameter for auto-enabling coin redemption
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const shouldUseCoins = searchParams.get('use_coins') === 'true';
      if (shouldUseCoins) {
        setUseCoins(true);
      }
    }
  }, []);

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
          setUserHealthCard(user.healthCard || null);
          if (user.address) {
            setAddress({
              id: user.id,
              label: 'Home',
              name: user.name,
              address: user.address,
              phone: user.phone || '',
            });
            setEditAddressValue(user.address);
          } else {
            // Initialize editAddressValue even when address is empty
            setEditAddressValue('');
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

        // Fetch coins balance
        try {
          const coinsResponse = await apiClient.get<{
            success: boolean;
            data: {
              totalCoins: number;
              canRedeem: boolean;
              maxRedeemable?: number;
            };
          }>('/patient/coins', { token });

          if (coinsResponse.data.success && coinsResponse.data.data) {
            setTotalCoins(coinsResponse.data.data.totalCoins || 0);
          }
        } catch (error) {
          console.error('Error fetching coins:', error);
          // Don't block checkout if coins fetch fails
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

  // Home sample collection charge (mandatory)
  const HOME_SAMPLE_CHARGE = 75;

  // Both cart and package: subtotal + home sample (mandatory) + hard copy when selected
  const baseTotal =
    effectiveSubtotal +
    HOME_SAMPLE_CHARGE +
    (hardcopyReport === 'yes' ? 100 : 0);

  // Swanand health card: 20% discount (applied by backend)
  const HEALTH_CARD_DISCOUNT_PERCENT = 20;
  const healthCardDiscount =
    userHealthCard ? Math.round(baseTotal * (HEALTH_CARD_DISCOUNT_PERCENT / 100)) : 0;
  const totalBeforeCoins = userHealthCard ? baseTotal - healthCardDiscount : baseTotal;

  // Apply coin discount if using coins; otherwise use base total (with health card discount if applicable)
  const total = useCoins && discountAmount > 0 ? finalAmount : totalBeforeCoins;

  // Validate coin redemption when useCoins is toggled or total changes
  // Use totalBeforeCoins so coins validate against the amount user actually pays (after health card discount)
  useEffect(() => {
    const validateCoinRedemption = async () => {
      if (!useCoins || totalCoins < 100) {
        setDiscountAmount(0);
        setFinalAmount(totalBeforeCoins);
        setCoinsToRedeem(0);
        return;
      }

      try {
        setValidatingCoins(true);
        const token = getAuthToken();
        if (!token) return;

        const response = await apiClient.post<{
          success: boolean;
          data: {
            discountAmount: number;
            finalAmount: number;
            coinsToRedeem: number;
            message?: string;
          };
        }>(
          '/patient/coins/validate-redemption',
          {
            bookingAmount: totalBeforeCoins,
            coinsToRedeem: totalCoins,
          },
          { token }
        );

        if (response.data.success && response.data.data) {
          setDiscountAmount(response.data.data.discountAmount || 0);
          setFinalAmount(response.data.data.finalAmount || totalBeforeCoins);
          setCoinsToRedeem(response.data.data.coinsToRedeem || 0);
        } else {
          setDiscountAmount(0);
          setFinalAmount(totalBeforeCoins);
          setCoinsToRedeem(0);
        }
      } catch (error: any) {
        console.error('Error validating coin redemption:', error);
        // If validation fails, disable coin usage
        setUseCoins(false);
        setDiscountAmount(0);
        setFinalAmount(totalBeforeCoins);
        setCoinsToRedeem(0);
        if (error?.message) {
          toast.error(error.message);
        }
      } finally {
        setValidatingCoins(false);
      }
    };

    validateCoinRedemption();
  }, [useCoins, baseTotal, totalBeforeCoins, totalCoins]);

  const handlePlaceOrder = async () => {
    // Validate required fields
    if (!address) {
      toast.error('Please add your address');
      return;
    }
    if (!selectedDate || !selectedSlot) {
      toast.error('Please select a date and time slot');
      return;
    }

    try {
      setPlacingOrder(true);

      // Prepare order data - use slotId if available, otherwise use slot details
      const orderData: {
        slotId?: string | null;
        centerId?: string;
        date?: string;
        startTime?: string;
        endTime?: string;
        paymentMethod: 'ONLINE' | 'OFFLINE';
        homeSampleCollection: boolean;
        hardCopyReport: boolean;
        coinsToRedeem?: number;
        existingMedicines?: string | null;
        healthDisorder?: string | null;
      } = {
        paymentMethod, // 'ONLINE' or 'OFFLINE'
        homeSampleCollection, // boolean
        hardCopyReport: hardcopyReport === 'yes',
      };

      // Add coins to redeem if user opted in
      if (useCoins && coinsToRedeem > 0) {
        orderData.coinsToRedeem = coinsToRedeem;
      }

      // Add optional health info if user provided
      if (showExistingMedicines && existingMedicines.trim()) {
        orderData.existingMedicines = existingMedicines.trim();
      }
      if (showHealthDisorder && healthDisorder.trim()) {
        orderData.healthDisorder = healthDisorder.trim();
      }

      // If slotId exists, use it; otherwise send slot details for dynamic slot creation
      if (selectedSlot.slotId) {
        orderData.slotId = selectedSlot.slotId;
      } else {
        // Send slot details for dynamically generated slots
        orderData.centerId = selectedSlot.center.id;
        orderData.date = selectedSlot.date;
        orderData.startTime = selectedSlot.startTime;
        orderData.endTime = selectedSlot.endTime;
      }

      await onPlaceOrder(orderData);
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

  const handleEditAddress = () => {
    // Set current address value or empty string if no address exists
    setEditAddressValue(address?.address || '');
    setEditAddressModalOpen(true);
  };

  const handleUpdateAddress = async () => {
    if (!editAddressValue.trim()) {
      toast.error('Address cannot be empty');
      return;
    }

    try {
      setUpdatingAddress(true);
      const token = getAuthToken();

      if (!token) {
        toast.error('Please login to update address');
        return;
      }

      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('address', editAddressValue.trim());

      const response = await apiClient.put<{
        success: boolean;
        data: {
          user: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            address: string | null;
          };
          message: string;
        };
      }>('/patient/profile', formData, {
        token,
      });

      if (response.data.success && response.data.data?.user) {
        const updatedUser = response.data.data.user;
        setAddress({
          id: updatedUser.id,
          label: 'Home',
          name: updatedUser.name,
          address: updatedUser.address || '',
          phone: updatedUser.phone || '',
        });
        setEditAddressModalOpen(false);
        toast.success(
          address
            ? 'Address updated successfully'
            : 'Address added successfully'
        );
      } else {
        toast.error('Failed to update address');
      }
    } catch (error: any) {
      console.error('Error updating address:', error);
      toast.error(
        error?.message || 'Failed to update address. Please try again.'
      );
    } finally {
      setUpdatingAddress(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          {onBackToCart && (
            <button
              onClick={onBackToCart}
              className="mb-4 inline-flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
              style={{ color: colors.primary }}
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </button>
          )}
          <h1
            className="text-3xl font-bold md:text-4xl text-center"
            style={{ color: colors.primary }}
          >
            {isPackagePurchase ? 'Package Checkout' : 'Checkout'}
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
                          onClick={handleEditAddress}
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
                  <div className="flex items-center justify-between p-4 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-600">
                      No address found. Please add your address.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditAddress}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Add Address
                    </Button>
                  </div>
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
                    Visit Charges
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Home Sample Collection - Mandatory */}
                  <div
                    className="flex items-start gap-3 p-4 rounded-lg"
                    style={{ backgroundColor: colors.primaryLight }}
                  >
                    <Home
                      className="h-5 w-5 mt-0.5"
                      style={{ color: colors.primary }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className="font-medium"
                            style={{ color: colors.black }}
                          >
                            Home Sample Collection
                            <span
                              className="ml-2 text-xs px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: colors.primary,
                                color: colors.white,
                              }}
                            >
                              Included
                            </span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Our phlebotomist will visit your location
                          </p>
                        </div>
                        <span className="font-semibold">₹75</span>
                      </div>
                    </div>
                  </div>

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

            {/* Health Information (optional) */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity
                    className="h-5 w-5"
                    style={{ color: colors.primary }}
                  />
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: colors.black }}
                  >
                    Health Information (optional)
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Existing medicines - label left, checkbox right; when checked show input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4 p-4 border rounded-lg">
                      <Label
                        htmlFor="existing_medicines_check"
                        className="flex-1 cursor-pointer text-sm font-medium"
                        style={{ color: colors.black }}
                      >
                        I am currently taking medicines
                      </Label>
                      <Checkbox
                        id="existing_medicines_check"
                        checked={showExistingMedicines}
                        onCheckedChange={(checked) => {
                          setShowExistingMedicines(checked === true);
                          if (checked !== true) setExistingMedicines('');
                        }}
                      />
                    </div>
                    {showExistingMedicines && (
                      <div className="pl-1">
                        <Input
                          id="existing_medicines_input"
                          placeholder="e.g. Metformin 500mg, Vitamin D"
                          value={existingMedicines}
                          onChange={(e) => setExistingMedicines(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Health disorder - label left, checkbox right; when checked show input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4 p-4 border rounded-lg">
                      <Label
                        htmlFor="health_disorder_check"
                        className="flex-1 cursor-pointer text-sm font-medium"
                        style={{ color: colors.black }}
                      >
                        I have a health disorder / condition
                      </Label>
                      <Checkbox
                        id="health_disorder_check"
                        checked={showHealthDisorder}
                        onCheckedChange={(checked) => {
                          setShowHealthDisorder(checked === true);
                          if (checked !== true) setHealthDisorder('');
                        }}
                      />
                    </div>
                    {showHealthDisorder && (
                      <div className="pl-1">
                        <Input
                          id="health_disorder_input"
                          placeholder="e.g. Type 2 Diabetes, Hypertension"
                          value={healthDisorder}
                          onChange={(e) => setHealthDisorder(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coin Redemption Section */}
            {totalCoins >= 100 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Coins
                      className="h-5 w-5"
                      style={{ color: colors.primary }}
                    />
                    <h2
                      className="text-lg font-semibold"
                      style={{ color: colors.black }}
                    >
                      Redeem Coins
                    </h2>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <Checkbox
                      id="use_coins"
                      checked={useCoins}
                      onCheckedChange={(checked) => {
                        setUseCoins(checked === true);
                      }}
                      disabled={validatingCoins}
                      className="mt-1"
                    />
                    <Label
                      htmlFor="use_coins"
                      className="flex-1 cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">Use coins for discount</p>
                          {validatingCoins && (
                            <span className="text-sm text-gray-500">
                              Validating...
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          You have {totalCoins.toLocaleString('en-IN')} coins
                          available
                        </p>
                        {useCoins && discountAmount > 0 && (
                          <div
                            className="mt-2 p-2 rounded"
                            style={{ backgroundColor: colors.lightestGreen }}
                          >
                            <p className="text-sm font-medium text-green-700">
                              Discount: ₹
                              {discountAmount.toLocaleString('en-IN')} (
                              {coinsToRedeem.toLocaleString('en-IN')} coins)
                            </p>
                          </div>
                        )}
                        {useCoins &&
                          discountAmount === 0 &&
                          !validatingCoins && (
                            <p className="text-sm text-red-600 mt-1">
                              Minimum 100 coins required for redemption
                            </p>
                          )}
                      </div>
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}

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
                    setPaymentMethod(value as 'ONLINE' | 'OFFLINE')
                  }
                >
                  <div className="space-y-4">
                    {/* Online Payment */}
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <RadioGroupItem value="ONLINE" id="online" />
                      <Label htmlFor="online" className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium mb-1">Online Payment</p>
                          <p className="text-sm text-gray-600">
                            Pay securely using PhonePe (UPI, Cards, Net Banking,
                            or Wallet)
                          </p>
                        </div>
                      </Label>
                    </div>
                    {/* Offline Payment */}
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <RadioGroupItem value="OFFLINE" id="offline" />
                      <Label
                        htmlFor="offline"
                        className="flex-1 cursor-pointer"
                      >
                        <div>
                          <p className="font-medium text-base mb-1">
                            Cash Payment to Phlebotomist
                          </p>
                          <p className="text-sm text-gray-600">
                            Pay cash to phlebotomist at the time of visit
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
                  {displayItems.map((item) => (
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
                    <span className="text-gray-600">
                      {isPackagePurchase ? 'Package Price' : 'Subtotal'}
                    </span>
                    <span className="font-medium">
                      ₹{effectiveSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Home Sample Collection
                    </span>
                    <span className="font-medium">₹75</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Hard Copy Report</span>
                    <span className="font-medium">
                      {hardcopyReport === 'yes' ? '₹100' : '₹0'}
                    </span>
                  </div>
                  {userHealthCard && healthCardDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Swanand Card discount (20%)
                      </span>
                      <span className="font-medium text-green-600">
                        -₹{healthCardDiscount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  {useCoins && discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Coin Discount</span>
                      <span className="font-medium text-green-600">
                        -₹{discountAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
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
                    placingOrder ||
                    !address ||
                    !selectedDate ||
                    !selectedSlot ||
                    !selectedSlot.center?.id ||
                    !selectedSlot.date ||
                    !selectedSlot.startTime ||
                    !selectedSlot.endTime
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

      {/* Edit Address Modal */}
      <Dialog
        open={editAddressModalOpen}
        onOpenChange={setEditAddressModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {address ? 'Edit Address' : 'Add Address'}
            </DialogTitle>
            <DialogDescription>
              {address
                ? 'Update your address for sample collection'
                : 'Add your address for sample collection'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="address" className="mb-2 block">
                Address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="address"
                value={editAddressValue}
                onChange={(e) => setEditAddressValue(e.target.value)}
                placeholder="Enter your complete address"
                rows={4}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditAddressModalOpen(false)}
              disabled={updatingAddress}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAddress}
              disabled={updatingAddress || !editAddressValue.trim()}
              style={{
                backgroundColor: colors.primary,
                color: colors.white,
              }}
            >
              {updatingAddress
                ? address
                  ? 'Updating...'
                  : 'Adding...'
                : address
                ? 'Update Address'
                : 'Add Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
