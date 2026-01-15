'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { colors } from '@/config/theme';
import { cn } from '@/lib/utils';

export interface DiagnosticTestCardProps {
  // Age range for the test
  ageRange?: string;
  // Whether the test is favorited
  isFavorite?: boolean;
  // Callback when favorite is toggled
  onFavoriteToggle?: () => void;
  // Main image/graphic for the test
  imageUrl?: string;
  // Alt text for the image
  imageAlt?: string;
  // Title of the test
  title: string;
  // Description of the test (will be truncated)
  description?: string;
  // Number of tests included
  testCount?: number;
  // Price in rupees
  price: number;
  // List of features/benefits
  features?: string[];
  // Callback when add to cart is clicked
  onAddToCart?: () => void;
  // Additional className for the card
  className?: string;
  // Test ID for linking to detail page
  testId?: string | number;
}

export function DiagnosticTestCard({
  ageRange,
  isFavorite = false,
  onFavoriteToggle,
  imageUrl,
  imageAlt = 'Diagnostic test illustration',
  title,
  description,
  testCount,
  price,
  features = [],
  onAddToCart,
  className,
  testId,
}: DiagnosticTestCardProps) {
  const router = useRouter();

  const handleAddToCart = () => {
    // Check if user is logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('patient_token') : null;
    if (!token) {
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    if (onAddToCart) {
      onAddToCart();
    }
  };
  return (
    <Card
      className={cn(
        'relative flex flex-col overflow-hidden bg-white shadow-lg transition-all hover:shadow-xl',
        'border-2 h-full',
        className
      )}
      style={{
        borderColor: colors.primary,
        boxShadow: `0 4px 20px rgba(94, 46, 133, 0.15)`,
      }}
    >
      <CardHeader className="relative p-0 flex-shrink-0">
        {/* Top Left - Age Badge */}
        {ageRange && (
          <div className="absolute left-3 top-3 z-10">
            <Badge
              variant="default"
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: colors.primary,
                color: colors.white,
                borderColor: colors.primary,
              }}
            >
              AGE : {ageRange}
            </Badge>
          </div>
        )}

        {/* Top Right - Favorite Heart */}
        {onFavoriteToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavoriteToggle();
            }}
            className="absolute right-3 top-3 z-10 rounded-full p-1.5 transition-colors"
            style={{
              backgroundColor: isFavorite ? colors.primaryLight : 'transparent',
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors',
                isFavorite ? 'fill-current' : 'stroke-2'
              )}
              style={{
                color: isFavorite ? colors.primary : colors.primary,
              }}
            />
          </button>
        )}

        {/* Main Image - Full Width */}
        {imageUrl ? (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover"
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          </div>
        ) : (
          <div className="relative h-48 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {/* Default graphic: Hands cupping heart with cross */}
            <svg
              viewBox="0 0 120 120"
              className="h-32 w-32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Hands */}
              <path
                d="M20 60 Q20 40 30 35 Q40 30 50 40 L50 50 Q45 55 40 60 Q35 65 30 70 Q25 75 20 70 Z"
                fill="#F5E6D3"
                stroke="#D4A574"
                strokeWidth="2"
              />
              <path
                d="M100 60 Q100 40 90 35 Q80 30 70 40 L70 50 Q75 55 80 60 Q85 65 90 70 Q95 75 100 70 Z"
                fill="#F5E6D3"
                stroke="#D4A574"
                strokeWidth="2"
              />
              {/* Heart */}
              <path
                d="M60 45 C60 35 50 30 45 35 C40 30 30 35 30 45 C30 55 45 70 60 80 C75 70 90 55 90 45 C90 35 80 30 75 35 C70 30 60 35 60 45 Z"
                fill="#DC2626"
              />
              {/* Cross */}
              <line
                x1="60"
                y1="55"
                x2="60"
                y2="70"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="52"
                y1="62.5"
                x2="68"
                y2="62.5"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-col flex-1 px-4 pb-4 space-y-2">
        {/* Title */}
        <div className="flex-shrink-0">
          {testId ? (
            <Link href={`/diagnostic-tests/${testId}`}>
              <h3
                className="line-clamp-1 text-lg font-bold leading-tight hover:opacity-80 transition-opacity cursor-pointer"
                style={{ color: colors.black }}
                title={title}
              >
                {title}
              </h3>
            </Link>
          ) : (
            <h3
              className="line-clamp-1 text-lg font-bold leading-tight"
              style={{ color: colors.black }}
              title={title}
            >
              {title}
            </h3>
          )}
        </div>

        {/* Description with truncate */}
        {description && (
          <p
            className="line-clamp-2 text-xs leading-snug flex-shrink-0"
            style={{ color: colors.black }}
            title={description}
          >
            {description}
          </p>
        )}

        {/* Test Count */}
        {testCount !== undefined && (
          <p className="text-xs flex-shrink-0" style={{ color: colors.black }}>
            {testCount} Tests Included
          </p>
        )}

        {/* Features List - Flexible section */}
        {features.length > 0 && (
          <ul className="space-y-1 flex-1 min-h-0">
            {features.map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-1.5 text-xs leading-tight"
                style={{ color: colors.black }}
              >
                <Star
                  className="mt-0.5 h-3 w-3 shrink-0"
                  style={{ color: colors.primary }}
                  fill={colors.primary}
                />
                <span className="flex-1 line-clamp-2">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Price and Button - Always at bottom */}
        <div className="flex-shrink-0 space-y-2 mt-auto">
          {/* Price */}
          <p className="text-xl font-bold" style={{ color: colors.black }}>
            ₹ {price.toLocaleString('en-IN')}
          </p>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            className="w-full rounded-lg py-2.5 text-sm font-semibold transition-all hover:opacity-90"
            style={{
              backgroundColor: colors.primary,
              color: colors.white,
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
