'use client';

import { useEffect, useState } from 'react';
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
import { ArrowLeft, FileText, Wallet, Coins, Gift, Upload } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

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

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('history');
  const [editModalOpen, setEditModalOpen] = useState(false);

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

  if (loading) {
    return (
      <div
        className="min-h-screen py-8 px-4"
        style={{ backgroundColor: '#f5f0e8' }}
      >
        <div className="container mx-auto max-w-6xl">
          <Skeleton className="h-12 w-48 mb-6" />
          <Card className="p-6 mb-6">
            <Skeleton className="h-24 w-full" />
          </Card>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div
        className="min-h-screen py-8 px-4 flex items-center justify-center"
        style={{ backgroundColor: '#f5f0e8' }}
      >
        <Card className="p-8 max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/auth/login" className="text-blue-600 hover:underline">
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
      className="min-h-screen py-8 px-4"
      style={{ backgroundColor: '#f5f0e8' }}
    >
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            style={{ color: colors.primary }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>

        <h1
          className="text-3xl font-bold mb-6"
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
          <TabsList className="w-full justify-start mb-6 bg-transparent p-0 h-auto border-b">
            <TabsTrigger
              value="history"
              className="flex items-center gap-2 px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold"
              style={{
                color: colors.black,
              }}
            >
              <FileText className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="flex items-center gap-2 px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold"
              style={{
                color: colors.black,
              }}
            >
              <Wallet className="w-4 h-4" />
              Transaction History
            </TabsTrigger>
            <TabsTrigger
              value="coins"
              className="flex items-center gap-2 px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold"
              style={{
                color: colors.black,
              }}
            >
              <Coins className="w-4 h-4" />
              Coins
            </TabsTrigger>
            <TabsTrigger
              value="vouchers"
              className="flex items-center gap-2 px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold"
              style={{
                color: colors.black,
              }}
            >
              <Gift className="w-4 h-4" />
              Vouchers
            </TabsTrigger>
            <TabsTrigger
              value="prescriptions"
              className="flex items-center gap-2 px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold"
              style={{
                color: colors.black,
              }}
            >
              <Upload className="w-4 h-4" />
              Prescriptions
            </TabsTrigger>
          </TabsList>

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
