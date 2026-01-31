'use client';

import { useEffect, useState } from 'react';
import { useLocalizedRouter } from '@/lib/hooks/useLocalizedRouter';
import { createLocalizedPath, getCurrentLocale } from '@/lib/utils/i18n';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Phone,
  MessageCircle,
  Upload,
  Heart,
  FlaskConical,
  AlertCircle,
  HeartPulse,
  Search,
  ChevronDown,
} from 'lucide-react';
import { CarePackageCard } from '@/components/care-packages';
import { DiagnosticTestCard } from '@/components/tests';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { colors } from '@/config/theme';
import { Leaf } from 'lucide-react';

import { BannerCarousel } from '@/components/common/BannerCarousel';
import type { Banner } from '@/components/common/BannerCarousel';
import { useLikedItems } from '@/lib/hooks/useLikedItems';
import { useDictionary } from '@/lib/hooks/useDictionary';
import { getAuthToken } from '@/lib/utils/auth';
import { toast } from '@/lib/toast';
import {
  getContactPhoneNumberRaw,
  getContactPhoneNumberWhatsApp,
} from '@/lib/constants';
import Link from 'next/link';

interface CarePackage {
  id: string | number;
  category?: string;
  title: string;
  testCount: number;
  price: number;
  features?: string[];
  [key: string]: unknown;
}

interface PopularTest {
  id: string | number;
  title: string;
  description?: string;
  testCount?: number;
  price: number;
  ageRange?: string;
  features?: string[];
  imageUrl?: string;
  [key: string]: unknown;
}

