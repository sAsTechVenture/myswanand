'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLocalizedRouter } from '@/lib/hooks/useLocalizedRouter';
import { getCurrentLocale, createLocalizedPath } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import Link from 'next/link';
import { CalendarIcon } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { colors } from '@/config/theme';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function RegisterPage() {
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const localizedRouter = useLocalizedRouter();
  const { dictionary } = useDictionary(locale);
  const [formData, setFormData] = useState({
    fullname: '',
    dob: undefined as Date | undefined,
    emailaddress: '',
    mobileNumber: '',
    swanandHealthCardNo: '',
    password: '',
    confirmPassword: '',
    gender: '' as 'MALE' | 'FEMALE' | 'OTHERS' | '',
    isCancerPatient: false,
    agreeToTerms: false,
  });

  // Date picker state
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [datePickerMonth, setDatePickerMonth] = useState<Date | undefined>(
    formData.dob
  );
  const [datePickerValue, setDatePickerValue] = useState('');

  // Format date for display
  function formatDate(date: Date | undefined) {
    if (!date) {
      return '';
    }
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  // Validate date
  function isValidDate(date: Date | undefined) {
    if (!date) {
      return false;
    }
    return !isNaN(date.getTime());
  }

  // Don't use useEffect to sync datePickerValue with formData.dob
  // This allows free typing without interference
  // The value is only updated when:
  // 1. User selects a date from the calendar (onSelect handler)
  // 2. User types a valid date (onChange handler formats it)

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox
      ? (e.target as HTMLInputElement).checked
      : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? checked : value,
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

    if (!formData.fullname.trim()) {
      newErrors.fullname = t('common.fullNameRequired');
    }

    if (!formData.dob) {
      newErrors.dob = t('common.dobRequired');
    }

    if (!formData.emailaddress.trim()) {
      newErrors.emailaddress = t('common.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailaddress)) {
      newErrors.emailaddress = t('common.invalidEmailFormat');
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = t('common.mobileRequired');
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = t('common.invalidMobile');
    }

    if (!formData.password) {
      newErrors.password = t('common.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('common.passwordMinLength');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('common.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('common.passwordsDoNotMatch');
    }

    if (!formData.gender) {
      newErrors.gender = t('common.genderRequired');
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = t('common.agreeTermsRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Format date of birth if provided
      let dobFormatted: string | undefined;
      if (formData.dob) {
        dobFormatted = formData.dob.toISOString();
      }

      const response = await apiClient.post<{
        success: boolean;
        data: {
          user: unknown;
          message: string;
        };
      }>('/patient/register', {
        fullname: formData.fullname.trim(),
        dob: dobFormatted,
        emailaddress: formData.emailaddress.trim().toLowerCase(),
        mobileNumber: formData.mobileNumber.replace(/\D/g, ''),
        swanandHealthCardNo: formData.swanandHealthCardNo.trim() || undefined,
        password: formData.password,
        gender: formData.gender,
        isCancerPatient: formData.isCancerPatient,
      });

      if (response.data.success) {
        setSubmitSuccess(true);
        // Redirect to login or verification page after a short delay
        setTimeout(() => {
          localizedRouter.push('/auth/login');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = t('common.registrationFailed');

      // Try to extract error message from various possible formats
      if (error?.message) {
        errorMessage = error.message;
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
          backgroundImage: 'url(/auth/new_signup.png)',
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
          {/* Left Side - Registration Form */}
          <div className="w-full">
            <div className="mb-6">
              <h2
                className="text-3xl font-bold mb-6"
                style={{ color: '#1a1a1a' }}
              >
                {t('common.getStartedNow')}
              </h2>
            </div>

            {/* Success Message */}
            {submitSuccess && (
              <Alert className="mb-6 border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {t('common.registrationSuccessful')}
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
              {/* Full Name */}
              <div>
                <Label
                  htmlFor="fullname"
                  className="mb-2 block text-sm font-medium"
                >
                  {t('common.fullName')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullname"
                  name="fullname"
                  type="text"
                  placeholder={t('common.enterFullName')}
                  value={formData.fullname}
                  onChange={handleChange}
                  className={`w-full ${
                    errors.fullname ? 'border-red-500' : ''
                  }`}
                  aria-invalid={!!errors.fullname}
                />
                {errors.fullname && (
                  <p className="mt-1 text-sm text-red-500">{errors.fullname}</p>
                )}
              </div>

              {/* Date of Birth - Picker with Input */}
              <div>
                <Label htmlFor="dob" className="mb-2 block text-sm font-medium">
                  {t('common.dateOfBirth')} <span className="text-red-500">*</span>
                </Label>
                <div className="relative flex gap-2">
                  <Input
                    id="dob"
                    value={datePickerValue}
                    placeholder="12/01/2025"
                    className={cn(
                      'bg-background pr-10',
                      errors.dob && 'border-red-500'
                    )}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // Always update the input value to allow free typing
                      setDatePickerValue(inputValue);

                      // If input is cleared, clear the date
                      if (!inputValue.trim()) {
                        setFormData((prev) => ({ ...prev, dob: undefined }));
                        setDatePickerMonth(undefined);
                        if (errors.dob) {
                          setErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.dob;
                            return newErrors;
                          });
                        }
                        return;
                      }

                      // Try to parse the date - shadcn uses new Date() which handles various formats
                      const date = new Date(inputValue);
                      if (isValidDate(date)) {
                        setFormData((prev) => ({ ...prev, dob: date }));
                        setDatePickerMonth(date);
                        if (errors.dob) {
                          setErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.dob;
                            return newErrors;
                          });
                        }
                      } else {
                        // Invalid date - clear formData.dob but keep the input value for user to continue typing
                        setFormData((prev) => ({ ...prev, dob: undefined }));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setDatePickerOpen(true);
                      }
                    }}
                    aria-invalid={!!errors.dob}
                  />
                  <Popover
                    open={datePickerOpen}
                    onOpenChange={setDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        id="date-picker"
                        variant="ghost"
                        className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                      >
                        <CalendarIcon className="size-3.5" />
                        <span className="sr-only">{t('common.dateOfBirth')}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="end"
                      alignOffset={-8}
                      sideOffset={10}
                    >
                      <Calendar
                        mode="single"
                        selected={formData.dob}
                        captionLayout="dropdown"
                        month={datePickerMonth}
                        onMonthChange={setDatePickerMonth}
                        onSelect={(date) => {
                          if (date) {
                            setFormData((prev) => ({ ...prev, dob: date }));
                            const formattedDate = formatDate(date);
                            setDatePickerValue(formattedDate);
                            setDatePickerMonth(date);
                            setDatePickerOpen(false);
                            if (errors.dob) {
                              setErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors.dob;
                                return newErrors;
                              });
                            }
                          } else {
                            // If date is cleared from calendar
                            setFormData((prev) => ({
                              ...prev,
                              dob: undefined,
                            }));
                            setDatePickerValue('');
                            setDatePickerMonth(undefined);
                          }
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {errors.dob && (
                  <p className="mt-1 text-sm text-red-500">{errors.dob}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <Label
                  htmlFor="emailaddress"
                  className="mb-2 block text-sm font-medium"
                >
                  {t('common.emailAddress')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="emailaddress"
                  name="emailaddress"
                  type="email"
                  placeholder={t('common.enterEmail')}
                  value={formData.emailaddress}
                  onChange={handleChange}
                  className={`w-full ${
                    errors.emailaddress ? 'border-red-500' : ''
                  }`}
                  aria-invalid={!!errors.emailaddress}
                />
                {errors.emailaddress && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.emailaddress}
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <Label
                  htmlFor="mobileNumber"
                  className="mb-2 block text-sm font-medium"
                >
                  {t('common.mobileNumber')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  placeholder={t('common.enterMobileNumber')}
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className={`w-full ${
                    errors.mobileNumber ? 'border-red-500' : ''
                  }`}
                  aria-invalid={!!errors.mobileNumber}
                />
                {errors.mobileNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.mobileNumber}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  {t('common.gender')} <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      gender: value as 'MALE' | 'FEMALE' | 'OTHERS',
                    }));
                    if (errors.gender) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.gender;
                        return newErrors;
                      });
                    }
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MALE" id="gender-male" />
                    <Label htmlFor="gender-male" className="cursor-pointer">
                      {t('common.male')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="FEMALE" id="gender-female" />
                    <Label htmlFor="gender-female" className="cursor-pointer">
                      {t('common.female')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="OTHERS" id="gender-others" />
                    <Label htmlFor="gender-others" className="cursor-pointer">
                      {t('common.others')}
                    </Label>
                  </div>
                </RadioGroup>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
                )}
              </div>

              {/* Swanand Health Card No */}
              <div>
                <Label
                  htmlFor="swanandHealthCardNo"
                  className="mb-2 block text-sm font-medium"
                >
                  {t('common.swanandHealthCard')}
                </Label>
                <Input
                  id="swanandHealthCardNo"
                  name="swanandHealthCardNo"
                  type="text"
                  placeholder={t('common.enterHealthCard')}
                  value={formData.swanandHealthCardNo}
                  onChange={handleChange}
                />
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

              {/* Confirm Password */}
              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium"
                >
                  {t('common.confirmPassword')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder={t('common.enterConfirmPassword')}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full ${
                    errors.confirmPassword ? 'border-red-500' : ''
                  }`}
                  aria-invalid={!!errors.confirmPassword}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Is Cancer Patient Checkbox */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="isCancerPatient"
                  name="isCancerPatient"
                  checked={formData.isCancerPatient}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({
                      ...prev,
                      isCancerPatient: checked === true,
                    }));
                  }}
                  className="mt-1 border-2"
                  style={{
                    borderColor: formData.isCancerPatient
                      ? colors.primary
                      : colors.primaryLight,
                    backgroundColor: formData.isCancerPatient
                      ? colors.primary
                      : 'transparent',
                  }}
                />
                <Label
                  htmlFor="isCancerPatient"
                  className="text-sm font-normal cursor-pointer"
                >
                  {t('common.cancerPatient')}
                </Label>
              </div>

              {/* Terms & Policy Checkbox */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({
                      ...prev,
                      agreeToTerms: checked === true,
                    }));
                    if (errors.agreeToTerms) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.agreeToTerms;
                        return newErrors;
                      });
                    }
                  }}
                  className="mt-1 border-2"
                  style={{
                    borderColor: formData.agreeToTerms
                      ? colors.primary
                      : colors.primaryLight,
                    backgroundColor: formData.agreeToTerms
                      ? colors.primary
                      : 'transparent',
                  }}
                  aria-invalid={!!errors.agreeToTerms}
                />
                <Label
                  htmlFor="agreeToTerms"
                  className="text-sm font-normal cursor-pointer"
                >
                  {t('common.agreeTerms')}
                  <span className="text-red-500"> *</span>
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-500 -mt-2 ml-7">
                  {errors.agreeToTerms}
                </p>
              )}

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
                {isSubmitting ? t('common.creatingAccount') : t('common.createAccount')}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  Have an account?{' '}
                  <Link
                    href={createLocalizedPath('/auth/login', locale)}
                    className="font-medium hover:underline"
                    style={{ color: colors.primary }}
                  >
                    {t('common.signInTitle')}
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
