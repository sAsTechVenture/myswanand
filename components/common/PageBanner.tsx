import Image from "next/image";

interface PageBannerProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

export default function PageBanner({
  title,
  subtitle = "Home / " + title,
  imageUrl = "/auth/hero-banner.jpg",
}: PageBannerProps) {
  return (
    <section className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover"
        priority
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-gray-100">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
