'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowLeft, GraduationCap, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { colors } from '@/config/theme';
import { apiClient } from '@/lib/api';
import { getAuthToken, isAuthenticated } from '@/lib/utils/auth';
import { toast } from '@/lib/toast';
import Image from 'next/image';

interface Consultant {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string | null;
  type: 'DOCTOR' | 'DIETITIAN';
  gender: 'MALE' | 'FEMALE' | 'OTHERS';
  address: string | null;
  consultationCount: number;
}

interface AvailableSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  availableCount: number;
  consultationType?: 'VIDEO' | 'PHONE' | 'CHAT';
}

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

function DoctorConsultationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Consultant | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20,
    hasNext: false,
    hasPrev: false,
  });

  // Get query params from URL
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';

  // Sync URL params to state
  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      const urlSearch = searchParams.get('search') || '';
      if (searchQuery !== urlSearch) {
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery.trim()) {
          params.set('search', searchQuery.trim());
        } else {
          params.delete('search');
        }
        params.set('page', '1');
        router.push(`/doctor-consultation?${params.toString()}`);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, searchParams, router]);

  // Fetch doctors
  useEffect(() => {
    async function fetchDoctors() {
      try {
        setLoading(true);
        const params: Record<string, string | number> = {
          type: 'DOCTOR',
          page: page,
          limit: 20,
        };

        if (search) {
          params.search = search;
        }

        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          queryParams.append(key, value.toString());
        });
        const queryString = queryParams.toString();
        const url = `/patient/consultants/doctors${queryString ? `?${queryString}` : ''}`;

        const response = await apiClient.get<{
          success: boolean;
          data: {
            data: Consultant[];
            pagination: PaginationMeta;
          };
        }>(url);

        if (response.data.success && response.data.data) {
          setDoctors(response.data.data.data || []);
          setPagination(response.data.data.pagination);
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
        toast.error('Failed to load doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchDoctors();
  }, [page, search]);

  // Fetch available slots only when doctor is selected
  useEffect(() => {
    if (!selectedDoctor) {
      setAvailableSlots([]);
      setSelectedTimeSlot('');
      return;
    }

    async function fetchSlots() {
      if (!selectedDoctor) return;
      
      try {
        setLoadingSlots(true);
        const params = new URLSearchParams({
          consultantId: selectedDoctor.id,
        });

        const response = await apiClient.get<{
          success: boolean;
          data: {
            slots?: AvailableSlot[];
            data?: AvailableSlot[];
            pagination?: PaginationMeta;
          };
        }>(`/patient/consultations/available-slots?${params.toString()}`);

        if (response.data.success && response.data.data) {
          setAvailableSlots(response.data.data.slots || response.data.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching slots:', err);
        toast.error('Failed to load available time slots.');
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [selectedDoctor]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if it's tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    // Otherwise format as "Mon, Jan 12"
    const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });
    const monthDay = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    return `${dayName}, ${monthDay}`;
  };

  // Group slots by date
  const groupedSlots = availableSlots.reduce((acc, slot) => {
    const dateKey = slot.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(slot);
    return acc;
  }, {} as Record<string, AvailableSlot[]>);

  // Process image URL
  const getImageUrl = (imageUrl: string | null): string | null => {
    if (!imageUrl) return null;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) {
      let urlToUse = baseUrl;
      if (baseUrl.endsWith('/api') && imageUrl.startsWith('/api')) {
        urlToUse = baseUrl.replace(/\/api$/, '');
      }
      return `${urlToUse}${imageUrl}`;
    }
    return imageUrl;
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedTimeSlot) {
      toast.error('Please select a doctor and time slot.');
      return;
    }

    if (!isAuthenticated()) {
      router.push('/auth/login?redirect=/doctor-consultation');
      return;
    }

    try {
      setBooking(true);
      setBookingError(null);
      const token = getAuthToken();

      const slot = availableSlots.find(s => s.id === selectedTimeSlot);
      if (!slot) {
        throw new Error('Selected time slot not found');
      }

      const response = await apiClient.post<{
        success: boolean;
        data: {
          message: string;
          consultation: {
            id: string;
          };
        };
      }>(
        '/patient/consultations/book',
        {
          slotId: slot.id,
        },
        { token }
      );

      if (response.data.success) {
        setBookingSuccess(true);
        toast.success(response.data.data?.message || 'Appointment booked successfully!');
        // Reset form
        setTimeout(() => {
          setSelectedDoctor(null);
          setSelectedTimeSlot('');
          setAvailableSlots([]);
          setBookingSuccess(false);
        }, 3000);
      }
    } catch (err: any) {
      console.error('Error booking appointment:', err);
      const errorMsg = err?.data?.message || err?.message || 'Failed to book appointment. Please try again.';
      setBookingError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setBooking(false);
    }
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="ghost"
              className="mb-4"
              style={{ color: colors.primary }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1
            className="text-3xl md:text-4xl font-bold text-center"
            style={{ color: colors.primary }}
          >
            Doctor Consultation
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Doctor List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <Card className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search Doctor By Name and Specialty"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  style={{ borderColor: colors.primary }}
                />
              </div>
            </Card>

            {/* Doctor Cards */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-32 w-full" />
                  </Card>
                ))}
              </div>
            ) : doctors.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-600">No doctors found</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {doctors.map((doctor) => {
                  const imageUrl = getImageUrl(doctor.profileImage);
                  const isSelected = selectedDoctor?.id === doctor.id;

                  return (
                    <Card
                      key={doctor.id}
                      className={`p-4 cursor-pointer transition-all ${
                        isSelected ? 'ring-2' : ''
                      }`}
                      style={{
                        borderColor: isSelected ? colors.primary : colors.primaryLight,
                        borderWidth: '1px',
                      }}
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setSelectedTimeSlot('');
                        setAvailableSlots([]);
                      }}
                    >
                      <div className="flex gap-4">
                        {/* Profile Image */}
                        <div className="relative w-24 h-24 rounded-full overflow-hidden shrink-0">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={doctor.name}
                              fill
                              className="object-cover"
                              sizes="96px"
                              unoptimized
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ backgroundColor: colors.primaryLight }}
                            >
                              <GraduationCap
                                className="w-12 h-12"
                                style={{ color: colors.primary }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Doctor Info */}
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-xl font-bold mb-1"
                            style={{ color: colors.black }}
                          >
                            {doctor.name}
                          </h3>
                          <p
                            className="text-sm mb-2"
                            style={{ color: colors.primary }}
                          >
                            General Physician
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            MBBS, MD
                          </p>
                          <p className="text-sm text-gray-600 mb-3">
                            Specialist in internal medicine with extensive experience in managing chronic diseases.
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <GraduationCap className="w-4 h-4" />
                              <span>15 years experience</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              <span>English, Hindi, Marathi</span>
                            </div>
                          </div>
                          <div className="border-t pt-3 mt-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Consultation Fee</p>
                              <p
                                className="text-lg font-bold"
                                style={{ color: colors.primary }}
                              >
                                ₹500
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Next Available</p>
                              <p
                                className="text-lg font-bold"
                                style={{ color: colors.primary }}
                              >
                                10:00 AM
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column - Booking Panel */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: colors.black }}
              >
                Book Appointment
              </h2>

              {/* Time Slot Selection */}
              <div className="mb-6">
                <Label className="mb-3 block" style={{ color: colors.black }}>
                  Select Time Slot <span className="text-red-500">*</span>
                </Label>
                {loadingSlots ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {!selectedDoctor
                      ? 'Please select a doctor first'
                      : 'No slots available'}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedSlots).map(([date, slots]) => (
                      <div key={date}>
                        <p className="text-sm font-medium mb-2" style={{ color: colors.black }}>
                          {formatDate(date)}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {slots.map((slot) => (
                            <Button
                              key={slot.id}
                              variant={selectedTimeSlot === slot.id ? 'default' : 'outline'}
                              onClick={() => setSelectedTimeSlot(slot.id)}
                              style={
                                selectedTimeSlot === slot.id
                                  ? {
                                      backgroundColor: colors.primary,
                                      color: colors.white,
                                    }
                                  : {
                                      borderColor: '#E5E7EB',
                                      color: '#6B7280',
                                    }
                              }
                            >
                              {formatTime(slot.startTime)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Book Button */}
              <Button
                className="w-full mb-3"
                onClick={handleBookAppointment}
                disabled={!selectedDoctor || !selectedTimeSlot || booking}
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                }}
              >
                {booking ? 'Booking...' : 'Book Appointment'}
              </Button>

              {/* Success Message */}
              {bookingSuccess && (
                <div
                  className="p-3 rounded mb-3 text-sm"
                  style={{ backgroundColor: colors.lightestGreen, color: colors.green }}
                >
                  Appointment booked successfully! You will receive a confirmation via SMS.
                </div>
              )}

              {/* Error Message */}
              {bookingError && (
                <div
                  className="p-3 rounded mb-3 text-sm"
                  style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                >
                  {bookingError}
                </div>
              )}

              <p className="text-xs text-gray-600 text-center">
                You will receive a confirmation via SMS
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorConsultationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-12 w-32 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      }
    >
      <DoctorConsultationContent />
    </Suspense>
  );
}
