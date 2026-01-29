'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { colors } from '@/config/theme';
import { toast } from '@/lib/toast';
import {
  Eye,
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  FileText,
  TestTube,
  Trash2,
  CalendarClock,
} from 'lucide-react';
import { getAuthToken } from '@/lib/utils/auth';

// Types matching API response
interface Test {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
  } | null;
}

interface Order {
  id: string;
  type: string;
  status: string;
  dateTime: string;
  isPriority: boolean;
  additionalService: string;
  hardCopyReport: boolean;
  slot: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    center: {
      id: string;
      name: string;
      address: string;
    } | null;
  } | null;
  payment: {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  } | null;
  tests: Test[];
  testCount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface TestResult {
  id: string;
  test: Test;
  reportUrl: string | null;
  locationId: string | null;
  healthId: string | null;
  hasReport: boolean;
  createdAt: string;
  updatedAt: string;
}

interface HistoryResponse {
  success: boolean;
  data: {
    orders: Order[];
    tests: TestResult[];
    summary: {
      totalOrders: number;
      totalTestResults: number;
      totalItems: number;
    };
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      limit: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// Available slots for reschedule (matches booking API)
interface AvailableSlot {
  slotId: string | null;
  center: { id: string; name: string; address: string };
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
    isCancerPatient?: boolean;
  };
}

interface HistoryTabProps {
  isActive?: boolean;
}

export function HistoryTab({ isActive = false }: HistoryTabProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalTestResults: 0,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false,
  });

  // Cancel booking
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Reschedule booking
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [orderToReschedule, setOrderToReschedule] = useState<Order | null>(
    null
  );
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlotForReschedule, setSelectedSlotForReschedule] =
    useState<AvailableSlot | null>(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  useEffect(() => {
    if (
      isActive &&
      orders.length === 0 &&
      testResults.length === 0 &&
      !loading
    ) {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const fetchHistory = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();

      if (!token) {
        setError('Please login to view history');
        return;
      }

      const response = await apiClient.get<HistoryResponse>(
        `/patient/history?page=${page}&limit=10`,
        { token }
      );

      if (response.data.success && response.data.data) {
        const {
          orders: ordersData,
          tests: testsData,
          summary: summaryData,
          pagination: paginationData,
        } = response.data.data;

        setOrders(ordersData);
        setTestResults(testsData);
        setSummary(summaryData);
        setPagination({
          currentPage: paginationData.currentPage,
          totalPages: paginationData.totalPages,
          totalItems: paginationData.totalItems,
          limit: paginationData.limit,
          hasNext: paginationData.hasNext,
          hasPrev: paginationData.hasPrev,
        });
      } else {
        setError('Failed to load history');
      }
    } catch (err: any) {
      console.error('History fetch error:', err);
      setError('Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchHistory(newPage);
    }
  };

  const canCancelOrReschedule = (order: Order): boolean => {
    const status = (order.status || '').toUpperCase();
    return status === 'PENDING' || status === 'CONFIRMED';
  };

  const handleCancelClick = (order: Order) => {
    if (!canCancelOrReschedule(order)) return;
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = useCallback(async () => {
    if (!orderToCancel) return;
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login to continue');
      return;
    }
    try {
      setCancelling(true);
      const response = await apiClient.delete<{
        success?: boolean;
        message?: string;
        data?: { booking: Order };
        booking?: Order;
      }>(`/patient/bookings/${orderToCancel.id}`, { token });

      const data = response.data as any;
      const updatedBooking = data?.booking ?? data?.data?.booking;
      if (updatedBooking) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderToCancel.id
              ? { ...o, ...updatedBooking, status: 'CANCELLED' }
              : o
          )
        );
      } else {
        await fetchHistory(pagination.currentPage);
      }
      setCancelDialogOpen(false);
      setOrderToCancel(null);
      toast.success(data?.message ?? 'Booking cancelled successfully');
    } catch (err: any) {
      console.error('Cancel booking error:', err);
      const message =
        err?.message ||
        err?.data?.message ||
        'Only pending or confirmed bookings can be cancelled. Please try again.';
      toast.error(message);
    } finally {
      setCancelling(false);
    }
  }, [orderToCancel, pagination.currentPage]);

  const handleRescheduleClick = (order: Order) => {
    if (!canCancelOrReschedule(order) || !order.slot?.center?.id) return;
    setOrderToReschedule(order);
    setSelectedSlotForReschedule(null);
    setRescheduleError(null);
    setRescheduleDialogOpen(true);
  };

  const loadAvailableSlots = useCallback(async () => {
    if (!orderToReschedule?.slot?.center?.id) return;
    const token = getAuthToken();
    if (!token) return;
    const centerId = orderToReschedule.slot.center.id;
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 14);
    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];

    try {
      setSlotsLoading(true);
      setRescheduleError(null);
      const response = await apiClient.get<AvailableSlotsResponse>(
        `/patient/bookings/available-slots?centerId=${encodeURIComponent(centerId)}&startDate=${startDate}&endDate=${endDate}`,
        { token }
      );
      if (response.data.success && response.data.data?.availableSlots) {
        const raw = response.data.data.availableSlots;
        const slots = Array.isArray(raw) ? raw : [];
        const filtered = slots.filter(
          (s) =>
            s.center?.id === centerId &&
            s.date >= startDate &&
            s.date <= endDate
        );
        setAvailableSlots(filtered);
        if (filtered.length === 0) {
          setRescheduleError(
            'No slots available for this center in the next 14 days.'
          );
        }
      } else {
        setAvailableSlots([]);
        setRescheduleError('No slots available for this center.');
      }
    } catch (err: any) {
      console.error('Load available slots error:', err);
      setAvailableSlots([]);
      setRescheduleError(
        err?.message ?? 'Failed to load available slots. Please try again.'
      );
    } finally {
      setSlotsLoading(false);
    }
  }, [orderToReschedule?.slot?.center?.id]);

  useEffect(() => {
    if (rescheduleDialogOpen && orderToReschedule?.slot?.center?.id) {
      loadAvailableSlots();
    }
  }, [
    rescheduleDialogOpen,
    orderToReschedule?.slot?.center?.id,
    loadAvailableSlots,
  ]);

  const handleRescheduleConfirm = useCallback(async () => {
    if (!orderToReschedule || !selectedSlotForReschedule) {
      toast.error('Please select a new date and time slot');
      return;
    }
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login to continue');
      return;
    }
    try {
      setRescheduling(true);
      setRescheduleError(null);
      const body: {
        slotId?: string;
        centerId?: string;
        date?: string;
        startTime?: string;
        endTime?: string;
      } = selectedSlotForReschedule.slotId
        ? { slotId: selectedSlotForReschedule.slotId }
        : {
            centerId: selectedSlotForReschedule.center.id,
            date: selectedSlotForReschedule.date,
            startTime: selectedSlotForReschedule.startTime,
            endTime: selectedSlotForReschedule.endTime,
          };

      const response = await apiClient.patch<{
        success?: boolean;
        message?: string;
        data?: { booking: Order };
        booking?: Order;
      }>(`/patient/bookings/${orderToReschedule.id}`, body, { token });

      const data = response.data as any;
      const updatedBooking = data?.booking ?? data?.data?.booking;
      if (updatedBooking) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderToReschedule.id ? { ...o, ...updatedBooking } : o
          )
        );
      } else {
        await fetchHistory(pagination.currentPage);
      }
      setRescheduleDialogOpen(false);
      setOrderToReschedule(null);
      setSelectedSlotForReschedule(null);
      toast.success(data?.message ?? 'Booking rescheduled successfully');
    } catch (err: any) {
      console.error('Reschedule booking error:', err);
      const message =
        err?.message ||
        err?.data?.message ||
        'Failed to reschedule. Slot may be full or booking is no longer eligible. Please try again.';
      setRescheduleError(message);
      toast.error(message);
    } finally {
      setRescheduling(false);
    }
  }, [orderToReschedule, selectedSlotForReschedule, pagination.currentPage]);

  // Format date and time
  const formatDateTime = (dateTime: string): string => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'CONFIRMED':
        return colors.green;
      case 'PENDING':
        return colors.yellow;
      case 'CANCELLED':
      case 'FAILED':
        return '#ef4444';
      default:
        return colors.primary;
    }
  };

  // Get additional service label
  const getAdditionalServiceLabel = (service: string): string => {
    switch (service) {
      case 'HOME_SAMPLE_COLLECTION':
        return 'Home Sample Collection';
      case 'VISIT_LAB_CENTER':
        return 'Visit Lab Center';
      case 'NOT_REQUIRED':
        return 'Not Required';
      default:
        return service;
    }
  };

  // Process image URL
  const getImageUrl = (imageUrl: string | null | undefined): string => {
    if (!imageUrl) return '';
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

  // Process report URL - construct full URL from relative path
  // Report URLs from API are like: /api/files/test-result/...
  // Base URL might be: http://server:port/api or http://server:port
  const getReportUrl = (
    reportUrl: string | null | undefined
  ): string | null => {
    if (!reportUrl) return null;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    if (reportUrl.startsWith('http')) return reportUrl;
    if (reportUrl.startsWith('/')) {
      // If reportUrl starts with /api, we need to avoid double /api
      if (reportUrl.startsWith('/api')) {
        // Remove trailing slash from baseUrl if present
        let cleanBaseUrl = baseUrl.endsWith('/')
          ? baseUrl.slice(0, -1)
          : baseUrl;
        // If baseUrl ends with /api, remove it to avoid double /api
        if (cleanBaseUrl.endsWith('/api')) {
          cleanBaseUrl = cleanBaseUrl.replace(/\/api$/, '');
        }
        return `${cleanBaseUrl}${reportUrl}`;
      }
      // If reportUrl doesn't start with /api, handle like image URL
      let urlToUse = baseUrl;
      if (baseUrl.endsWith('/api')) {
        urlToUse = baseUrl.replace(/\/api$/, '');
      }
      return `${urlToUse}${reportUrl}`;
    }
    return reportUrl;
  };

  // Create a map of test results by test.id for quick lookup
  const testResultsMap = new Map<string, TestResult>();
  testResults.forEach((testResult) => {
    testResultsMap.set(testResult.test.id, testResult);
  });

  if (loading && orders.length === 0 && testResults.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: colors.black }}>
          Order & Test History
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-32 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && orders.length === 0 && testResults.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: colors.black }}>
          Order & Test History
        </h3>
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => fetchHistory(1)}
            style={{
              backgroundColor: colors.primary,
              color: colors.white,
            }}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  // Combine and sort by date (most recent first)
  const allItems = [
    ...orders.map((order) => ({
      type: 'order' as const,
      data: order,
      date: order.dateTime,
    })),
    ...testResults.map((test) => ({
      type: 'test' as const,
      data: test,
      date: test.createdAt,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold" style={{ color: colors.black }}>
          Order & Test History
        </h3>
        {summary.totalItems > 0 && (
          <div className="text-sm text-gray-600">
            {summary.totalOrders} Orders • {summary.totalTestResults} Test
            Results
          </div>
        )}
      </div>

      <div className="space-y-4">
        {allItems.length === 0 && !loading ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No history found</p>
          </Card>
        ) : (
          allItems.map((item) => {
            if (item.type === 'order') {
              const order = item.data as Order;
              return (
                <Card key={order.id} className="p-4">
                  <CardContent className="p-0">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge
                              className="text-xs"
                              style={{
                                backgroundColor: colors.primary,
                                color: colors.white,
                              }}
                            >
                              Booking
                            </Badge>
                            <Badge
                              className="text-xs"
                              style={{
                                backgroundColor: getStatusColor(order.status),
                                color: colors.white,
                              }}
                            >
                              {order.status}
                            </Badge>
                            {order.isPriority && (
                              <Badge
                                className="text-xs"
                                style={{
                                  backgroundColor: colors.green,
                                  color: colors.white,
                                }}
                              >
                                Priority
                              </Badge>
                            )}
                            {order.type && (
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: colors.primary,
                                  color: colors.primary,
                                }}
                              >
                                {order.type}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <Calendar className="inline h-3 w-3 mr-1" />
                              {formatDateTime(order.dateTime)}
                            </p>
                            {order.slot?.center && (
                              <p className="text-sm text-gray-600">
                                <MapPin className="inline h-3 w-3 mr-1" />
                                {order.slot.center.name} -{' '}
                                {order.slot.center.address}
                              </p>
                            )}
                            {order.slot && (
                              <p className="text-sm text-gray-600">
                                <Clock className="inline h-3 w-3 mr-1" />
                                {formatTime(order.slot.startTime)} -{' '}
                                {formatTime(order.slot.endTime)}
                              </p>
                            )}
                            {order.payment ? (
                              <div className="space-y-1">
                                <p className="text-sm text-gray-600 font-bold">
                                  <CreditCard className="inline h-3 w-3 mr-1" />
                                  Total Test Prices: ₹
                                  {order.tests
                                    .reduce(
                                      (sum, test) => sum + (test.price || 0),
                                      0
                                    )
                                    .toLocaleString('en-IN')}
                                </p>
                                {/* Payment Breakdown */}
                                <div className="ml-4 space-y-0.5 text-xs text-gray-500">
                                  {order.additionalService ===
                                    'HOME_SAMPLE_COLLECTION' && (
                                    <p>
                                      Home Sample Collection: +₹
                                      {200}
                                    </p>
                                  )}
                                  {order.hardCopyReport && (
                                    <p>
                                      Hard Copy Report: +₹
                                      {100}
                                    </p>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">
                                  Payment Status: {order.payment.status}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600 font-bold">
                                <CreditCard className="inline h-3 w-3 mr-1" />
                                Total: ₹
                                {order.tests
                                  .reduce(
                                    (sum, test) => sum + (test.price || 0),
                                    0
                                  )
                                  .toLocaleString('en-IN')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {order.payment ? (
                            <p
                              className="text-lg font-bold mb-1"
                              style={{ color: colors.black }}
                            >
                              ₹{order.payment.amount.toLocaleString('en-IN')}
                            </p>
                          ) : (
                            <p
                              className="text-lg font-bold mb-1"
                              style={{ color: colors.black }}
                            >
                              ₹
                              {order.tests
                                .reduce(
                                  (sum, test) => sum + (test.price || 0),
                                  0
                                )
                                .toLocaleString('en-IN')}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {order.testCount}{' '}
                            {order.testCount === 1 ? 'test' : 'tests'}
                          </p>
                        </div>
                      </div>

                      {/* Tests List */}
                      {order.tests.length > 0 && (
                        <div className="border-t pt-4">
                          <p
                            className="text-sm font-semibold mb-2"
                            style={{ color: colors.black }}
                          >
                            Tests ({order.tests.length}):
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {order.tests.map((test) => {
                              const testImageUrl = getImageUrl(test.imageUrl);
                              const testResult = testResultsMap.get(test.id);
                              const reportUrl = testResult
                                ? getReportUrl(testResult.reportUrl)
                                : null;
                              const hasReport = testResult?.hasReport || false;

                              return (
                                <div
                                  key={test.id}
                                  className="flex items-start gap-3 p-3 rounded-lg border"
                                >
                                  {testImageUrl ? (
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                                      <Image
                                        src={testImageUrl}
                                        alt={test.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                      />
                                    </div>
                                  ) : (
                                    <div
                                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                                      style={{
                                        backgroundColor: colors.primaryLight,
                                      }}
                                    >
                                      <TestTube
                                        className="h-6 w-6"
                                        style={{ color: colors.primary }}
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className="text-sm font-medium truncate mb-1"
                                      style={{ color: colors.black }}
                                    >
                                      {test.name}
                                    </p>
                                    {test.category && (
                                      <p className="text-xs text-gray-500 mb-1">
                                        {test.category.name}
                                      </p>
                                    )}
                                    <p
                                      className="text-xs font-semibold mb-2"
                                      style={{ color: colors.primary }}
                                    >
                                      ₹
                                      {(test.price ?? 0).toLocaleString(
                                        'en-IN'
                                      )}
                                    </p>
                                    {hasReport && reportUrl && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-xs h-7"
                                        onClick={() => {
                                          window.open(
                                            reportUrl,
                                            '_blank',
                                            'noopener,noreferrer'
                                          );
                                        }}
                                        style={{
                                          borderColor: colors.primary,
                                          color: colors.primary,
                                        }}
                                      >
                                        <FileText className="h-3 w-3 mr-1" />
                                        View Report
                                      </Button>
                                    )}
                                    {!hasReport && (
                                      <p className="text-xs text-gray-400">
                                        Report pending
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Additional Info + Cancel / Reschedule */}
                      <div className="border-t pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-4">
                          <span>
                            Service:{' '}
                            {getAdditionalServiceLabel(order.additionalService)}
                          </span>
                          {order.hardCopyReport && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Hard Copy Report
                            </span>
                          )}
                        </div>
                        {canCancelOrReschedule(order) && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => handleRescheduleClick(order)}
                              disabled={!order.slot?.center?.id}
                              style={{
                                borderColor: colors.primary,
                                color: colors.primary,
                              }}
                              title={
                                !order.slot?.center?.id
                                  ? 'Reschedule not available for this booking'
                                  : 'Reschedule'
                              }
                            >
                              <CalendarClock className="w-3.5 h-3.5 mr-1" />
                              Reschedule
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => handleCancelClick(order)}
                              style={{
                                borderColor: '#ef4444',
                                color: '#ef4444',
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            } else {
              const testResult = item.data as TestResult;
              const test = testResult.test;
              const testImageUrl = getImageUrl(test.imageUrl);
              return (
                <Card key={testResult.id} className="p-4">
                  <CardContent className="p-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {testImageUrl ? (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={testImageUrl}
                              alt={test.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div
                            className="w-16 h-16 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: colors.primaryLight }}
                          >
                            <TestTube
                              className="h-8 w-8"
                              style={{ color: colors.primary }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge
                              className="text-xs"
                              style={{
                                backgroundColor: colors.lightestGreen,
                                color: colors.green,
                              }}
                            >
                              Test Result
                            </Badge>
                            {test.category && (
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: colors.primary,
                                  color: colors.primary,
                                }}
                              >
                                {test.category.name}
                              </Badge>
                            )}
                          </div>
                          <h4
                            className="font-semibold mb-1"
                            style={{ color: colors.black }}
                          >
                            {test.name}
                          </h4>
                          {test.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {test.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                            <span>
                              <Calendar className="inline h-3 w-3 mr-1" />
                              {formatDate(testResult.createdAt)}
                            </span>
                          </div>
                          {testResult.hasReport && testResult.reportUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                const fullReportUrl = getReportUrl(
                                  testResult.reportUrl
                                );
                                if (fullReportUrl) {
                                  window.open(
                                    fullReportUrl,
                                    '_blank',
                                    'noopener,noreferrer'
                                  );
                                }
                              }}
                              style={{
                                borderColor: colors.primary,
                                color: colors.primary,
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View/Download Report
                            </Button>
                          )}
                          {!testResult.hasReport && (
                            <p className="text-xs text-gray-500 mt-2">
                              Report not available yet
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-semibold mb-1"
                          style={{ color: colors.black }}
                        >
                          ₹{(test.price ?? 0).toLocaleString('en-IN')}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          style={{ color: colors.primary }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
          })
        )}
      </div>

      {/* Cancel booking confirmation dialog */}
      <Dialog
        open={cancelDialogOpen}
        onOpenChange={(open) => !cancelling && setCancelDialogOpen(open)}
      >
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => cancelling && e.preventDefault()}
          onEscapeKeyDown={(e) => cancelling && e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Cancel booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => !cancelling && setCancelDialogOpen(false)}
              disabled={cancelling}
            >
              Keep booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Yes, cancel booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule booking dialog */}
      <Dialog
        open={rescheduleDialogOpen}
        onOpenChange={(open) => {
          if (!rescheduling && !slotsLoading) {
            setRescheduleDialogOpen(open);
            if (!open) {
              setOrderToReschedule(null);
              setSelectedSlotForReschedule(null);
              setRescheduleError(null);
              setAvailableSlots([]);
            }
          }
        }}
      >
        <DialogContent
          className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
          onPointerDownOutside={(e) =>
            (rescheduling || slotsLoading) && e.preventDefault()
          }
          onEscapeKeyDown={(e) =>
            (rescheduling || slotsLoading) && e.preventDefault()
          }
        >
          <DialogHeader>
            <DialogTitle>Reschedule booking</DialogTitle>
            <DialogDescription>
              Choose a new date and time slot for your booking.
              {orderToReschedule?.slot?.center?.name && (
                <span className="block mt-1 font-medium text-foreground">
                  Center: {orderToReschedule.slot.center.name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {slotsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Skeleton className="h-24 w-full" />
                <p className="text-sm text-gray-500 mt-2">
                  Loading available slots...
                </p>
              </div>
            ) : rescheduleError && availableSlots.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-sm text-red-600">{rescheduleError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={loadAvailableSlots}
                  disabled={slotsLoading}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <Label className="text-sm font-medium">Select new slot</Label>
                <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
                  {availableSlots.length === 0 && !slotsLoading && (
                    <p className="text-sm text-gray-500 py-4 text-center">
                      No slots available in the next 14 days.
                    </p>
                  )}
                  {availableSlots.map((slot) => {
                    const isSelected =
                      selectedSlotForReschedule?.date === slot.date &&
                      selectedSlotForReschedule?.startTime === slot.startTime &&
                      selectedSlotForReschedule?.center?.id === slot.center?.id;
                    return (
                      <button
                        key={`${slot.center.id}-${slot.date}-${slot.startTime}`}
                        type="button"
                        onClick={() => setSelectedSlotForReschedule(slot)}
                        className={`flex items-center justify-between gap-2 p-3 rounded-lg border text-left transition-colors ${
                          isSelected
                            ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={
                          isSelected
                            ? {
                                borderColor: colors.primary,
                                backgroundColor: `${colors.primary}15`,
                              }
                            : {}
                        }
                      >
                        <span className="text-sm font-medium">
                          {formatDate(slot.date)} • {formatTime(slot.startTime)}{' '}
                          – {formatTime(slot.endTime)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {slot.center.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {rescheduleError && availableSlots.length > 0 && (
                  <p className="text-sm text-red-600">{rescheduleError}</p>
                )}
              </>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                if (!rescheduling && !slotsLoading) {
                  setRescheduleDialogOpen(false);
                  setOrderToReschedule(null);
                  setSelectedSlotForReschedule(null);
                  setRescheduleError(null);
                }
              }}
              disabled={rescheduling || slotsLoading}
            >
              Close
            </Button>
            <Button
              onClick={handleRescheduleConfirm}
              disabled={
                !selectedSlotForReschedule || rescheduling || slotsLoading
              }
              style={{ backgroundColor: colors.primary, color: colors.white }}
            >
              {rescheduling ? 'Rescheduling...' : 'Confirm reschedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.hasPrev) {
                      handlePageChange(pagination.currentPage - 1);
                    }
                  }}
                  className={
                    !pagination.hasPrev
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pageNum);
                    }}
                    isActive={pageNum === pagination.currentPage}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.hasNext) {
                      handlePageChange(pagination.currentPage + 1);
                    }
                  }}
                  className={
                    !pagination.hasNext
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
