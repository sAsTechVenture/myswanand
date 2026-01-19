import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      title: 'Healthy Eating Habits',
      excerpt: 'Simple food habits to improve digestion and immunity.',
      description:
        'Healthy eating is not about strict dieting but balanced nutrition. Small food choices can improve digestion, boost immunity, increase energy levels, and support long-term wellness.',
      content: [
        'Eating a balanced diet provides essential nutrients.',
        'Include fruits and vegetables daily.',
        'Avoid processed foods.',
        'Drink enough water.',
        'Consistency matters more than perfection.',
      ],
      image:
        'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
      category: 'Nutrition',
      date: '12 Jan 2026',
      readTime: '5 min read',
    },
    {
      id: 2,
      title: 'Weight Loss Myths',
      excerpt: 'Common misconceptions that stop real progress.',
      description:
        'Many people fail in weight loss because of misleading myths. Knowing the truth helps build sustainable fitness habits.',
      content: [
        'Skipping meals does not help.',
        'Carbs are not bad.',
        'Exercise alone is not enough.',
        'Healthy weight loss takes time.',
      ],
      image:
        'https://images.unsplash.com/photo-1558611848-73f7eb4001a1',
      category: 'Fitness',
      date: '15 Jan 2026',
      readTime: '6 min read',
    },
  ]);
}
