'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { colors } from '@/config/theme';
import { Activity, Calendar } from 'lucide-react';
import { getAuthToken } from '@/lib/utils/auth';

// Matches DiabetesRecord from API
interface DiabetesRecord {
  id: string;
  userId: string;
  date: string;
  weight: number | null;
  bp: string | null;
  fastingBloodSugar: number | null;
  postLunchSugar: number | null;
  hba1c: number | null;
  serumCreatinine: number | null;
  createdAt: string;
  updatedAt: string;
}

// API returns { success, data: DiabetesRecord[], pagination }
interface DiabetesRecordsResponse {
  success: boolean;
  data: DiabetesRecord[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

interface BloodSugarTrackingTabProps {
  isActive?: boolean;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatValue(
  value: number | string | null | undefined,
  unit = ''
): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number' && isNaN(value)) return '—';
  return `${value}${unit ? ` ${unit}` : ''}`;
}

export function BloodSugarTrackingTab({
  isActive = false,
}: BloodSugarTrackingTabProps) {
  const [records, setRecords] = useState<DiabetesRecord[]>([]);
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
  const [dateFrom, setDateFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  // Today in YYYY-MM-DD — max for date inputs (no future dates)
  const todayStr = new Date().toISOString().split('T')[0];

  const fetchRecords = async (page: number = 1) => {
    const token = getAuthToken();
    if (!token) {
      setError('Please login to view your records');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        dateFrom,
        dateTo,
      });
      const response = await apiClient.get<DiabetesRecordsResponse>(
        `/patient/diabetes-records?${params.toString()}`,
        { token }
      );
      const raw = response.data as any;
      // API returns { success, data: [...], pagination }; handle raw being the array or raw.data
      let list: DiabetesRecord[] = [];
      if (Array.isArray(raw)) {
        list = raw;
      } else if (Array.isArray(raw?.data)) {
        list = raw.data;
      } else if (Array.isArray(raw?.records)) {
        list = raw.records;
      } else if (Array.isArray(raw?.diabetesRecords)) {
        list = raw.diabetesRecords;
      }
      setRecords(list);
      const pag = raw?.pagination ?? (response as any).pagination;
      if (pag) {
        setPagination({
          currentPage: pag.currentPage ?? page,
          totalPages: pag.totalPages ?? 0,
          totalItems: pag.totalItems ?? 0,
          limit: pag.limit ?? 10,
          hasNext: pag.hasNext ?? false,
          hasPrev: pag.hasPrev ?? false,
        });
      }
    } catch (err: any) {
      console.error('Diabetes records fetch error:', err);
      setRecords([]);
      setError(err?.message ?? 'Failed to load records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      fetchRecords(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchRecords(newPage);
    }
  };

  const handleApplyDateFilter = () => {
    fetchRecords(1);
  };

  if (!isActive) {
    return null;
  }

  if (loading && records.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: colors.black }}>
          Blood Sugar Tracking
        </h3>
        <Card className="p-6 mb-4">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-full" />
        </Card>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && records.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: colors.black }}>
          Blood Sugar Tracking
        </h3>
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => fetchRecords(1)}
            style={{ backgroundColor: colors.primary, color: colors.white }}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const tableHeaders = [
    { key: 'date', label: 'Date' },
    { key: 'weight', label: 'Weight (kg)' },
    { key: 'bp', label: 'BP' },
    { key: 'fastingBloodSugar', label: 'Fasting (mg/dL)' },
    { key: 'postLunchSugar', label: 'Post Lunch (mg/dL)' },
    { key: 'hba1c', label: 'HbA1c (%)' },
    { key: 'serumCreatinine', label: 'Serum Creatinine' },
  ];

  return (
    <div>
      <h3 className="text-xl font-bold mb-4" style={{ color: colors.black }}>
        Blood Sugar Tracking
      </h3>

      {/* Date range filter — max date is today (no future) */}
      <Card className="p-4 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[120px]">
            <Label className="text-xs text-gray-600">From</Label>
            <input
              type="date"
              value={dateFrom}
              max={todayStr}
              onChange={(e) => {
                const v = e.target.value;
                setDateFrom(v);
                if (dateTo && v > dateTo) setDateTo(v);
              }}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <Label className="text-xs text-gray-600">To</Label>
            <input
              type="date"
              value={dateTo}
              max={todayStr}
              onChange={(e) => {
                const v = e.target.value;
                setDateTo(v);
                if (dateFrom && v < dateFrom) setDateFrom(v);
              }}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <Button
            size="sm"
            onClick={handleApplyDateFilter}
            disabled={loading}
            style={{ backgroundColor: colors.primary, color: colors.white }}
          >
            {loading ? 'Loading...' : 'Apply'}
          </Button>
        </div>
      </Card>

      {records.length === 0 ? (
        <Card className="p-8 text-center">
          <Activity className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600">No records in this date range.</p>
          <p className="text-sm text-gray-500 mt-1">
            Your care team may add lab values here after your visits.
          </p>
        </Card>
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto">
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      {tableHeaders.map((h) => (
                        <th
                          key={h.key}
                          className="px-4 py-3 font-semibold"
                          style={{ color: colors.black }}
                        >
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b last:border-0 hover:bg-gray-50/50"
                      >
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-500" />
                            {formatDate(r.date)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {formatValue(r.weight, 'kg')}
                        </td>
                        <td className="px-4 py-3">{formatValue(r.bp)}</td>
                        <td className="px-4 py-3">
                          {formatValue(r.fastingBloodSugar)}
                        </td>
                        <td className="px-4 py-3">
                          {formatValue(r.postLunchSugar)}
                        </td>
                        <td className="px-4 py-3">{formatValue(r.hba1c)}</td>
                        <td className="px-4 py-3">
                          {formatValue(r.serumCreatinine)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Mobile: cards */}
          <div className="md:hidden space-y-3">
            {records.map((r) => (
              <Card key={r.id} className="p-4">
                <div
                  className="flex items-center gap-2 mb-3 text-sm font-medium"
                  style={{ color: colors.primary }}
                >
                  <Calendar className="h-4 w-4" />
                  {formatDate(r.date)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Weight</span>
                    <p className="font-medium">{formatValue(r.weight, 'kg')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">BP</span>
                    <p className="font-medium">{formatValue(r.bp)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Fasting</span>
                    <p className="font-medium">
                      {formatValue(r.fastingBloodSugar, 'mg/dL')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Post Lunch</span>
                    <p className="font-medium">
                      {formatValue(r.postLunchSugar, 'mg/dL')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">HbA1c</span>
                    <p className="font-medium">{formatValue(r.hba1c, '%')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Serum Creatinine</span>
                    <p className="font-medium">
                      {formatValue(r.serumCreatinine)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
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
                        if (pagination.hasPrev)
                          handlePageChange(pagination.currentPage - 1);
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
                        if (pagination.hasNext)
                          handlePageChange(pagination.currentPage + 1);
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
        </>
      )}
    </div>
  );
}
