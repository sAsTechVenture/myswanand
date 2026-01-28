'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [popularCarePackages, setPopularCarePackages] = useState<
    CarePackage[]
  >([]);
  const [popularTests, setPopularTests] = useState<PopularTest[]>([]);
  const { isLiked, toggleLike } = useLikedItems();

  const redirectToLogin = () => {
    const currentPath = window.location.pathname;
    router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
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
    router.push(q ? `${path}?search=${encodeURIComponent(q)}` : path);
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
    <>
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
                  <option value="tests">Diagnostic Tests</option>
                  <option value="packages">Care Packages</option>
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
                      ? 'Search diagnostic tests...'
                      : 'Search care packages...'
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
              Search
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
                Book lab test via
              </h3>
              <div className="space-y-4">
                {/* Call and WhatsApp buttons side by side */}
                <div className="flex gap-3">
                  <Button
                    className="flex-1 rounded-lg py-3 text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: '#E91E63' }}
                    onClick={() => window.open(`tel:${getContactPhoneNumberRaw()}`)}
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
                {/* Upload Prescription button */}
                <Button
                  className="w-full rounded-lg border-2 bg-white py-3 transition-all hover:bg-gray-50"
                  style={{
                    borderColor: colors.primaryLight,
                    color: colors.primary,
                  }}
                  onClick={() => router.push('/upload-prescription')}
                >
                  <Upload
                    className="mr-2 h-5 w-5"
                    style={{ color: colors.primary }}
                  />
                  Upload Prescription
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
                Confused Or Have any Doubt?
              </h3>
              <p className="mb-6 text-md text-gray-600">
                Our healthcare experts are here to help you
              </p>
              <div className="flex gap-3">
                <Button
                  className="flex-1 rounded-lg py-3 text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#E91E63' }}
                  onClick={() => window.open(`tel:${getContactPhoneNumberRaw()}`)}
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
            Popular Diagnostic Tests
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
                      router.push(
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
                        router.push('/cart');
                      }, 1000);
                    } catch (error: any) {
                      console.error('Error adding to cart:', error);
                      if (error?.message?.includes('already in your cart')) {
                        toast.info('Test is already in your cart');
                        router.push('/cart');
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
            My Swanand Care Packages
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
                      router.push(
                        `/auth/login?redirect=${encodeURIComponent(
                          currentPath
                        )}`
                      );
                      return;
                    }
                    router.push(`/care-packages/${pkg.id}`);
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
        className="py-16"
        style={{ backgroundColor: colors.primaryLightest }}
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            {/* Title and Subtitle */}
            <div className="mb-8 text-center">
              <h2
                className="mb-2 text-3xl font-bold md:text-4xl"
                style={{ color: colors.black }}
              >
                Schedule Your Tests
              </h2>
              <p className="text-gray-600">
                Choose from priority or normal scheduling options.
              </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="priority" className="w-full">
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                  [data-state="active"][data-slot="tabs-trigger"] {
                    background-color: ${colors.primary} !important;
                    color: ${colors.white} !important;
                  }
                `,
                }}
              />
              <TabsList
                className="mb-6 h-12 w-full rounded-lg p-1"
                style={{ backgroundColor: colors.black }}
              >
                <TabsTrigger
                  value="priority"
                  className="flex-1 rounded-md text-sm font-medium text-white transition-all"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Priority Tests (Cancer Patients)
                </TabsTrigger>
                <TabsTrigger
                  value="normal"
                  className="flex-1 rounded-md text-sm font-medium text-white transition-all"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                >
                  <FlaskConical className="mr-2 h-4 w-4" />
                  Normal Schedule tests
                </TabsTrigger>
              </TabsList>

              {/* Priority Tests Content */}
              <TabsContent value="priority" className="mt-0">
                <Card
                  className="border-2 p-6"
                  style={{ borderColor: colors.primary }}
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center">
                    {/* Icon */}
                    <div
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Leaf className="h-8 w-8 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3
                        className="mb-3 text-2xl font-bold"
                        style={{ color: colors.black }}
                      >
                        Priority Testing for Cancer Patients
                      </h3>
                      <p className="mb-6 text-gray-600">
                        We understand the urgency. Cancer patients receive
                        priority scheduling, fastest turnaround time, and
                        dedicated support from our team.
                      </p>
                      {/* <Button
                        className="rounded-lg px-6 py-3 text-base font-semibold"
                        style={{
                          backgroundColor: colors.primary,
                          color: colors.white,
                        }}
                        onClick={() => console.log('Schedule priority test')}
                      >
                        Schedule Priority Test
                      </Button> */}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Normal Schedule Content */}
              <TabsContent value="normal" className="mt-0">
                <Card
                  className="border-2 p-6"
                  style={{ borderColor: colors.primary }}
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center">
                    {/* Icon */}
                    <div
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <FlaskConical className="h-8 w-8 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3
                        className="mb-3 text-2xl font-bold"
                        style={{ color: colors.black }}
                      >
                        Normal Schedule Tests
                      </h3>
                      <p className="mb-6 text-gray-600">
                        Schedule your tests at your convenience. Choose from
                        available time slots and get your results within
                        standard turnaround times.
                      </p>
                      {/* <Button
                        className="rounded-lg px-6 py-3 text-base font-semibold"
                        style={{
                          backgroundColor: colors.primary,
                          color: colors.white,
                        }}
                        onClick={() => console.log('Schedule normal test')}
                      >
                        Schedule Test
                      </Button> */}
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
        className="py-16"
        style={{ backgroundColor: colors.primaryLight }}
      >
        <div className="container mx-auto px-12">
          <h2
            className="mb-12 text-center text-3xl font-bold md:text-4xl"
            style={{ color: colors.black }}
          >
            Health concerns? Talk to a specialist!
          </h2>
          <div className="flex justify-center">
            <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
              {/* Doctor Card */}
              <Card className="overflow-hidden bg-white p-6 shadow-md w-100">
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
                    Doctor
                  </h3>
                  {/* Description */}
                  <p className="mb-6 text-sm text-gray-600">
                    Book appointments with experienced doctors for personalized
                    health advice
                  </p>
                  {/* Button */}
                  <Link href="/doctor-consultation">
                    <Button
                      className="w-full rounded-lg px-6 py-3 text-sm font-semibold"
                      style={{
                        backgroundColor: colors.black,
                        color: colors.white,
                      }}
                    >
                      Book Appointment
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Dietician Card */}
              <Card className="overflow-hidden bg-white p-6 shadow-md w-100">
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
                    Dietician
                  </h3>
                  {/* Description */}
                  <p className="mb-6 text-sm text-gray-600">
                    Get personalized nutrition plans from certified dieticians
                  </p>
                  {/* Button */}
                  <Link href="/dietitian-consultation">
                    <Button
                      className="w-full rounded-lg px-6 py-3 text-sm font-semibold"
                      style={{
                        backgroundColor: colors.black,
                        color: colors.white,
                      }}
                    >
                      Book Appointment
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
                  NEED IMMEDIATE HELP IN AN EMERGENCY, PLEASE CONTACT THE
                  NUMBERS BELOW.
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
                  In case of a disaster in your area, please contact the
                  relevant number immediately. All citizens should save these
                  numbers and use them if needed.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Women Wellness Care Section */}
      <section
        className="py-16"
        style={{ backgroundColor: colors.lightestGreen }}
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
              Women Wellness Care
            </h2>

            {/* Description */}
            <p className="mb-8 text-center text-base text-gray-700 md:text-lg">
              Because early awareness and timely care can protect your health
              and give you confidence for a better tomorrow.
            </p>

            {/* Buttons */}
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                className="rounded-lg px-8 py-4 text-base font-semibold transition-all hover:opacity-90"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                }}
                onClick={() => router.push('/womens-care/breast-cancer')}
              >
                Breast Cancer Care
              </Button>
              <Button
                className="rounded-lg px-8 py-4 text-base font-semibold transition-all hover:opacity-90"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                }}
                onClick={() => console.log('Cervical Cancer Care')}
              >
                Cervical Cancer Care
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* My Happiness Corner Section */}
      <section
        className="py-16"
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
              My Happiness Corner
            </h2>

            {/* Description */}
            <p className="mb-8 text-center text-base text-gray-700 md:text-lg">
              Nurture your well-being with daily reflections, mindfulness practices, positive affirmations, and meditation music.
            </p>

            {/* Button */}
            <div className="flex justify-center">
              <Button
                className="rounded-lg px-8 py-4 text-base font-semibold transition-all hover:opacity-90"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                }}
                onClick={() => router.push('/my-happiness-corner')}
              >
                Explore Happiness Corner
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Health Card Section */}
      <section className="py-16" style={{ backgroundColor: colors.black }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-8 lg:flex-row">
            {/* Left Side - Text (2/3 width) */}
            <div className="flex-1 text-center lg:w-2/3 lg:text-left">
              <h2 className="mb-2 text-4xl font-bold text-white md:text-5xl">
                My Swanand Family Health Card
              </h2>
              <p className="mb-2 text-lg text-white">
                Get exclusive benefits with our health card program:
              </p>
              <div className="mb-8 space-y-1">
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 text-xl text-white">•</span>
                  <p className="text-lg text-white">
                    Up to 20% discount on all tests
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 text-xl text-white">•</span>
                  <p className="text-lg text-white">
                    Priority booking & home collection
                  </p>
                </div>
                {/* <div className="flex items-start gap-3">
                  <span className="mt-1.5 text-xl text-white">•</span>
                  <p className="text-lg text-white">
                    Free annual health checkup
                  </p>
                </div> */}
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 text-xl text-white">•</span>
                  <p className="text-lg text-white">
                    Family coverage available
                  </p>
                </div>
              </div>
              <Link href="/swanand-card/apply">
                <Button
                  className="rounded-lg bg-white px-8 py-4 font-semibold"
                  style={{ color: colors.primary }}
                >
                  Apply Swanand Card
                </Button>
              </Link>
            </div>

            {/* Right Side - Health Card Image (1/3 width) */}
            <div className="flex-1 lg:w-1/3">
              <div className="relative h-[400px] w-full md:h-[500px]">
                <div className="absolute inset-0 transform rotate-[-5deg] transition-transform hover:rotate-[-3deg]">
                  <Image
                    src="/home/healthCard.png"
                    alt="Swanand Family Health Card"
                    fill
                    className="object-contain drop-shadow-2xl"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
