'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft, RotateCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { colors } from '@/config/theme';

interface CheckoutErrorProps {
  errorMessage?: string;
  onRetry?: () => void;
  onBackToCart?: () => void;
  /** Label for the back button. Default: "Back to Cart" */
  backLabel?: string;
}

export function CheckoutError({
  errorMessage = 'Something went wrong while placing your order. Please try again.',
  onRetry,
  onBackToCart,
  backLabel = 'Back to Cart',
}: CheckoutErrorProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="p-8 text-center">
          <CardContent className="p-0">
            <div className="mb-6 flex justify-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#fee2e2' }}
              >
                <AlertCircle
                  className="h-12 w-12"
                  style={{ color: '#ef4444' }}
                />
              </div>
            </div>

            <h1
              className="text-3xl font-bold mb-4"
              style={{ color: colors.black }}
            >
              Order Failed
            </h1>

            <p className="text-gray-600 mb-6">{errorMessage}</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  className="flex items-center gap-2"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.white,
                  }}
                >
                  <RotateCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
              {onBackToCart && (
                <Button
                  onClick={onBackToCart}
                  variant="outline"
                  className="flex items-center gap-2"
                  style={{
                    borderColor: colors.primary,
                    color: colors.primary,
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {backLabel}
                </Button>
              )}
            </div>

            <div className="mt-8 p-4 rounded-lg bg-red-50">
              <p className="text-sm text-red-700">
                If the problem persists, please contact our support team or try
                again later.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
