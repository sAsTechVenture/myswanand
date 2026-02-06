'use client';

import { useState, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { useLocalizedRouter } from '@/lib/hooks/useLocalizedRouter';
import { useSearchParams } from 'next/navigation';
import { getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import { createLocalizedPath } from '@/lib/utils/i18n';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { colors } from '@/config/theme';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

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

function LoginContent() {
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const localizedRouter = useLocalizedRouter();
  const searchParams = useSearchParams();
  const { dictionary } = useDictionary(locale);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(
    null
  );
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  // Check if session expired (redirected from middleware)
  const sessionExpired = searchParams.get('expired') === 'true';

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

    if (!formData.email.trim()) {
      newErrors.email = t('common.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('common.invalidEmailFormat');
    }

    if (!formData.password) {
      newErrors.password = t('common.passwordRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post<{
        success: boolean;
        data: {
          user: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            healthCard: string | null;
            role: string;
            userStatus: string;
          };
          token: string;
        };
      }>('/patient/login', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;

        // Store token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('patient_token', token);
          localStorage.setItem('patient_user', JSON.stringify(user));

          // Also set cookie for middleware access (expires in 7 days)
          const expires = new Date();
          expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
          document.cookie = `patient_token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

          // Dispatch custom event to update header
          window.dispatchEvent(new Event('auth-change'));
        }

        // Get redirect URL and decode it if needed
        const redirectParam = searchParams.get('redirect');
        const redirectUrl = redirectParam
          ? decodeURIComponent(redirectParam)
          : '/';

        // Use localizedRouter.replace to avoid adding to history
        // If redirectUrl already has locale, use it directly, otherwise use localizedRouter
        if (
          redirectUrl.startsWith('/en/') ||
          redirectUrl.startsWith('/hi/') ||
          redirectUrl.startsWith('/mr/')
        ) {
          localizedRouter.router.replace(redirectUrl);
        } else {
          localizedRouter.replace(redirectUrl);
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = t('common.loginFailed');

      // Extract error message from API response
      // The API returns error messages in the format: { message: "..." }
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

      // The error message should now match exactly what the API sends:
      // - "Email and password are required"
      // - "Invalid credentials"
      // - "Access denied. Patient account required."
      // - "Account is not active"
      // - "Please verify your email address before logging in. Check your inbox for the verification link."
      // - "Internal server error"

      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotPasswordError(null);
    setForgotPasswordSuccess(false);

    // Validate email
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordError(t('common.emailRequired'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail.trim())) {
      setForgotPasswordError(t('common.invalidEmailFormat'));
      return;
    }

    setForgotPasswordLoading(true);

    try {
      const response = await apiClient.post<{
        success: boolean;
        data: {
          message: string;
        };
      }>('/patient/forgot-password', {
        email: forgotPasswordEmail.trim().toLowerCase(),
      });

      if (response.data.success) {
        setForgotPasswordSuccess(true);
        // Reset email after a delay
        setTimeout(() => {
          setForgotPasswordEmail('');
          setForgotPasswordOpen(false);
          setForgotPasswordSuccess(false);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      let errorMessage = t('common.failedToSendReset');

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }

      setForgotPasswordError(errorMessage);
    } finally {
      setForgotPasswordLoading(false);
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
                    href={createLocalizedPath('/', locale)}
                    className="hover:underline font-medium"
                    style={{ color: colors.white }}
                  >
                    {t('common.home')}
                  </Link>
                </li>
                <li style={{ color: colors.white }}>/</li>
                <li style={{ color: colors.white }}>{t('common.myAccount')}</li>
              </ol>
            </nav>
            {/* Title */}
            <h1 className="text-4xl font-bold" style={{ color: colors.white }}>
              {t('common.myAccount')}
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
          {/* Left Side - Login Form */}
          <div className="w-full">
            <div className="mb-6">
              <h2
                className="text-3xl font-bold mb-6"
                style={{ color: '#1a1a1a' }}
              >
                {t('common.signInTitle')}
              </h2>
            </div>

            {/* Session Expired Message */}
            {sessionExpired && (
              <Alert className="mb-6 border-yellow-500 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Your session has expired. Please log in again to continue.
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
              {/* Email Address */}
              <div>
                <Label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  {t('common.emailAddress')}{' '}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('common.enterEmail')}
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <Label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium"
                >
                  {t('common.password')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={t('common.enterPassword')}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-sm font-medium hover:underline"
                  style={{ color: colors.primary }}
                >
                  {t('common.forgotPassword')}
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 text-lg font-semibold"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                }}
              >
                {isSubmitting ? t('common.signingIn') : t('common.signInTitle')}
              </Button>

              {/* Register Link */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  {t('common.dontHaveAccount')}{' '}
                  <Link
                    href={createLocalizedPath('/auth/register', locale)}
                    className="font-medium hover:underline"
                    style={{ color: colors.primary }}
                  >
                    {t('common.signUp')}
                  </Link>
                </p>
              </div>

              {/* Login using mobile number */}
              <div className="pt-6 mt-6 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Login using mobile number
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-6 text-lg font-semibold"
                  style={{
                    borderColor: colors.primary,
                    color: colors.primary,
                  }}
                  onClick={() => {
                    // Preserve redirect parameter when navigating to mobile login
                    const redirectParam = searchParams.get('redirect');
                    const mobileLoginPath = createLocalizedPath(
                      '/auth/mobile-login',
                      locale
                    );
                    const redirectQuery = redirectParam
                      ? `?redirect=${encodeURIComponent(redirectParam)}`
                      : '';
                    localizedRouter.push(`${mobileLoginPath}${redirectQuery}`);
                  }}
                >
                  Continue with Mobile
                </Button>
              </div>
            </form>
          </div>

          {/* Right Side - Mascot/Character (Scalable for animated mascot) */}
          <div className="hidden lg:flex items-center justify-center relative">
            <MascotDisplay />
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: colors.primary }}>
              {t('common.forgotPasswordTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('common.forgotPasswordDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {forgotPasswordSuccess && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {t('common.resetEmailSent')}
                </AlertDescription>
              </Alert>
            )}

            {forgotPasswordError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{forgotPasswordError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="forgot-email">{t('common.emailAddress')}</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder={t('common.enterEmail')}
                value={forgotPasswordEmail}
                onChange={(e) => {
                  setForgotPasswordEmail(e.target.value);
                  setForgotPasswordError(null);
                }}
                disabled={forgotPasswordLoading || forgotPasswordSuccess}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForgotPasswordOpen(false);
                setForgotPasswordEmail('');
                setForgotPasswordError(null);
                setForgotPasswordSuccess(false);
              }}
              disabled={forgotPasswordLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleForgotPassword}
              disabled={forgotPasswordLoading || forgotPasswordSuccess}
              style={{
                backgroundColor: colors.primary,
                color: colors.white,
              }}
            >
              {forgotPasswordLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('common.signingIn')}
                </>
              ) : (
                t('common.sendResetLink')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LoginPage() {
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
      <LoginContent />
    </Suspense>
  );
}
