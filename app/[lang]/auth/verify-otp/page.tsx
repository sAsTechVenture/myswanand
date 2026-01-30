'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLocalizedRouter } from '@/lib/hooks/useLocalizedRouter';
import { getCurrentLocale } from '@/lib/utils/i18n';
import { createLocalizedPath } from '@/lib/utils/i18n';
import Link from 'next/link';
import { verifyOtp } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { colors } from '@/config/theme';
import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const OTP_LENGTH = 6;

function validateOtp(otp: string): string | null {
  if (!otp || otp.length === 0) return 'OTP is required.';
  if (!/^\d+$/.test(otp)) return 'OTP must contain only digits.';
  if (otp.length !== OTP_LENGTH) return `Enter a ${OTP_LENGTH}-digit OTP.`;
  return null;
}

function VerifyOtpContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = getCurrentLocale(pathname);
  const localizedRouter = useLocalizedRouter();
  const mobileFromQuery = (searchParams.get('mobile') ?? '').trim().replace(/\D/g, '').slice(0, 10);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingMobile, setMissingMobile] = useState(false);

  useEffect(() => {
    if (!mobileFromQuery) setMissingMobile(true);
  }, [mobileFromQuery]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(raw);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!mobileFromQuery) {
      setMissingMobile(true);
      setError('Mobile number is missing. Please use a different number.');
      return;
    }

    // Read OTP from input ref so we always send the current value (avoids stale state)
    const rawOtp = (otpInputRef.current?.value ?? '')
      .trim()
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH);
    setOtp(rawOtp);

    const validationError = validateOtp(rawOtp);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const mobile = mobileFromQuery.length === 10 ? `+91${mobileFromQuery}` : mobileFromQuery;
      const response = await verifyOtp(mobile, rawOtp);
      const data = response.data as { success?: boolean; data?: { token?: string; user?: Record<string, unknown> } };

      if (data?.success && data?.data?.token) {
        const token = data.data.token;
        const user = data.data.user;

        if (typeof window !== 'undefined') {
          localStorage.setItem('patient_token', token);
          if (user) localStorage.setItem('patient_user', JSON.stringify(user));

          const expires = new Date();
          expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
          document.cookie = `patient_token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; max-age=${7 * 24 * 60 * 60}`;

          window.dispatchEvent(new Event('auth-change'));
        }

        localizedRouter.replace('/');
        return;
      }

      setError('Verification failed. Please check the OTP and try again.');
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ||
        (err as { data?: { message?: string } })?.data?.message ||
        'Verification failed. Please try again.';
      setError(message.replace(/^API (Error|Request Failed):\s*/i, ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (missingMobile || !mobileFromQuery) {
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
              <h1 className="text-4xl font-bold" style={{ color: colors.white }}>
                Verify OTP
              </h1>
            </div>
            <div
              className="absolute inset-0 z-0"
              style={{ backgroundColor: 'rgba(94, 46, 133, 0.7)' }}
            />
          </div>
        </div>
        <div className="container mx-auto max-w-6xl px-8">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Mobile number is missing. Please start from the mobile login page.
            </AlertDescription>
          </Alert>
          <Button
            className="mt-4"
            style={{ backgroundColor: colors.primary, color: colors.white }}
            asChild
          >
            <Link href={createLocalizedPath('/auth/mobile-login', locale)}>
              Go to Mobile Login
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const maskedMobile = mobileFromQuery.length >= 4
    ? `******${mobileFromQuery.slice(-4)}`
    : '******';

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
                <li style={{ color: colors.white }}>Verify OTP</li>
              </ol>
            </nav>
            <h1 className="text-4xl font-bold" style={{ color: colors.white }}>
              Verify OTP
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
            Enter verification code
          </h2>
          <p className="text-gray-600 mb-6">
            We sent a {OTP_LENGTH}-digit code to {maskedMobile}. Enter it below.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="hidden" name="mobile" value={mobileFromQuery} />
            <div>
              <Label htmlFor="otp" className="mb-2 block text-sm font-medium">
                OTP <span className="text-red-500">*</span>
              </Label>
              <input
                ref={otpInputRef}
                id="otp"
                name="otp"
                type="tel"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder={`${OTP_LENGTH}-digit code`}
                value={otp}
                onChange={handleOtpChange}
                maxLength={OTP_LENGTH}
                disabled={isSubmitting}
                className={cn(
                  'flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-center text-2xl tracking-[0.5em] shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm',
                  error && 'border-red-500'
                )}
              />
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
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </Button>

            <div className="text-center pt-2">
              <Link
                href={`${createLocalizedPath('/auth/mobile-login', locale)}`}
                className="text-sm font-medium hover:underline"
                style={{ color: colors.primary }}
              >
                Use a different number
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-8 flex items-center justify-center">
          <Loader2
            className="h-12 w-12 animate-spin"
            style={{ color: colors.primary }}
          />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
