import Image from 'next/image';
import { Info, Star } from 'lucide-react';
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
}: CarePackageCardProps) {
  // Determine color scheme: odd index = yellow, even index = blue
  const isYellow = index % 2 === 1;
  const accentColor = isYellow ? colors.yellow : colors.blue;
  const badgeBgColor = isYellow ? colors.yellow : colors.blue;
  const badgeTextColor = isYellow ? colors.black : colors.white;

  return (
    <Card
      className={cn(
        'relative overflow-hidden bg-white shadow-sm transition-all hover:shadow-md',
        'border',
        className
      )}
    >
      <CardHeader className="relative min-h-[60px] pb-3">
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

        {/* Top Right - Info Icon */}
        <button
          className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:opacity-80"
          style={{ backgroundColor: accentColor }}
          aria-label="Package information"
        >
          <Info className="h-3.5 w-3.5 text-white" strokeWidth={3} />
        </button>

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

      <CardContent className="space-y-2.5 px-4 pb-4 pt-0">
        {/* Title */}
        <h3
          className="line-clamp-2 text-left text-lg font-bold leading-tight"
          style={{ color: colors.black }}
          title={title}
        >
          {title}
        </h3>

        {/* Test Count */}
        <p className="text-left text-xs" style={{ color: colors.black }}>
          {testCount} Tests Included
        </p>

        {/* Price */}
        <p
          className="text-left text-xl font-bold"
          style={{ color: colors.black }}
        >
          ₹ {price.toLocaleString('en-IN')}
        </p>

        {/* Features List */}
        {features && features.length > 0 && (
          <ul className="space-y-1">
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
                <span className="flex-1">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Book Package Button */}
        <Button
          onClick={onBookPackage}
          className="w-full rounded-lg py-2.5 text-xs font-bold uppercase tracking-wide transition-all hover:opacity-90"
          style={{
            backgroundColor: accentColor,
            color: colors.white,
          }}
        >
          Book Package
        </Button>
      </CardContent>
    </Card>
  );
}
