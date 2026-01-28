'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocalizedRouter } from '@/lib/hooks/useLocalizedRouter';
import { createLocalizedPath, getCurrentLocale } from '@/lib/utils/i18n';
import { usePathname } from 'next/navigation';
import { useDictionary } from '@/lib/hooks/useDictionary';
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
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const { dictionary } = useDictionary(locale);
  const localizedRouter = useLocalizedRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<{
    success: boolean;
    message: string;
    verified?: boolean;
  } | null>(null);

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

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setVerificationStatus({
          success: false,
          message: t('common.verificationTokenMissing'),
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
          message =
            responseData.data.message || t('common.emailVerifiedSuccess');
          verified = responseData.data.verified || false;
        } else if (responseData?.data?.message) {
          message = responseData.data.message;
          verified = responseData.data.verified || false;
        } else if (responseData?.message) {
          message = responseData.message;
          verified = responseData.verified || false;
        } else {
          message = t('common.emailVerificationCompleted');
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
            localizedRouter.push('/auth/login');
          }, 3000);
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        let errorMessage = t('common.failedToVerifyEmail');

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
          errorMessage = t('common.invalidExpiredToken');
        } else if (lowerMessage.includes('already verified')) {
          // Handle case where email is already verified
          setVerificationStatus({
            success: true,
            message: 'Your email is already verified. You can login now.',
            verified: true,
          });
          setIsVerifying(false);
          setTimeout(() => {
            localizedRouter.push('/auth/login');
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
  }, [searchParams, localizedRouter]);

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
                  {t('common.verifyingEmail')}
                </h1>
                <p className="text-gray-600">
                  {t('common.pleaseWaitVerifying')}
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
                      {t('common.emailVerified')}
                    </h1>
                    <Alert className="mb-6 border-green-500 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        {verificationStatus.message ||
                          t('common.emailVerifiedSuccess')}
                      </AlertDescription>
                    </Alert>
                    {verificationStatus.verified && (
                      <p className="text-gray-600 mb-6">
                        {t('common.redirectingToLogin')}
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={() => localizedRouter.push('/auth/login')}
                        className="px-8"
                        style={{
                          backgroundColor: colors.primary,
                          color: colors.white,
                        }}
                      >
                        {t('common.goToLogin')}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => localizedRouter.push('/')}
                        className="px-8"
                      >
                        {t('common.goToHome')}
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
                      {t('common.verificationFailed')}
                    </h1>
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {verificationStatus.message}
                      </AlertDescription>
                    </Alert>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={() => localizedRouter.push('/auth/register')}
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
                        onClick={() => localizedRouter.push('/')}
                        className="px-8"
                      >
                        {t('common.goToHome')}
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
