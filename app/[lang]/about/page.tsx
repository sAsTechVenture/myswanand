'use client';

import { ClipboardList, Target, Compass, Check, Eye } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import PageBanner from "@/components/common/PageBanner";
import { getCurrentLocale } from "@/lib/utils/i18n";
import { useDictionary } from "@/lib/hooks/useDictionary";

const founders = [
  {
    name: "Dr. Poorva Raghunath Rane",
    degree: "MBBS, M.D. (Pathology)",
    experience: "8 years of experience",
    image: "/founder.JPG",
  },
];

export default function AboutPage() {
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const { dictionary } = useDictionary(locale);

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

  return (
    <main className="w-full overflow-x-hidden">
      {/* ================= HERO SECTION ================= */}
      <PageBanner title={t('common.about')} />

      {/* ================= ABOUT CONTENT ================= */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-[20px] font-semibold text-[#111]">
            {t('common.aboutSwanand')}
          </h2>

          <div className="mt-6 space-y-4 text-[14px] leading-[26px] text-gray-600 max-w-4xl">
            <p>
              {t('common.aboutDescription1')}
            </p>

            <p>
              {t('common.aboutDescription2')}
            </p>

            <p>
              {t('common.aboutDescription3')}
            </p>
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="mb-20">
        <h2 className="flex items-center gap-3 text-lg font-bold mb-10">
          <span className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <ClipboardList className="text-white" size={20} />
          </span>
          {t('common.ourServicesCommitment')}
        </h2>

        {/* Cards Row */}
        <div className="flex flex-wrap gap-6 justify-center">
          <div className="w-[220px] h-[140px] border border-yellow-400 rounded-xl px-4 py-5 text-sm text-gray-700 text-center shadow-sm flex items-center">
            {t('common.service1')}
          </div>

          <div className="w-[220px] h-[140px] border border-purple-500 rounded-xl px-4 py-5 text-sm text-gray-700 text-center shadow-sm flex items-center">
            {t('common.service2')}
          </div>

          <div className="w-[220px] h-[140px] border border-pink-400 rounded-xl px-4 py-5 text-sm text-gray-700 text-center shadow-sm flex items-center">
            {t('common.service3')}
          </div>

          <div className="w-[220px] h-[140px] border border-teal-400 rounded-xl px-4 py-5 text-sm text-gray-700 text-center shadow-sm flex items-center">
            {t('common.service4')}
          </div>
        </div>
      </div>

      {/* ================= VISION / MISSION ================= */}
      
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Vision */}
          <div className="rounded-2xl border border-[#A855F7] bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#34D399]">
                <Eye className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-[16px] font-bold text-[#C026D3]">
                {t('common.ourVision')}
              </h4>
            </div>
            <p className="text-[13px] leading-[22px] text-[#C026D3] italic">
              {t('common.visionDescription')}
            </p>
          </div>

          {/* Mission */}
          <div className="rounded-2xl border font-bold border-[#C026D3] bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C026D3]">
                <Target className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-[16px] font-bold text-lg text-[#C026D3]">
                {t('common.ourMission')}
              </h4>
            </div>
            <p className="text-[13px] leading-[22px] text-[#C026D3] italic">
              {t('common.missionDescription')}
            </p>
          </div>
        </div>
      </section>


      {/* ================= JOURNEY ================= */}
      <section className="py-16 sm:py-20 bg-white px-4">
        <h2 className="text-center text-xl sm:text-2xl font-bold text-[#56276C]">
          {t('common.ourJourney')}
        </h2>
        <p className="text-center text-sm text-gray-500 mt-2 mb-12">
          {t('common.journeySubtitle')}
        </p>

        <div className="max-w-6xl mx-auto space-y-6">
          {[
            { year: "2015", title: t('common.journey2015'), desc: t('common.journey2015Desc') },
            { year: "2017", title: t('common.journey2017'), desc: t('common.journey2017Desc') },
            { year: "2020", title: t('common.journey2020'), desc: t('common.journey2020Desc') },
            { year: "2026", title: t('common.journey2026'), desc: t('common.journey2026Desc') },
          ].map((item, i) => (
            <div
              key={i}
              className="relative bg-white rounded-xl shadow-md px-6 sm:px-8 py-5 flex items-center justify-between"
            >
              <span className="absolute left-0 top-0 h-full w-[4px] bg-yellow-400 rounded-l-xl" />

              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#56276C] text-white flex items-center justify-center text-sm font-semibold">
                  {item.year}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#56276C]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 max-w-lg">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="w-7 h-7 rounded-full bg-[#56276C] flex items-center justify-center">
                <Check size={14} className="text-white" strokeWidth={3} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-20">
      {/* Heading */}
      <h2 className="text-xl sm:text-2xl font-semibold mb-12">
        {t('common.aboutFounder')}
      </h2>

      {/* Cards */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {founders.map((item, index) => (
          <div
            key={index}
            className="
              border
              border-[#F4C430]
              rounded-3xl
              p-6
              shadow-md
              bg-white
              flex
              flex-col
              items-center
              text-center
            "
          >
            {/* Image Wrapper */}
            <div className="bg-[#EADDF2] rounded-xl p-4 mb-6">
              <div className="relative w-[220px] h-[140px] sm:w-[240px] sm:h-[150px]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>

            {/* Name */}
            <h3 className="text-[#6B2D84] font-medium text-sm sm:text-base mb-1">
              {item.name}
            </h3>

            {/* Degree */}
            <p className="font-semibold text-sm mb-4">
              {item.degree}
            </p>

            {/* Experience Badge */}
            <span className="bg-[#E6D8EF] text-[#6B2D84] text-xs px-4 py-1 rounded-full">
              {t('common.yearsExperience')}
            </span>
          </div>
        ))}
      </div>
    </section>

    </main>
  );
}
