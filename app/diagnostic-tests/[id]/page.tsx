'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  FlaskConical,
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

interface DiagnosticTest {
  id: string;
  name: string;
  description?: string;
  instruction?: string;
  price: number;
  imageUrl?: string;
  isPopular?: boolean;
  category?: {
    id: string;
    name: string;
  };
  [key: string]: unknown;
}

// Map instructions to pathology-related icons
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
    return (
      <FlaskConical className="h-5 w-5" style={{ color: colors.primary }} />
    );
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
    return (
      <Thermometer className="h-5 w-5" style={{ color: colors.primary }} />
    );
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
    return (
      <Stethoscope className="h-5 w-5" style={{ color: colors.primary }} />
    );
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

  // Default icon
  return <FlaskConical className="h-5 w-5" style={{ color: colors.primary }} />;
};

export default function DiagnosticTestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;
  const [test, setTest] = useState<DiagnosticTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    async function fetchTest() {
      try {
        setLoading(true);
        const response = await apiClient.get<{
          success?: boolean;
          data?: DiagnosticTest;
        }>(`/patient/tests/${testId}`);

        const responseData = response.data as any;
        let testData: DiagnosticTest | null = null;

        if (responseData?.data) {
          testData = responseData.data;
        } else if (responseData) {
          testData = responseData;
        }

        if (testData) {
          // Process image URL
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
          let imageUrl = testData.imageUrl;
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
          testData.imageUrl = imageUrl;
        }

        setTest(testData);
      } catch (err) {
        console.error('Error fetching test:', err);
      } finally {
        setLoading(false);
      }
    }

    if (testId) {
      fetchTest();
    }
  }, [testId]);

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', test?.id);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality
  };

  // Split instructions by full stops
  const instructions = test?.instruction
    ? test.instruction
        .split('.')
        .map((inst) => inst.trim())
        .filter((inst) => inst.length > 0)
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

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center">
            <p className="text-lg text-gray-600">Test not found</p>
            <Link href="/diagnostic-tests">
              <Button
                className="mt-4"
                style={{ backgroundColor: colors.primary }}
              >
                Back to Tests
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/diagnostic-tests"
          className="mb-6 inline-flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
          style={{ color: colors.primary }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Diagnostic Tests
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Left Side - Image */}
          <div>
            <Card className="overflow-hidden">
              {test.imageUrl ? (
                <div className="relative h-96 w-full">
                  <Image
                    src={test.imageUrl}
                    alt={test.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-96 w-full items-center justify-center bg-gray-100">
                  <FlaskConical
                    className="h-24 w-24"
                    style={{ color: colors.primaryLight }}
                  />
                </div>
              )}
            </Card>
          </div>

          {/* Right Side - Details */}
          <div className="space-y-6">
            {/* Title and Badges */}
            <div>
              <div className="mb-3 flex items-start justify-between">
                <h1
                  className="text-3xl font-bold md:text-4xl"
                  style={{ color: colors.primary }}
                >
                  {test.name}
                </h1>
                <button
                  onClick={handleToggleFavorite}
                  className="rounded-full p-2 transition-colors hover:bg-gray-100"
                  aria-label={
                    isFavorite ? 'Remove from favorites' : 'Add to favorites'
                  }
                >
                  <Heart
                    className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`}
                    style={{
                      color: isFavorite ? colors.primary : colors.primary,
                    }}
                  />
                </button>
              </div>

              {test.category && (
                <Badge
                  className="mb-3"
                  style={{
                    backgroundColor: colors.primaryLight,
                    color: colors.primary,
                  }}
                >
                  {test.category.name}
                </Badge>
              )}

              {test.isPopular && (
                <Badge
                  className="ml-2"
                  style={{
                    backgroundColor: colors.yellow,
                    color: colors.black,
                  }}
                >
                  Popular
                </Badge>
              )}
            </div>

            {/* Price */}
            <div>
              <p
                className="text-3xl font-bold"
                style={{ color: colors.primary }}
              >
                ₹ {test.price.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Description */}
            {test.description && (
              <div>
                <h2
                  className="mb-2 text-xl font-semibold"
                  style={{ color: colors.black }}
                >
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {test.description}
                </p>
              </div>
            )}

            {/* Instructions */}
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

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                }}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                className="px-6"
                style={{
                  borderColor: colors.primary,
                  color: colors.primary,
                }}
                onClick={() => router.push('/upload-prescription')}
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
