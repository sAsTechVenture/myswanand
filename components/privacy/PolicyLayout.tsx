interface PolicyLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function PolicyLayout({ title, children }: PolicyLayoutProps) {
  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-8">
        {title}
      </h1>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        {children}
      </div>
    </main>
  );
}
