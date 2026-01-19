'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { colors } from '@/config/theme';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Blog = {
  id: number;
  title: string;
  description: string;
  content: string[];
  image: string;
  category: string;
  date: string;
  readTime: string;
};

export default function SingleBlogPage() {
  const { id } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => {
        const found = data.find((b: Blog) => b.id === Number(id));
        setBlog(found);
      });
  }, [id]);

  if (!blog) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="mb-6"
        style={{ backgroundColor: colors.primary, color: colors.white }}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blogs
      </Button>

      <img
        src={blog.image}
        alt={blog.title}
        className="w-full h-64 object-cover rounded-2xl mb-6"
      />

       <Badge
        className="mb-3"
        style={{
          backgroundColor: colors.primary,
          color: colors.white,
        }}
      >
        {blog.category}
      </Badge>
    
      <div
        className="text-sm font-medium mb-2"
        style={{ color: colors.primary }}
      >
        {blog.date} • {blog.readTime}
      </div>

      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>

      <p className="text-base text-gray-700 mb-6">
        {blog.description}
      </p>

      <ul className="list-disc pl-6 space-y-2 text-base text-gray-800">
        {blog.content.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    </div>
  );
}
