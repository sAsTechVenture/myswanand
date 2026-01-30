import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from '@/lib/toast';

export interface LikedItem {
  id: string;
  userId: string;
  packageId?: string;
  testId?: string;
  createdAt: string;
  updatedAt: string;
  package?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    categoryId: string;
    testCount: number;
    category: {
      id: string;
      name: string;
    };
  };
  test?: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    imageUrl?: string | null;
  };
}

interface LikedItemsResponse {
  success: boolean;
  data: {
    likedItems: LikedItem[];
    count: number;
  };
}

/**
 * Hook to manage liked items (favorites)
 */
export function useLikedItems() {
  const [likedItems, setLikedItems] = useState<LikedItem[]>([]);
  const [likedPackageIds, setLikedPackageIds] = useState<Set<string>>(
    new Set()
  );
  const [likedTestIds, setLikedTestIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false); // Prevent concurrent fetches

  // Fetch all liked items
  const fetchLikedItems = useCallback(async () => {
    // Prevent concurrent fetches
    if (fetchingRef.current) {
      return;
    }

    // Check authentication inline to avoid dependency issues
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('patient_token')
        : null;

    if (!token) {
      setLikedItems([]);
      setLikedPackageIds(new Set());
      setLikedTestIds(new Set());
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);

      const response = await apiClient.get<LikedItemsResponse>(
        '/patient/likes',
        {
          token,
        }
      );

      const responseData = response.data as any;
      let items: LikedItem[] = [];

      if (responseData?.success && responseData?.data?.likedItems) {
        items = responseData.data.likedItems;
      } else if (responseData?.data?.likedItems) {
        items = responseData.data.likedItems;
      } else if (Array.isArray(responseData?.data)) {
        items = responseData.data;
      }

      setLikedItems(items);
      setLikedPackageIds(
        new Set(
          items.filter((item) => item.packageId).map((item) => item.packageId!)
        )
      );
      setLikedTestIds(
        new Set(items.filter((item) => item.testId).map((item) => item.testId!))
      );
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      const isUnauthorized =
        e?.status === 401 ||
        (typeof e?.message === 'string' &&
          (e.message.includes('Unauthorized') ||
            e.message.includes('Patient access required')));
      if (!isUnauthorized) {
        console.error('Error fetching liked items:', err);
        setError('Failed to fetch liked items');
      }
      setLikedItems([]);
      setLikedPackageIds(new Set());
      setLikedTestIds(new Set());
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []); // No dependencies - we check token inside the function

  // Add item to liked items (supports both packageId and testId)
  const addToLikedItems = useCallback(
    async (
      itemId: string,
      type: 'package' | 'test' = 'package',
      redirectToLogin?: () => void
    ) => {
      // Check authentication inline
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('patient_token')
          : null;

      if (!token) {
        if (redirectToLogin) {
          redirectToLogin();
        } else if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          window.location.href = `/auth/login?redirect=${encodeURIComponent(
            currentPath
          )}`;
        }
        return false;
      }

      try {
        setError(null);

        const requestBody =
          type === 'package' ? { packageId: itemId } : { testId: itemId };

        const response = await apiClient.post<{
          success: boolean;
          data: {
            message: string;
            likedItem: LikedItem;
          };
        }>('/patient/likes', requestBody, {
          token,
        });

        const responseData = response.data as any;

        if (responseData?.success || responseData?.data) {
          // Refresh liked items
          await fetchLikedItems();
          toast.success('Added to favorites');
          return true;
        }

        return false;
      } catch (err: any) {
        console.error('Error adding to liked items:', err);
        const errorMessage =
          err?.data?.message || err?.message || 'Failed to add to favorites';

        // Check if already liked
        if (errorMessage.includes('already')) {
          toast.error('Already in favorites');
        } else {
          toast.error(errorMessage);
        }
        return false;
      }
    },
    [fetchLikedItems]
  );

  // Check if item is liked
  const isLiked = useCallback(
    (itemId: string, type: 'package' | 'test' = 'package') => {
      if (type === 'package') {
        return likedPackageIds.has(itemId);
      } else {
        return likedTestIds.has(itemId);
      }
    },
    [likedPackageIds, likedTestIds]
  );

  // Remove item from liked items (supports both packageId and testId)
  const removeFromLikedItems = useCallback(
    async (itemId: string, type: 'package' | 'test' = 'package') => {
      // Check authentication inline
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('patient_token')
          : null;

      if (!token) {
        return false;
      }

      try {
        setError(null);

        // Try with type parameter first, fallback to just itemId
        try {
          await apiClient.delete<{
            success: boolean;
            data: {
              message: string;
            };
          }>(`/patient/likes/${itemId}?type=${type}`, {
            token,
          });
        } catch (err: any) {
          // If type parameter doesn't work, try without it
          await apiClient.delete<{
            success: boolean;
            data: {
              message: string;
            };
          }>(`/patient/likes/${itemId}`, {
            token,
          });
        }

        // Refresh liked items
        await fetchLikedItems();
        toast.success('Removed from favorites');
        return true;
      } catch (err: any) {
        console.error('Error removing from liked items:', err);
        const errorMessage =
          err?.data?.message ||
          err?.message ||
          'Failed to remove from favorites';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchLikedItems]
  );

  // Toggle like status
  const toggleLike = useCallback(
    async (
      itemId: string,
      type: 'package' | 'test' = 'package',
      redirectToLogin?: () => void
    ) => {
      if (isLiked(itemId, type)) {
        return await removeFromLikedItems(itemId, type);
      } else {
        return await addToLikedItems(itemId, type, redirectToLogin);
      }
    },
    [isLiked, addToLikedItems, removeFromLikedItems]
  );

  // Initialize on mount - only fetch once
  useEffect(() => {
    fetchLikedItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Listen for auth changes - but debounce to avoid loops
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleAuthChange = () => {
      // Debounce the fetch to avoid rapid successive calls
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchLikedItems();
      }, 500);
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [fetchLikedItems]);

  return {
    likedItems,
    likedPackageIds,
    likedTestIds,
    loading,
    error,
    isLiked,
    addToLikedItems,
    removeFromLikedItems,
    toggleLike,
    refreshLikedItems: fetchLikedItems,
  };
}
