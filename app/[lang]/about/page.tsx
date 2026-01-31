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
      <PageBanner title={t('common.about')} />

      {/* ================= ABOUT SWANAND SECTION ================= */}
      <section className="py-16 bg-[#FDF8F3]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Left Content */}
            <div className="flex-1">
              {/* Logo */}
              <div className="mb-6">
                <Image
                  src="/logo.png"
                  alt="Swanand Logo"
                  width={180}
                  height={60}
                  className="object-contain"
                />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('common.aboutSwanand')}
              </h2>

              <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                <p>{t('common.aboutDescription1')}</p>
                <p>{t('common.aboutDescription2')}</p>
                <p>{t('common.aboutDescription3')}</p>
              </div>
            </div>

            {/* Right Image with Badge */}
            <div className="flex-1 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/about/dr.jpg"
                  alt="Lab technician"
                  width={500}
                  height={350}
                  className="object-cover w-full h-[300px]"
                />
                {/* Happy Customers Badge */}
                <div
                  className="absolute top-4 right-4 rounded-2xl px-6 py-4 text-white text-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <div className="text-3xl font-bold">2500+</div>
                  <div className="text-sm">{t('common.happyCustomers')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= VISION & MISSION SECTION ================= */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Our Vision */}
            <div
              className="bg-white rounded-2xl p-8 border-l-4 shadow-sm"
              style={{ borderColor: '#10B981' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#10B981' }}
                >
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h3
                  className="text-xl font-bold"
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
              className="bg-white rounded-2xl p-8 border-l-4 shadow-sm"
              style={{ borderColor: colors.primary }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3
                  className="text-xl font-bold"
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-12">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {t('common.ourServicesCommitment')}
            </h2>
          </div>

          {/* Services Grid - Creative Layout */}
          <div className="relative flex flex-wrap justify-center items-center gap-8 py-8">
            {servicesConfig.map((service, index) => (
              <div
                key={index}
                className="relative w-[200px] h-[200px] rounded-full flex flex-col items-center justify-center text-center p-6 border-2 bg-white shadow-lg transition-transform hover:scale-105"
                style={{
                  borderColor: service.color,
                }}
              >
                <span
                  className="absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: service.color }}
                >
                  {service.number}
                </span>
                <p className="text-sm text-gray-700 leading-snug font-medium">
                  {t(service.titleKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= OUR HISTORY TIMELINE ================= */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-12">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#F59E0B' }}
            >
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {t('common.ourHistory')}
            </h2>
          </div>

          {/* Timeline Header */}
          <div className="relative mb-12 hidden md:block">
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
          <div className="px-12">
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {historyDataConfig.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <CarouselItem
                      key={index}
                      className="pl-4 md:basis-1/2 lg:basis-1/3"
                    >
                      <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 h-full">
                        {/* Icon Header */}
                        <div
                          className="h-[140px] flex items-center justify-center"
                          style={{ backgroundColor: `${item.color}15` }}
                        >
                          <div
                            className="w-20 h-20 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: item.color }}
                          >
                            <IconComponent className="w-10 h-10 text-white" />
                          </div>
                        </div>
                        {/* Content */}
                        <div className="p-5">
                          <h4
                            className="font-bold text-lg mb-2"
                            style={{ color: item.color }}
                          >
                            {item.year}
                          </h4>
                          <h5 className="font-semibold text-gray-900 mb-2">
                            {t(item.titleKey)}
                          </h5>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {t(item.descKey)}
                          </p>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* ================= ABOUT THE FOUNDER ================= */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            {t('common.aboutFounder')}
          </h2>

          <div className="flex flex-col lg:flex-row gap-12 items-center justify-center">
            {/* Founder Image */}
            <div className="relative w-[280px] h-[350px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/founder.JPG"
                alt="Dr. Poorva Rane Surve"
                fill
                className="object-cover"
              />
            </div>

            {/* Founder Info */}
            <div className="flex-1 max-w-xl">
              <span
                className="text-sm font-medium"
                style={{ color: colors.primary }}
              >
                {t('common.founderDirector')}
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {t('common.founderName')}
              </h3>
              <p
                className="text-base font-semibold mt-1"
                style={{ color: colors.primary }}
              >
                {t('common.founderQualification')}
              </p>

              <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
                <p>{t('common.founderDesc1')}</p>
                <p>{t('common.founderDesc2')}</p>
                <p>{t('common.founderDesc3')}</p>
              </div>

              {/* Experience Badge */}
              <div className="mt-6">
                <span
                  className="inline-block px-4 py-2 rounded-full text-sm font-medium text-white"
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
