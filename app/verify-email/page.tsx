'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { colors } from '@/config/theme';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface VerificationResponse {
  success: boolean;
  data?: {
    message: string;
    verified: boolean;
  };
  message?: string;
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<{
    success: boolean;
    message: string;
    verified?: boolean;
  } | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setVerificationStatus({
          success: false,
          message:
            'Verification token is missing. Please check your email link.',
        });
        setIsVerifying(false);
        return;
      }

      try {
        const response = await apiClient.get<VerificationResponse>(
          `/patient/verify-email?token=${encodeURIComponent(token)}`
        );

        // Handle different response structures
        const responseData = response.data as any;
        let message = '';
        let verified = false;

        if (responseData?.success && responseData?.data) {
          message = responseData.data.message || 'Email verified successfully!';
          verified = responseData.data.verified || false;
        } else if (responseData?.data?.message) {
          message = responseData.data.message;
          verified = responseData.data.verified || false;
        } else if (responseData?.message) {
          message = responseData.message;
          verified = responseData.verified || false;
        } else {
          message = 'Email verification completed.';
          verified = true;
        }

        setVerificationStatus({
          success: true,
          message,
          verified,
        });

        // Redirect to login after 3 seconds if verification was successful
        if (verified) {
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        let errorMessage = 'Failed to verify email. Please try again.';

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
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        // Check for specific error messages and provide user-friendly responses
        const lowerMessage = errorMessage.toLowerCase();
        if (
          lowerMessage.includes('invalid') ||
          lowerMessage.includes('expired') ||
          lowerMessage.includes('token')
        ) {
          errorMessage =
            'Invalid or expired verification token. Please request a new verification email or register again.';
        } else if (lowerMessage.includes('already verified')) {
          // Handle case where email is already verified
          setVerificationStatus({
            success: true,
            message: 'Your email is already verified. You can login now.',
            verified: true,
          });
          setIsVerifying(false);
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
          return;
        }

        setVerificationStatus({
          success: false,
          message: errorMessage,
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div
      className="min-h-screen py-12 px-4 flex items-center justify-center"
      style={{ backgroundColor: '#f5f0e8' }}
    >
      <div className="container mx-auto max-w-2xl">
        <Card className="p-8 shadow-lg">
          <div className="text-center">
            {isVerifying ? (
              <>
                <div className="flex justify-center mb-6">
                  <Loader2
                    className="h-12 w-12 animate-spin"
                    style={{ color: colors.primary }}
                  />
                </div>
                <h1
                  className="text-3xl font-bold mb-4"
                  style={{ color: colors.primary }}
                >
                  Verifying Your Email
                </h1>
                <p className="text-gray-600">
                  Please wait while we verify your email address...
                </p>
              </>
            ) : verificationStatus ? (
              <>
                {verificationStatus.success ? (
                  <>
                    <div className="flex justify-center mb-6">
                      <div
                        className="rounded-full p-3"
                        style={{ backgroundColor: colors.primaryLight }}
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
                      Email Verified!
                    </h1>
                    <Alert className="mb-6 border-green-500 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        {verificationStatus.message ||
                          'Your email has been verified successfully!'}
                      </AlertDescription>
                    </Alert>
                    {verificationStatus.verified && (
                      <p className="text-gray-600 mb-6">
                        Redirecting to login page in a few seconds...
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={() => router.push('/auth/login')}
                        className="px-8"
                        style={{
                          backgroundColor: colors.primary,
                          color: colors.white,
                        }}
                      >
                        Go to Login
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push('/')}
                        className="px-8"
                      >
                        Go to Home
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-center mb-6">
                      <div
                        className="rounded-full p-3"
                        style={{ backgroundColor: colors.primaryLight }}
                      >
                        <AlertCircle
                          className="h-12 w-12"
                          style={{ color: '#dc2626' }}
                        />
                      </div>
                    </div>
                    <h1
                      className="text-3xl font-bold mb-4"
                      style={{ color: colors.primary }}
                    >
                      Verification Failed
                    </h1>
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {verificationStatus.message}
                      </AlertDescription>
                    </Alert>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={() => router.push('/auth/register')}
                        className="px-8"
                        style={{
                          backgroundColor: colors.primary,
                          color: colors.white,
                        }}
                      >
                        Register Again
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push('/')}
                        className="px-8"
                      >
                        Go to Home
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-6">
                      Need help?{' '}
                      <Link
                        href="/contact"
                        className="underline"
                        style={{ color: colors.primary }}
                      >
                        Contact Support
                      </Link>
                    </p>
                  </>
                )}
              </>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen py-12 px-4 flex items-center justify-center"
          style={{ backgroundColor: '#f5f0e8' }}
        >
          <div className="container mx-auto max-w-2xl">
            <Card className="p-8 shadow-lg">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <Loader2
                    className="h-12 w-12 animate-spin"
                    style={{ color: colors.primary }}
                  />
                </div>
                <h1
                  className="text-3xl font-bold mb-4"
                  style={{ color: colors.primary }}
                >
                  Loading...
                </h1>
              </div>
            </Card>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
