'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { colors } from '@/config/theme';
import { isAuthenticated, getAuthToken, syncAuthTokenToCookie } from '@/lib/utils/auth';
import { apiClient } from '@/lib/api';
import { toast } from '@/lib/toast';
import Link from 'next/link';

interface BreastCheckFormData {
  changeInContourShape: boolean;
  dimplingPuckering: boolean;
  pullingInNipple: boolean;
  itchyScalySoreRash: boolean;
  swellingRednessDarkness: boolean;
  sizeShapeDirection: boolean;
  nippleDischarge: boolean;
  lumpNearNeckBreasts: boolean;
  skinIrregularities: boolean;
  notes: string;
}

// Helper function to format date in local timezone (YYYY-MM-DD)
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function BreastCancerCarePage() {
  const router = useRouter();
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return formatDateLocal(today);
  });

  const [formData, setFormData] = useState<BreastCheckFormData>({
    changeInContourShape: false,
    dimplingPuckering: false,
    pullingInNipple: false,
    itchyScalySoreRash: false,
    swellingRednessDarkness: false,
    sizeShapeDirection: false,
    nippleDischarge: false,
    lumpNearNeckBreasts: false,
    skinIrregularities: false,
    notes: '',
  });

  const fetchExistingData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) return;

      const response = await apiClient.get<{
        success: boolean;
        data: {
          data: Array<{
            changeInContourShape?: boolean;
            dimplingPuckering?: boolean;
            pullingInNipple?: boolean;
            itchyScalySoreRash?: boolean;
            swellingRednessDarkness?: boolean;
            sizeShapeDirection?: boolean;
            nippleDischarge?: boolean;
            lumpNearNeckBreasts?: boolean;
            skinIrregularities?: boolean;
            notes?: string;
          }>;
        };
      }>(`/patient/user-details?type=WOMAN_BREAST_CHECK&dateFrom=${selectedDate}&dateTo=${selectedDate}`, {
        token,
      });

      if (response.data.success && response.data.data.data.length > 0) {
        const existingData = response.data.data.data[0];
        setFormData({
          changeInContourShape: existingData.changeInContourShape ?? false,
          dimplingPuckering: existingData.dimplingPuckering ?? false,
          pullingInNipple: existingData.pullingInNipple ?? false,
          itchyScalySoreRash: existingData.itchyScalySoreRash ?? false,
          swellingRednessDarkness: existingData.swellingRednessDarkness ?? false,
          sizeShapeDirection: existingData.sizeShapeDirection ?? false,
          nippleDischarge: existingData.nippleDischarge ?? false,
          lumpNearNeckBreasts: existingData.lumpNearNeckBreasts ?? false,
          skinIrregularities: existingData.skinIrregularities ?? false,
          notes: existingData.notes ?? '',
        });
      } else {
        // Reset form if no existing data found for selected date
        setFormData({
          changeInContourShape: false,
          dimplingPuckering: false,
          pullingInNipple: false,
          itchyScalySoreRash: false,
          swellingRednessDarkness: false,
          sizeShapeDirection: false,
          nippleDischarge: false,
          lumpNearNeckBreasts: false,
          skinIrregularities: false,
          notes: '',
        });
      }
    } catch (error: any) {
      console.error('Error fetching existing data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncAuthTokenToCookie();

    if (!isAuthenticated()) {
      const currentPath = window.location.pathname;
      router.replace(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    fetchExistingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      router.push('/auth/login?redirect=/womens-care/breast-cancer');
      return;
    }

    try {
      setSubmitting(true);
      const token = getAuthToken();
      if (!token) {
        router.push('/auth/login?redirect=/womens-care/breast-cancer');
        return;
      }

      // Send date with timezone offset to ensure server parses it correctly
      // When server does new Date() and setHours(0,0,0,0), we need to ensure
      // the date stays on the correct day. Sending with timezone offset helps.
      const dateObj = new Date(selectedDate + 'T12:00:00');
      const timezoneOffset = -dateObj.getTimezoneOffset(); // Offset in minutes
      const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60).toString().padStart(2, '0');
      const offsetMinutes = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0');
      const offsetSign = timezoneOffset >= 0 ? '+' : '-';
      // Send as ISO string with timezone: YYYY-MM-DDTHH:mm:ss+HH:mm
      const dateWithTimezone = `${selectedDate}T12:00:00${offsetSign}${offsetHours}:${offsetMinutes}`;

      const payload = {
        type: 'WOMAN_BREAST_CHECK' as const,
        date: dateWithTimezone,
        changeInContourShape: formData.changeInContourShape,
        dimplingPuckering: formData.dimplingPuckering,
        pullingInNipple: formData.pullingInNipple,
        itchyScalySoreRash: formData.itchyScalySoreRash,
        swellingRednessDarkness: formData.swellingRednessDarkness,
        sizeShapeDirection: formData.sizeShapeDirection,
        nippleDischarge: formData.nippleDischarge,
        lumpNearNeckBreasts: formData.lumpNearNeckBreasts,
        skinIrregularities: formData.skinIrregularities,
        notes: formData.notes || undefined,
      };

      const response = await apiClient.post<{
        success: boolean;
        data: {
          message: string;
        };
      }>('/patient/user-details', payload, { token });

      if (response.data.success) {
        toast.success('Breast examination checklist saved successfully!');
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to save checklist. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckboxChange = (field: keyof BreastCheckFormData, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="ghost"
              className="mb-4"
              style={{ color: colors.primary }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1
            className="text-3xl md:text-4xl font-bold"
            style={{ color: colors.primary }}
          >
            Breast Cancer Self Examination Markers
          </h1>
          <p className="text-gray-600 mt-2">
            Early detection is key to successful treatment. Follow this guide to perform regular self-examinations.
          </p>
        </div>

        {/* Checklist Card */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: colors.black }}>
            Checklist for Self Breast Examination
          </h2>
          <ul className="space-y-2 mb-4 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Ensure you are relaxed, not in a hurry.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Ensure – Good light, Chairs, table, Mirror, Checklist, Pen, Small pillow, Bed/couch.</span>
            </li>
          </ul>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
            <p className="text-sm text-gray-700">
              <strong>Important:</strong> Breast self-examination should ideally be performed 7-10 days after your menstrual periods start, which is when your breasts are least tender & lumpy.
            </p>
            <p className="text-sm text-gray-700 mt-2">
              If you are post menopausal, select same date of every month and mark on calendar or set reminders on your mobile.
            </p>
          </div>
        </Card>

        {/* Inspection Section */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: colors.black }}>
            A) INSPECTION
          </h2>
          
          <div className="space-y-6">
            {/* Position 1 */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>
                Position 1:
              </h3>
              <p className="text-gray-700 mb-3">
                Undress till waist and stand in front of mirror.
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Note that left & right breasts may not exactly match in size – very few women have perfectly symmetrical breasts. Note what is normal for you.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-2 text-gray-800">Check for:</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Any change in contour or shape of breasts</li>
                  <li>• Any dimpling/puckering of skin</li>
                  <li>• Pulling in nipple</li>
                  <li>• Itchy, scaly, sore or rash on nipple</li>
                  <li>• Swelling, redness/darkness in either breast</li>
                  <li>• Size, shape & direction in which the nipples point</li>
                  <li>• Any nipple discharge</li>
                  <li>• Any lump near neck or around breasts</li>
                  <li>• Any skin irregularities/thickening on or around breasts</li>
                </ul>
              </div>
            </div>

            {/* Position 2 */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>
                Position 2:
              </h3>
              <p className="text-gray-700 mb-3">
                Place hands on your hips, press firmly to flex your chest muscles.
              </p>
              <p className="text-sm text-gray-600">
                Look for all the points mentioned in Position 1.
              </p>
            </div>

            {/* Position 3 */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>
                Position 3:
              </h3>
              <p className="text-gray-700 mb-3">
                Take both the arms over head, whilst leaning forward and again check all points.
              </p>
              <p className="text-sm text-gray-600">
                Note down all points in checklist.
              </p>
            </div>
          </div>

          {/* Inspection Form */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.primary }}>
              Record Your Inspection Results
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date Selection */}
              <div>
                <Label htmlFor="examination-date" className="mb-2 block" style={{ color: colors.black }}>
                  Examination Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="examination-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  style={{ borderColor: colors.primary }}
                  className="max-w-xs"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <Label className="mb-3 block font-medium" style={{ color: colors.black }}>
                  Check all that apply:
                </Label>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="changeInContourShape"
                      checked={formData.changeInContourShape}
                      onCheckedChange={(checked) => handleCheckboxChange('changeInContourShape', checked === true)}
                      className="mt-1"
                    />
                    <label
                      htmlFor="changeInContourShape"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      style={{ color: colors.black }}
                    >
                      Any change in contour or shape of breasts
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="dimplingPuckering"
                      checked={formData.dimplingPuckering}
                      onCheckedChange={(checked) => handleCheckboxChange('dimplingPuckering', checked === true)}
                      className="mt-1"
                    />
                    <label
                      htmlFor="dimplingPuckering"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      style={{ color: colors.black }}
                    >
                      Any dimpling/puckering of skin
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="pullingInNipple"
                      checked={formData.pullingInNipple}
                      onCheckedChange={(checked) => handleCheckboxChange('pullingInNipple', checked === true)}
                      className="mt-1"
                    />
                    <label
                      htmlFor="pullingInNipple"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      style={{ color: colors.black }}
                    >
                      Pulling in nipple
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="itchyScalySoreRash"
                      checked={formData.itchyScalySoreRash}
                      onCheckedChange={(checked) => handleCheckboxChange('itchyScalySoreRash', checked === true)}
                      className="mt-1"
                    />
                    <label
                      htmlFor="itchyScalySoreRash"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      style={{ color: colors.black }}
                    >
                      Itchy, scaly, sore or rash on nipple
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="swellingRednessDarkness"
                      checked={formData.swellingRednessDarkness}
                      onCheckedChange={(checked) => handleCheckboxChange('swellingRednessDarkness', checked === true)}
                      className="mt-1"
                    />
                    <label
                      htmlFor="swellingRednessDarkness"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      style={{ color: colors.black }}
                    >
                      Swelling, redness/darkness in either breast
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="sizeShapeDirection"
                      checked={formData.sizeShapeDirection}
                      onCheckedChange={(checked) => handleCheckboxChange('sizeShapeDirection', checked === true)}
                      className="mt-1"
                    />
                    <label
                      htmlFor="sizeShapeDirection"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      style={{ color: colors.black }}
                    >
                      Size, shape & direction in which the nipples point
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="nippleDischarge"
                      checked={formData.nippleDischarge}
                      onCheckedChange={(checked) => handleCheckboxChange('nippleDischarge', checked === true)}
                      className="mt-1"
                    />
                    <label
                      htmlFor="nippleDischarge"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      style={{ color: colors.black }}
                    >
                      Any nipple discharge
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="lumpNearNeckBreasts"
                      checked={formData.lumpNearNeckBreasts}
                      onCheckedChange={(checked) => handleCheckboxChange('lumpNearNeckBreasts', checked === true)}
                      className="mt-1"
                    />
                    <label
                      htmlFor="lumpNearNeckBreasts"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      style={{ color: colors.black }}
                    >
                      Any lump near neck or around breasts
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="skinIrregularities"
                      checked={formData.skinIrregularities}
                      onCheckedChange={(checked) => handleCheckboxChange('skinIrregularities', checked === true)}
                      className="mt-1"
                    />
                    <label
                      htmlFor="skinIrregularities"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      style={{ color: colors.black }}
                    >
                      Any skin irregularities/thickening on or around breasts
                    </label>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="mb-2 block" style={{ color: colors.black }}>
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any additional observations or concerns..."
                  rows={4}
                  style={{ borderColor: colors.primary }}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={submitting || loading}
                  className="w-full sm:w-auto"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.white,
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Checklist'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Palpation Section */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: colors.black }}>
            B) PALPATION
          </h2>
          
          <div className="space-y-6">
            {/* Position 1 */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>
                Position 1:
              </h3>
              <p className="text-gray-700 mb-3">
                Lie down on bed with pillow under shoulder on side being examined and place the arm of side to be examined overhead. In this position, the breast tissue spreads out evenly along chest wall.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-3">
                <p className="font-medium mb-2 text-gray-800">Steps:</p>
                <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                  <li>Place pillow under your right shoulder and put your right arm behind your head.</li>
                  <li>Using your left hand, move the pads of your three middle fingers around your right breast whole area and armpit.</li>
                  <li>Use light, medium and firm pressure to feel for any new lump, thickening, hardened knots or any other change.</li>
                  <li>Squeeze nipple for any discharge.</li>
                  <li>Repeat steps for left breast.</li>
                </ol>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> You can use any one method from below three methods for breast palpation. Make sure, once you choose a convenient particular method, stick to that method always while examining. Do not keep changing methods.
                </p>
              </div>
            </div>

            {/* Position 2 */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>
                Position 2:
              </h3>
              <p className="text-gray-700">
                Repeat the same technique in sitting position.
              </p>
            </div>

            {/* Position 3 */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>
                Position 3:
              </h3>
              <p className="text-gray-700">
                Repeat the same technique in shower.
              </p>
            </div>
          </div>
        </Card>

        {/* Acknowledgment Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="acknowledge"
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked === true)}
              className="mt-1"
            />
            <div className="flex-1">
              <label
                htmlFor="acknowledge"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                style={{ color: colors.black }}
              >
                I have read and understood the self breast examination guide. I will perform regular self-examinations as recommended and consult a healthcare professional if I notice any changes or abnormalities.
              </label>
            </div>
          </div>
        </Card>

        {/* Important Note */}
        <Card className="p-6 border-l-4" style={{ borderColor: colors.primary, backgroundColor: '#F0F9FF' }}>
          <div className="flex items-start">
            <CheckCircle2 className="w-5 h-5 mr-3 mt-0.5" style={{ color: colors.primary }} />
            <div>
              <h3 className="font-semibold mb-2" style={{ color: colors.primary }}>
                Important Reminder
              </h3>
              <p className="text-sm text-gray-700">
                Self-examination is a valuable tool for early detection, but it does not replace regular clinical breast exams and mammograms as recommended by your healthcare provider. If you notice any changes, lumps, or abnormalities, please consult with a healthcare professional immediately.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
