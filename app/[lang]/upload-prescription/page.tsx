'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocalizedRouter } from '@/lib/hooks/useLocalizedRouter';
import { usePathname } from 'next/navigation';
import { getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import { apiClient } from '@/lib/api';
import { colors } from '@/config/theme';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';
import { syncAuthTokenToCookie, isAuthenticated } from '@/lib/utils/auth';
import {
  ImageIcon,
  Camera,
  Check,
  Phone,
  Lock,
  User,
  Upload as UploadIcon,
} from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
];

export default function UploadPrescriptionPage() {
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const { dictionary } = useDictionary(locale);
  const localizedRouter = useLocalizedRouter();

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

  // Sync token to cookie on mount (for existing sessions)
  useEffect(() => {
    syncAuthTokenToCookie();

    // If not authenticated, redirect to login
    if (!isAuthenticated()) {
      const currentPath = window.location.pathname;
      localizedRouter.replace(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [localizedRouter]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync token to cookie on mount (for existing sessions)
  useEffect(() => {
    syncAuthTokenToCookie();

    // If not authenticated, redirect to login
    if (!isAuthenticated()) {
      const currentPath = window.location.pathname;
      localizedRouter.replace(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [router]);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return t('common.invalidFileType');
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return t('common.fileSizeExceeds');
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast.error(error);
      // Reset the input
      if (event.target === fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (event.target === cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error(t('common.selectFileToUpload'));
      return;
    }

    const error = validateFile(selectedFile);
    if (error) {
      toast.error(error);
      return;
    }

    setUploading(true);

    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('patient_token')
          : null;

      if (!token) {
        toast.error(t('common.pleaseLoginToUpload'));
        localizedRouter.push('/auth/login?redirect=/upload-prescription');
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Show loading toast
      const loadingToast = toast.loading(t('common.uploadingPrescription'));

      // Upload file
      const response = await apiClient.post<{
        success: boolean;
        data: {
          id: string;
          imageUrl: string;
          createdAt: string;
        };
      }>('/patient/prescriptions', formData, {
        token,
      });

      toast.dismiss(loadingToast);

      if (response.data.success) {
        toast.success(t('common.prescriptionUploadedSuccess'));
        // Reset form
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';

        // Redirect to profile prescriptions tab after a short delay
        setTimeout(() => {
          localizedRouter.push('/profile?tab=prescriptions');
        }, 1500);
      } else {
        toast.error(t('common.failedToUploadPrescription'));
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(
        error?.message || t('common.failedToUploadPrescription')
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCall = () => {
    // You can replace this with actual phone number
    window.location.href = 'tel:+911234567890';
  };

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{ backgroundColor: colors.primaryLightest }}
    >
      <div className="container mx-auto max-w-4xl">
        <Card className="overflow-hidden">
          {/* Purple Header */}
          <CardHeader
            className="text-white py-6"
            style={{ backgroundColor: colors.primary }}
          >
            <CardTitle className="text-2xl font-bold text-center">
              {t('common.uploadPrescriptionTitle')}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            {/* Main Heading */}
            <h2
              className="text-2xl font-semibold mb-8 text-center"
              style={{ color: colors.primary }}
            >
              {t('common.havePrescription')}
            </h2>

            {/* Upload Options */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              {/* Gallery Option */}
              <button
                type="button"
                onClick={handleGalleryClick}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-lg border-2 border-dashed transition-all hover:border-primary hover:bg-primaryLightest"
                style={{
                  borderColor: colors.primaryLight,
                  minWidth: '150px',
                }}
                disabled={uploading}
              >
                <div
                  className="p-4 rounded-full"
                  style={{ backgroundColor: colors.primaryLight }}
                >
                  <ImageIcon
                    className="w-8 h-8"
                    style={{ color: colors.primary }}
                  />
                </div>
                <span className="font-medium" style={{ color: colors.primary }}>
                  {t('common.gallery')}
                </span>
              </button>

              {/* Camera Option */}
              <button
                type="button"
                onClick={handleCameraClick}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-lg border-2 border-dashed transition-all hover:border-primary hover:bg-primaryLightest"
                style={{
                  borderColor: colors.primaryLight,
                  minWidth: '150px',
                }}
                disabled={uploading}
              >
                <div
                  className="p-4 rounded-full"
                  style={{ backgroundColor: colors.primaryLight }}
                >
                  <Camera
                    className="w-8 h-8"
                    style={{ color: colors.primary }}
                  />
                </div>
                <span className="font-medium" style={{ color: colors.primary }}>
                  {t('common.takePicture')}
                </span>
              </button>
            </div>

            {/* Hidden File Inputs */}
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Security Message */}
            <div
              className="flex items-center gap-3 p-4 rounded-lg mb-8"
              style={{ backgroundColor: colors.primaryLightest }}
            >
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" style={{ color: colors.primary }} />
                <Lock className="w-5 h-5" style={{ color: colors.primary }} />
              </div>
              <p className="text-sm" style={{ color: colors.primary }}>
                {t('common.prescriptionSecure')}
              </p>
            </div>

            {/* Preview */}
            {preview && (
              <div className="mb-8">
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: colors.primary }}
                >
                  {t('common.selectedFile')}:
                </p>
                <div
                  className="border rounded-lg p-4"
                  style={{ borderColor: colors.primaryLight }}
                >
                  <img
                    src={preview}
                    alt="Prescription preview"
                    className="max-w-full h-auto max-h-64 mx-auto rounded"
                  />
                </div>
              </div>
            )}

            {selectedFile && !preview && (
              <div className="mb-8">
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: colors.primary }}
                >
                  {t('common.selectedFile')}:
                </p>
                <div
                  className="border rounded-lg p-4"
                  style={{ borderColor: colors.primaryLight }}
                >
                  <p className="text-sm" style={{ color: colors.primary }}>
                    {selectedFile.name} (
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              </div>
            )}

            {/* Why Upload Section */}
            <div className="mb-8">
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: colors.primary }}
              >
                {t('common.whyUploadPrescription')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    style={{ color: colors.primary }}
                  />
                  <p className="text-sm text-gray-700">
                    {t('common.uploadAcceptedFormats')}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    style={{ color: colors.primary }}
                  />
                  <p className="text-sm text-gray-700">
                    {t('common.expertsVerify')}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    style={{ color: colors.primary }}
                  />
                  <p className="text-sm text-gray-700">
                    {t('common.orderVisible')}
                  </p>
                </div>
              </div>
            </div>

            {/* Don't have prescription section */}
            <div
              className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 p-4 rounded-lg"
              style={{ backgroundColor: colors.primaryLightest }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: colors.primary }}
              >
                Don't have a valid prescription?
              </p>
              <Button
                onClick={handleCall}
                className="flex items-center gap-2"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                }}
                disabled={uploading}
              >
                <Phone className="w-4 h-4" />
                Call
              </Button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mb-6">
              <Button
                onClick={handleSubmit}
                disabled={!selectedFile || uploading}
                className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                }}
                size="lg"
              >
                {uploading ? (
                  <>
                    <UploadIcon className="w-4 h-4 animate-pulse" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-4 h-4" />
                    Submit
                  </>
                )}
              </Button>
            </div>

            {/* File Input Display */}
            <div
              className="border-t pt-6"
              style={{ borderColor: colors.primaryLight }}
            >
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  <UploadIcon className="w-4 h-4" />
                  Choose File
                </Button>
                <span className="text-sm text-gray-500">
                  {selectedFile ? selectedFile.name : 'No file chosen'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
