"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  FileText,
  CalendarCheck,
  User,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { getAuthToken } from "@/lib/utils/auth";
import { toast } from "@/lib/toast";
import { colors } from "@/config/theme";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Image from "next/image";
import { normalizeImageUrl } from "@/lib/image-utils";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  profileImage: string | null;
  healthCard: string | null;
}

export default function ApplySwanandCardForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [cardType, setCardType] = useState<'INDIVIDUAL' | 'FAMILY'>('INDIVIDUAL');
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetchingProfile(true);
        const token = getAuthToken();

        if (!token) {
          router.push('/auth/login?redirect=/swanand-card/apply');
          return;
        }

        const response = await apiClient.get<{
          success: boolean;
          data: {
            user: UserProfile;
          };
        }>('/patient/me', { token });

        if (response.data.success && response.data.data?.user) {
          setUser(response.data.data.user);
          
          // Check if user already has a health card
          if (response.data.data.user.healthCard) {
            setError(`You already have a health card. Health card number: ${response.data.data.user.healthCard}`);
          }
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        if (err?.message?.includes('401') || err?.message?.includes('Unauthorized')) {
          router.push('/auth/login?redirect=/swanand-card/apply');
        } else {
          setError('Failed to load profile. Please try again.');
        }
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchProfile();
  }, [router]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        router.push('/auth/login?redirect=/swanand-card/apply');
        return;
      }

      const response = await apiClient.post<{
        success: boolean;
        data: {
          message: string;
          application?: {
            id: string;
            type: string;
            status: string;
            appliedAt: string;
          };
        };
      }>('/patient/health-card/apply', {
        cardType: cardType,
      }, { token });

      if (response.data.success) {
        toast.success(response.data.data.message || 'Application submitted successfully');
        onSuccess();
      }
    } catch (err: any) {
      console.error('Application error:', err);
      let errorMessage = 'Failed to submit application. Please try again.';

      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      }

      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProfile) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }

  if (error && !user) {
    return (
      <Card className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  const profileImageUrl = user.profileImage ? normalizeImageUrl(user.profileImage) : null;

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-2xl bg-white p-4 shadow-md"
    >
      {/* TOP ICON STRIP */}
      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
        <TopIcon icon={<ShieldCheck size={18} />} text="Health Protection" />
        <TopIcon icon={<FileText size={18} />} text="Policy Coverage" />
        <TopIcon icon={<CalendarCheck size={18} />} text="Scheduled Account" />
      </div>

      {/* APPLICATION FORM TITLE */}
      <p className="text-center text-xs font-semibold" style={{ color: colors.primary }}>
        Application Form
      </p>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {submitError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* USER PROFILE SECTION */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center gap-4 mb-4">
          {profileImageUrl ? (
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2" style={{ borderColor: colors.primary }}>
              <Image
                src={profileImageUrl}
                alt={user.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          ) : (
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center border-2"
              style={{ 
                borderColor: colors.primary,
                backgroundColor: colors.primaryLight 
              }}
            >
              <User className="w-10 h-10" style={{ color: colors.primary }} />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-sm" style={{ color: colors.black }}>
              {user.name}
            </h3>
            <p className="text-xs text-gray-600">{user.email}</p>
            {user.phone && (
              <p className="text-xs text-gray-600">{user.phone}</p>
            )}
          </div>
        </div>
        {user.address && (
          <div className="mt-2">
            <p className="text-xs text-gray-600 mb-1">Address:</p>
            <p className="text-xs text-gray-700">{user.address}</p>
          </div>
        )}
      </Card>

      {/* CARD TYPE */}
      <div className="rounded-xl p-3" style={{ backgroundColor: colors.primaryLightest }}>
        <Label className="mb-2 block text-xs font-medium text-gray-700">
          Select Health Card Type <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={cardType}
          onValueChange={(value) => setCardType(value as 'INDIVIDUAL' | 'FAMILY')}
          className="flex gap-2"
        >
          <label className="flex flex-1 items-center justify-between rounded-lg bg-white px-3 py-2 text-xs cursor-pointer border-2 transition-colors"
            style={{
              borderColor: cardType === 'INDIVIDUAL' ? colors.primary : 'transparent',
            }}
          >
            Individual
            <RadioGroupItem value="INDIVIDUAL" id="individual" />
          </label>
          <label className="flex flex-1 items-center justify-between rounded-lg bg-white px-3 py-2 text-xs cursor-pointer border-2 transition-colors"
            style={{
              borderColor: cardType === 'FAMILY' ? colors.primary : 'transparent',
            }}
          >
            Family
            <RadioGroupItem value="FAMILY" id="family" />
          </label>
        </RadioGroup>
      </div>

      {/* SUBMIT */}
      <Button
        type="submit"
        disabled={loading || !!error}
        className="w-full py-3 text-sm font-semibold"
        style={{
          backgroundColor: colors.primary,
          color: colors.white,
        }}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
            Submitting...
          </>
        ) : (
          "SUBMIT APPLICATION"
        )}
      </Button>

      <p className="text-center text-[10px] text-gray-400">
        By submitting this form, you agree to the terms & conditions
      </p>

      {/* NEED HELP */}
      <div className="rounded-xl p-4 text-center text-white" style={{ backgroundColor: colors.primary }}>
        <p className="text-sm font-semibold">Need Help?</p>
        <p className="mt-1 text-xs">Contact us for assistance</p>
        <div className="mt-3 rounded-lg bg-white py-2 text-sm font-medium" style={{ color: colors.primary }}>
          Email: info@swanandpathology.com
        </div>
      </div>

      {/* FOOTER NOTE */}
      <div className="rounded-xl p-3 text-center text-[10px] text-gray-600" style={{ backgroundColor: colors.lightestGreen }}>
        Click submit to continue your application
      </div>
    </form>
  );
}

/* -------------------- UI HELPERS -------------------- */

function TopIcon({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="rounded-xl p-2" style={{ backgroundColor: colors.primaryLightest }}>
      <div className="mx-auto mb-1 w-fit" style={{ color: colors.primary }}>
        {icon}
      </div>
      <p className="text-[10px]">{text}</p>
    </div>
  );
}
