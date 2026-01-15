'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { colors } from '@/config/theme';

interface CheckoutSuccessProps {
  orderId?: string;
  orderNumber?: string;
  message?: string;
  onViewOrder?: () => void;
}

export function CheckoutSuccess({
  orderId,
  orderNumber,
  message,
  onViewOrder,
}: CheckoutSuccessProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="p-8 text-center">
          <CardContent className="p-0">
            <div className="mb-6 flex justify-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colors.lightestGreen }}
              >
                <CheckCircle2
                  className="h-12 w-12"
                  style={{ color: colors.green }}
                />
              </div>
            </div>

            <h1
              className="text-3xl font-bold mb-4"
              style={{ color: colors.primary }}
            >
              Booking Confirmed!
            </h1>

            <p className="text-gray-600 mb-2">
              {message ||
                'Thank you for your booking. We have received your booking request.'}
            </p>

            {orderNumber && (
              <p className="text-sm text-gray-500 mb-2">
                Booking Number:{' '}
                <span className="font-semibold">{orderNumber}</span>
              </p>
            )}

            {orderId && orderId !== orderNumber && (
              <p className="text-sm text-gray-500 mb-6">
                Booking ID: <span className="font-semibold">{orderId}</span>
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              {onViewOrder && (
                <Button
                  onClick={onViewOrder}
                  className="flex items-center gap-2"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.white,
                  }}
                >
                  View Order Details
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              <Link href="/">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 w-full sm:w-auto"
                  style={{
                    borderColor: colors.primary,
                    color: colors.primary,
                  }}
                >
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>

            <div
              className="mt-8 p-4 rounded-lg"
              style={{ backgroundColor: colors.lightestGreen }}
            >
              <p className="text-sm text-gray-700">
                You will receive a confirmation email shortly with all the
                details. Our team will contact you to confirm your appointment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
