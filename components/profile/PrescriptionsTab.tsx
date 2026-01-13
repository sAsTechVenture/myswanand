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
import { Eye, Download, Upload } from 'lucide-react';
import Image from 'next/image';

interface Prescription {
  id: string;
  fileName: string;
  doctorName: string;
  date: string;
  thumbnail?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PrescriptionsTabProps {
  isActive?: boolean;
  onUpload?: () => void;
}

export function PrescriptionsTab({
  isActive = false,
  onUpload,
}: PrescriptionsTabProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
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
    if (isActive && prescriptions.length === 0 && !loading) {
      fetchPrescriptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const fetchPrescriptions = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('patient_token')
          : null;

      if (!token) {
        setError('Please login to view prescriptions');
        return;
      }

      const response = await apiClient.get<{
        success: boolean;
        data: {
          prescriptions: Prescription[];
          pagination: PaginationData;
        };
      }>(`/patient/prescriptions?page=${page}&limit=10`, {
        token,
      });

      if (response.data.success && response.data.data) {
        const { prescriptions: prescriptionList, pagination: paginationData } =
          response.data.data;
        setPrescriptions(prescriptionList);
        setPagination(paginationData);
      } else {
        setError('Failed to load prescriptions');
      }
    } catch (err: any) {
      console.error('Prescriptions fetch error:', err);
      setError('Failed to load prescriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchPrescriptions(newPage);
    }
  };

  if (loading && prescriptions.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-32 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-2/3 mb-2" />
              <Skeleton className="h-8 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && prescriptions.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" style={{ color: colors.black }}>
            Uploaded Prescriptions
          </h3>
          {onUpload && (
            <Button
              onClick={onUpload}
              style={{
                backgroundColor: colors.black,
                color: colors.white,
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload new
            </Button>
          )}
        </div>
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => fetchPrescriptions(1)}
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold" style={{ color: colors.black }}>
          Uploaded Prescriptions
        </h3>
        {onUpload && (
          <Button
            onClick={onUpload}
            style={{
              backgroundColor: colors.black,
              color: colors.white,
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload new
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prescriptions.map((prescription) => (
          <Card key={prescription.id} className="p-4">
            <div className="mb-3">
              {prescription.thumbnail ? (
                <div className="relative w-full h-32 mb-2 rounded overflow-hidden">
                  <Image
                    src={prescription.thumbnail}
                    alt={prescription.fileName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-full h-32 mb-2 rounded flex items-center justify-center"
                  style={{ backgroundColor: colors.primaryLight }}
                >
                  <span className="text-4xl">📄</span>
                </div>
              )}
            </div>
            <h4
              className="font-semibold text-sm mb-1"
              style={{ color: colors.black }}
            >
              {prescription.fileName}
            </h4>
            <p className="text-xs text-gray-600 mb-1">
              By {prescription.doctorName}
            </p>
            <p className="text-xs text-gray-600 mb-3">{prescription.date}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                style={{
                  borderColor: colors.primary,
                  color: colors.primary,
                }}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                style={{
                  borderColor: colors.primary,
                  color: colors.primary,
                }}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          </Card>
        ))}
        {prescriptions.length === 0 && !loading && (
          <Card className="p-8 text-center col-span-2">
            <p className="text-gray-600 mb-4">No prescriptions uploaded</p>
            {onUpload && (
              <Button
                onClick={onUpload}
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Prescription
              </Button>
            )}
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
