import { ClipboardList, Target, Compass, Check,Eye } from "lucide-react";
import Image from "next/image";

const founders = [
  {
    name: "Dr. Poorva Raghunath Rane",
    degree: "MBBS, M.D. (Pathology)",
    experience: "8 years of experience",
    image: "/founder.JPG",
  },
];

export default function AboutPage() {
  return (
    <main className="w-full overflow-x-hidden">

      {/* ================= HERO SECTION ================= */}
      <section className="relative bg-[#F9EFE5] py-14">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-[22px] font-semibold text-[#2D2D2D]">
            About us
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Home / About us
          </p>
        </div>
      </section>

      {/* ================= ABOUT CONTENT ================= */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-[20px] font-semibold text-[#111]">
            About SWANAND
          </h2>

          <div className="mt-6 space-y-4 text-[14px] leading-[26px] text-gray-600 max-w-4xl">
            <p>
              At MY SWANAND Pathology Laboratory, we are dedicated to delivering
              accurate, reliable, and timely diagnostic services that form the
              foundation of better healthcare decisions.
            </p>

            <p>
              Pathology is the science of understanding diseases — and it plays
              a vital role in modern medicine. At MY SWANAND, we combine
              advanced technology, scientific expertise, and a compassionate
              approach to ensure every patient receives the best care possible.
            </p>

            <p>
              We simplify complex medical data, making every report easy to
              understand and patient-friendly.
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
          Our Services & Commitment
        </h2>

        {/* Cards Row */}
        <div className="flex flex-wrap gap-6 justify-center">
          <div className="w-[220px] h-[140px] border border-yellow-400 rounded-xl px-4 py-5 text-sm text-gray-700 text-center shadow-sm flex items-center">
            Comprehensive health check-up packages for all age groups.
          </div>

          <div className="w-[220px] h-[140px] border border-purple-500 rounded-xl px-4 py-5 text-sm text-gray-700 text-center shadow-sm flex items-center">
            Precise and evidence-based diagnostic testing.
          </div>

          <div className="w-[220px] h-[140px] border border-pink-400 rounded-xl px-4 py-5 text-sm text-gray-700 text-center shadow-sm flex items-center">
            Personalized attention for every patient.
          </div>

          <div className="w-[220px] h-[140px] border border-teal-400 rounded-xl px-4 py-5 text-sm text-gray-700 text-center shadow-sm flex items-center">
            Transparent and ethical medical practices.
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
                Our Vision
              </h4>
            </div>
            <p className="text-[13px] leading-[22px] text-[#C026D3] italic">
              We aspire to redefine healthcare through precision, innovation,
              and compassion — ensuring that every interaction, from diagnosis
              to care, becomes a transformative experience that improves lives.
            </p>
          </div>

          {/* Mission */}
          <div className="rounded-2xl border font-bold border-[#C026D3] bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C026D3]">
                <Target className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-[16px] font-bold text-lg text-[#C026D3]">
                Our Mission
              </h4>
            </div>
            <p className="text-[13px] leading-[22px] text-[#C026D3] italic">
              Our heartfelt mission for the coming years (till the end of 2027)
              is to amplify our diagnostic impact, aiming to conduct precise
              and timely tests for over 30,000 patients annually, thereby
              enhancing the overall well-being of the community.
            </p>
          </div>
        </div>
      </section>


      {/* ================= JOURNEY ================= */}
      <section className="py-16 sm:py-20 bg-white px-4">
        <h2 className="text-center text-xl sm:text-2xl font-bold text-[#56276C]">
          Our Journey
        </h2>
        <p className="text-center text-sm text-gray-500 mt-2 mb-12">
          Milestones that shaped My Swanand
        </p>

        <div className="max-w-6xl mx-auto space-y-6">
          {[
            { year: "2015", title: "My Swanand Founded", desc: "Started with a vision to make healthcare accessible" },
            { year: "2017", title: "Expanded Services", desc: "Added home collection and digital reports" },
            { year: "2020", title: "Health Card Launch", desc: "Introduced family health card program" },
            { year: "2026", title: "Future Impact", desc: "Serving 30,000+ patients annually" },
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
        About the Founder
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
              {item.experience}
            </span>
          </div>
        ))}
      </div>
    </section>

    </main>
  );
}
