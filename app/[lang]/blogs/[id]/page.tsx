'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { createLocalizedPath, getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { colors } from '@/config/theme';
import { apiClient } from '@/lib/api';
import Image from 'next/image';
import PageBanner from '@/components/common/PageBanner';

interface Blog {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  status: string;
  uploadTime: number | null;
  shareTime: number | null;
  downloadTime: number | null;
  createdAt: string;
  updatedAt: string;
}

// Function to estimate read time based on word count
const estimateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Function to format content with proper styling
const formatContent = (content: string): string => {
  // Split content into paragraphs
  const paragraphs = content.split(/\r\n\r\n|\n\n/);

  const formattedParagraphs = paragraphs.map((paragraph) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return '';

    // Check if it's a numbered heading (e.g., "1. The Power of Early Detection")
    const numberedHeadingMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numberedHeadingMatch) {
      return `<h3 class="blog-heading">${numberedHeadingMatch[1]}. ${numberedHeadingMatch[2]}</h3>`;
    }

    // Check if it's a section heading (ends with specific patterns or is a known heading)
    const sectionHeadings = [
      'Common Tests You Should Know',
      'Why Choose Swanand Pathology?',
    ];
    if (sectionHeadings.some((h) => trimmed.startsWith(h))) {
      return `<h3 class="blog-heading">${trimmed}</h3>`;
    }

    // Check if it starts with a bullet point pattern (like "CBC (Complete Blood Count):")
    if (trimmed.match(/^[A-Z][A-Za-z0-9\s]+(\([^)]+\))?:/)) {
      // It's a definition/bullet item
      const parts = trimmed.split(':');
      const term = parts[0];
      const definition = parts.slice(1).join(':').trim();
      return `<p class="blog-bullet"><span class="blog-bullet-dot">•</span> <strong>${term}:</strong> ${definition}</p>`;
    }

    // Check for lines that look like bullet points (starting with specific keywords)
    if (
      trimmed.match(/^(Accuracy|Speed|Care|Special Launch Offer!):/i) ||
      trimmed.match(/^(Accuracy|Speed|Care):/)
    ) {
      const parts = trimmed.split(':');
      const term = parts[0];
      const definition = parts.slice(1).join(':').trim();
      return `<p class="blog-bullet"><span class="blog-bullet-dot">•</span> <strong>${term}:</strong> ${definition}</p>`;
    }

    // Regular paragraph - handle line breaks within
    const withLineBreaks = trimmed.replace(/\r\n|\n/g, '<br />');
    return `<p class="blog-paragraph">${withLineBreaks}</p>`;
  });

  return formattedParagraphs.filter((p) => p).join('\n');
};

export default function BlogDetailPage() {
  const params = useParams();
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const { dictionary } = useDictionary(locale);
  const blogId = params.id as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    async function fetchBlog() {
      try {
        setLoading(true);
        const response = await apiClient.get<{
          success: boolean;
          data: Blog;
        }>(`/patient/blogs/${blogId}`);

        if (response.data.success && response.data.data) {
          setBlog(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    }

    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <PageBanner
          title={t('common.blogs')}
          imageUrl="/blog/blog_banner.png"
          showLogo={false}
        />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-[400px] w-full rounded-3xl mb-8" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-48 mb-8" />
          <Skeleton className="h-4 w-full mb-3" />
          <Skeleton className="h-4 w-full mb-3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white">
        <PageBanner
          title={t('common.blogs')}
          imageUrl="/blog/blog_banner.png"
          showLogo={false}
        />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="p-12 text-center rounded-3xl bg-gray-50">
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: colors.black }}
            >
              Blog Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The blog you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Link href={createLocalizedPath('/blogs', locale)}>
              <Button
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blogs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Process image URL
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  let imageUrl = blog.imageUrl;
  if (imageUrl) {
    if (!imageUrl.startsWith('http')) {
      if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
        let urlToUse = baseUrl;
        if (baseUrl.endsWith('/api') && imageUrl.startsWith('/api')) {
          urlToUse = baseUrl.replace(/\/api$/, '');
        }
        imageUrl = `${urlToUse}${imageUrl}`;
      }
    }
    if (imageUrl.includes('localhost:3000')) {
      imageUrl = imageUrl.replace(
        /http:\/\/localhost:3000[^/]*/,
        baseUrl.replace(/\/api$/, '')
      );
    }
  }
  const normalizedImageUrl = imageUrl || null;
  const readTime = estimateReadTime(blog.content);

  return (
    <div className="min-h-screen bg-white">
      {/* Page Banner */}
      <PageBanner
        title={t('common.blogs')}
        imageUrl="/blog/blog_banner.png"
        showLogo={false}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back to Blogs Link */}
        <Link
          href={createLocalizedPath('/blogs', locale)}
          className="inline-flex items-center gap-2 mb-8 transition-opacity hover:opacity-70"
          style={{ color: colors.primary }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Blogs</span>
        </Link>

        {/* Featured Image */}
        {normalizedImageUrl && (
          <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-3xl overflow-hidden mb-8 shadow-lg">
            <Image
              src={normalizedImageUrl}
              alt={blog.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1280px"
              priority
              unoptimized
            />
          </div>
        )}

        {/* Blog Content Container */}
        <article className="max-w-4xl">
          {/* Title */}
          <h1
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight"
            style={{ color: '#B8860B' }}
          >
            {blog.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm mb-8">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(blog.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{readTime} min read</span>
            </div>
          </div>

          {/* Content */}
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: formatContent(blog.content) }}
          />

          {/* Styles for blog content */}
          <style jsx global>{`
            .blog-content {
              font-size: 1rem;
              line-height: 1.8;
              color: #374151;
            }

            .blog-paragraph {
              margin-bottom: 1.25rem;
            }

            .blog-heading {
              color: ${colors.primary};
              font-size: 1.25rem;
              font-weight: 600;
              margin-top: 2rem;
              margin-bottom: 1rem;
            }

            .blog-bullet {
              margin-bottom: 0.75rem;
              padding-left: 0.5rem;
              display: flex;
              align-items: flex-start;
              gap: 0.5rem;
            }

            .blog-bullet-dot {
              color: ${colors.primary};
              font-weight: bold;
              flex-shrink: 0;
            }

            .blog-bullet strong {
              color: #1f2937;
            }

            .blog-content a {
              color: ${colors.primary};
              text-decoration: underline;
            }

            .blog-content a:hover {
              opacity: 0.8;
            }
          `}</style>
        </article>
      </div>
    </div>
  );
}
