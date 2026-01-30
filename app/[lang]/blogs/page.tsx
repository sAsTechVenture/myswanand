'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useLocalizedRouter } from '@/lib/hooks/useLocalizedRouter';
import { createLocalizedPath, getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import Link from 'next/link';
import { Search, ArrowUpRight } from 'lucide-react';
import PageBanner from '@/components/common/PageBanner';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { colors } from '@/config/theme';
import { apiClient } from '@/lib/api';
import Image from 'next/image';
import GlareHover from '@/components/GlareHover';

interface Blog {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  status: string;
  uploadTime: number | null;
  shareTime: number | null;
  downloadTime: number | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

function BlogsContent() {
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const localizedRouter = useLocalizedRouter();
  const searchParams = useSearchParams();
  const { dictionary } = useDictionary(locale);
  const [blogs, setBlogs] = useState<Blog[]>([]);

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
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false,
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Get query params from URL (source of truth)
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';

  // Sync URL params to state on mount/change
  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  // Debounce: when user stops typing, sync search to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const urlSearch = searchParams.get('search') || '';
      if (searchQuery !== urlSearch) {
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery.trim()) {
          params.set('search', searchQuery.trim());
        } else {
          params.delete('search');
        }
        params.set('page', '1');
        localizedRouter.push(`/blogs?${params.toString()}`);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, searchParams, localizedRouter]);

  // Fetch blogs
  useEffect(() => {
    async function fetchBlogs() {
      try {
        setLoading(true);
        const params: Record<string, string | number> = {
          page: page,
          limit: 10,
        };

        if (search) {
          params.search = search;
        }

        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          queryParams.append(key, value.toString());
        });
        const queryString = queryParams.toString();
        const url = `/patient/blogs${queryString ? `?${queryString}` : ''}`;

        const response = await apiClient.get<{
          success: boolean;
          data: {
            data: Blog[];
            pagination: PaginationMeta;
          };
        }>(url);

        if (response.data.success && response.data.data) {
          setBlogs(response.data.data.data || []);
          setPagination(response.data.data.pagination);
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, [page, search]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    localizedRouter.push(`/blogs?${params.toString()}`);
  };

  // Truncate content for card preview (strip HTML tags)
  const truncateContent = (content: string, maxLength: number = 80): string => {
    // Strip HTML tags
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Banner Section */}
      <PageBanner title={t('common.blogs')} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              style={{ color: '#9CA3AF' }}
            />
            <Input
              type="text"
              placeholder={t('common.searchBlogs')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-6 text-base border-2 rounded-lg"
              style={{
                borderColor: colors.primary,
              }}
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing all {pagination.totalItems} results
          </p>
        </div>

        {/* Blog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-3xl overflow-hidden">
                <Skeleton className="h-[380px] w-full" />
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-gray-50">
            <p className="text-gray-600">No blogs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {blogs.map((blog) => {
              // Process image URL similar to diagnostic-tests
              const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
              let imageUrl = blog.imageUrl;
              if (imageUrl) {
                if (!imageUrl.startsWith('http')) {
                  if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
                    let urlToUse = baseUrl;
                    if (
                      baseUrl.endsWith('/api') &&
                      imageUrl.startsWith('/api')
                    ) {
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
              const normalizedImageUrl = imageUrl || null;

              return (
                <GlareHover
                  key={blog.id}
                  width="100%"
                  height="380px"
                  background="transparent"
                  borderRadius="24px"
                  borderColor="transparent"
                  glareColor="#ffffff"
                  glareOpacity={0.3}
                >
                  <Link
                    href={createLocalizedPath(`/blogs/${blog.id}`, locale)}
                    className="block w-full h-full"
                  >
                    <div className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow w-full h-full">
                      {/* Image Background */}
                      <div className="absolute inset-0">
                        {normalizedImageUrl ? (
                          <Image
                            src={normalizedImageUrl}
                            alt={blog.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            unoptimized
                          />
                        ) : (
                          <div
                            className="w-full h-full"
                            style={{
                              background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primaryLightest} 100%)`,
                            }}
                          >
                            {/* Medical pattern placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-30">
                              <svg
                                width="100"
                                height="100"
                                viewBox="0 0 100 100"
                                fill="none"
                              >
                                <path
                                  d="M45 20h10v60H45z"
                                  fill={colors.primary}
                                />
                                <path
                                  d="M20 45h60v10H20z"
                                  fill={colors.primary}
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Purple Curved Corner - Top Right */}
                      <div
                        className="absolute top-0 right-0 w-[100px] h-[100px]"
                        style={{
                          backgroundColor: colors.primary,
                          borderBottomLeftRadius: '100%',
                        }}
                      />

                      {/* Arrow Icon - Top Right */}
                      <div className="absolute top-4 right-4 w-12 h-12 rounded-full border-2 border-white bg-transparent flex items-center justify-center z-10">
                        <ArrowUpRight className="w-5 h-5 text-white" />
                      </div>

                      {/* White Bottom Section with Content */}
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-6 pb-5 rounded-t-[32px]"
                        style={{ minHeight: '130px' }}
                      >
                        {/* Title - Primary color, italic */}
                        <h3
                          className="font-semibold text-xl italic leading-tight line-clamp-2 mb-2"
                          style={{ color: colors.primary }}
                        >
                          {blog.title}
                        </h3>
                        {/* Description - Truncated */}
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                          {truncateContent(blog.content, 100)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </GlareHover>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.hasPrev) {
                        handlePageChange(pagination.currentPage - 1);
                      }
                    }}
                    className={
                      !pagination.hasPrev
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pageNum);
                      }}
                      isActive={pageNum === pagination.currentPage}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.hasNext) {
                        handlePageChange(pagination.currentPage + 1);
                      }
                    }}
                    className={
                      !pagination.hasNext
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BlogsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-64 w-full mb-8" />
            <Skeleton className="h-12 w-full max-w-2xl mx-auto mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-96 w-full" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <BlogsContent />
    </Suspense>
  );
}
