import { CarePackageCard } from '@/components/care-packages';

const carePackages = [
  {
    category: 'HEALTH',
    title: 'Essential Health Checkup',
    testCount: 15,
    price: 999,
  },
  {
    category: 'FULL BODY',
    title: 'Full Body Checkup Basic',
    testCount: 28,
    price: 1499,
  },
  {
    category: 'FULL BODY',
    title: 'Full Body Checkup Premium',
    testCount: 90,
    price: 3999,
  },
  {
    category: 'HEALTH',
    title: 'Cardiac Health Package',
    testCount: 3,
    price: 2199,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-center text-3xl font-bold">Care Packages</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {carePackages.map((pkg, index) => (
            <CarePackageCard
              key={index}
              category={pkg.category}
              index={index}
              title={pkg.title}
              testCount={pkg.testCount}
              price={pkg.price}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
