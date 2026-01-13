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

interface Transaction {
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

interface WalletTabProps {
  isActive?: boolean;
}

export function WalletTab({ isActive = false }: WalletTabProps) {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
    if (isActive && transactions.length === 0 && !loading) {
      fetchWalletData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const fetchWalletData = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('patient_token')
          : null;

      if (!token) {
        setError('Please login to view wallet');
        return;
      }

      const response = await apiClient.get<{
        success: boolean;
        data: {
          balance: number;
          transactions: Transaction[];
          pagination: PaginationData;
        };
      }>(`/patient/wallet?page=${page}&limit=10`, {
        token,
      });

      if (response.data.success && response.data.data) {
        const {
          balance: walletBalance,
          transactions: txns,
          pagination: paginationData,
        } = response.data.data;
        setBalance(walletBalance);
        setTransactions(txns);
        setPagination(paginationData);
      } else {
        setError('Failed to load wallet data');
      }
    } catch (err: any) {
      console.error('Wallet fetch error:', err);
      setError('Failed to load wallet data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchWalletData(newPage);
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: colors.black }}>
          Transaction History
        </h3>
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

  if (error && transactions.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: colors.black }}>
          Transaction History
        </h3>
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => fetchWalletData(1)}
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
      {/* Wallet Balance */}
      {balance > 0 && (
        <Card
          className="p-6 mb-6"
          style={{ backgroundColor: colors.primaryLight }}
        >
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: colors.black }}
          >
            Wallet Balance
          </h3>
          <span className="text-3xl font-bold" style={{ color: colors.black }}>
            ₹{balance}
          </span>
        </Card>
      )}

      {/* Transaction History */}
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: colors.black }}>
          Transaction History
        </h3>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: colors.black }}>
                    {transaction.description}
                  </p>
                  <p className="text-sm text-gray-600">{transaction.date}</p>
                </div>
                <span
                  className={`font-semibold ${
                    transaction.type === 'credit'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'credit' ? '+' : '-'}₹
                  {transaction.amount}
                </span>
              </div>
            </Card>
          ))}
          {transactions.length === 0 && !loading && (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No transactions found</p>
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
