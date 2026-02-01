'use client';

import {
  Eye,
  Target,
  Settings,
  Rocket,
  HeartHandshake,
  Shield,
  Sparkles,
  Building2,
  Smartphone,
  Award,
} from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import PageBanner from '@/components/common/PageBanner';
import { getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import { colors } from '@/config/theme';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const historyDataConfig = [
  {
    year: '2020',
    titleKey: 'common.journey2020Title',
    descKey: 'common.journey2020Desc',
    icon: Building2,
    color: '#8B5CF6',
  },
  {
    year: '2021 & 2022',
    titleKey: 'common.journey2021_2022Title',
    descKey: 'common.journey2021_2022Desc',
    icon: HeartHandshake,
    color: '#EC4899',
  },
  {
    year: '2023',
    titleKey: 'common.journey2023Title',
    descKey: 'common.journey2023Desc',
    icon: Shield,
    color: '#10B981',
  },
  {
    year: '2024',
    titleKey: 'common.journey2024Title',
    descKey: 'common.journey2024Desc',
    icon: Sparkles,
    color: '#F59E0B',
  },
  {
    year: '2025',
    titleKey: 'common.journey2025Title',
    descKey: 'common.journey2025Desc',
    icon: Smartphone,
    color: '#3B82F6',
  },
  {
    year: '2026',
    titleKey: 'common.journey2026Title',
    descKey: 'common.journey2026Desc',
    icon: Award,
    color: colors.primary,
  },
];

const servicesConfig = [
  { number: '01', titleKey: 'common.service1', color: '#F59E0B' },
  { number: '02', titleKey: 'common.service2', color: colors.primary },
  { number: '03', titleKey: 'common.service3', color: '#EC4899' },
  { number: '04', titleKey: 'common.service4', color: '#14B8A6' },
];

export default function AboutPage() {
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const { dictionary } = useDictionary(locale);

  const t = (key: string): string => {
    if (!dictionary) return key;
    const keys = key.split('.');
    let value: any = dictionary;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  return (
    <main className="w-full overflow-x-hidden bg-white">
      {/* Hero Banner */}
      <PageBanner
        title={t('common.about')}
        imageUrl="/about/about_banner.png"
        showLogo={false}
      />

      {/* ================= ABOUT SWANAND SECTION ================= */}
      <section className="py-10 sm:py-16 bg-[#FDF8F3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Left Content */}
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                {t('common.aboutSwanand')}
              </h2>

              <div className="space-y-3 sm:space-y-4 text-gray-600 text-sm leading-relaxed">
                <p>{t('common.aboutDescription1')}</p>
                <p>{t('common.aboutDescription2')}</p>
                <p>{t('common.aboutDescription3')}</p>
              </div>
            </div>

            {/* Right Image with Badge */}
            <div className="flex-1 relative w-full">
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/about/dr.jpg"
                  alt="Lab technician"
                  width={500}
                  height={350}
                  className="object-cover w-full h-[220px] sm:h-[280px] lg:h-[300px]"
                />
                {/* Happy Customers Badge */}
                <div
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-6 sm:py-4 text-white text-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <div className="text-xl sm:text-3xl font-bold">2500+</div>
                  <div className="text-xs sm:text-sm">{t('common.happyCustomers')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= VISION & MISSION SECTION ================= */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            {/* Our Vision */}
            <div
              className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 border-l-4 shadow-sm"
              style={{ borderColor: '#10B981' }}
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#10B981' }}
                >
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3
                  className="text-lg sm:text-xl font-bold"
                  style={{ color: colors.primary }}
                >
                  {t('common.ourVision')}
                </h3>
              </div>
              <p
                className="text-sm leading-relaxed italic"
                style={{ color: colors.primary }}
              >
                {t('common.aboutVisionDescription')}
              </p>
            </div>

            {/* Our Mission */}
            <div
              className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 border-l-4 shadow-sm"
              style={{ borderColor: colors.primary }}
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3
                  className="text-lg sm:text-xl font-bold"
                  style={{ color: colors.primary }}
                >
                  {t('common.ourMission')}
                </h3>
              </div>
              <p
                className="text-sm leading-relaxed italic"
                style={{ color: colors.primary }}
              >
                {t('common.aboutMissionDescription')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= OUR SERVICES & COMMITMENT ================= */}
      <section className="py-10 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-8 sm:mb-12">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: colors.primary }}
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {t('common.ourServicesCommitment')}
            </h2>
          </div>

          {/* Services Grid - Creative Layout */}
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 py-4 sm:py-8">
            {servicesConfig.map((service, index) => (
              <div
                key={index}
                className="relative w-full aspect-square max-w-[160px] sm:max-w-[180px] lg:max-w-[200px] mx-auto rounded-full flex flex-col items-center justify-center text-center p-4 sm:p-6 border-2 bg-white shadow-lg transition-transform hover:scale-105"
                style={{
                  borderColor: service.color,
                }}
              >
                <span
                  className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold"
                  style={{ backgroundColor: service.color }}
                >
                  {service.number}
                </span>
                <p className="text-xs sm:text-sm text-gray-700 leading-snug font-medium">
                  {t(service.titleKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= OUR HISTORY TIMELINE ================= */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-8 sm:mb-12">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#F59E0B' }}
            >
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {t('common.ourHistory')}
            </h2>
          </div>

          {/* Timeline Header */}
          <div className="relative mb-8 sm:mb-12 hidden lg:block">
            <div className="flex justify-between items-center px-8">
              {historyDataConfig.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <span
                    className="text-xs font-semibold mb-2 whitespace-nowrap"
                    style={{ color: colors.primary }}
                  >
                    {item.year}
                  </span>
                  <div
                    className="w-4 h-4 rounded-full z-10"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              ))}
            </div>
            {/* Timeline Line */}
            <div
              className="absolute top-[calc(100%-8px)] left-8 right-8 h-0.5"
              style={{ backgroundColor: colors.primaryLight }}
            />
          </div>

          {/* Carousel */}
          <div className="px-6 sm:px-12">
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 sm:-ml-4">
                {historyDataConfig.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <CarouselItem
                      key={index}
                      className="pl-2 sm:pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3"
                    >
                      <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-gray-100 h-full">
                        {/* Icon Header */}
                        <div
                          className="h-[100px] sm:h-[140px] flex items-center justify-center"
                          style={{ backgroundColor: `${item.color}15` }}
                        >
                          <div
                            className="w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: item.color }}
                          >
                            <IconComponent className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
                          </div>
                        </div>
                        {/* Content */}
                        <div className="p-4 sm:p-5">
                          <h4
                            className="font-bold text-base sm:text-lg mb-1 sm:mb-2"
                            style={{ color: item.color }}
                          >
                            {item.year}
                          </h4>
                          <h5 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">
                            {t(item.titleKey)}
                          </h5>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            {t(item.descKey)}
                          </p>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="-left-2 sm:left-0" />
              <CarouselNext className="-right-2 sm:right-0" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* ================= ABOUT THE FOUNDER ================= */}
      <section className="py-10 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            {t('common.aboutFounder')}
          </h2>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-center">
            {/* Founder Image */}
            <div className="relative w-[200px] h-[260px] sm:w-[250px] sm:h-[320px] lg:w-[280px] lg:h-[350px] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl flex-shrink-0">
              <Image
                src="/about/dr_poorva.jpeg"
                alt="Dr. Poorva Rane Surve"
                fill
                className="object-contain"
              />
            </div>

            {/* Founder Info */}
            <div className="flex-1 max-w-xl text-center lg:text-left">
              <span
                className="text-xs sm:text-sm font-medium"
                style={{ color: colors.primary }}
              >
                {t('common.founderDirector')}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">
                {t('common.founderName')}
              </h3>
              <p
                className="text-sm sm:text-base font-semibold mt-1"
                style={{ color: colors.primary }}
              >
                {t('common.founderQualification')}
              </p>

              <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 text-gray-600 leading-relaxed text-sm sm:text-base">
                <p>{t('common.founderDesc1')}</p>
                <p>{t('common.founderDesc2')}</p>
                <p>{t('common.founderDesc3')}</p>
              </div>

              {/* Experience Badge */}
              <div className="mt-4 sm:mt-6">
                <span
                  className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  {t('common.yearsExperiencePlus')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
