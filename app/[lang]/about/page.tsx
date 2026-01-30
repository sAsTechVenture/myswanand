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

const historyData = [
  {
    year: '2020',
    title: 'Swanand Pathology Laboratory founded',
    description:
      'Started our journey with a vision to provide quality diagnostic services to the community.',
    icon: Building2,
    color: '#8B5CF6',
  },
  {
    year: '2021 & 2022',
    title: 'Helping Community Fight Covid',
    description:
      'Firmly stood helping the community during the pandemic with dedication and commitment.',
    icon: HeartHandshake,
    color: '#EC4899',
  },
  {
    year: '2023',
    title: 'Building Trust Through Excellence',
    description:
      'Continued gaining trust of patients through sincerity, team work and utmost dedication.',
    icon: Shield,
    color: '#10B981',
  },
  {
    year: '2024',
    title: 'Swanand Healthcard Launch',
    description:
      'Launched Swanand Healthcard delivering holistic well being and not just discounts on blood tests.',
    icon: Sparkles,
    color: '#F59E0B',
  },
  {
    year: '2025',
    title: 'MySwanand App Development',
    description:
      'Work on MySwanand App in progress to bring healthcare services to your fingertips.',
    icon: Smartphone,
    color: '#3B82F6',
  },
  {
    year: '2026',
    title: 'MySwanand App & Referral Lab',
    description:
      'Ready to deliver MySwanand App with personalized accurate healthcare. Becomes a referral lab with all pathology services under one roof.',
    icon: Award,
    color: colors.primary,
  },
];

const services = [
  {
    number: '01',
    title: 'Comprehensive health check-up packages for all age groups.',
    color: '#F59E0B',
  },
  {
    number: '02',
    title: 'Precise and evidence-based diagnostic testing.',
    color: colors.primary,
  },
  {
    number: '03',
    title: 'Personalized attention for every patient.',
    color: '#EC4899',
  },
  {
    number: '04',
    title: 'Transparent and ethical medical practices.',
    color: '#14B8A6',
  },
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
                About SWANAND
              </h2>

              <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                <p>
                  At SWANAND Pathology Laboratory, we provide accurate,
                  reliable, and timely diagnostic services that form the
                  foundation of effective healthcare decisions.
                </p>
                <p>
                  Pathology is the science of understanding diseases - and it is
                  what we do. At My SWANAND, we combine the best resources and
                  technology, scientific expertise, and a passionate commitment
                  to ensure every patient receives the best care possible.
                </p>
                <p>
                  We simplify complex medical data by making every patient's
                  experience as patient-friendly.
                </p>
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
                  <div className="text-sm">Happy Customers</div>
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
                  Our Vision
                </h3>
              </div>
              <p
                className="text-sm leading-relaxed italic"
                style={{ color: colors.primary }}
              >
                We are here to support healthcare in transforming healthcare,
                innovatively from traditional diagnostic testing to advanced
                Molecular tools, from village lab to some smart clinic, focusing
                on clear experience in easy steps.
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
                  Our Mission
                </h3>
              </div>
              <p
                className="text-sm leading-relaxed italic"
                style={{ color: colors.primary }}
              >
                Our heartfelt motive for the coming years 10, the year of 2035
                is to notify our diagnostic services offering personal service
                and friendly testing for every potential person who may need any
                wellness services prior to our wish mainly in the community.
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
              Our Services & Commitment
            </h2>
          </div>

          {/* Services Grid - Creative Layout */}
          <div className="relative flex flex-wrap justify-center items-center gap-8 py-8">
            {services.map((service, index) => (
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
                  {service.title}
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
              Our history throughout the years
            </h2>
          </div>

          {/* Timeline Header */}
          <div className="relative mb-12 hidden md:block">
            <div className="flex justify-between items-center px-8">
              {historyData.map((item, index) => (
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
                {historyData.map((item, index) => {
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
                            {item.title}
                          </h5>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {item.description}
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
            About the Founder
          </h2>

          <div className="flex flex-col lg:flex-row gap-12 items-center justify-center">
            {/* Founder Image */}
            <div className="relative w-[280px] h-[350px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/founder.JPG"
                alt="Dr. Poorva Raghunath Rane"
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
                FOUNDER & DIRECTOR
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                Dr. Poorva Raghunath Rane
              </h3>
              <p
                className="text-base font-semibold mt-1"
                style={{ color: colors.primary }}
              >
                MBBS, M.D. (Pathology)
              </p>

              <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Dr. Poorva Raghunath Rane is the visionary founder of Swanand
                  Pathology Laboratory. With a passion for accurate diagnostics
                  and patient care, she established Swanand with the mission to
                  provide reliable, affordable, and accessible healthcare
                  services to the community.
                </p>
                <p>
                  With her extensive experience in pathology and commitment to
                  excellence, Dr. Rane has built Swanand into a trusted name in
                  diagnostic services. Her dedication to innovation led to the
                  development of the Swanand Healthcard and the upcoming
                  MySwanand App, bringing modern healthcare solutions to
                  patients.
                </p>
                <p>
                  Under her leadership, Swanand continues to grow as a
                  comprehensive referral laboratory, offering a wide range of
                  pathology services while maintaining the highest standards of
                  quality and patient satisfaction.
                </p>
              </div>

              {/* Experience Badge */}
              <div className="mt-6">
                <span
                  className="inline-block px-4 py-2 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  8+ Years of Experience
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
