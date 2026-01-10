'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { colors } from '@/config/theme';
import { cn } from '@/lib/utils';

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface BannerCarouselProps {
  banners: Banner[];
  autoSlideInterval?: number; // in milliseconds, default 5000
  className?: string;
}

export function BannerCarousel({
  banners,
  autoSlideInterval = 5000,
  className,
}: BannerCarouselProps) {
  // Filter only active banners
  const activeBanners = banners.filter((banner) => banner.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide functionality
  useEffect(() => {
    if (activeBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [activeBanners.length, autoSlideInterval]);

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? activeBanners.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Don't render if no active banners
  if (activeBanners.length === 0) {
    return null;
  }

  const currentBanner = activeBanners[currentIndex];

  return (
    <section
      className={cn('relative w-full overflow-hidden', className)}
      style={{ backgroundColor: colors.primary }}
    >
      <div className="relative h-[250px] w-full sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-[600px]">
        {/* Banner Image */}
        <div className="relative h-full w-full">
          <Image
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            fill
            className="object-cover object-center"
            priority={currentIndex === 0}
            sizes="100vw"
            unoptimized
          />
        </div>

        {/* Navigation Arrows */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white transition-all hover:bg-white/30"
              aria-label="Previous banner"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white transition-all hover:bg-white/30"
              aria-label="Next banner"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'h-2 w-2 rounded-full transition-all',
                  index === currentIndex
                    ? 'w-8 bg-white'
                    : 'bg-white/50 hover:bg-white/75'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
