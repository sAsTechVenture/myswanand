'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api';
import { getAuthToken } from '@/lib/utils/auth';
import { colors } from '@/config/theme';
import { Gift, ExternalLink, Calendar, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { normalizeImageUrl } from '@/lib/image-utils';

interface ExternalVoucher {
  id: string;
  voucherId: string;
  code: string;
  companyName: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  redemptionUrl: string | null;
  expiryDate: string | null;
  isActive: boolean;
  isExpired: boolean;
  assignedAt: string;
  bookingId: string | null;
}

interface VoucherAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignedVoucherIds: string[];
}

export function VoucherAssignmentModal({
  open,
  onOpenChange,
  assignedVoucherIds,
}: VoucherAssignmentModalProps) {
  const [vouchers, setVouchers] = useState<ExternalVoucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVouchers = async () => {
      if (!open || assignedVoucherIds.length === 0) {
        return;
      }


      try {
        setLoading(true);
        setError(null);

        const token = getAuthToken();
        if (!token) {
          setError('Please login to view vouchers');
          return;
        }

        // Fetch all external vouchers and filter by assigned IDs
        const response = await apiClient.get<{
          success: boolean;
          data: {
            vouchers: ExternalVoucher[];
            pagination?: {
              currentPage: number;
              totalPages: number;
              totalItems: number;
              hasNext: boolean;
              hasPrev: boolean;
            };
          };
        }>('/patient/external-vouchers', { token });

        console.log('Voucher modal: API response:', response.data);

        if (response.data.success && response.data.data?.vouchers) {
          // Filter vouchers to only show the ones that were just assigned
          // Check both assignment ID (voucher.id) and voucher ID (voucher.voucherId)
          const assignedVouchers = response.data.data.vouchers.filter((voucher) =>
            assignedVoucherIds.includes(voucher.id) || assignedVoucherIds.includes(voucher.voucherId)
          );
          console.log('Voucher modal: Filtered vouchers:', assignedVouchers);
          setVouchers(assignedVouchers);
        } else {
          setError('Failed to load voucher details');
        }
      } catch (err: any) {
        console.error('Error fetching vouchers:', err);
        setError('Failed to load voucher details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, [open, assignedVoucherIds]);

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'No expiry';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleRedeem = (voucher: ExternalVoucher) => {
    if (voucher.redemptionUrl) {
      window.open(voucher.redemptionUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ color: colors.primary }}>
            🎉 You've Received New Vouchers!
          </DialogTitle>
          <DialogDescription>
            {assignedVoucherIds.length} voucher
            {assignedVoucherIds.length > 1 ? 's have' : ' has'} been assigned to
            your account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-32 w-full" />
                </Card>
              ))}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && vouchers.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No voucher details found. Please check your vouchers page.
              </AlertDescription>
            </Alert>
          )}

          {!loading && !error && vouchers.length > 0 && (
            <div className="space-y-4">
              {vouchers.map((voucher) => {
                const imageUrl = voucher.imageUrl
                  ? normalizeImageUrl(voucher.imageUrl)
                  : null;

                return (
                  <Card key={voucher.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Voucher Image */}
                        {imageUrl ? (
                          <div className="relative w-full sm:w-32 h-32 sm:h-auto shrink-0">
                            <Image
                              src={imageUrl}
                              alt={voucher.title}
                              fill
                              className="object-cover"
                              sizes="128px"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-full sm:w-32 h-32 sm:h-auto flex items-center justify-center shrink-0"
                            style={{ backgroundColor: colors.primaryLight }}
                          >
                            <Gift
                              className="w-12 h-12"
                              style={{ color: colors.primary }}
                            />
                          </div>
                        )}

                        {/* Voucher Details */}
                        <div className="flex-1 p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3
                                  className="font-semibold text-lg"
                                  style={{ color: colors.black }}
                                >
                                  {voucher.title}
                                </h3>
                                {voucher.isActive && !voucher.isExpired && (
                                  <Badge
                                    className="text-xs"
                                    style={{
                                      backgroundColor: colors.green,
                                      color: colors.white,
                                    }}
                                  >
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Active
                                  </Badge>
                                )}
                                {voucher.isExpired && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs"
                                    style={{
                                      borderColor: '#ef4444',
                                      color: '#ef4444',
                                    }}
                                  >
                                    Expired
                                  </Badge>
                                )}
                              </div>
                              {voucher.companyName && (
                                <p className="text-sm text-gray-600 mb-1">
                                  by {voucher.companyName}
                                </p>
                              )}
                              {voucher.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {voucher.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                            {voucher.code && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Code:</span>
                                <code
                                  className="px-2 py-1 rounded bg-gray-100 font-mono"
                                  style={{ color: colors.primary }}
                                >
                                  {voucher.code}
                                </code>
                              </div>
                            )}
                            {voucher.expiryDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Expires: {formatDate(voucher.expiryDate)}</span>
                              </div>
                            )}
                          </div>

                          {voucher.redemptionUrl && (
                            <Button
                              onClick={() => handleRedeem(voucher)}
                              className="w-full sm:w-auto"
                              style={{
                                backgroundColor: colors.primary,
                                color: colors.white,
                              }}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Redeem Voucher
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            style={{
              backgroundColor: colors.primary,
              color: colors.white,
            }}
          >
            Close
          </Button>
          {vouchers.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                window.location.href = '/profile?tab=vouchers';
              }}
              style={{
                borderColor: colors.primary,
                color: colors.primary,
              }}
            >
              View All Vouchers
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
