'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import { colors } from '@/config/theme';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Blog = {
  id: number;
  title: string;
  excerpt: string;
  description: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
};

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => setBlogs(data));
  }, []);

  const categories = ['all', ...new Set(blogs.map(b => b.category))];

  const filteredBlogs = blogs.filter(blog => {
    const matchSearch =
      blog.title.toLowerCase().includes(search.toLowerCase()) ||
      blog.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'all' || blog.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <div className="py-14" style={{ backgroundColor: colors.primaryLight }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold" style={{ color: colors.primary }}>
            Health & Diet Blog
          </h1>
          <p className="mt-2 text-lg" style={{ color: colors.black }}>
            Expert articles from doctors & dietitians
          </p>
        </div>
      </div>

      {/* FILTER */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div
          className="rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-3 shadow-sm"
         
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search blogs..."
              className="pl-10 w-full border rounded-xl py-2 text-base"
            />
          </div>

          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="rounded-xl px-3 py-2 text-base border"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* BLOG CARDS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map(blog => (
            <Card
              key={blog.id}
              className="rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="h-40 overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <CardContent className="p-5">
                <Badge
                  className="mb-2"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.white,
                  }}
                >
                  {blog.category}
                </Badge>

                <h3 className="font-semibold text-lg mb-1">
                  {blog.title}
                </h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {blog.description}
                </p>

                  <div
                  className="text-sm font-medium mb-4"
                  style={{ color: colors.primary }}
                >
                  {blog.date} • {blog.readTime}
                </div>

                <Link href={`/blog/${blog.id}`}>
                  <Button
                    className="w-full"
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.white,
                    }}
                  >
                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
