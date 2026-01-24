'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  PersonalDetails,
  HistoryTab,
  WalletTab,
  CoinsTab,
  VouchersTab,
  PrescriptionsTab,
} from '@/components/profile';
import { EditPersonalDetailsModal } from '@/components/profile/EditPersonalDetailsModal';
import { colors } from '@/config/theme';
import { ArrowLeft, FileText, Wallet, Coins, Gift, Upload, LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuthToken } from '@/lib/utils/auth';
import { toast } from '@/lib/toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address?: string | null;
  profileImage?: string | null;
  healthCard?: string | null;
  isCancerPatient?: number | boolean;
  userType?: string;
  userStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('history');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Handle tab query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (
      tabParam &&
      [
        'history',
        'transactions',
        'coins',
        'vouchers',
        'prescriptions',
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('patient_token')
            : null;

        if (!token) {
          router.push('/auth/login?redirect=/profile');
          return;
        }

        const response = await apiClient.get<{
          success: boolean;
          data: {
            user: UserProfile;
          };
        }>('/patient/me', {
          token,
        });

        // Handle different response structures
        const responseData = response.data as any;
        if (responseData?.success && responseData?.data?.user) {
          setUser(responseData.data.user);
        } else if (responseData?.data) {
          // Fallback if structure is different
          setUser(responseData.data);
        } else {
          setError('Failed to load profile');
        }
      } catch (err: any) {
        console.error('Profile fetch error:', err);
        let errorMessage = 'Failed to load profile. Please try again.';

        if (err?.message) {
          errorMessage = err.message;
        } else if (err?.data?.message) {
          errorMessage = err.data.message;
        }

        // If unauthorized, redirect to login
        if (
          errorMessage.includes('401') ||
          errorMessage.includes('Unauthorized') ||
          errorMessage.includes('token')
        ) {
          router.push('/auth/login?redirect=/profile');
          return;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleEditPersonalDetails = () => {
    setEditModalOpen(true);
  };

  const handleProfileUpdate = async () => {
    // Refresh profile data after update
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('patient_token')
        : null;

    if (!token) {
      return;
    }

    try {
      const response = await apiClient.get<{
        success: boolean;
        data: {
          user: UserProfile;
        };
      }>('/patient/me', {
        token,
      });

      const responseData = response.data as any;
      if (responseData?.success && responseData?.data?.user) {
        setUser(responseData.data.user);
      } else if (responseData?.data) {
        setUser(responseData.data);
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const handleUploadPrescription = () => {
    router.push('/upload-prescription');
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const token = getAuthToken();

      // Call logout API
      if (token) {
        try {
          await apiClient.post('/patient/logout', {}, { token });
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout API error:', error);
        }
      }

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('patient_token');
        localStorage.removeItem('patient_user');

        // Clear cookie
        document.cookie = 'patient_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';

        // Dispatch auth-change event to update header
        window.dispatchEvent(new Event('auth-change'));
      }

      // Show success message
      toast.success('Logged out successfully');

      // Redirect to login page
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen py-4 sm:py-6 md:py-8 px-4 sm:px-6"
        style={{ backgroundColor: '#f5f0e8' }}
      >
        <div className="container mx-auto max-w-6xl">
          <Skeleton className="h-8 sm:h-12 w-32 sm:w-48 mb-4 sm:mb-6" />
          <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
            <Skeleton className="h-20 sm:h-24 w-full" />
          </Card>
          <Skeleton className="h-48 sm:h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div
        className="min-h-screen py-4 sm:py-6 md:py-8 px-4 sm:px-6 flex items-center justify-center"
        style={{ backgroundColor: '#f5f0e8' }}
      >
        <Card className="p-6 sm:p-8 max-w-md w-full mx-4">
          <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
          <Link
            href="/auth/login"
            className="text-blue-600 hover:underline text-sm sm:text-base"
          >
            Go to Login
          </Link>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className="min-h-screen py-4 sm:py-6 md:py-8 px-4 sm:px-6"
      style={{ backgroundColor: '#f5f0e8' }}
    >
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Link
            href="/"
            className="flex items-center gap-1 sm:gap-2 hover:opacity-80 transition-opacity text-sm sm:text-base"
            style={{ color: colors.primary }}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <Button
            onClick={handleLogout}
            disabled={loggingOut}
            variant="outline"
            className="flex items-center gap-2 text-sm sm:text-base"
            style={{
              borderColor: colors.primary,
              color: colors.primary,
            }}
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Logout</span>
          </Button>
        </div>

        <h1
          className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6"
          style={{ color: colors.primary }}
        >
          My Profile
        </h1>

        {/* Personal Details */}
        <PersonalDetails
          user={{
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            profileImage: user.profileImage,
          }}
          onEdit={handleEditPersonalDetails}
          onUpdate={handleProfileUpdate}
        />

        {/* Edit Personal Details Modal */}
        <EditPersonalDetailsModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          user={{
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            profileImage: user.profileImage,
            isCancerPatient: user.isCancerPatient,
          }}
          onSuccess={handleProfileUpdate}
        />

        {/* Tabs */}
        <Tabs
          defaultValue="history"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 mb-4 sm:mb-6 scrollbar-hide">
            <TabsList className="w-full min-w-max justify-start mb-0 bg-transparent p-0 h-auto border-b inline-flex">
              <TabsTrigger
                value="history"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold whitespace-nowrap text-sm sm:text-base"
                style={{
                  color: colors.black,
                }}
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span>History</span>
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold whitespace-nowrap text-sm sm:text-base"
                style={{
                  color: colors.black,
                }}
              >
                <Wallet className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden sm:inline">Transaction History</span>
                <span className="sm:hidden">Transactions</span>
              </TabsTrigger>
              <TabsTrigger
                value="coins"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold whitespace-nowrap text-sm sm:text-base"
                style={{
                  color: colors.black,
                }}
              >
                <Coins className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span>Coins</span>
              </TabsTrigger>
              <TabsTrigger
                value="vouchers"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold whitespace-nowrap text-sm sm:text-base"
                style={{
                  color: colors.black,
                }}
              >
                <Gift className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span>Vouchers</span>
              </TabsTrigger>
              <TabsTrigger
                value="prescriptions"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold whitespace-nowrap text-sm sm:text-base"
                style={{
                  color: colors.black,
                }}
              >
                <Upload className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden sm:inline">Prescriptions</span>
                <span className="sm:hidden">Prescriptions</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="history">
            <HistoryTab isActive={activeTab === 'history'} />
          </TabsContent>

          <TabsContent value="transactions">
            <WalletTab isActive={activeTab === 'transactions'} />
          </TabsContent>

          <TabsContent value="coins">
            <CoinsTab isActive={activeTab === 'coins'} />
          </TabsContent>

          <TabsContent value="vouchers">
            <VouchersTab isActive={activeTab === 'vouchers'} />
          </TabsContent>

          <TabsContent value="prescriptions">
            <PrescriptionsTab
              isActive={activeTab === 'prescriptions'}
              onUpload={handleUploadPrescription}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="space-y-4">
              <Skeleton className="h-10 w-48" />
              <Card className="p-6">
                <Skeleton className="h-64 w-full" />
              </Card>
            </div>
          </div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
