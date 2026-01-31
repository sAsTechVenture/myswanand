import Image from 'next/image';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  showLogo?: boolean;
}

export default function PageBanner({
  title,
  subtitle = 'Home / ' + title,
  imageUrl = '/auth/hero-banner.jpg',
  showLogo = true,
}: PageBannerProps) {
  return (
    <section className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden bg-gray-100">
      {/* Background Image */}
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover object-center"
        sizes="100vw"
        priority
      />
      {/* Content */}
      {showLogo && (
        <div className="relative h-full flex items-center justify-center">
          {/* Glassy card with logo */}
          <div
            className="backdrop-blur-lg bg-white/20 rounded-3xl shadow-lg p-6"
            style={{
              border: '1.5px solid rgba(255,255,255,0.25)',
            }}
          >
            <Image src="/logo.png" alt="Logo" width={180} height={184} priority />
          </div>
        </div>
      )}
    </section>
  );
}
