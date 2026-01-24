'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { apiClient } from '@/lib/api';
import { normalizeImageUrl } from '@/lib/image-utils';
import { colors } from '@/config/theme';
import { Upload, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface EditPersonalDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    name: string;
    email: string;
    phone: string | null;
    address?: string | null;
    profileImage?: string | null;
    isCancerPatient?: number | boolean;
  };
  onSuccess?: () => void;
}

/**
 * Get user initials from name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function EditPersonalDetailsModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: EditPersonalDetailsModalProps) {
  // Convert isCancerPatient from number (0/1) to boolean
  const getIsCancerPatientBoolean = (
    value: number | boolean | undefined
  ): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    return false;
  };

  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || '',
    address: user.address || '',
    isCancerPatient: getIsCancerPatientBoolean(user.isCancerPatient),
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    user.profileImage ? normalizeImageUrl(user.profileImage) : null
  );
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (open) {
      console.log('user', user);
      setFormData({
        name: user.name,
        phone: user.phone || '',
        address: user.address || '',
        gender: (user as any).gender || '',
        isCancerPatient: getIsCancerPatientBoolean(user.isCancerPatient),
      });
      setProfileImage(null);
      setProfileImagePreview(
        user.profileImage ? normalizeImageUrl(user.profileImage) : null
      );
      setRemoveImage(false);
      setError(null);
    }
  }, [open, user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
    setFormData((prev) => ({ ...prev, isCancerPatient: checked === true }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setProfileImage(file);
      setRemoveImage(false); // Reset remove flag when new image is selected
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
    setRemoveImage(true); // Mark that user wants to remove the image
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('patient_token')
          : null;

      if (!token) {
        setError('Please login to update profile');
        setLoading(false);
        return;
      }

      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('phone', formData.phone.trim() || '');
      formDataToSend.append('address', formData.address.trim() || '');
      if (formData.gender) {
        formDataToSend.append('gender', formData.gender);
      }
      // Convert boolean to number (0 or 1) for database
      formDataToSend.append(
        'isCancerPatient',
        formData.isCancerPatient ? '1' : '0'
      );

      // Add profile image if selected
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      // Call API with FormData
      const response = await apiClient.put<{
        success: boolean;
        data: {
          user: any;
          message: string;
        };
      }>('/patient/profile', formDataToSend, {
        token,
      });

      if (response.data.success) {
        // Call success callback to refresh profile data
        if (onSuccess) {
          onSuccess();
        }
        onOpenChange(false);
      } else {
        setError('Failed to update profile');
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      let errorMessage = 'Failed to update profile. Please try again.';

      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const initials = getInitials(formData.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ color: colors.primary }}>
            Edit Personal Details
          </DialogTitle>
          <DialogDescription>
            Update your personal information and profile picture
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Profile Image Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div
                className="rounded-full overflow-hidden border-4"
                style={{
                  borderColor: colors.primary,
                  width: '120px',
                  height: '120px',
                }}
              >
                <Avatar className="w-28 h-28">
                  {profileImagePreview ? (
                    <AvatarImage
                      src={profileImagePreview}
                      alt={formData.name}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback
                    className="text-3xl font-semibold"
                    style={{
                      backgroundColor: colors.primaryLight,
                      color: colors.primary,
                    }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              {profileImagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  style={{ zIndex: 10 }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="profile-image-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  borderColor: colors.primary,
                  color: colors.primary,
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                {profileImagePreview ? 'Change Photo' : 'Upload Photo'}
              </Button>
              <p className="text-xs text-gray-500">
                JPG, PNG or GIF. Max size 5MB
              </p>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your mobile number"
            />
          </div>

          {/* Gender Field */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup
              value={formData.gender}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  gender: value as 'MALE' | 'FEMALE' | 'OTHERS',
                }));
              }}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MALE" id="edit-gender-male" />
                <Label htmlFor="edit-gender-male" className="cursor-pointer">
                  Male
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FEMALE" id="edit-gender-female" />
                <Label htmlFor="edit-gender-female" className="cursor-pointer">
                  Female
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="OTHERS" id="edit-gender-others" />
                <Label htmlFor="edit-gender-others" className="cursor-pointer">
                  Others
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Address Field */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter your address"
            />
          </div>

          {/* Is Cancer Patient Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isCancerPatient"
              checked={formData.isCancerPatient}
              onCheckedChange={handleCheckboxChange}
            />
            <Label
              htmlFor="isCancerPatient"
              className="text-sm font-normal cursor-pointer"
            >
              I am a cancer patient
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: colors.primary,
                color: colors.white,
              }}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