export default function Home() {
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const localizedRouter = useLocalizedRouter();
  const { dictionary, loading: dictLoading } = useDictionary(locale);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [popularCarePackages, setPopularCarePackages] = useState<CarePackage[]>(
    []
  );
  const [popularTests, setPopularTests] = useState<PopularTest[]>([]);
  const { isLiked, toggleLike } = useLikedItems();

  // Helper function to get translation
  const t = (key: string): string => {
    if (!dictionary || dictLoading) {
      return key;
    }
    const keys = key.split('.');
    let value: any = dictionary;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  // Helper for translations with fallback when key is shown (e.g. during load or missing key)
  const tf = (key: string, fallback: string): string => {
    const val = t(key);
    return val && !val.startsWith('common.') && val !== 'common'
      ? val
      : fallback;
  };

  const redirectToLogin = () => {
    const currentPath = window.location.pathname;
    localizedRouter.push(
      `/auth/login?redirect=${encodeURIComponent(currentPath)}`
    );
  };

  // Loading states for each section
  const [bannersLoading, setBannersLoading] = useState(true);
  const [popularTestsLoading, setPopularTestsLoading] = useState(true);
  const [carePackagesLoading, setCarePackagesLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // Home search bar
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [homeSearchType, setHomeSearchType] = useState<'tests' | 'packages'>(
    'tests'
  );

  const handleHomeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = homeSearchQuery.trim();
    const path =
      homeSearchType === 'tests' ? '/diagnostic-tests' : '/care-packages';
    localizedRouter.push(q ? `${path}?search=${encodeURIComponent(q)}` : path);
  };

  // Fetch banners
  useEffect(() => {
    async function fetchBanners() {
      try {
        setBannersLoading(true);
        const bannerRes = await apiClient.get<{
          data?: Banner[] | { data?: { banners?: Banner[] } };
          banners?: Banner[];
        }>('/patient/banner');

        const bannerData = bannerRes.data as any;
        let bannerArray: Banner[] = [];

        if (
          bannerData?.data?.banners &&
          Array.isArray(bannerData.data.banners)
        ) {
          bannerArray = bannerData.data.banners;
        } else if (bannerData?.data && Array.isArray(bannerData.data)) {
          bannerArray = bannerData.data;
        } else if (bannerData?.banners && Array.isArray(bannerData.banners)) {
          bannerArray = bannerData.banners;
        } else if (Array.isArray(bannerData)) {
          bannerArray = bannerData;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        setBanners(
          bannerArray.map((banner: any) => {
            let imageUrl = banner.imageUrl || banner.image;
            if (
              imageUrl &&
              imageUrl.startsWith('/') &&
              !imageUrl.startsWith('//')
            ) {
              let urlToUse = baseUrl;
              if (baseUrl.endsWith('/api') && imageUrl.startsWith('/api')) {
                urlToUse = baseUrl.replace(/\/api$/, '');
              }
              imageUrl = `${urlToUse}${imageUrl}`;
            }
            return {
              id: banner.id,
              title: banner.title,
              imageUrl,
              isActive: banner.isActive !== undefined ? banner.isActive : true,
              createdAt: banner.createdAt,
              updatedAt: banner.updatedAt,
            };
          })
        );
      } catch (err) {
        console.error('Error fetching banners:', err);
      } finally {
        setBannersLoading(false);
      }
    }

    fetchBanners();
  }, []);

  // Fetch popular tests
  useEffect(() => {
    async function fetchPopularTests() {
      try {
        setPopularTestsLoading(true);
        const popularTestsRes = await apiClient.get<{
          data?: PopularTest[] | { data?: { tests?: PopularTest[] } };
          tests?: PopularTest[];
        }>('/patient/popular-tests');

        const popularTestsData = popularTestsRes.data as any;
        let testsArray: any[] = [];

        if (
          popularTestsData?.data?.tests &&
          Array.isArray(popularTestsData.data.tests)
        ) {
          testsArray = popularTestsData.data.tests;
        } else if (
          popularTestsData?.data &&
          Array.isArray(popularTestsData.data)
        ) {
          testsArray = popularTestsData.data;
        } else if (
          popularTestsData?.tests &&
          Array.isArray(popularTestsData.tests)
        ) {
          testsArray = popularTestsData.tests;
        } else if (Array.isArray(popularTestsData)) {
          testsArray = popularTestsData;
        }

        // Map and fix image URLs
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const mappedTests = testsArray.map((test: any) => {
          let imageUrl = test.imageUrl;
          if (imageUrl) {
            // Check if it's already a full URL
            if (!imageUrl.startsWith('http')) {
              // It's a relative URL, prepend base URL
              if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
                let urlToUse = baseUrl;
                if (baseUrl.endsWith('/api') && imageUrl.startsWith('/api')) {
                  urlToUse = baseUrl.replace(/\/api$/, '');
                }
                imageUrl = `${urlToUse}${imageUrl}`;
              }
            }
            // If it contains localhost:3000, replace with correct base URL
            if (imageUrl.includes('localhost:3000')) {
              imageUrl = imageUrl.replace(
                /http:\/\/localhost:3000[^/]*/,
                baseUrl.replace(/\/api$/, '')
              );
            }
          }
          return {
            ...test,
            imageUrl,
            title: test.name || test.title,
          };
        });

        setPopularTests(mappedTests);
        console.log('popularTests', mappedTests);
      } catch (err) {
        console.error('Error fetching popular tests:', err);
      } finally {
        setPopularTestsLoading(false);
      }
    }

    fetchPopularTests();
  }, []);

  // Fetch popular care packages
  useEffect(() => {
    async function fetchPopularCarePackages() {
      try {
        setCarePackagesLoading(true);
        const res = await apiClient.get<{
          data?: { packages?: CarePackage[] };
          packages?: CarePackage[];
        }>('/patient/care-packages/popular');

        const data = res.data as any;
        let list: CarePackage[] = [];

        if (data?.data?.packages && Array.isArray(data.data.packages)) {
          list = data.data.packages;
        } else if (data?.packages && Array.isArray(data.packages)) {
          list = data.packages;
        } else if (data?.data && Array.isArray(data.data)) {
          list = data.data;
        } else if (Array.isArray(data)) {
          list = data;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const processed = list.map((pkg: any) => {
          let imageUrl = pkg.imageUrl;
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
          return {
            ...pkg,
            imageUrl,
            title: pkg.name || pkg.title,
            category: pkg.category?.name || pkg.category || 'HEALTH',
            testCount: pkg.testCount || 0,
          };
        });

        setPopularCarePackages(processed);
      } catch (err) {
        console.error('Error fetching popular care packages:', err);
      } finally {
        setCarePackagesLoading(false);
      }
    }

    fetchPopularCarePackages();
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* Search Bar - top */}
      <section
        className="w-full border-b py-4 sm:py-5"
        style={{ backgroundColor: colors.white }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <form
            onSubmit={handleHomeSearch}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-stretch">
              {/* Dropdown: what to search */}
              <div className="relative flex-shrink-0 sm:w-[180px]">
                <select
                  value={homeSearchType}
                  onChange={(e) =>
                    setHomeSearchType(e.target.value as 'tests' | 'packages')
                  }
                  className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-9 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 sm:h-11"
                  style={{
                    borderColor: colors.primaryLight,
                  }}
                  aria-label="Search in"
                >
                  <option value="tests">{t('common.diagnosticTests')}</option>
                  <option value="packages">{t('common.carePackages')}</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                  aria-hidden
                />
              </div>
              {/* Search input */}
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden
                />
                <Input
                  type="search"
                  placeholder={
                    homeSearchType === 'tests'
                      ? t('common.searchDiagnosticTests')
                      : t('common.searchCarePackages')
                  }
                  value={homeSearchQuery}
                  onChange={(e) => setHomeSearchQuery(e.target.value)}
                  className="h-10 border-gray-200 pl-9 focus-visible:ring-2 focus-visible:ring-gray-200 sm:h-11"
                  style={{ borderColor: colors.primaryLight }}
                  aria-label="Search"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="h-10 w-full sm:h-11 sm:w-auto sm:min-w-[100px]"
              style={{
                backgroundColor: colors.primary,
                color: colors.white,
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              {t('common.search')}
            </Button>
          </form>
        </div>
      </section>

      {/* Contact Cards Section */}
      <section className="py-12" style={{ backgroundColor: colors.white }}>
        <div className="container mx-auto px-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
            {/* Left Card - Book lab test via */}
            <Card
              className="rounded-xl bg-white p-6 shadow-md"
              style={{ backgroundColor: colors.primaryLightest }}
            >
              <h3
                className="mb-6 text-3xl font-bold"
                style={{
                  color: colors.black,
                }}
              >
                {t('common.bookLabTest')}
              </h3>
              <div className="space-y-4">
                {/* Call and WhatsApp buttons side by side */}
                <div className="flex gap-3">
                  <Button
                    className="flex-1 rounded-lg py-3 text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: '#E91E63' }}
                    onClick={() =>
                      window.open(`tel:${getContactPhoneNumberRaw()}`)
                    }
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    {t('common.call')}
                  </Button>
                  <Button
                    className="flex-1 rounded-lg py-3 text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: '#25D366' }}
                    onClick={() =>
                      window.open(
                        `https://wa.me/${getContactPhoneNumberWhatsApp()}`,
                        '_blank'
                      )
                    }
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    {t('common.whatsapp')}
                  </Button>
                </div>
                {/* Upload Prescription button */}
                <Button
                  className="w-full rounded-lg border-2 bg-white py-3 transition-all hover:bg-gray-50"
                  style={{
                    borderColor: colors.primaryLight,
                    color: colors.primary,
                  }}
                  onClick={() => localizedRouter.push('/upload-prescription')}
                >
                  <Upload
                    className="mr-2 h-5 w-5"
                    style={{ color: colors.primary }}
                  />
                  {t('common.uploadPrescription')}
                </Button>
              </div>
            </Card>

            {/* Right Card - Confused Or Have any Doubt? */}
            <Card
              className="rounded-xl bg-white p-6 shadow-md"
              style={{ backgroundColor: colors.primaryLightest }}
            >
              <h3
                className="mb-2 text-3xl font-bold"
                style={{ color: colors.black }}
              >
                {t('common.confusedOrDoubt')}
              </h3>
              <p className="mb-6 text-md text-gray-600">
                {t('common.healthcareExperts')}
              </p>
              <div className="flex gap-3">
                <Button
                  className="flex-1 rounded-lg py-3 text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#E91E63' }}
                  onClick={() =>
                    window.open(`tel:${getContactPhoneNumberRaw()}`)
                  }
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Call
                </Button>
                <Button
                  className="flex-1 rounded-lg py-3 text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#25D366' }}
                  onClick={() =>
                    window.open(
                      `https://wa.me/${getContactPhoneNumberWhatsApp()}`,
                      '_blank'
                    )
                  }
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Banner Carousel Section */}
      {bannersLoading ? (
        <section
          className="relative w-full overflow-hidden"
          style={{ backgroundColor: colors.primary }}
        >
          <Skeleton className="h-[250px] w-full sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-[600px]" />
        </section>
      ) : (
        banners.length > 0 && (
          <BannerCarousel banners={banners} autoSlideInterval={5000} />
        )
      )}

      {/* Popular Diagnostic Tests Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-left text-3xl font-bold">
            {t('common.popularDiagnosticTests')}
          </h2>
          {popularTestsLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="mb-4 h-20 w-20 rounded-full mx-auto" />
                  <Skeleton className="mb-2 h-6 w-3/4" />
                  <Skeleton className="mb-2 h-4 w-1/2" />
                  <Skeleton className="mb-4 h-8 w-1/3" />
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="mb-4 h-4 w-2/3" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </Card>
              ))}
            </div>
          ) : popularTests.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {popularTests.map((test, index) => (
                <DiagnosticTestCard
                  key={test.id || index}
                  title={test.name as string}
                  testId={test.id}
                  description={test.description}
                  testCount={test.testCount}
                  price={test.price}
                  ageRange={test.ageRange}
                  features={test.features}
                  imageUrl={test.imageUrl}
                  isFavorite={isLiked(String(test.id), 'test')}
                  onFavoriteToggle={() =>
                    toggleLike(String(test.id), 'test', redirectToLogin)
                  }
                  onAddToCart={async () => {
                    // Check if user is logged in
                    const token = getAuthToken();
                    if (!token) {
                      const currentPath = window.location.pathname;
                      localizedRouter.push(
                        `/auth/login?redirect=${encodeURIComponent(
                          currentPath
                        )}`
                      );
                      return;
                    }

                    try {
                      await apiClient.post(
                        '/patient/cart',
                        { testId: String(test.id) },
                        { token }
                      );
                      toast.success('Test added to cart successfully!');
                      // Dispatch event to update cart count in header
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new Event('cart-change'));
                      }
                      // Optionally redirect to cart
                      setTimeout(() => {
                        localizedRouter.push('/cart');
                      }, 1000);
                    } catch (error: any) {
                      console.error('Error adding to cart:', error);
                      if (error?.message?.includes('already in your cart')) {
                        toast.info('Test is already in your cart');
                        localizedRouter.push('/cart');
                      } else {
                        toast.error(
                          'Failed to add test to cart. Please try again.'
                        );
                      }
                    }
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* My Swanand Care Packages Section */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">
            {t('common.mySwanandCarePackages')}
          </h2>

          {/* Care Packages Grid */}
          {carePackagesLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="mb-4 h-6 w-20" />
                  <Skeleton className="mb-2 h-5 w-3/4" />
                  <Skeleton className="mb-2 h-4 w-1/2" />
                  <Skeleton className="mb-4 h-6 w-1/3" />
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="mb-4 h-4 w-2/3" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </Card>
              ))}
            </div>
          ) : popularCarePackages.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {popularCarePackages.map((pkg, index) => (
                <CarePackageCard
                  key={pkg.id || index}
                  packageId={pkg.id}
                  category={(pkg.category as string) || 'HEALTH'}
                  index={index}
                  title={
                    (pkg.title as string) || (pkg.name as string) || 'Package'
                  }
                  testCount={(pkg.testCount as number) || 0}
                  price={pkg.price as number}
                  features={pkg.features as string[]}
                  imageUrl={pkg.imageUrl as string | undefined}
                  isLiked={isLiked(String(pkg.id), 'package')}
                  onLikeToggle={() =>
                    toggleLike(String(pkg.id), 'package', redirectToLogin)
                  }
                  onBookPackage={() => {
                    // Check if user is logged in
                    const token =
                      typeof window !== 'undefined'
                        ? localStorage.getItem('patient_token')
                        : null;
                    if (!token) {
                      const currentPath = window.location.pathname;
                      localizedRouter.push(
                        `/auth/login?redirect=${encodeURIComponent(
                          currentPath
                        )}`
                      );
                      return;
                    }
                    localizedRouter.push(`/care-packages/${pkg.id}`);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No popular packages available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Schedule Your Tests Section */}
      <section
        className="py-12 sm:py-16"
        style={{ backgroundColor: colors.primaryLightest }}
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            {/* Title and Subtitle */}
            <div className="mb-6 sm:mb-8 text-center">
              <h2
                className="mb-2 text-2xl sm:text-3xl font-bold md:text-4xl"
                style={{ color: colors.black }}
              >
                {t('common.scheduleYourTests')}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                We offer priority scheduling for cancer patients and normal
                scheduling for routine tests.
              </p>
            </div>

            {/* Tabs - Clean switch style */}
            <Tabs defaultValue="priority" className="w-full">
              <div className="flex justify-center mb-6">
                <TabsList
                  className="h-11 sm:h-12 w-full max-w-md grid grid-cols-2 rounded-full p-1"
                  style={{ backgroundColor: colors.black }}
                >
                  <TabsTrigger
                    value="priority"
                    className="rounded-full text-xs sm:text-sm font-medium text-white data-[state=active]:text-white transition-all"
                    style={{
                      backgroundColor: 'transparent',
                    }}
                    data-active-style
                  >
                    <Heart className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">
                      {t('common.priorityTests')}
                    </span>
                    <span className="xs:hidden">Priority</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="normal"
                    className="rounded-full text-xs sm:text-sm font-medium text-white data-[state=active]:text-white transition-all"
                    style={{
                      backgroundColor: 'transparent',
                    }}
                  >
                    <FlaskConical className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">
                      {t('common.normalSchedule')}
                    </span>
                    <span className="xs:hidden">Normal</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                  [data-slot="tabs-trigger"][data-state="active"] {
                    background-color: ${colors.primary} !important;
                    color: white !important;
                  }
                `,
                }}
              />

              {/* Priority Tests Content */}
              <TabsContent value="priority" className="mt-0">
                <Card
                  className="border-2 p-4 sm:p-6"
                  style={{ borderColor: colors.primary }}
                >
                  <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center">
                    {/* Icon */}
                    <div
                      className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Leaf className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3
                        className="mb-2 sm:mb-3 text-xl sm:text-2xl font-bold"
                        style={{ color: colors.black }}
                      >
                        Priority Testing for Cancer Patients
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        We understand the urgency. Cancer patients receive
                        priority scheduling, fastest report delivery, and
                        dedicated support throughout their diagnostic journey.
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Normal Schedule Content */}
              <TabsContent value="normal" className="mt-0">
                <Card
                  className="border-2 p-4 sm:p-6"
                  style={{ borderColor: colors.primary }}
                >
                  <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center">
                    {/* Icon */}
                    <div
                      className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <FlaskConical className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3
                        className="mb-2 sm:mb-3 text-xl sm:text-2xl font-bold"
                        style={{ color: colors.black }}
                      >
                        Normal Schedule Tests
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        For routine health check-ups and preventive diagnostics,
                        book your tests at your convenience with flexible
                        scheduling options.
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Health Concerns Section */}
      <section
        className="py-12 sm:py-16"
        style={{ backgroundColor: colors.primaryLight }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <h2
            className="mb-8 sm:mb-12 text-center text-2xl sm:text-3xl font-bold md:text-4xl"
            style={{ color: colors.black }}
          >
            {t('common.healthConcerns')}
          </h2>
          <div className="flex justify-center">
            <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:gap-8">
              {/* Doctor Card */}
              <Card className="overflow-hidden bg-white p-4 sm:p-6 shadow-md w-full">
                <div className="flex flex-col items-center text-center">
                  {/* Doctor Image */}
                  <div className="relative mb-4 h-48 w-full">
                    <Image
                      src="/home/doctor.jpg"
                      alt="Doctor"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  {/* Title */}
                  <h3
                    className="mb-3 text-2xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    {t('common.doctor')}
                  </h3>
                  {/* Description */}
                  <p className="mb-6 text-sm text-gray-600">
                    {t('common.doctorDescription')}
                  </p>
                  {/* Button */}
                  <Link
                    href={createLocalizedPath('/doctor-consultation', locale)}
                  >
                    <Button
                      className="w-full rounded-lg px-6 py-3 text-sm font-semibold"
                      style={{
                        backgroundColor: colors.black,
                        color: colors.white,
                      }}
                    >
                      {t('common.bookAppointment')}
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Dietician Card */}
              <Card className="overflow-hidden bg-white p-4 sm:p-6 shadow-md w-full">
                <div className="flex flex-col items-center text-center">
                  {/* Dietician Image */}
                  <div className="relative mb-4 h-48 w-full">
                    <Image
                      src="/home/dietcian.jpg"
                      alt="Dietician"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  {/* Title */}
                  <h3
                    className="mb-3 text-2xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    {t('common.dietician')}
                  </h3>
                  {/* Description */}
                  <p className="mb-6 text-sm text-gray-600">
                    {t('common.dieticianDescription')}
                  </p>
                  {/* Button */}
                  <Link
                    href={createLocalizedPath(
                      '/dietitian-consultation',
                      locale
                    )}
                  >
                    <Button
                      className="w-full rounded-lg px-6 py-3 text-sm font-semibold"
                      style={{
                        backgroundColor: colors.black,
                        color: colors.white,
                      }}
                    >
                      {t('common.bookAppointment')}
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <Card className="shadow-lg">
              <div className="p-6 md:p-8">
                {/* Emergency Icon */}
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Heading */}
                <h2 className="mb-6 text-center text-lg font-bold text-black md:text-xl">
                  {t('common.emergencyContact')}
                </h2>

                {/* Fire Station Contacts - Purple Block */}
                <div
                  className="mb-6 rounded-lg p-4 md:p-6"
                  style={{ backgroundColor: colors.primary }}
                >
                  <div className="space-y-3 text-sm text-white md:text-base">
                    <div>
                      <strong>Adharwadi Fire Station, Kalyan (West):</strong>{' '}
                      2310155, 2315101, 101/8591767493
                    </div>
                    <div>
                      <strong>MIDC Fire Station, Dombivli (East):</strong>{' '}
                      2470357/8591764174
                    </div>
                    <div>
                      <strong>'D' Ward Fire Station, Kalyan (East):</strong>{' '}
                      2365101/8591752153
                    </div>
                    <div>
                      <strong>'H' Ward Fire Station, Dombivli (West):</strong>{' '}
                      2400447/8591747192
                    </div>
                    <div>
                      <strong>Titwala Fire Station, Titwala:</strong> 8097796018
                    </div>
                    <div>
                      <strong>
                        Palava Fire Station, Palava, Dombivli (East):
                      </strong>{' '}
                      9076123101
                    </div>
                  </div>
                </div>

                {/* Instruction Text */}
                <p className="text-center text-sm text-black md:text-base">
                  {t('common.emergencyDescription')}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Women Wellness Care Section */}
      <section
        className="py-16 mb-4"
        style={{ backgroundColor: colors.primaryLightest }}
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.green }}
              >
                <HeartPulse className="h-10 w-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="mb-4 text-center text-3xl font-bold text-black md:text-4xl">
              {t('common.womenWellnessCare')}
            </h2>

            {/* Description */}
            <p className="mb-8 text-center text-base text-gray-700 md:text-lg">
              {t('common.womenWellnessDescription')}
            </p>

            {/* Buttons */}
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                className="rounded-lg px-8 py-4 text-base font-semibold transition-all hover:opacity-90"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                }}
                onClick={() =>
                  localizedRouter.push('/womens-care/breast-cancer')
                }
              >
                {t('common.breastCancerCare')}
              </Button>
              <Button
                className="rounded-lg px-8 py-4 text-base font-semibold transition-all hover:opacity-90"
                style={{
                  backgroundColor: colors.white,
                  color: colors.primary,
                  border: `1px solid ${colors.primary}`,
                }}
                onClick={() => console.log('Cervical Cancer Care')}
              >
                {t('common.cervicalCancerCare')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* My Happiness Corner Section */}
      <section
        className="py-16 mb-4"
        style={{ backgroundColor: colors.lightestGreen }}
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.primary }}
              >
                <Heart className="h-10 w-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="mb-4 text-center text-3xl font-bold text-black md:text-4xl">
              {t('common.myHappinessCorner')}
            </h2>

            {/* Description */}
            <p className="mb-8 text-center text-base text-gray-700 md:text-lg">
              {t('common.happinessDescription')}
            </p>

            {/* Button */}
            <div className="flex justify-center">
              <Button
                className="rounded-lg px-8 py-4 text-base font-semibold transition-all hover:opacity-90"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                }}
                onClick={() => localizedRouter.push('/my-happiness-corner')}
              >
                {t('common.exploreHappinessCorner')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Health Card Section */}
      <section
        className="py-12 sm:py-16 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colors.primaryLightest} 0%, ${colors.primaryLight} 50%, ${colors.primaryLightest} 100%)`,
        }}
      >
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Medical cross patterns */}
          <svg
            className="absolute top-8 left-8 w-8 h-8 opacity-20"
            viewBox="0 0 24 24"
            fill={colors.primary}
          >
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          <svg
            className="absolute top-20 left-1/4 w-6 h-6 opacity-15"
            viewBox="0 0 24 24"
            fill={colors.primary}
          >
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          <svg
            className="absolute bottom-16 left-16 w-10 h-10 opacity-20"
            viewBox="0 0 24 24"
            fill={colors.primary}
          >
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          <svg
            className="absolute top-1/3 right-1/4 w-5 h-5 opacity-15"
            viewBox="0 0 24 24"
            fill={colors.primary}
          >
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          <svg
            className="absolute bottom-24 right-16 w-7 h-7 opacity-20"
            viewBox="0 0 24 24"
            fill={colors.primary}
          >
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          {/* Decorative circles */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
            style={{ backgroundColor: colors.primary }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-10"
            style={{ backgroundColor: colors.primary }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-stretch lg:gap-0">
            {/* Left Side - Card Style Content */}
            <div className="relative w-full lg:w-2/3">
              <div
                className="relative rounded-3xl p-6 sm:p-8 md:p-10 lg:rounded-l-[40px] lg:rounded-r-[60px] overflow-hidden shadow-2xl"
                style={{
                  background: `linear-gradient(180deg, ${colors.white} 0%, ${colors.primaryLightest} 100%)`,
                  minHeight: '400px',
                  border: `2px solid ${colors.primaryLight}`,
                }}
              >
                {/* Inner decorative elements */}
                <div className="absolute top-4 right-4 opacity-30">
                  <svg
                    className="w-12 h-12"
                    viewBox="0 0 24 24"
                    fill={colors.primary}
                  >
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </div>
                <div className="absolute bottom-8 left-8 opacity-20">
                  <svg
                    className="w-8 h-8"
                    viewBox="0 0 24 24"
                    fill={colors.primary}
                  >
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Title with swanand styling */}
                  <div className="mb-4">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-0 sm:gap-2 mb-1 text-center sm:text-left">
                      <span
                        className="text-2xl sm:text-3xl md:text-4xl font-bold"
                        style={{ color: colors.primary }}
                      >
                        MySwanand
                      </span>
                      <span
                        className="text-2xl sm:text-3xl md:text-4xl font-light"
                        style={{ color: colors.black }}
                      >
                        {tf(
                          'common.familyHealthCardTitle',
                          'Family Health Card'
                        )}
                      </span>
                    </div>
                    <p
                      className="text-lg sm:text-xl font-semibold"
                      style={{ color: colors.yellow }}
                    >
                      {tf('common.familyHealthCardPrice', 'Just At Rs. 499')}
                    </p>
                  </div>

                  {/* Benefits List with styled bullets */}
                  <ul className="mb-6 sm:mb-8 space-y-3">
                    <li className="flex items-center gap-3">
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <p
                        className="text-sm sm:text-base md:text-lg"
                        style={{ color: colors.black }}
                      >
                        {tf(
                          'common.familyHealthCardBenefit1',
                          'Valid For One Year'
                        )}
                      </p>
                    </li>
                    <li className="flex items-center gap-3">
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <p
                        className="text-sm sm:text-base md:text-lg"
                        style={{ color: colors.black }}
                      >
                        {tf(
                          'common.familyHealthCardBenefit2',
                          'Upto 4 Family Members Covered'
                        )}
                      </p>
                    </li>
                    <li className="flex items-center gap-3">
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <p
                        className="text-sm sm:text-base md:text-lg"
                        style={{ color: colors.black }}
                      >
                        {tf(
                          'common.familyHealthCardBenefit3',
                          '10+ Services Free Of Cost & Discounted Price'
                        )}
                      </p>
                    </li>
                  </ul>

                  {/* Apply Button */}
                  <Link
                    href={createLocalizedPath('/swanand-card/apply', locale)}
                  >
                    <Button
                      className="rounded-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.white,
                      }}
                    >
                      {t('common.applySwanandCard')}
                    </Button>
                  </Link>

                  {/* Tagline */}
                  <p
                    className="mt-6 text-xs sm:text-sm italic"
                    style={{ color: colors.primary }}
                  >
                    Care Backed By Science
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Mascot Image */}
            <div className="relative hidden lg:flex lg:w-1/3 items-end justify-center">
              <div className="relative h-[450px] w-full">
                <Image
                  src="/home/mascot.jpg"
                  alt="Swanand Health Mascot"
                  fill
                  className="object-contain object-bottom drop-shadow-2xl"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
