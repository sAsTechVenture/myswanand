'use client';

import { useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useLocalizedRouter } from '@/lib/hooks/useLocalizedRouter';
import { getCurrentLocale } from '@/lib/utils/i18n';
import { createLocalizedPath } from '@/lib/utils/i18n';
import Link from 'next/link';
import { sendOtp } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { colors } from '@/config/theme';
import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const INDIAN_MOBILE_LENGTH = 10;

function validateMobile(digits: string): string | null {
  if (!digits || digits.length === 0) return 'Mobile number is required.';
  if (!/^\d+$/.test(digits)) return 'Mobile number must contain only digits.';
  if (digits.length !== INDIAN_MOBILE_LENGTH)
    return `Enter a valid 10-digit Indian mobile number.`;
  return null;
}

export default function MobileLoginPage() {
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const localizedRouter = useLocalizedRouter();
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const [mobileDigits, setMobileDigits] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, INDIAN_MOBILE_LENGTH);
    setMobileDigits(raw);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Read value from the actual input ref so we always get the current DOM value
    const rawDigits = (mobileInputRef.current?.value ?? '')
      .trim()
      .replace(/\D/g, '')
      .slice(0, INDIAN_MOBILE_LENGTH);
    setMobileDigits(rawDigits); // keep state in sync

    const validationError = validateMobile(rawDigits);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const mobile = `+91${rawDigits}`;
      const response = await sendOtp(mobile);

      if (response.data?.success) {
        const verifyPath = createLocalizedPath('/auth/verify-otp', locale);
        localizedRouter.push(`${verifyPath}?mobile=${encodeURIComponent(rawDigits)}`);
        return;
      }

      setError('Failed to send OTP. Please try again.');
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ||
        (err as { data?: { message?: string } })?.data?.message ||
        'Failed to send OTP. Please try again.';
      setError(message.replace(/^API (Error|Request Failed):\s*/i, ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div
        className="w-full relative overflow-hidden py-8 mb-8"
        style={{
          backgroundImage: 'url(/auth/new_login.png)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '260px',
        }}
      >
        <div className="container mx-auto max-w-6xl px-8">
          <div className="relative z-10">
            <nav className="text-sm mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2">
                <li>
                  <Link
                    href={createLocalizedPath('/', locale)}
                    className="hover:underline font-medium"
                    style={{ color: colors.white }}
                  >
                    Home
                  </Link>
                </li>
                <li style={{ color: colors.white }}>/</li>
                <li style={{ color: colors.white }}>Login</li>
                <li style={{ color: colors.white }}>/</li>
                <li style={{ color: colors.white }}>Mobile</li>
              </ol>
            </nav>
            <h1 className="text-4xl font-bold" style={{ color: colors.white }}>
              Login with Mobile
            </h1>
          </div>
          <div
            className="absolute inset-0 z-0"
            style={{ backgroundColor: 'rgba(94, 46, 133, 0.7)' }}
          />
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-8">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#1a1a1a' }}>
            Enter your mobile number
          </h2>
          <p className="text-gray-600 mb-6">
            We&apos;ll send you a one-time password (OTP) to verify your number. Enter 10 digits without +91.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="mobile" className="mb-2 block text-sm font-medium">
                Mobile number <span className="text-red-500">*</span>
              </Label>
              <input
                ref={mobileInputRef}
                id="mobile"
                name="mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="10-digit mobile number"
                value={mobileDigits}
                onChange={handleChange}
                maxLength={INDIAN_MOBILE_LENGTH}
                disabled={isSubmitting}
                className={cn(
                  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm',
                  error && 'border-red-500'
                )}
              />
              {mobileDigits.length > 0 && mobileDigits.length !== INDIAN_MOBILE_LENGTH && (
                <p className="mt-1 text-sm text-gray-500">
                  {mobileDigits.length} / {INDIAN_MOBILE_LENGTH} digits
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-6 text-lg font-semibold"
              style={{
                backgroundColor: colors.primary,
                color: colors.white,
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>

            <div className="text-center pt-2">
              <Link
                href={createLocalizedPath('/auth/login', locale)}
                className="text-sm font-medium hover:underline"
                style={{ color: colors.primary }}
              >
                Back to email login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
