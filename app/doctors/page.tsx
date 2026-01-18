'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Award, BookOpen, Search, Filter } from 'lucide-react';

import BookAppointment from '@/components/consultation/BookAppointment';
import { colors } from '@/config/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface Slot {
  day: string;
  slots: string[];
}

interface Doctor {
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

export default function DoctorPage() {
  const router = useRouter();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('all');

  const specialties = ['all', 'General Physician', 'Cardiologist'];

  useEffect(() => {
    fetch('/api/doctors/list')
      .then(res => res.json())
      .then(data => setDoctors(data))
      .catch(err => console.error('Doctor API error:', err));
  }, []);

  const filteredDoctors = doctors.filter(d =>
    (d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase())) &&
    (specialty === 'all' || d.specialty === specialty)
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.primaryLightest }}>
      {/* Header */}
      <header className="sticky top-0 shadow z-40" style={{ backgroundColor: colors.white }}>
        <div className="max-w-7xl mx-auto flex items-center px-6 py-4">
          <Button variant="ghost" onClick={() => router.push('/')} style={{ color: colors.primary }}>
            <ArrowLeft className="mr-2" style={{ color: colors.primary }} />
            Back
          </Button>

          <h1 className="mx-auto text-2xl font-bold" style={{ color: colors.primary }}>
            Doctor Consultation
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Doctor List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search & Filter */}
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <div className="flex-1 relative min-w-50">
              <Search
                className="absolute left-3 top-3"
                style={{ color: colors.primary }}
              />
              <Input
                placeholder="Search doctor or specialty"
                className="pl-10"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  borderColor: colors.primaryLight,
                  backgroundColor: colors.white,
                  color: colors.primary,
                }}
              />
            </div>

            <div className="relative w-48">
              <Filter
                className="absolute left-3 top-3"
                style={{ color: colors.primary }}
              />
              <select
                className="w-full rounded-xl px-10 py-3"
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
                style={{
                  borderColor: colors.primaryLight,
                  backgroundColor: colors.white,
                  color: colors.primary,
                }}
              >
                {specialties.map(s => (
                  <option
                    key={s}
                    value={s}
                    style={{ backgroundColor: colors.white, color: colors.black }}
                  >
                    {s === 'all' ? 'All Specialties' : s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Doctors */}
          {filteredDoctors.map(doctor => (
            <Card
              key={doctor.id}
              onClick={() => setSelectedDoctor(doctor)}
              className="cursor-pointer transition-all hover:shadow-xl"
              style={{
                border:
                  selectedDoctor?.id === doctor.id
                    ? `3px solid ${colors.primary}`
                    : `1px solid ${colors.primaryLight}`,
              }}
            >
              <CardContent className="p-6 flex gap-6">
                {/* Doctor Image */}
                <img
                  src={doctor.photo}
                  alt={doctor.name}
                  className="w-32 h-36 rounded-lg object-cover border-2 p-1"
                  style={{ borderColor: colors.primary }}
                />

                <div className="flex-1">
                  <h3 className="text-xl font-bold" style={{ color: colors.black }}>
                    {doctor.name}
                  </h3>

                  <p className="font-medium" style={{ color: colors.green }}>
                    {doctor.specialty}
                  </p>

                  <p style={{ color: colors.black }}>{doctor.qualification}</p>

                  <p className="mt-2" style={{ color: colors.black }}>
                    {doctor.about}
                  </p>

                  {/* Experience & Languages */}
                  <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" style={{ color: colors.green }} />
                      <span style={{ color: colors.black }}>
                        {doctor.experience}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" style={{ color: colors.green }} />
                      <span style={{ color: colors.black }}>
                        {doctor.languages.join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <span style={{ color: colors.primary, fontWeight: 500 }}>
                      ₹{doctor.consultationFee}
                    </span>
                    <span style={{ color: colors.primary }}>
                      Next: {doctor.nextAvailable}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredDoctors.length === 0 && (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <Search className="w-16 h-16 mx-auto mb-4" style={{ color: colors.primary }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.primary }}>
                No doctors found
              </h3>
              <p style={{ color: colors.primary }}>
                Try adjusting your search or filter
              </p>
            </div>
          )}
        </div>

        {/* Book Appointment */}
        <BookAppointment dietician={selectedDoctor} serviceType="doctor" />
      </div>
    </div>
  );
}
