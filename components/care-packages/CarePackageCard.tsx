'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { colors } from '@/config/theme';
import { cn } from '@/lib/utils';
import { ParticleCard } from '@/components/MagicBento';

export interface CarePackageCardProps {
  // Category name (e.g., "HEALTH", "FULL BODY")
  category: string;
  // Index for color alternation (0 = primary, others = primaryLightest)
  index: number;
  // Title of the package
  title: string;
  // Number of tests included
  testCount: number;
  // Price in rupees
  price: number;
  // Description of the package
  description?: string;
  // List of features/benefits
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
  index,
  title,
  testCount,
  price,
  description,
  onBookPackage,
  className,
  packageId,
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

  // First card (index 0) has primary purple, others have primaryLightest
  const isFirstCard = index === 0;

  // Default description if not provided
  const displayDescription =
    description ||
    'Comprehensive health checkup package with detailed reports and expert consultation.';

  return (
    <ParticleCard
      className="h-full rounded-3xl"
      style={{ borderRadius: '1.5rem' }}
      particleCount={8}
      glowColor="132, 0, 255"
      enableTilt={false}
      clickEffect={true}
      enableMagnetism={false}
    >
      <div
        className={cn(
          'relative flex flex-col overflow-hidden rounded-3xl h-full w-full',
          'shadow-xl transition-all hover:shadow-2xl',
          className
        )}
        style={{
          backgroundColor: isFirstCard
            ? colors.primary
            : colors.primaryLightest,
          minHeight: '380px',
        }}
      >
        {/* Main Content Area */}
        <div className="flex-1 px-6 pt-6">
          {/* Title */}
          <div className="flex-shrink-0">
            {packageId ? (
              <Link href={`/care-packages/${packageId}`}>
                <h3
                  className="text-xl font-bold leading-tight hover:opacity-80 transition-opacity cursor-pointer line-clamp-2"
                  style={{ color: isFirstCard ? colors.white : colors.black }}
                  title={title}
                >
                  {title}
                </h3>
              </Link>
            ) : (
              <h3
                className="text-xl font-bold leading-tight line-clamp-2"
                style={{ color: isFirstCard ? colors.white : colors.black }}
                title={title}
              >
                {title}
              </h3>
            )}
          </div>

          {/* Test Count */}
          <p
            className="text-sm mt-1"
            style={{
              color: isFirstCard ? 'rgba(255,255,255,0.8)' : colors.black,
            }}
          >
            {testCount} Tests Included
          </p>

          {/* Price */}
          <p
            className="text-2xl font-bold mt-2"
            style={{ color: isFirstCard ? colors.white : colors.primary }}
          >
            ₹{price.toLocaleString('en-IN')}
          </p>

          {/* Description - Truncated */}
          <div className="mt-4">
            <p
              className="text-sm leading-relaxed line-clamp-3"
              style={{
                color: isFirstCard ? 'rgba(255,255,255,0.9)' : colors.black,
              }}
              title={displayDescription}
            >
              {displayDescription}
            </p>
          </div>
        </div>

        {/* Bottom Row - Arrow and Book Package Button */}
        <div className="flex items-center justify-between px-6 pb-6">
          {/* Arrow Icon */}
          <button
            onClick={handleBookPackage}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all hover:scale-105"
            style={{
              borderColor: colors.black,
              backgroundColor: colors.white,
            }}
            aria-label="View package details"
          >
            <ArrowUpRight className="h-5 w-5" style={{ color: colors.black }} />
          </button>

          {/* Book Package Button */}
          <Button
            onClick={handleBookPackage}
            className="rounded-full px-6 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
            style={{
              backgroundColor: isFirstCard ? colors.white : colors.black,
              color: isFirstCard ? colors.primary : colors.white,
              border: isFirstCard ? `2px solid ${colors.primary}` : 'none',
            }}
          >
            Book Package
          </Button>
        </div>
      </div>
    </ParticleCard>
  );
}
