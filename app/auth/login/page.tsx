'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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

        // Use router.replace to avoid adding to history
        router.replace(redirectUrl);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';

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

  return (
    <div className="min-h-screen py-8">
      {/* Full-width Banner Section for Breadcrumb and My Account */}
      <div
        className="w-full relative overflow-hidden py-8 mb-8"
        style={{
          backgroundImage: 'url(/auth/hero-banner.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
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
                    Home
                  </Link>
                </li>
                <li style={{ color: colors.white }}>/</li>
                <li style={{ color: colors.white }}>My Account</li>
              </ol>
            </nav>
            {/* Title */}
            <h1 className="text-4xl font-bold" style={{ color: colors.white }}>
              My Account
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
                Sign In
              </h2>
            </div>

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
                  Email address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
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
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your Password"
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
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Register Link */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    href="/auth/register"
                    className="font-medium hover:underline"
                    style={{ color: colors.primary }}
                  >
                    Sign Up
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
