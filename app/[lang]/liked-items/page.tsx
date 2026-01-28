'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLocalizedRouter } from '@/lib/hooks/useLocalizedRouter';
import { createLocalizedPath, getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { colors } from '@/config/theme';
import { useLikedItems, LikedItem } from '@/lib/hooks/useLikedItems';
import { apiClient } from '@/lib/api';
import { toast } from '@/lib/toast';
import { syncAuthTokenToCookie, isAuthenticated } from '@/lib/utils/auth';

export default function LikedItemsPage() {
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const localizedRouter = useLocalizedRouter();
  const { dictionary } = useDictionary(locale);
  const { likedItems, loading, removeFromLikedItems, refreshLikedItems } =
    useLikedItems();
  const [removingId, setRemovingId] = useState<string | null>(null);

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

  // Sync token to cookie on mount (for existing sessions)
  useEffect(() => {
    syncAuthTokenToCookie();

    // If not authenticated, redirect to login
    if (!isAuthenticated()) {
      const currentPath = window.location.pathname;
      localizedRouter.replace(
        `/auth/login?redirect=${encodeURIComponent(currentPath)}`
      );
    }
  }, [localizedRouter]);

  // Process image URLs
  const getImageUrl = (imageUrl: string | null | undefined): string => {
    if (!imageUrl) return '';
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) {
      let urlToUse = baseUrl;
      if (baseUrl.endsWith('/api') && imageUrl.startsWith('/api')) {
        urlToUse = baseUrl.replace(/\/api$/, '');
      }
      return `${urlToUse}${imageUrl}`;
    }
    return imageUrl;
  };

  const handleRemove = async (item: LikedItem) => {
    setRemovingId(item.id);
    const itemId = item.packageId || item.testId;
    const type = item.packageId ? 'package' : 'test';

    if (!itemId) {
      setRemovingId(null);
      return;
    }

    const success = await removeFromLikedItems(itemId, type);
    setRemovingId(null);
  };

  const handleBookPackage = (packageId: string) => {
    localizedRouter.push(`/care-packages/${packageId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="mb-6 h-10 w-48" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="mb-4 h-48 w-full" />
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="mb-2 h-4 w-1/2" />
                <Skeleton className="mb-4 h-8 w-1/3" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={createLocalizedPath('/', locale)}
            className="mb-4 inline-flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
            style={{ color: colors.primary }}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.backToHome')}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-3xl font-bold md:text-4xl mb-2"
                style={{ color: colors.primary }}
              >
                {t('common.myFavorites')}
              </h1>
              <p className="text-gray-600">
                {likedItems.length}{' '}
                {likedItems.length === 1 ? t('common.item') : t('common.items')}{' '}
                {t('common.saved')}
              </p>
            </div>
          </div>
        </div>

        {/* Liked Items Grid */}
        {likedItems.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart
              className="h-16 w-16 mx-auto mb-4"
              style={{ color: colors.primaryLight }}
            />
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: colors.black }}
            >
              {t('common.noFavoritesYet')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('common.startAddingFavorites')}
            </p>
            <Link href={createLocalizedPath('/care-packages', locale)}>
              <Button
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                }}
              >
                {t('common.browseCarePackages')}
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {likedItems.map((item) => {
              // Handle both packages and tests
              const packageData = item.package;
              const testData = item.test;
              const isPackage = !!packageData;
              const isTest = !!testData;

              // Get the item data (package or test)
              const itemData = packageData || testData;

              if (!itemData) {
                // Skip if neither package nor test data exists
                return null;
              }

              const imageUrl = getImageUrl(
                isPackage
                  ? packageData?.imageUrl || null
                  : testData?.imageUrl || null
              );
              const itemName = isPackage
                ? packageData?.name || 'Package'
                : testData?.name || 'Test';
              const itemPrice = isPackage
                ? packageData?.price || 0
                : testData?.price || 0;
              const itemId = isPackage
                ? packageData?.id || ''
                : testData?.id || '';
              const detailUrl = isPackage
                ? createLocalizedPath(`/care-packages/${itemId}`, locale)
                : createLocalizedPath(`/diagnostic-tests/${itemId}`, locale);

              // Skip rendering if no valid ID
              if (!itemId) {
                return null;
              }

              return (
                <Card
                  key={item.id}
                  className="relative flex flex-col overflow-hidden bg-white shadow-sm transition-all hover:shadow-md border h-full"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item)}
                    disabled={removingId === item.id}
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:opacity-80 disabled:opacity-50"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    }}
                    aria-label={t('common.removeFromFavorites')}
                  >
                    <Trash2
                      className="h-4 w-4"
                      style={{ color: colors.primary }}
                    />
                  </button>

                  {/* Item Image */}
                  <div className="relative -mx-6 -mt-6 mb-4 h-48 w-full overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={itemName || t('common.itemLabel')}
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100">
                        <Heart
                          className="h-12 w-12"
                          style={{ color: colors.primaryLight }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 px-4 pb-4 pt-0 space-y-2.5">
                    {/* Category Badge - Only for packages */}
                    {isPackage && packageData?.category && (
                      <Badge
                        className="self-start text-xs"
                        style={{
                          backgroundColor: colors.primaryLight,
                          color: colors.primary,
                        }}
                      >
                        {packageData.category.name}
                      </Badge>
                    )}

                    {/* Title */}
                    <Link href={detailUrl}>
                      <h3
                        className="line-clamp-2 text-left text-lg font-bold leading-tight hover:opacity-80 transition-opacity cursor-pointer"
                        style={{ color: colors.black }}
                        title={itemName || t('common.itemLabel')}
                      >
                        {itemName || t('common.itemLabel')}
                      </h3>
                    </Link>

                    {/* Test Count - Only for packages */}
                    {isPackage && (
                      <p
                        className="text-left text-xs flex-shrink-0"
                        style={{ color: colors.black }}
                      >
                        {packageData?.testCount || 0}{' '}
                        {t('common.testsIncluded')}
                      </p>
                    )}

                    {/* Price and Button - Always at bottom */}
                    <div className="flex-shrink-0 space-y-2.5 mt-auto">
                      {/* Price */}
                      <p
                        className="text-left text-xl font-bold"
                        style={{ color: colors.black }}
                      >
                        ₹ {itemPrice?.toLocaleString('en-IN') || '0'}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            if (isPackage && itemId) {
                              handleBookPackage(itemId);
                            } else if (itemId) {
                              // For tests, navigate to detail page
                              localizedRouter.push(detailUrl);
                            }
                          }}
                          className="flex-1 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wide transition-all hover:opacity-90"
                          style={{
                            backgroundColor: colors.primary,
                            color: colors.white,
                          }}
                        >
                          <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                          {isPackage ? t('common.book') : t('common.view')}
                        </Button>
                        <Button
                          onClick={() => handleRemove(item)}
                          disabled={removingId === item.id}
                          variant="outline"
                          className="px-3 rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                          style={{
                            borderColor: colors.primary,
                            color: colors.primary,
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
