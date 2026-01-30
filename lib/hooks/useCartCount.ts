'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api';

interface CartResponse {
  success: boolean;
  data: {
    cartItems: unknown[];
    count: number;
    totalPrice: number;
  };
}

/**
 * Hook to manage cart count
 */
export function useCartCount() {
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false); // Prevent concurrent fetches

  // Fetch cart count
  const fetchCartCount = useCallback(async () => {
    // Prevent concurrent fetches
    if (fetchingRef.current) {
      return;
    }

    // Check authentication inline
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('patient_token')
        : null;

    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);

      const response = await apiClient.get<CartResponse>('/patient/cart', {
        token,
      });

      if (response.data.success && response.data.data) {
        setCartCount(response.data.data.count || 0);
      } else {
        setCartCount(0);
      }
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      const isUnauthorized =
        err?.status === 401 ||
        (typeof err?.message === 'string' &&
          (err.message.includes('Unauthorized') ||
            err.message.includes('Patient access required')));
      if (!isUnauthorized) {
        console.error('Error fetching cart count:', error);
      }
      setCartCount(0);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    fetchCartCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Listen for cart changes
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleCartChange = () => {
      // Debounce the fetch to avoid rapid successive calls
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchCartCount();
      }, 500);
    };

    window.addEventListener('cart-change', handleCartChange);
    window.addEventListener('auth-change', handleCartChange);
    window.addEventListener('storage', (e) => {
      if (e.key === 'patient_token') {
        handleCartChange();
      }
    });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('cart-change', handleCartChange);
      window.removeEventListener('auth-change', handleCartChange);
    };
  }, [fetchCartCount]);

  return {
    cartCount,
    loading,
    refreshCartCount: fetchCartCount,
  };
}
