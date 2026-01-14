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
import { format } from 'date-fns';

interface Prescription {
  id: string;
  createdAt: string;
  imageUrl: string;
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
    if (isActive && !loading) {
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

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const getImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return '';

    // Remove /api prefix if present (since base URL already includes /api)
    let cleanUrl = imageUrl;
    if (cleanUrl.startsWith('/api/')) {
      cleanUrl = cleanUrl.replace('/api', '');
    }

    // Ensure URL starts with /
    if (!cleanUrl.startsWith('/')) {
      cleanUrl = `/${cleanUrl}`;
    }

    // Get base URL from environment
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

    // Remove trailing slash from baseUrl if present
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    return `${cleanBaseUrl}${cleanUrl}`;
  };

  const handleView = (prescription: Prescription) => {
    const url = getImageUrl(prescription.imageUrl);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = async (prescription: Prescription) => {
    try {
      const url = getImageUrl(prescription.imageUrl);
      if (!url) {
        console.error('No image URL available');
        return;
      }

      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('patient_token')
          : null;

      // Fetch the file
      const response = await fetch(url, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      // Get the blob
      const blob = await response.blob();

      // Create a temporary URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;

      // Extract filename from URL or use a default
      const urlParts = prescription.imageUrl.split('/');
      const filename =
        urlParts[urlParts.length - 1] || `prescription-${prescription.id}`;

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
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
        {prescriptions.map((prescription) => {
          const imageUrl = getImageUrl(prescription.imageUrl);
          const isImage = prescription.imageUrl.match(
            /\.(jpg|jpeg|png|gif|webp)$/i
          );

          return (
            <Card key={prescription.id} className="p-4">
              <div className="mb-3">
                {imageUrl && isImage ? (
                  <div className="relative w-full h-32 mb-2 rounded overflow-hidden bg-gray-100">
                    <img
                      src={imageUrl}
                      alt={`Prescription ${prescription.id}`}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<span class="text-4xl">📄</span>';
                          parent.className =
                            'w-full h-32 mb-2 rounded flex items-center justify-center';
                          parent.setAttribute(
                            'style',
                            `background-color: ${colors.primaryLight}`
                          );
                        }
                      }}
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
                Prescription
              </h4>
              <p className="text-xs text-gray-600 mb-3">
                {formatDate(prescription.createdAt)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  style={{
                    borderColor: colors.primary,
                    color: colors.primary,
                  }}
                  onClick={() => handleView(prescription)}
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
                  onClick={() => handleDownload(prescription)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </Card>
          );
        })}
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
