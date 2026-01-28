'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocalizedRouter } from '@/lib/hooks/useLocalizedRouter';
import { createLocalizedPath, getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import { ArrowLeft, Loader2, Smile, TrendingUp, Users, Heart, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { colors } from '@/config/theme';
import { isAuthenticated, getAuthToken, syncAuthTokenToCookie } from '@/lib/utils/auth';
import { apiClient } from '@/lib/api';
import { toast } from '@/lib/toast';
import Link from 'next/link';

// Helper function to format date in local timezone (YYYY-MM-DD)
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface DailyReflectionFormData {
  moodRating: number | null;
  productivityRating: number | null;
  connectedWithOthers: number | null;
  physicalHealthCare: boolean;
  meaningfulActivity: boolean;
  gratitude: string;
}

const RATING_EMOJIS = ['😢', '😕', '😐', '🙂', '😊'];
const RATING_LABELS = ['1-2', '3-4', '5-6', '7-8', '9-10'];

// Map emoji index (0-4) to rating value (1-10)
// Each emoji represents 2 rating points
const getRatingFromEmoji = (emojiIndex: number): number => {
  // emojiIndex 0 -> rating 1-2 (use 2)
  // emojiIndex 1 -> rating 3-4 (use 4)
  // emojiIndex 2 -> rating 5-6 (use 6)
  // emojiIndex 3 -> rating 7-8 (use 8)
  // emojiIndex 4 -> rating 9-10 (use 10)
  return (emojiIndex + 1) * 2;
};

// Map rating value (1-10) to emoji index (0-4)
const getEmojiIndexFromRating = (rating: number | null): number | null => {
  if (rating === null) return null;
  // rating 1-2 -> emojiIndex 0
  // rating 3-4 -> emojiIndex 1
  // rating 5-6 -> emojiIndex 2
  // rating 7-8 -> emojiIndex 3
  // rating 9-10 -> emojiIndex 4
  return Math.min(Math.floor((rating - 1) / 2), 4);
};

export default function MyHappinessCornerPage() {
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const localizedRouter = useLocalizedRouter();
  const { dictionary } = useDictionary(locale);
  const [loading, setLoading] = useState(false);

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
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return formatDateLocal(today);
  });
  const [randomQuote, setRandomQuote] = useState<string>('');
  const [quotesData, setQuotesData] = useState<string[]>([]);

  const [formData, setFormData] = useState<DailyReflectionFormData>({
    moodRating: null,
    productivityRating: null,
    connectedWithOthers: null,
    physicalHealthCare: false,
    meaningfulActivity: false,
    gratitude: '',
  });

  useEffect(() => {
    syncAuthTokenToCookie();

    if (!isAuthenticated()) {
      const currentPath = window.location.pathname;
      localizedRouter.replace(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Load quotes
    async function loadQuotes() {
      try {
        const response = await fetch('/data/quotes.json');
        const quotes = await response.json();
        setQuotesData(quotes);
        if (quotes.length > 0) {
          const randomIndex = Math.floor(Math.random() * quotes.length);
          setRandomQuote(quotes[randomIndex]);
        }
      } catch (error) {
        console.error('Error loading quotes:', error);
      }
    }
    loadQuotes();

    fetchExistingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, selectedDate]);

  const fetchExistingData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) return;

      const response = await apiClient.get<{
        success: boolean;
        data: {
          data: Array<{
            moodRating?: number;
            productivityRating?: number;
            connectedWithOthers?: number;
            physicalHealthCare?: boolean;
            meaningfulActivity?: boolean;
            gratitude?: string;
          }>;
        };
      }>(`/patient/user-details?type=DAILY_REFLECTION&dateFrom=${selectedDate}&dateTo=${selectedDate}`, {
        token,
      });

      if (response.data.success && response.data.data.data.length > 0) {
        const existingData = response.data.data.data[0];
        setFormData({
          moodRating: existingData.moodRating ?? null,
          productivityRating: existingData.productivityRating ?? null,
          connectedWithOthers: existingData.connectedWithOthers ?? null,
          physicalHealthCare: existingData.physicalHealthCare ?? false,
          meaningfulActivity: existingData.meaningfulActivity ?? false,
          gratitude: existingData.gratitude ?? '',
        });
      } else {
        // Reset form if no existing data
        setFormData({
          moodRating: null,
          productivityRating: null,
          connectedWithOthers: null,
          physicalHealthCare: false,
          meaningfulActivity: false,
          gratitude: '',
        });
      }
    } catch (error: any) {
      console.error('Error fetching existing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      localizedRouter.push('/auth/login?redirect=/my-happiness-corner');
      return;
    }

    try {
      setSubmitting(true);
      const token = getAuthToken();
      if (!token) {
        localizedRouter.push('/auth/login?redirect=/my-happiness-corner');
        return;
      }

      // Send date with timezone offset to ensure correct date
      const dateObj = new Date(selectedDate + 'T12:00:00');
      const timezoneOffset = -dateObj.getTimezoneOffset();
      const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60).toString().padStart(2, '0');
      const offsetMinutes = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0');
      const offsetSign = timezoneOffset >= 0 ? '+' : '-';
      const dateWithTimezone = `${selectedDate}T12:00:00${offsetSign}${offsetHours}:${offsetMinutes}`;

      const payload = {
        type: 'DAILY_REFLECTION' as const,
        date: dateWithTimezone,
        moodRating: formData.moodRating || undefined,
        productivityRating: formData.productivityRating || undefined,
        connectedWithOthers: formData.connectedWithOthers || undefined,
        physicalHealthCare: formData.physicalHealthCare,
        meaningfulActivity: formData.meaningfulActivity,
        gratitude: formData.gratitude || undefined,
      };

      const response = await apiClient.post<{
        success: boolean;
        data: {
          message: string;
        };
      }>('/patient/user-details', payload, { token });

      if (response.data.success) {
        toast.success('Daily reflection saved successfully!');
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to save reflection. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingChange = (field: 'moodRating' | 'productivityRating' | 'connectedWithOthers', emojiIndex: number) => {
    const ratingValue = getRatingFromEmoji(emojiIndex);
    setFormData((prev) => ({
      ...prev,
      [field]: ratingValue,
    }));
  };

  const handleNewQuote = () => {
    if (quotesData.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotesData.length);
      setRandomQuote(quotesData[randomIndex]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link href={createLocalizedPath('/', locale)}>
            <Button
              variant="ghost"
              className="mb-4"
              style={{ color: colors.primary }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.backToHome')}
            </Button>
          </Link>
          <h1
            className="text-3xl md:text-4xl font-bold"
            style={{ color: colors.primary }}
          >
            My Happiness Corner
          </h1>
          <p className="text-gray-600 mt-2">
            Nurture your well-being with daily reflections, mindfulness, positivity, and meditation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Reflection Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.primaryLight }}
              >
                <Heart className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: colors.black }}>
                Daily Reflection
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Selection */}
              <div>
                <Label htmlFor="reflection-date" className="mb-2 block" style={{ color: colors.black }}>
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="reflection-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  style={{ borderColor: colors.primary }}
                  className="max-w-xs"
                />
              </div>

              {/* Rating Questions */}
              <div className="space-y-4">
                {/* Mood Rating */}
                <div>
                  <Label className="mb-2 block flex items-center gap-2" style={{ color: colors.black }}>
                    <Smile className="w-4 h-4" />
                    How was your mood today? (1-10)
                  </Label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4].map((emojiIndex) => {
                      const isSelected = getEmojiIndexFromRating(formData.moodRating) === emojiIndex;
                      return (
                        <button
                          key={emojiIndex}
                          type="button"
                          onClick={() => handleRatingChange('moodRating', emojiIndex)}
                          className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-primary'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{
                            backgroundColor: isSelected ? colors.primaryLight : 'transparent',
                            borderColor: isSelected ? colors.primary : undefined,
                          }}
                        >
                          <div className="text-2xl mb-1">{RATING_EMOJIS[emojiIndex]}</div>
                          <div className="text-xs text-gray-600">{RATING_LABELS[emojiIndex]}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Productivity Rating */}
                <div>
                  <Label className="mb-2 block flex items-center gap-2" style={{ color: colors.black }}>
                    <TrendingUp className="w-4 h-4" />
                    How productive were you today? (1-10)
                  </Label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4].map((emojiIndex) => {
                      const isSelected = getEmojiIndexFromRating(formData.productivityRating) === emojiIndex;
                      return (
                        <button
                          key={emojiIndex}
                          type="button"
                          onClick={() => handleRatingChange('productivityRating', emojiIndex)}
                          className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-primary'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{
                            backgroundColor: isSelected ? colors.primaryLight : 'transparent',
                            borderColor: isSelected ? colors.primary : undefined,
                          }}
                        >
                          <div className="text-2xl mb-1">{RATING_EMOJIS[emojiIndex]}</div>
                          <div className="text-xs text-gray-600">{RATING_LABELS[emojiIndex]}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Connected with Others Rating */}
                <div>
                  <Label className="mb-2 block flex items-center gap-2" style={{ color: colors.black }}>
                    <Users className="w-4 h-4" />
                    How connected did you feel with others today? (1-10)
                  </Label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4].map((emojiIndex) => {
                      const isSelected = getEmojiIndexFromRating(formData.connectedWithOthers) === emojiIndex;
                      return (
                        <button
                          key={emojiIndex}
                          type="button"
                          onClick={() => handleRatingChange('connectedWithOthers', emojiIndex)}
                          className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-primary'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{
                            backgroundColor: isSelected ? colors.primaryLight : 'transparent',
                            borderColor: isSelected ? colors.primary : undefined,
                          }}
                        >
                          <div className="text-2xl mb-1">{RATING_EMOJIS[emojiIndex]}</div>
                          <div className="text-xs text-gray-600">{RATING_LABELS[emojiIndex]}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Physical Health Care Checkbox */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="physicalHealthCare"
                    checked={formData.physicalHealthCare}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, physicalHealthCare: checked === true }))
                    }
                    className="mt-1"
                  />
                  <label
                    htmlFor="physicalHealthCare"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    style={{ color: colors.black }}
                  >
                    Did you take care of your physical health today?
                  </label>
                </div>

                {/* Meaningful Activity Checkbox */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="meaningfulActivity"
                    checked={formData.meaningfulActivity}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, meaningfulActivity: checked === true }))
                    }
                    className="mt-1"
                  />
                  <label
                    htmlFor="meaningfulActivity"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    style={{ color: colors.black }}
                  >
                    Did you engage in meaningful activities today?
                  </label>
                </div>
              </div>

              {/* Gratitude Textarea */}
              <div>
                <Label htmlFor="gratitude" className="mb-2 block" style={{ color: colors.black }}>
                  What are you grateful for today?
                </Label>
                <Textarea
                  id="gratitude"
                  value={formData.gratitude}
                  onChange={(e) => setFormData((prev) => ({ ...prev, gratitude: e.target.value }))}
                  placeholder="Share what you're grateful for..."
                  rows={4}
                  style={{ borderColor: colors.primary }}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting || loading}
                className="w-full"
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
                  'Save Reflection'
                )}
              </Button>
            </form>
          </Card>

          {/* Daily Dose of Positivity Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.primaryLight }}
              >
                <Smile className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: colors.black }}>
                Daily Dose of Positivity
              </h2>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-lg border-l-4" style={{ borderColor: colors.primary }}>
              <p className="text-lg text-gray-800 italic mb-4">"{randomQuote}"</p>
              <Button
                variant="outline"
                onClick={handleNewQuote}
                className="w-full"
                style={{ borderColor: colors.primary, color: colors.primary }}
              >
                Get Another Quote
              </Button>
            </div>
          </Card>

          {/* Mindfulness for Healing Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.primaryLight }}
              >
                <Heart className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: colors.black }}>
                Mindfulness for Healing
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4" style={{ borderColor: colors.primary }}>
                <p className="text-sm text-gray-700 mb-3">
                  Take a moment to breathe deeply and center yourself. Mindfulness practices can help reduce stress, improve emotional well-being, and promote healing.
                </p>
                <Link href={createLocalizedPath('/blogs', locale)}>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{ borderColor: colors.primary, color: colors.primary }}
                  >
                    Explore Mindfulness Articles
                  </Button>
                </Link>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border-l-4" style={{ borderColor: colors.green }}>
                <p className="text-sm text-gray-700 mb-3">
                  Healing is a journey, not a destination. Practice self-compassion and be patient with yourself as you navigate through challenges.
                </p>
                <Link href={createLocalizedPath('/blogs', locale)}>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{ borderColor: colors.green, color: colors.green }}
                  >
                    Read Healing Stories
                  </Button>
                </Link>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border-l-4" style={{ borderColor: colors.primary }}>
                <p className="text-sm text-gray-700 mb-3">
                  Remember that every small step towards wellness matters. Your mental and emotional health is just as important as your physical health.
                </p>
                <Link href={createLocalizedPath('/blogs', locale)}>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{ borderColor: colors.primary, color: colors.primary }}
                  >
                    Discover Wellness Tips
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Music for Meditation Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.primaryLight }}
              >
                <Music className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: colors.black }}>
                Music for Meditation
              </h2>
            </div>

            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/IHLUJg8z8rc"
                title="Meditation Music"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <p className="text-sm text-gray-600 mt-3 text-center">
              Take a moment to relax and find your inner peace with this calming meditation music.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
