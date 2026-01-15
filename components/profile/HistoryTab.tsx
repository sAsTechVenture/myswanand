'use client';

import { useEffect, useState } from 'react';
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
import { apiClient } from '@/lib/api';
import { colors } from '@/config/theme';
import {
  Eye,
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  FileText,
  TestTube,
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
                            {order.payment && (
                              <p className="text-sm text-gray-600">
                                <CreditCard className="inline h-3 w-3 mr-1" />
                                Payment: ₹
                                {order.payment.amount.toLocaleString('en-IN')} (
                                {order.payment.status})
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className="text-lg font-bold mb-1"
                            style={{ color: colors.black }}
                          >
                            ₹{order.totalAmount.toLocaleString('en-IN')}
                          </p>
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
                              return (
                                <div
                                  key={test.id}
                                  className="flex items-center gap-3 p-2 rounded-lg border"
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
                                      className="text-sm font-medium truncate"
                                      style={{ color: colors.black }}
                                    >
                                      {test.name}
                                    </p>
                                    {test.category && (
                                      <p className="text-xs text-gray-500">
                                        {test.category.name}
                                      </p>
                                    )}
                                    <p
                                      className="text-xs font-semibold"
                                      style={{ color: colors.primary }}
                                    >
                                      ₹{test.price.toLocaleString('en-IN')}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Additional Info */}
                      <div className="border-t pt-3 flex items-center justify-between text-xs text-gray-600">
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          style={{ color: colors.primary }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
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
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>
                              <Calendar className="inline h-3 w-3 mr-1" />
                              {formatDate(testResult.createdAt)}
                            </span>
                            {testResult.reportUrl && (
                              <a
                                href={testResult.reportUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                                style={{ color: colors.primary }}
                              >
                                <FileText className="h-3 w-3" />
                                View Report
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-semibold mb-1"
                          style={{ color: colors.black }}
                        >
                          ₹{test.price.toLocaleString('en-IN')}
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
