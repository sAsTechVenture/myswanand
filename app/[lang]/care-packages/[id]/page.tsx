'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { useLocalizedRouter } from '@/lib/hooks/useLocalizedRouter';
import { createLocalizedPath, getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  FlaskConical,
  Package,
  Microscope,
  HeartPulse,
  Activity,
  Stethoscope,
  Pill,
  Syringe,
  Bandage,
  Thermometer,
  Droplet,
  Beaker,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { colors } from '@/config/theme';
import { apiClient } from '@/lib/api';
import { useLikedItems } from '@/lib/hooks/useLikedItems';

// Map instructions to pathology-related icons (same as diagnostic-tests)
const getInstructionIcon = (instruction: string): React.ReactNode => {
  const lowerInstruction = instruction.toLowerCase();
  if (
    lowerInstruction.includes('fast') ||
    lowerInstruction.includes('fasting') ||
    lowerInstruction.includes('empty stomach')
  ) {
    return <Clock className="h-5 w-5" style={{ color: colors.primary }} />;
  }
  if (
    lowerInstruction.includes('blood') ||
    lowerInstruction.includes('sample') ||
    lowerInstruction.includes('draw')
  ) {
    return <Droplet className="h-5 w-5" style={{ color: colors.primary }} />;
  }
  if (
    lowerInstruction.includes('urine') ||
    lowerInstruction.includes('pee') ||
    lowerInstruction.includes('bladder')
  ) {
    return <Beaker className="h-5 w-5" style={{ color: colors.primary }} />;
  }
  if (
    lowerInstruction.includes('stool') ||
    lowerInstruction.includes('feces') ||
    lowerInstruction.includes('bowel')
  ) {
    return <FlaskConical className="h-5 w-5" style={{ color: colors.primary }} />;
  }
  if (
    lowerInstruction.includes('heart') ||
    lowerInstruction.includes('cardiac') ||
    lowerInstruction.includes('ecg')
  ) {
    return <HeartPulse className="h-5 w-5" style={{ color: colors.primary }} />;
  }
  if (
    lowerInstruction.includes('medicine') ||
    lowerInstruction.includes('medication') ||
    lowerInstruction.includes('drug')
  ) {
    return <Pill className="h-5 w-5" style={{ color: colors.primary }} />;
  }
  if (
    lowerInstruction.includes('injection') ||
    lowerInstruction.includes('inject') ||
    lowerInstruction.includes('vaccine')
  ) {
    return <Syringe className="h-5 w-5" style={{ color: colors.primary }} />;
  }
  if (
    lowerInstruction.includes('temperature') ||
    lowerInstruction.includes('fever') ||
    lowerInstruction.includes('thermometer')
  ) {
    return <Thermometer className="h-5 w-5" style={{ color: colors.primary }} />;
  }
  if (
    lowerInstruction.includes('wound') ||
    lowerInstruction.includes('bandage') ||
    lowerInstruction.includes('dressing')
  ) {
    return <Bandage className="h-5 w-5" style={{ color: colors.primary }} />;
  }
  if (
    lowerInstruction.includes('doctor') ||
    lowerInstruction.includes('consultation') ||
    lowerInstruction.includes('examination')
  ) {
    return <Stethoscope className="h-5 w-5" style={{ color: colors.primary }} />;
  }
  if (
    lowerInstruction.includes('test') ||
    lowerInstruction.includes('lab') ||
    lowerInstruction.includes('laboratory')
  ) {
    return <Microscope className="h-5 w-5" style={{ color: colors.primary }} />;
  }
  if (
    lowerInstruction.includes('activity') ||
    lowerInstruction.includes('exercise') ||
    lowerInstruction.includes('physical')
  ) {
    return <Activity className="h-5 w-5" style={{ color: colors.primary }} />;
  }
  if (
    lowerInstruction.includes('date') ||
    lowerInstruction.includes('schedule') ||
    lowerInstruction.includes('appointment')
  ) {
    return <Calendar className="h-5 w-5" style={{ color: colors.primary }} />;
  }
  if (
    lowerInstruction.includes('important') ||
    lowerInstruction.includes('note') ||
    lowerInstruction.includes('warning')
  ) {
    return <AlertCircle className="h-5 w-5" style={{ color: colors.yellow }} />;
  }
  if (
    lowerInstruction.includes('required') ||
    lowerInstruction.includes('must') ||
    lowerInstruction.includes('necessary')
  ) {
    return <CheckCircle2 className="h-5 w-5" style={{ color: colors.green }} />;
  }
  return <FlaskConical className="h-5 w-5" style={{ color: colors.primary }} />;
};

interface CarePackage {
  id: string;
  name: string;
  description?: string | null;
  instruction?: string | null;
  price: number;
  imageUrl?: string;
  category?: {
    id: string;
    name: string;
    parentId?: string | null;
  };
  tests?: Array<{
    id: string;
    name: string;
    description?: string;
    price?: number;
  }>;
  packageTests?: Array<{
    test: {
      id: string;
      name: string;
    };
  }>;
  testCount?: number;
  [key: string]: unknown;
}

export default function CarePackageDetailPage() {
  const params = useParams();
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const localizedRouter = useLocalizedRouter();
  const { dictionary } = useDictionary(locale);
  const packageId = params.id as string;
  const [packageData, setPackageData] = useState<CarePackage | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLiked, toggleLike } = useLikedItems();

  // Helper function to get translation
  const t = (key: string): string => {
    if (!dictionary) return key;
    const keys = key.split('.');
    let value: any = dictionary;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  useEffect(() => {
    async function fetchPackage() {
      try {
        setLoading(true);
        const response = await apiClient.get<{
          success?: boolean;
          data?: CarePackage;
        }>(`/patient/care-packages/${packageId}`);

        const responseData = response.data as any;
        let packageData: CarePackage | null = null;

        if (responseData?.data) {
          packageData = responseData.data;
        } else if (responseData) {
          packageData = responseData;
        }

        if (packageData) {
          // Process image URL
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
          let imageUrl = packageData.imageUrl;
          if (imageUrl) {
            if (!imageUrl.startsWith('http')) {
              if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
                let urlToUse = baseUrl;
                if (baseUrl.endsWith('/api') && imageUrl.startsWith('/api')) {
                  urlToUse = baseUrl.replace(/\/api$/, '');
                }
                imageUrl = `${urlToUse}${imageUrl}`;
              }
            }
            if (imageUrl.includes('localhost:3000')) {
              imageUrl = imageUrl.replace(
                /http:\/\/localhost:3000[^/]*/,
                baseUrl.replace(/\/api$/, '')
              );
            }
          }
          packageData.imageUrl = imageUrl;
        }

        setPackageData(packageData);
      } catch (err) {
        console.error('Error fetching package:', err);
      } finally {
        setLoading(false);
      }
    }

    if (packageId) {
      fetchPackage();
    }
  }, [packageId]);

  const handleBookPackage = () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('patient_token')
        : null;
    if (!token) {
      const currentPath = window.location.pathname;
      localizedRouter.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    localizedRouter.push(`/care-packages/${packageId}/purchase`);
  };

  const redirectToLogin = () => {
    const currentPath = window.location.pathname;
    localizedRouter.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
  };

  const handleToggleFavorite = async () => {
    if (packageData?.id) {
      await toggleLike(packageData.id, 'package', redirectToLogin);
    }
  };

  // Get test count and tests array
  const testCount =
    packageData?.testCount ||
    packageData?.tests?.length ||
    packageData?.packageTests?.length ||
    0;

  const tests =
    packageData?.tests ||
    packageData?.packageTests?.map((pt: any) => pt.test) ||
    [];

  // Split instructions by full stops (same as diagnostic-tests)
  const instructions = packageData?.instruction
    ? (packageData.instruction as string)
        .split('.')
        .map((inst: string) => inst.trim())
        .filter((inst: string) => inst.length > 0)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="mb-6 h-10 w-48" />
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="h-96 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center">
            <p className="text-lg text-gray-600">{t('common.packageNotFound')}</p>
            <Link href={createLocalizedPath('/care-packages', locale)}>
              <Button
                className="mt-4"
                style={{ backgroundColor: colors.primary }}
              >
                {t('common.backToPackages')}
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <Link
          href="/care-packages"
          className="mb-6 inline-flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
          style={{ color: colors.primary }}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.backToCarePackages')}
        </Link>

        {/* Package Header Section */}
        <Card className="mb-8 overflow-hidden">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Side - Image */}
            <div>
              {packageData.imageUrl ? (
                <div className="relative h-64 w-full md:h-96">
                  <Image
                    src={packageData.imageUrl}
                    alt={packageData.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-64 w-full items-center justify-center bg-gray-100 md:h-96">
                  <Package
                    className="h-24 w-24"
                    style={{ color: colors.primaryLight }}
                  />
                </div>
              )}
            </div>

            {/* Right Side - Header Info */}
            <div className="flex flex-col justify-between p-6">
              <div>
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h1
                      className="mb-3 text-3xl font-bold md:text-4xl"
                      style={{ color: colors.primary }}
                    >
                      {packageData.name}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                      {packageData.category && (
                        <Badge
                          className="text-sm"
                          style={{
                            backgroundColor: colors.primaryLight,
                            color: colors.primary,
                          }}
                        >
                          {packageData.category.name}
                        </Badge>
                      )}
                      {testCount > 0 && (
                        <Badge
                          className="text-sm"
                          style={{
                            backgroundColor: colors.green,
                            color: colors.white,
                          }}
                        >
                          {testCount} Tests
                        </Badge>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleToggleFavorite}
                    className="ml-4 rounded-full p-2 transition-colors hover:bg-gray-100"
                    aria-label={
                      isLiked(packageData.id, 'package')
                        ? 'Remove from favorites'
                        : 'Add to favorites'
                    }
                  >
                    <Heart
                      className={`h-6 w-6 ${
                        isLiked(packageData.id, 'package') ? 'fill-current' : ''
                      }`}
                      style={{
                        color: isLiked(packageData.id, 'package')
                          ? colors.primary
                          : colors.primary,
                      }}
                    />
                  </button>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Package Price</p>
                  <p
                    className="text-4xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    ₹ {packageData.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handleBookPackage}
                  className="flex-1"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.white,
                  }}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Book Package
                </Button>
                <Button
                  variant="outline"
                  className="px-6"
                  style={{
                    borderColor: colors.primary,
                    color: colors.primary,
                  }}
                  onClick={() => localizedRouter.push('/upload-prescription')}
                >
                  Upload Prescription
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Description (same as diagnostic-tests) */}
          {packageData.description && (
            <div>
              <h2
                className="mb-2 text-xl font-semibold"
                style={{ color: colors.black }}
              >
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {packageData.description}
              </p>
            </div>
          )}

          {/* Instructions (same as diagnostic-tests) */}
          {instructions.length > 0 && (
            <div>
              <h2
                className="mb-4 text-xl font-semibold"
                style={{ color: colors.black }}
              >
                Instructions
              </h2>
              <div className="space-y-3">
                {instructions.map((instruction, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border p-4"
                    style={{ borderColor: colors.primaryLight }}
                  >
                    <div className="mt-0.5 shrink-0">
                      {getInstructionIcon(instruction)}
                    </div>
                    <p className="flex-1 text-gray-700 leading-relaxed">
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Package Highlights */}
          <Card
            className="p-6"
            style={{ backgroundColor: colors.primaryLightest }}
          >
            <h2
              className="mb-4 text-xl font-semibold"
              style={{ color: colors.black }}
            >
              Package Overview
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-600 mb-1">Tests Included</p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: colors.primary }}
                >
                  {testCount}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-600 mb-1">Package Price</p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: colors.primary }}
                >
                  ₹ {packageData.price.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-600 mb-1">Category</p>
                <p
                  className="text-lg font-semibold"
                  style={{ color: colors.primary }}
                >
                  {packageData.category?.name || 'N/A'}
                </p>
              </div>
            </div>
          </Card>

          {/* Included Tests */}
          {tests.length > 0 && (
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2
                  className="text-xl font-semibold"
                  style={{ color: colors.black }}
                >
                  Included Tests
                </h2>
                <Badge
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.white,
                  }}
                >
                  {testCount} Tests
                </Badge>
              </div>
              <div className="space-y-3">
                {tests.map((test: any, index: number) => (
                  <Link
                    key={test.id || index}
                    href={`/diagnostic-tests/${test.id}`}
                    className="flex items-center gap-4 rounded-lg border p-4 transition-all hover:shadow-md hover:border-primary"
                    style={{ borderColor: colors.primaryLight }}
                  >
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: colors.primaryLight }}
                    >
                      <FlaskConical
                        className="h-6 w-6"
                        style={{ color: colors.primary }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 mb-1">
                        {test.name}
                      </p>
                      {test.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {test.description}
                        </p>
                      )}
                    </div>
                    {test.price && (
                      <div className="text-right shrink-0">
                        <p
                          className="font-bold text-lg"
                          style={{ color: colors.primary }}
                        >
                          ₹ {test.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
