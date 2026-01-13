'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
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
import { Eye } from 'lucide-react';

interface HistoryItem {
  id: string;
  type: 'Lab Test' | 'Doctor Consultation';
  title: string;
  date: string;
  price: number;
  status: 'Completed' | 'Pending' | 'Cancelled';
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface HistoryTabProps {
  isActive?: boolean;
}

export function HistoryTab({ isActive = false }: HistoryTabProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
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
    if (isActive && history.length === 0 && !loading) {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const fetchHistory = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('patient_token')
          : null;

      if (!token) {
        setError('Please login to view history');
        return;
      }

      const response = await apiClient.get<{
        success: boolean;
        data: {
          orders?: HistoryItem[];
          tests?: HistoryItem[];
          pagination: PaginationData;
        };
      }>(`/patient/history?page=${page}&limit=10`, {
        token,
      });

      if (response.data.success && response.data.data) {
        const {
          orders = [],
          tests = [],
          pagination: paginationData,
        } = response.data.data;
        // Combine orders and tests
        const combinedHistory = [...orders, ...tests].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setHistory(combinedHistory);
        setPagination(paginationData);
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

  const getCardBackgroundColor = (type: string) => {
    return type === 'Lab Test'
      ? 'rgba(173, 216, 230, 0.3)' // Light blue
      : colors.white;
  };

  if (loading && history.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: colors.black }}>
          Order & Test History
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && history.length === 0) {
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

  return (
    <div>
      <h3 className="text-xl font-bold mb-4" style={{ color: colors.black }}>
        Order & Test History
      </h3>
      <div className="space-y-4">
        {history.map((item) => (
          <Card
            key={item.id}
            className="p-4"
            style={{ backgroundColor: getCardBackgroundColor(item.type) }}
          >
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
                    {item.type}
                  </Badge>
                  <Badge
                    className="text-xs"
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.white,
                    }}
                  >
                    {item.status}
                  </Badge>
                </div>
                <h4
                  className="font-semibold mb-1"
                  style={{ color: colors.black }}
                >
                  {item.title}
                </h4>
                <p className="text-sm text-gray-600">{item.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold" style={{ color: colors.black }}>
                  ₹{item.price}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  style={{ color: colors.primary }}
                >
                  <Eye className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {history.length === 0 && !loading && (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No history found</p>
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
