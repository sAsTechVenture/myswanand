'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Building2,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { colors } from '@/config/theme';

// Wallet transaction item
interface WalletTransaction {
  id: string;
  category: 'WALLET';
  type: string; // CREDIT, DEBIT
  amount: number;
  description: string;
  balance: number;
  createdAt: string;
}

// Payment item
interface PaymentItem {
  id: string;
  category: 'PAYMENT';
  type: string;
  amount: number;
  coinsUsed?: number;
  paymentMethod: 'ONLINE' | 'OFFLINE';
  gateway?: string;
  status: string;
  merchantTransactionId?: string;
  phonepeTransactionId?: string;
  refundStatus?: string;
  booking?: {
    id: string;
    type: string;
    status: string;
    appointmentDate: string;
    centerName?: string;
  };
  createdAt: string;
}

type HistoryItem = WalletTransaction | PaymentItem;

interface WalletSummary {
  totalWalletTransactions: number;
  totalPayments: number;
  onlinePayments: number;
  offlinePayments: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
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
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'wallet' | 'payments'
  >('all');
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
      fetchWalletData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      fetchWalletData(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

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
          history: HistoryItem[];
          transactions: WalletTransaction[];
          payments: PaymentItem[];
          summary: WalletSummary;
          pagination: PaginationData;
        };
      }>(`/patient/wallet?page=${page}&limit=10&type=${activeFilter}`, {
        token,
      });

      if (response.data.success && response.data.data) {
        const {
          balance: walletBalance,
          history: historyData,
          summary: summaryData,
          pagination: paginationData,
        } = response.data.data;
        setBalance(walletBalance);
        setHistory(historyData);
        setSummary(summaryData);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'PENDING':
      case 'INITIATED':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'COMPLETED':
        return 'text-green-600 bg-green-50';
      case 'FAILED':
        return 'text-red-600 bg-red-50';
      case 'PENDING':
      case 'INITIATED':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading && history.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <Skeleton className="h-10 w-64 mb-4" />
        <div className="space-y-3">
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
      {/* Wallet Balance Card */}
      <Card
        className="p-6 mb-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-white/80" />
            <span className="text-white/80 text-sm font-medium">
              Wallet Balance
            </span>
          </div>
          <span className="text-4xl font-bold text-white">
            ₹{balance.toLocaleString('en-IN')}
          </span>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -right-4 w-24 h-24 rounded-full bg-white/5" />
      </Card>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-green-600">
              {summary.successfulPayments}
            </p>
            <p className="text-xs text-gray-600">Successful</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {summary.pendingPayments}
            </p>
            <p className="text-xs text-gray-600">Pending</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-red-600">
              {summary.failedPayments}
            </p>
            <p className="text-xs text-gray-600">Failed</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: colors.primary }}>
              {summary.totalWalletTransactions}
            </p>
            <p className="text-xs text-gray-600">Wallet Txns</p>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <Tabs
        value={activeFilter}
        onValueChange={(value) =>
          setActiveFilter(value as 'all' | 'wallet' | 'payments')
        }
        className="mb-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Transaction History */}
      <div className="space-y-3">
        {loading && history.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
          </div>
        )}

        {!loading &&
          history.map((item) => (
            <Card key={item.id} className="p-4">
              {item.category === 'WALLET' ? (
                // Wallet Transaction
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.type === 'CREDIT' ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      {item.type === 'CREDIT' ? (
                        <ArrowDownLeft className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="font-medium text-sm sm:text-base"
                        style={{ color: colors.black }}
                      >
                        {item.description || 'Wallet Transaction'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(item.createdAt)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Balance: ₹{item.balance.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold text-sm sm:text-base whitespace-nowrap ${
                      item.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {item.type === 'CREDIT' ? '+' : '-'}₹
                    {Math.abs(item.amount).toLocaleString('en-IN')}
                  </span>
                </div>
              ) : (
                // Payment
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.paymentMethod === 'ONLINE'
                          ? 'bg-purple-100'
                          : 'bg-blue-100'
                      }`}
                    >
                      <CreditCard
                        className={`w-5 h-5 ${
                          item.paymentMethod === 'ONLINE'
                            ? 'text-purple-600'
                            : 'text-blue-600'
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className="font-medium text-sm sm:text-base"
                          style={{ color: colors.black }}
                        >
                          {item.booking?.type || 'Payment'}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {getStatusIcon(item.status)}
                          {item.status}
                        </span>
                      </div>
                      {item.booking && (
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                          {item.booking.appointmentDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(
                                item.booking.appointmentDate
                              ).toLocaleDateString('en-IN')}
                            </span>
                          )}
                          {item.booking.centerName && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {item.booking.centerName}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(item.createdAt)} •{' '}
                        {item.paymentMethod === 'ONLINE'
                          ? `Online${item.gateway ? ` (${item.gateway})` : ''}`
                          : 'Pay at Center'}
                      </p>
                      {item.coinsUsed && item.coinsUsed > 0 && (
                        <p className="text-xs text-yellow-600 mt-0.5">
                          🪙 {item.coinsUsed} coins used
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className="font-semibold text-sm sm:text-base whitespace-nowrap"
                    style={{ color: colors.black }}
                  >
                    ₹{item.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </Card>
          ))}

        {history.length === 0 && !loading && (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colors.primaryLight }}
              >
                <Wallet className="w-8 h-8" style={{ color: colors.primary }} />
              </div>
              <p className="text-gray-600">
                {activeFilter === 'all'
                  ? 'No transactions found'
                  : activeFilter === 'wallet'
                  ? 'No wallet transactions found'
                  : 'No payments found'}
              </p>
            </div>
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
                { length: Math.min(pagination.totalPages, 5) },
                (_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  return pageNum;
                }
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
