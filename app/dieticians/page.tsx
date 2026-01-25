'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Award, BookOpen, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BookAppointment from '@/components/consultation/BookAppointment';
import { colors } from '@/config/theme';

interface Slot { day: string; slots: string[]; }
interface Dietician {
  id: number;
  name: string;
  specialty: string;
  qualification: string;
  experience: string;
  consultationFee: number;
  languages: string[];
  photo: string;
  availability: string;
  about: string;
  nextAvailable: string;
  slots: Slot[];
}

export default function DieticianPage() {
  const router = useRouter();
  const [dieticians, setDieticians] = useState<Dietician[]>([]);
  const [selectedDietician, setSelectedDietician] = useState<Dietician | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');

  const specialties = ['all', 'Clinical Nutritionist', 'Sports Nutritionist', 'Child Nutritionist'];

  useEffect(() => {
    fetch('/api/dieticians/list')
      .then(res => res.json())
      .then((data: Dietician[]) => setDieticians(data))
      .catch(err => console.error(err));
  }, []);

  const filteredDieticians = dieticians.filter(d => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = filterSpecialty === 'all' || d.specialty === filterSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.primaryLightest }}>
      {/* Header */}
      <header className="sticky top-0 shadow z-40" style={{ backgroundColor: colors.white }}>
        <div className="max-w-7xl mx-auto flex items-center px-6 py-4">
          <Button variant="ghost" onClick={() => router.push('/')} style={{ color: colors.primary }}>
            <ArrowLeft className="mr-2" /> Back
          </Button>
          <h1 className="mx-auto text-2xl font-bold" style={{ color: colors.primary }}>
            Dietician Consultation
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dietician List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search & Filter */}
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3" style={{ color: colors.primary }} />
              <Input
                placeholder="Search dietician or specialty"
                className="pl-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ borderColor: colors.primaryLight, backgroundColor: colors.white, color: colors.primary }}
              />
            </div>
            <div className="relative w-48">
              <Filter className="absolute left-3 top-3" style={{ color: colors.primary }} />
              <select
                value={filterSpecialty}
                onChange={e => setFilterSpecialty(e.target.value)}
                className="w-full rounded-xl px-10 py-3"
                style={{ borderColor: colors.primaryLight, backgroundColor: colors.white, color: colors.primary }}
              >
                {specialties.map(s => (
                  <option key={s} value={s} style={{ backgroundColor: colors.white, color: colors.black }}>
                    {s === 'all' ? 'All Specialties' : s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dieticians */}
          {filteredDieticians.map(dietician => (
            <Card
              key={dietician.id}
              onClick={() => setSelectedDietician(dietician)} // pass full object
              className="cursor-pointer hover:shadow-xl transition-all"
              style={{
                border: selectedDietician?.id === dietician.id
                  ? `3px solid ${colors.primary}`
                  : `1px solid ${colors.primaryLight}`,
              }}
            >
              <CardContent className="p-6 flex gap-6">
                <img
                  src={dietician.photo}
                  alt={dietician.name}
                  className="w-32 h-32 rounded-lg object-cover border-2"
                  style={{ borderColor: colors.primary }}
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold" style={{ color: colors.black }}>{dietician.name}</h3>
                  <p className="font-medium" style={{ color: colors.green }}>{dietician.specialty}</p>
                  <p style={{ color: colors.black }}>{dietician.qualification}</p>
                  <p className="mt-2" style={{ color: colors.black }}>{dietician.about}</p>

                  <div className="flex gap-4 mt-4" style={{ color: colors.black }}>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" style={{ color: colors.green }} />
                      <span>{dietician.experience}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" style={{ color: colors.green }} />
                      <span>{dietician.languages.join(', ')}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <span style={{ color: colors.primary, fontWeight: '500' }}>₹{dietician.consultationFee}</span>
                    <span style={{ color: colors.primary }}>{`Next: ${dietician.nextAvailable}`}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredDieticians.length === 0 && (
            <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: colors.primaryLight }}>
              <Search className="w-16 h-16 mx-auto mb-4" style={{ color: colors.primary }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.primary }}>No dieticians found</h3>
              <p style={{ color: colors.primary }}>Try adjusting your search or filter</p>
            </div>
          )}
        </div>

        {/* Book Appointment */}
        <BookAppointment dietician={selectedDietician} serviceType="dietician" />
      </div>
    </div>
  );
}
