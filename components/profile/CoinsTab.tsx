'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
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
import { Coins } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CoinTransaction {
  id: string;
  description: string;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CoinsTabProps {
  isActive?: boolean;
}

export function CoinsTab({ isActive = false }: CoinsTabProps) {
  const [totalCoins, setTotalCoins] = useState<number>(0);
  const [history, setHistory] = useState<CoinTransaction[]>([]);
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
  const router = useRouter();

  useEffect(() => {
    if (isActive && history.length === 0 && !loading) {
      fetchCoinsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const fetchCoinsData = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('patient_token')
          : null;

      if (!token) {
        setError('Please login to view coins');
        return;
      }

      const response = await apiClient.get<{
        success: boolean;
        data: {
          totalCoins: number;
          canRedeem?: boolean;
          maxRedeemable?: number;
          history: CoinTransaction[];
          pagination: PaginationData;
        };
      }>(`/patient/coins?page=${page}&limit=10`, {
        token,
      });

      if (response.data.success && response.data.data) {
        const {
          totalCoins: coins,
          history: coinHistory,
          pagination: paginationData,
        } = response.data.data;
        setTotalCoins(coins);
        setHistory(coinHistory);
        setPagination(paginationData);
      } else {
        setError('Failed to load coins data');
      }
    } catch (err: any) {
      console.error('Coins fetch error:', err);
      setError('Failed to load coins data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchCoinsData(newPage);
    }
  };

  if (loading && history.length === 0) {
    return (
      <div>
        <Card className="p-6 mb-6">
          <Skeleton className="h-24 w-full" />
        </Card>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-16 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && history.length === 0) {
    return (
      <div>
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => fetchCoinsData(1)}
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
      {/* Reward Coins */}
      <Card
        className="p-6 mb-6"
        style={{ backgroundColor: colors.primaryLight }}
      >
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: colors.black }}
        >
          Reward Coins
        </h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl font-bold" style={{ color: colors.black }}>
            {totalCoins} Coins
          </span>
        </div>
        <Button
          className="w-full"
          style={{
            backgroundColor: colors.primary,
            color: colors.white,
          }}
          onClick={() => router.push('/cart?use_coins=true')}
        >
          <Coins className="w-4 h-4 mr-2" />
          Redeem Coins
        </Button>
      </Card>

      {/* Coins History */}
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: colors.black }}>
          Coins History
        </h3>
        <div className="space-y-3">
          {history.map((transaction) => {
            // Determine transaction type from description
            const description = transaction.description.toLowerCase();
            const isEarned = description.includes('earned');
            const isRedeemed = description.includes('redeemed');
            const isReversed = description.includes('reversed');

            // Determine color and sign based on transaction type
            let colorClass = 'text-red-600'; // Default for redeemed
            let sign = '-';
            
            if (isEarned) {
              colorClass = 'text-green-600';
              sign = '+';
            } else if (isReversed) {
              colorClass = 'text-yellow-600';
              sign = '-';
            } else if (isRedeemed) {
              colorClass = 'text-red-600';
              sign = '-';
            }

            return (
              <Card key={transaction.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" style={{ color: colors.black }}>
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-600">{transaction.date}</p>
                  </div>
                  <span className={`font-semibold ${colorClass}`}>
                    {sign}
                    {Math.abs(transaction.amount)} coins
                  </span>
                </div>
              </Card>
            );
          })}
          {history.length === 0 && !loading && (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No coin transactions found</p>
            </Card>
          )}
        </div>
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
