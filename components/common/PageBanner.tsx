import Image from 'next/image';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

export default function PageBanner({
  title,
  subtitle = 'Home / ' + title,
  imageUrl = '/auth/hero-banner.jpg',
}: PageBannerProps) {
  return (
    <section className="relative h-64 sm:h-36 md:h-48 w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover"
        priority
      />
      {/* Content */}
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
    </section>
  );
}
