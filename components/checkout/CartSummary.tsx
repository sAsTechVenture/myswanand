'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { colors } from '@/config/theme';

interface CartItem {
  id: string;
  testId: string;
  test: {
    id: string;
    name: string;
    price: number;
  };
}

interface CartSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  hardcopyReport: number;
  total: number;
  onProceedCheckout: () => void;
  disabled?: boolean;
}

export function CartSummary({
  cartItems,
  subtotal,
  hardcopyReport,
  total,
  onProceedCheckout,
  disabled = false,
}: CartSummaryProps) {
  return (
    <Card className="sticky top-4">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-6" style={{ color: colors.black }}>
          Order Summary
        </h2>

        {/* Summary Items */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">
              ₹{subtotal.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Hardcopy Report</span>
            <span className="font-medium">
              ₹{hardcopyReport.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Total */}
        <div className="flex justify-between mb-6">
          <span className="text-lg font-bold" style={{ color: colors.black }}>
            Total
          </span>
          <span className="text-lg font-bold" style={{ color: colors.black }}>
            ₹{total.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Proceed Checkout Button */}
        <Button
          className="w-full py-6 text-base font-semibold rounded-lg"
          style={{
            backgroundColor: colors.primary,
            color: colors.white,
          }}
          disabled={disabled || cartItems.length === 0}
          onClick={onProceedCheckout}
        >
          Proceed Checkout
        </Button>
      </CardContent>
    </Card>
  );
}
