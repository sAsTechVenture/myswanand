'use client';

import { useState, Suspense, useEffect } from 'react';
import { useLocalizedRouter } from '@/lib/hooks/useLocalizedRouter';
import { useSearchParams, usePathname } from 'next/navigation';
import { getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import { createLocalizedPath } from '@/lib/utils/i18n';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { colors } from '@/config/theme';
import { AlertCircle, CheckCircle2, Loader2, Lock } from 'lucide-react';

/**
 * MascotDisplay Component
 * Displays animated mascot video entry animation.
 */
function MascotDisplay() {
  return (
    <div className="relative w-full max-w-md h-[600px] flex items-center justify-center">
      <div className="relative w-full h-full">
        <video
          src="/mascot-entry.mp4"
          className="w-full h-full object-contain"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}

function ResetPasswordContent() {
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const { dictionary } = useDictionary(locale);
  const localizedRouter = useLocalizedRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [token, setToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  // Get token from URL on mount
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setSubmitError(t('common.invalidResetLink'));
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = t('common.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('common.passwordMinLength');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('common.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('common.passwordsDoNotMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    if (!token) {
      setSubmitError(t('common.invalidResetLink'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post<{
        success: boolean;
        data: {
          message: string;
        };
      }>('/patient/reset-password', {
        token,
        password: formData.password,
      });

      if (response.data.success) {
        setSubmitSuccess(true);
        // Redirect to login after a short delay
        setTimeout(() => {
          localizedRouter.push('/auth/login');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      let errorMessage = t('common.failedToResetPassword');

      // Extract error message from API response
      if (error?.message) {
        errorMessage = error.message;
        // Remove "API Error:" or "API Request Failed:" prefixes if present
        errorMessage = errorMessage.replace(
          /^API (Error|Request Failed):\s*/i,
          ''
        );
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      {/* Full-width Banner Section for Breadcrumb and My Account */}
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
            {/* Breadcrumb */}
            <nav className="text-sm mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2">
                <li>
                  <Link
                    href="/"
                    className="hover:underline font-medium"
                    style={{ color: colors.white }}
                  >
                    {t('common.home')}
                  </Link>
                </li>
                <li style={{ color: colors.white }}>/</li>
                <li style={{ color: colors.white }}>{t('common.resetPassword')}</li>
              </ol>
            </nav>
            {/* Title */}
            <h1 className="text-4xl font-bold" style={{ color: colors.white }}>
                {t('common.resetPassword')}
            </h1>
          </div>
          {/* Overlay for better text readability */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundColor: 'rgba(94, 46, 133, 0.7)',
            }}
          />
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Side - Reset Password Form */}
          <div className="w-full">
            <div className="mb-6">
              <h2
                className="text-3xl font-bold mb-6"
                style={{ color: '#1a1a1a' }}
              >
                {t('common.createNewPassword')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('common.newPasswordDescription')}
              </p>
            </div>

            {/* Success Message */}
            {submitSuccess && (
              <Alert className="mb-6 border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {t('common.passwordResetSuccess')}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {submitError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div>
                <Label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium"
                >
                  {t('common.newPassword')} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={t('common.enterNewPassword')}
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                    aria-invalid={!!errors.password}
                  />
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium"
                >
                  {t('common.confirmPassword')} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder={t('common.confirmNewPassword')}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 ${
                      errors.confirmPassword ? 'border-red-500' : ''
                    }`}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !token || submitSuccess}
                className="w-full py-6 text-lg font-semibold"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                    {t('common.resettingPassword')}
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  Remember your password?{' '}
                  <Link
                    href="/auth/login"
                    className="font-medium hover:underline"
                    style={{ color: colors.primary }}
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Right Side - Mascot/Character (Scalable for animated mascot) */}
          <div className="hidden lg:flex items-center justify-center relative">
            <MascotDisplay />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-8 flex items-center justify-center">
          <div className="container mx-auto max-w-6xl px-8">
            <div className="flex justify-center">
              <Loader2
                className="h-12 w-12 animate-spin"
                style={{ color: colors.primary }}
              />
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
