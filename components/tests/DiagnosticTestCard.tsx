'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { colors } from '@/config/theme';
import { cn } from '@/lib/utils';
import GlareHover from '@/components/GlareHover';

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
  isFavorite = false,
  onFavoriteToggle,
  imageUrl,
  imageAlt = 'Diagnostic test illustration',
  title,
  description,
  testCount,
  price,
  onAddToCart,
  className,
  testId,
}: DiagnosticTestCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  // Show fallback if no imageUrl or if image failed to load
  const showFallback = !imageUrl || imageError;

  const handleAddToCart = () => {
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
    if (onAddToCart) {
      onAddToCart();
    }
  };

  return (
    <GlareHover
      width="100%"
      height="100%"
      background="transparent"
      borderRadius="1rem"
      borderColor="transparent"
      glareColor="#ffffff"
      glareOpacity={0.2}
      glareSize={200}
      transitionDuration={500}
      className="h-full"
    >
      <div
        className={cn(
          'relative flex flex-col overflow-hidden rounded-2xl h-full w-full',
          'shadow-lg transition-all hover:shadow-xl border border-gray-200',
          className
        )}
      >
        {/* Image Section with Overlay Content - Fixed height */}
        <div className="relative h-[280px] flex-shrink-0">
          {/* Background Image */}
          {!showFallback ? (
            <Image
              src={imageUrl!}
              alt={imageAlt}
              fill
              className="object-cover"
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              onError={() => setImageError(true)}
            />
          ) : (
            /* Default medical/health themed background when no image or image fails to load */
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-600">
              {/* Medical cross pattern overlay */}
              <div className="absolute inset-0 opacity-10">
                <svg
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="medical-pattern"
                      x="0"
                      y="0"
                      width="60"
                      height="60"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M25 10 h10 v15 h15 v10 h-15 v15 h-10 v-15 h-15 v-10 h15 z"
                        fill="white"
                      />
                    </pattern>
                  </defs>
                  <rect
                    width="100%"
                    height="100%"
                    fill="url(#medical-pattern)"
                  />
                </svg>
              </div>
              {/* Centered health icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* Heart with pulse line */}
                    <path d="M19.5 12.572l-7.5 7.428l-7.5-7.428a5 5 0 1 1 7.5-6.566a5 5 0 1 1 7.5 6.572" />
                    <path d="M12 6v4m0 0v4m0-4h4m-4 0H8" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

          {/* Top Right - Favorite Heart */}
          {onFavoriteToggle && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFavoriteToggle();
              }}
              className="absolute right-3 top-3 z-10 rounded-full p-2 transition-all hover:scale-110"
              style={{
                backgroundColor: 'white',
              }}
              aria-label={
                isFavorite ? 'Remove from favorites' : 'Add to favorites'
              }
            >
              <Heart
                className={cn(
                  'h-5 w-5 transition-colors',
                  isFavorite ? 'fill-current' : ''
                )}
                style={{
                  color: colors.primary,
                }}
              />
            </button>
          )}

          {/* Overlay Content - Title, Test Count, Price */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
            {/* Title */}
            {testId ? (
              <Link href={`/diagnostic-tests/${testId}`}>
                <h3
                  className="text-xl font-bold text-white leading-tight hover:opacity-80 transition-opacity cursor-pointer line-clamp-2"
                  title={title}
                >
                  {title}
                </h3>
              </Link>
            ) : (
              <h3
                className="text-xl font-bold text-white leading-tight line-clamp-2"
                title={title}
              >
                {title}
              </h3>
            )}

            {/* Test Count */}
            {testCount !== undefined && (
              <p className="text-sm text-white/80 mt-1">
                {testCount} Tests Include
              </p>
            )}

            {/* Price */}
            <p
              className="text-2xl font-bold mt-1"
              style={{ color: colors.white }}
            >
              ₹{price.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* White Bottom Section - Fixed height for symmetry */}
        <div className="bg-white px-5 pt-6 pb-5 rounded-t-3xl -mt-6 relative z-20 h-[180px] flex flex-col">
          {/* Truncated Description - Fixed height container */}
          <div className="flex-1 overflow-hidden">
            {description ? (
              <p
                className="text-sm leading-relaxed line-clamp-3"
                style={{ color: colors.black }}
                title={description}
              >
                {description}
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-gray-400 italic">
                Comprehensive health checkup package
              </p>
            )}
          </div>

          {/* Add to Cart Button - Always at bottom */}
          <Button
            onClick={handleAddToCart}
            className="w-full rounded-full py-5 text-sm font-semibold transition-all hover:opacity-90 mt-auto"
            style={{
              backgroundColor: colors.primary,
              color: colors.white,
            }}
          >
            Add to cart
          </Button>
        </div>
      </div>
    </GlareHover>
  );
}
