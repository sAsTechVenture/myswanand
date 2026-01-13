'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface Voucher {
  id: string;
  title: string;
  description: string;
  code: string;
  status: 'Available' | 'Used' | 'Expired';
  validTill?: string;
  usedOn?: string;
  expiredOn?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface VouchersTabProps {
  isActive?: boolean;
}

export function VouchersTab({ isActive = false }: VouchersTabProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    if (isActive && vouchers.length === 0 && !loading) {
      fetchVouchers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const fetchVouchers = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('patient_token')
          : null;

      if (!token) {
        setError('Please login to view vouchers');
        return;
      }

      const response = await apiClient.get<{
        success: boolean;
        data: {
          vouchers: Voucher[];
          pagination: PaginationData;
        };
      }>(`/patient/vouchers?page=${page}&limit=10`, {
        token,
      });

      if (response.data.success && response.data.data) {
        const { vouchers: voucherList, pagination: paginationData } =
          response.data.data;
        setVouchers(voucherList);
        setPagination(paginationData);
      } else {
        setError('Failed to load vouchers');
      }
    } catch (err: any) {
      console.error('Vouchers fetch error:', err);
      setError('Failed to load vouchers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchVouchers(newPage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return colors.primary;
      case 'Used':
        return colors.green;
      case 'Expired':
        return '#dc2626';
      default:
        return colors.primary;
    }
  };

  if (loading && vouchers.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: colors.black }}>
          Available Vouchers
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && vouchers.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: colors.black }}>
          Available Vouchers
        </h3>
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => fetchVouchers(1)}
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

  return (
    <div>
      <h3 className="text-xl font-bold mb-4" style={{ color: colors.black }}>
        Available Vouchers
      </h3>
      <div className="space-y-4">
        {vouchers.map((voucher) => (
          <Card key={voucher.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4
                    className="font-bold text-lg"
                    style={{ color: colors.black }}
                  >
                    {voucher.title}
                  </h4>
                  <Badge
                    className="text-xs"
                    style={{
                      backgroundColor: getStatusColor(voucher.status),
                      color: colors.white,
                    }}
                  >
                    {voucher.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  {voucher.description}
                </p>
                <p className="text-xs text-gray-600 mb-1">
                  Code:{' '}
                  <span className="font-mono font-semibold">
                    {voucher.code}
                  </span>
                </p>
                {voucher.status === 'Available' && voucher.validTill && (
                  <p className="text-xs text-gray-600">
                    Valid till {voucher.validTill}
                  </p>
                )}
                {voucher.status === 'Used' && voucher.usedOn && (
                  <p className="text-xs text-gray-600">
                    Used on {voucher.usedOn}
                  </p>
                )}
                {voucher.status === 'Expired' && voucher.expiredOn && (
                  <p className="text-xs text-gray-600">
                    Expired on {voucher.expiredOn}
                  </p>
                )}
              </div>
              {voucher.status === 'Available' && (
                <Button
                  style={{
                    backgroundColor: colors.black,
                    color: colors.white,
                  }}
                >
                  Apply
                </Button>
              )}
            </div>
          </Card>
        ))}
        {vouchers.length === 0 && !loading && (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No vouchers available</p>
          </Card>
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
                      handlePageChange(pagination.page - 1);
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
                    isActive={pageNum === pagination.page}
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
                      handlePageChange(pagination.page + 1);
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
