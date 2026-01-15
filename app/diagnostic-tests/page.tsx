'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Grid, List, ChevronDown, Filter, X } from 'lucide-react';
import { DiagnosticTestCard } from '@/components/tests';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { colors } from '@/config/theme';
import { apiClient } from '@/lib/api';
import { useLikedItems } from '@/lib/hooks/useLikedItems';

interface DiagnosticTest {
  id: string | number;
  name?: string;
  title?: string;
  description?: string;
  testCount?: number;
  price: number;
  ageRange?: string;
  features?: string[];
  imageUrl?: string;
  [key: string]: unknown;
}

interface Category {
  id: string;
  name: string;
  parentId?: string | null;
  [key: string]: unknown;
}

export default function DiagnosticTestsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLiked, toggleLike } = useLikedItems();

  const redirectToLogin = () => {
    const currentPath = window.location.pathname + window.location.search;
    router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
  };
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isPopular, setIsPopular] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get query params
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'created_desc';
  const categoriesParam = searchParams.get('categories') || '';
  const popularParam = searchParams.get('isPopular');

  useEffect(() => {
    setCurrentPage(page);
    setDebouncedSearchQuery(search);
    setSearchQuery(search);
    setSortBy(sort);

    // Parse categories from URL
    if (categoriesParam) {
      setSelectedCategories(categoriesParam.split(',').filter(Boolean));
    } else {
      setSelectedCategories([]);
    }

    // Parse isPopular from URL
    if (popularParam === 'true') {
      setIsPopular(true);
    } else if (popularParam === 'false') {
      setIsPopular(false);
    } else {
      setIsPopular(null);
    }
  }, [page, search, sort, categoriesParam, popularParam]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch diagnostic tests
  useEffect(() => {
    async function fetchTests() {
      try {
        setLoading(true);
        const params: Record<string, string | number | undefined> = {
          page: currentPage,
          limit: 12,
        };

        // Add search if provided
        if (debouncedSearchQuery) {
          params.search = debouncedSearchQuery;
        }

        // Add sort
        if (sortBy && sortBy !== 'default') {
          params.sort = sortBy;
        }

        // Add categories (comma-separated)
        if (selectedCategories.length > 0) {
          params.categories = selectedCategories.join(',');
        }

        // Add isPopular filter
        if (isPopular !== null) {
          params.isPopular = isPopular.toString();
        }

        // Build query string
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
        const queryString = queryParams.toString();
        const url = `/patient/tests${queryString ? `?${queryString}` : ''}`;

        const response = await apiClient.get<{
          success?: boolean;
          data?: {
            tests?: DiagnosticTest[];
            categories?: Category[];
            pagination?: {
              currentPage: number;
              totalPages: number;
              totalItems: number;
            };
          };
        }>(url);

        const responseData = response.data as any;
        let testsArray: DiagnosticTest[] = [];
        let categoriesArray: Category[] = [];

        // Extract tests from response
        if (
          responseData?.data?.tests &&
          Array.isArray(responseData.data.tests)
        ) {
          testsArray = responseData.data.tests;
        } else if (responseData?.tests && Array.isArray(responseData.tests)) {
          testsArray = responseData.tests;
        } else if (responseData?.data && Array.isArray(responseData.data)) {
          testsArray = responseData.data;
        } else if (Array.isArray(responseData)) {
          testsArray = responseData;
        }

        // Extract categories from response
        if (
          responseData?.data?.categories &&
          Array.isArray(responseData.data.categories)
        ) {
          categoriesArray = responseData.data.categories;
        } else if (
          responseData?.categories &&
          Array.isArray(responseData.categories)
        ) {
          categoriesArray = responseData.categories;
        }

        // Process image URLs
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const processedTests = testsArray.map((test: any) => {
          let imageUrl = test.imageUrl;
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
            ...test,
            imageUrl,
            title: test.name || test.title,
          };
        });

        setTests(processedTests);
        setCategories(categoriesArray);

        // Handle pagination
        if (responseData?.data?.pagination) {
          setTotalPages(responseData.data.pagination.totalPages || 1);
          setTotalItems(responseData.data.pagination.totalItems || 0);
        } else if (responseData?.pagination) {
          setTotalPages(responseData.pagination.totalPages || 1);
          setTotalItems(responseData.pagination.totalItems || 0);
        } else {
          // Default pagination if not provided
          setTotalPages(Math.ceil(processedTests.length / 12) || 1);
          setTotalItems(processedTests.length);
        }
      } catch (err) {
        console.error('Error fetching diagnostic tests:', err);
        setTests([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTests();
  }, [
    currentPage,
    debouncedSearchQuery,
    sortBy,
    selectedCategories,
    isPopular,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by debounce, just update URL
    updateURLParams();
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    params.set('page', '1');
    router.push(`/diagnostic-tests?${params.toString()}`);
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newCategories);

    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    if (newCategories.length > 0) {
      params.set('categories', newCategories.join(','));
    } else {
      params.delete('categories');
    }
    params.set('page', '1');
    router.push(`/diagnostic-tests?${params.toString()}`);
  };

  const handleClearCategories = () => {
    setSelectedCategories([]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('categories');
    params.set('page', '1');
    router.push(`/diagnostic-tests?${params.toString()}`);
  };

  const handlePopularToggle = (value: boolean | null) => {
    setIsPopular(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value !== null) {
      params.set('isPopular', value.toString());
    } else {
      params.delete('isPopular');
    }
    params.set('page', '1');
    router.push(`/diagnostic-tests?${params.toString()}`);
  };

  const updateURLParams = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearchQuery) {
      params.set('search', debouncedSearchQuery);
    } else {
      params.delete('search');
    }

    params.set('page', '1');
    router.push(`/diagnostic-tests?${params.toString()}`);
  }, [debouncedSearchQuery, searchParams, router]);

  // Update URL when debounced search changes
  useEffect(() => {
    updateURLParams();
  }, [debouncedSearchQuery]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/diagnostic-tests?${params.toString()}`);
  };

  const sortOptions = [
    { value: 'created_desc', label: 'Newest First' },
    { value: 'created_asc', label: 'Oldest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name: A to Z' },
    { value: 'name_desc', label: 'Name: Z to A' },
  ];

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Banner */}
      <div
        className="relative w-full overflow-hidden py-8 md:py-12"
        style={{ backgroundColor: colors.primaryLightest }}
      >
        <div className="container mx-auto px-4">
          <div className="mb-2">
            <span className="text-sm text-gray-600">
              Home / Diagnostic Tests
            </span>
          </div>
          <h1
            className="text-3xl font-bold md:text-4xl"
            style={{ color: colors.primary }}
          >
            Diagnostic Tests
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search and Filters Bar */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  style={{ color: colors.primary }}
                />
                <Input
                  type="text"
                  placeholder="Search items, collections, and accounts"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4"
                  style={{
                    borderColor: colors.primaryLight,
                  }}
                />
              </div>
            </form>

            {/* Sort and View Controls */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    style={{
                      borderColor: colors.primaryLight,
                      color: colors.black,
                    }}
                  >
                    Sort by
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
                  <div className="flex flex-col">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`px-3 py-2 text-left text-sm rounded-md transition-colors ${
                          sortBy === option.value
                            ? 'font-semibold'
                            : 'hover:bg-accent'
                        }`}
                        style={{
                          backgroundColor:
                            sortBy === option.value
                              ? colors.primaryLight
                              : 'transparent',
                          color:
                            sortBy === option.value
                              ? colors.primary
                              : colors.black,
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* View Mode Toggle */}
              <div
                className="flex items-center gap-1 rounded-md border p-1"
                style={{ borderColor: colors.primaryLight }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={`h-8 w-8 ${
                    viewMode === 'grid' ? 'bg-primary text-white' : ''
                  }`}
                  style={{
                    backgroundColor:
                      viewMode === 'grid' ? colors.primary : 'transparent',
                    color: viewMode === 'grid' ? colors.white : colors.black,
                  }}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={`h-8 w-8 ${
                    viewMode === 'list' ? 'bg-primary text-white' : ''
                  }`}
                  style={{
                    backgroundColor:
                      viewMode === 'list' ? colors.primary : 'transparent',
                    color: viewMode === 'list' ? colors.white : colors.black,
                  }}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Filter Button with Categories Dropdown */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 relative"
                    style={{
                      borderColor: colors.primaryLight,
                      color: colors.black,
                    }}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {(selectedCategories.length > 0 || isPopular !== null) && (
                      <Badge
                        className="ml-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
                        style={{
                          backgroundColor: colors.primary,
                          color: colors.white,
                        }}
                      >
                        {(selectedCategories.length > 0 ? 1 : 0) +
                          (isPopular !== null ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                    {/* Popular Filter */}
                    <div>
                      <h3
                        className="text-sm font-semibold mb-3"
                        style={{ color: colors.primary }}
                      >
                        Popular Tests
                      </h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={isPopular === true}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handlePopularToggle(true);
                              } else {
                                handlePopularToggle(null);
                              }
                            }}
                          />
                          <span className="text-sm">Popular Only</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={isPopular === false}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handlePopularToggle(false);
                              } else {
                                handlePopularToggle(null);
                              }
                            }}
                          />
                          <span className="text-sm">Non-Popular Only</span>
                        </label>
                        {isPopular !== null && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePopularToggle(null)}
                            className="text-xs h-6 px-2"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Categories Filter */}
                    {categories.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3
                            className="text-sm font-semibold"
                            style={{ color: colors.primary }}
                          >
                            Categories
                          </h3>
                          {selectedCategories.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleClearCategories}
                              className="text-xs h-6 px-2"
                            >
                              Clear All
                            </Button>
                          )}
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {categories.map((cat) => (
                            <label
                              key={cat.id}
                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md"
                            >
                              <Checkbox
                                checked={selectedCategories.includes(cat.id)}
                                onCheckedChange={() =>
                                  handleCategoryToggle(cat.id)
                                }
                              />
                              <span className="text-sm flex-1">{cat.name}</span>
                            </label>
                          ))}
                        </div>
                        {selectedCategories.length > 0 && (
                          <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                            {selectedCategories.map((catId) => {
                              const cat = categories.find(
                                (c) => c.id === catId
                              );
                              if (!cat) return null;
                              return (
                                <Badge
                                  key={catId}
                                  variant="secondary"
                                  className="flex items-center gap-1 px-2 py-1"
                                  style={{
                                    backgroundColor: colors.primaryLight,
                                    color: colors.primary,
                                  }}
                                >
                                  {cat.name}
                                  <button
                                    onClick={() => handleCategoryToggle(catId)}
                                    className="ml-1 hover:opacity-70"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </Card>

        {/* Results Count */}
        {!loading && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {tests.length} of {totalItems} tests
          </div>
        )}

        {/* Tests Grid/List */}
        {loading ? (
          <div
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
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
        ) : tests.length > 0 ? (
          <div
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {tests.map((test, index) => (
              <DiagnosticTestCard
                key={test.id || index}
                testId={test.id}
                title={test.title as string}
                description={test.description}
                testCount={test.testCount}
                price={test.price}
                ageRange={test.ageRange}
                features={test.features}
                imageUrl={test.imageUrl}
                isFavorite={false}
                onAddToCart={() => console.log(`Added to cart: ${test.title}`)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-lg text-gray-600">No tests found</p>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </Card>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      currentPage > 1 && handlePageChange(currentPage - 1)
                    }
                    className={
                      currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                    }
                  />
                </PaginationItem>
                {getPaginationItems()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      currentPage < totalPages &&
                      handlePageChange(currentPage + 1)
                    }
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : ''
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
