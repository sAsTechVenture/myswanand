'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { useLocalizedRouter } from '@/lib/hooks/useLocalizedRouter';
import { createLocalizedPath, getCurrentLocale } from '@/lib/utils/i18n';
import { useDictionary } from '@/lib/hooks/useDictionary';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { colors } from '@/config/theme';
import { apiClient } from '@/lib/api';
import Image from 'next/image';

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

export default function BlogDetailPage() {
  const params = useParams();
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const { dictionary } = useDictionary(locale);
  const localizedRouter = useLocalizedRouter();
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-12 w-32 mb-6" />
          <Skeleton className="h-96 w-full mb-6" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.black }}>
              {t('common.blogNotFound')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('common.blogNotFoundDesc')}
            </p>
            <Link href={createLocalizedPath('/blogs', locale)}>
              <Button
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.backToBlogs')}
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  // Process image URL similar to diagnostic-tests
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link href={createLocalizedPath('/blogs', locale)}>
          <Button
            variant="ghost"
            className="mb-6"
            style={{
              color: colors.primary,
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.backToBlogs')}
          </Button>
        </Link>

        {/* Blog Content */}
        <Card className="overflow-hidden shadow-lg">
          {/* Featured Image */}
          {normalizedImageUrl && (
            <div className="relative w-full h-64 md:h-96 lg:h-[500px]">
              <Image
                src={normalizedImageUrl}
                alt={blog.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
                priority
                unoptimized
              />
            </div>
          )}

          <CardContent className="p-6 md:p-8 lg:p-12">
            {/* Title */}
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
              style={{ color: colors.black }}
            >
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm mb-8 pb-6 border-b">
              <div className="flex items-center gap-2" style={{ color: colors.primary }}>
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{formatDate(blog.createdAt)}</span>
              </div>
              {blog.uploadTime && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{blog.uploadTime} min read</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div
              className="blog-content-wrapper"
              style={{
                fontSize: '1.125rem',
                lineHeight: '1.8',
                color: '#374151',
              }}
            >
              <div
                className="space-y-6"
                dangerouslySetInnerHTML={{ 
                  __html: blog.content
                    .replace(/\r\n\r\n/g, '</p><p style="margin-bottom: 1.5rem;">')
                    .replace(/\r\n/g, '<br />')
                    .replace(/\n\n/g, '</p><p style="margin-bottom: 1.5rem;">')
                    .replace(/\n/g, '<br />')
                    .replace(/^/, '<p style="margin-bottom: 1.5rem;">')
                    .replace(/$/, '</p>')
                }}
              />
            </div>
            <style dangerouslySetInnerHTML={{__html: `
              .blog-content-wrapper p {
                margin-bottom: 1.5rem;
                color: #374151;
                font-size: 1.125rem;
                line-height: 1.8;
              }
              .blog-content-wrapper h1,
              .blog-content-wrapper h2,
              .blog-content-wrapper h3 {
                margin-top: 2rem;
                margin-bottom: 1rem;
                font-weight: bold;
                color: ${colors.black};
              }
              .blog-content-wrapper h1 {
                font-size: 2rem;
              }
              .blog-content-wrapper h2 {
                font-size: 1.75rem;
              }
              .blog-content-wrapper h3 {
                font-size: 1.5rem;
              }
              .blog-content-wrapper ul,
              .blog-content-wrapper ol {
                margin-left: 1.5rem;
                margin-bottom: 1.5rem;
                padding-left: 1.5rem;
              }
              .blog-content-wrapper li {
                margin-bottom: 0.75rem;
              }
              .blog-content-wrapper strong {
                font-weight: 600;
                color: ${colors.black};
              }
              .blog-content-wrapper a {
                color: ${colors.primary};
                text-decoration: underline;
              }
              .blog-content-wrapper a:hover {
                opacity: 0.8;
              }
            `}} />
          </CardContent>
        </Card>

        {/* Back to Blogs Button */}
        <div className="mt-8 text-center">
          <Link href="/blogs">
            <Button
              style={{
                backgroundColor: colors.primary,
                color: colors.white,
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Blogs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
