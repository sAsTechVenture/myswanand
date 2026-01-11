'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { colors } from '@/config/theme';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * MascotDisplay Component
 * Scalable component for displaying mascot/character.
 * Can be easily replaced with an animated mascot component in the future.
 */
function MascotDisplay() {
  return (
    <div className="relative w-full max-w-md h-[600px] flex items-center justify-center">
      <div className="relative w-full h-full">
        <Image
          src="/auth/avatar.jpg"
          alt="Doctor Character"
          fill
          className="object-contain"
          priority
          unoptimized
          sizes="(max-width: 768px) 0vw, 500px"
          onError={(e) => {
            console.error('Failed to load mascot image:', e);
          }}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
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
        }

        // Redirect to home page or dashboard
        router.push('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';

      // Try to extract error message from various possible formats
      if (error?.message) {
        errorMessage = error.message;
        // Remove "API Error:" or "API Request Failed:" prefixes
        errorMessage = errorMessage.replace(
          /^API (Error|Request Failed):\s*/i,
          ''
        );
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Check if it's an API error response
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
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
