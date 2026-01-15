'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Info, Star, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { colors } from '@/config/theme';
import { cn } from '@/lib/utils';

export interface CarePackageCardProps {
  // Category name (e.g., "HEALTH", "FULL BODY")
  category: string;
  // Index for color alternation (odd = yellow, even = blue)
  index: number;
  // Title of the package
  title: string;
  // Number of tests included
  testCount: number;
  // Price in rupees
  price: number;
  // List of features/benefits (typically 3 items)
  features?: string[];
  // Image URL for the package
  imageUrl?: string;
  // Callback when book package is clicked
  onBookPackage?: () => void;
  // Additional className for the card
  className?: string;
  // Package ID for linking to detail page
  packageId?: string | number;
  // Whether the package is liked
  isLiked?: boolean;
  // Callback when like is toggled
  onLikeToggle?: () => void;
}

export function CarePackageCard({
  category,
  index,
  title,
  testCount,
  price,
  features,
  imageUrl,
  onBookPackage,
  className,
  packageId,
  isLiked = false,
  onLikeToggle,
}: CarePackageCardProps) {
  const router = useRouter();

  const handleBookPackage = () => {
    // Check if user is logged in
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('patient_token')
        : null;
    if (!token) {
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    if (onBookPackage) {
      onBookPackage();
    }
  };
  // Determine color scheme: odd index = primary, even index = blue
  const isPrimary = index % 2 === 1;
  const accentColor = isPrimary ? colors.primary : colors.blue;
  const badgeBgColor = isPrimary ? colors.primary : colors.blue;
  const badgeTextColor = isPrimary ? colors.white : colors.white;

  return (
    <Card
      className={cn(
        'relative flex flex-col overflow-hidden bg-white shadow-sm transition-all hover:shadow-md',
        'border h-full',
        className
      )}
    >
      <CardHeader className="relative min-h-[60px] pb-3 flex-shrink-0">
        {/* Top Left - Category Badge */}
        <div className="absolute left-3 top-3 z-10">
          <Badge
            variant="default"
            className="rounded-md px-2.5 py-0.5 text-xs font-bold uppercase"
            style={{
              backgroundColor: badgeBgColor,
              color: badgeTextColor,
              borderColor: badgeBgColor,
            }}
          >
            {category}
          </Badge>
        </div>

        {/* Top Right - Like and Info Icons */}
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          {/* Like Button */}
          {onLikeToggle && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLikeToggle();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:opacity-80"
              style={{
                backgroundColor: isLiked
                  ? colors.primary
                  : 'rgba(255, 255, 255, 0.8)',
              }}
              aria-label={
                isLiked ? 'Remove from favorites' : 'Add to favorites'
              }
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-colors',
                  isLiked ? 'fill-current' : ''
                )}
                style={{
                  color: isLiked ? colors.white : colors.primary,
                }}
              />
            </button>
          )}
          {/* Info Icon */}
          <button
            className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:opacity-80"
            style={{ backgroundColor: accentColor }}
            aria-label="Package information"
          >
            <Info className="h-3.5 w-3.5 text-white" strokeWidth={3} />
          </button>
        </div>

        {/* Package Image */}
        {imageUrl && (
          <div className="relative -mx-6 -mt-6 mb-4 h-48 w-full overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-col flex-1 px-4 pb-4 pt-0 space-y-2.5">
        {/* Title */}
        <div className="flex-shrink-0">
          {packageId ? (
            <Link href={`/care-packages/${packageId}`}>
              <h3
                className="line-clamp-2 text-left text-lg font-bold leading-tight hover:opacity-80 transition-opacity cursor-pointer"
                style={{ color: colors.black }}
                title={title}
              >
                {title}
              </h3>
            </Link>
          ) : (
            <h3
              className="line-clamp-2 text-left text-lg font-bold leading-tight"
              style={{ color: colors.black }}
              title={title}
            >
              {title}
            </h3>
          )}
        </div>

        {/* Test Count */}
        <p
          className="text-left text-xs flex-shrink-0"
          style={{ color: colors.black }}
        >
          {testCount} Tests Included
        </p>

        {/* Features List - Flexible section */}
        {features && features.length > 0 && (
          <ul className="space-y-1 flex-1 min-h-0">
            {features.map((feature, featureIndex) => (
              <li
                key={featureIndex}
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
        <div className="flex-shrink-0 space-y-2.5 mt-auto">
          {/* Price */}
          <p
            className="text-left text-xl font-bold"
            style={{ color: colors.black }}
          >
            ₹ {price.toLocaleString('en-IN')}
          </p>

          {/* Book Package Button */}
          <Button
            onClick={handleBookPackage}
            className="w-full rounded-lg py-2.5 text-xs font-bold uppercase tracking-wide transition-all hover:opacity-90"
            style={{
              backgroundColor: accentColor,
              color: colors.white,
            }}
          >
            Book Package
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
