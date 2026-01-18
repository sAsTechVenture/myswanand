'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { colors } from '@/config/theme';

interface Slot {
  day: string;
  date?: string;
  slots: string[];
}

interface Provider {
  id: number;
  name: string;
  slots: Slot[];
}

interface BookAppointmentProps {
  dietician?: Provider | null;
  serviceType?: 'doctor' | 'dietician';
}

export default function BookAppointment({ dietician, serviceType }: BookAppointmentProps) {
  const router = useRouter();

  const [selectedDay, setSelectedDay] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    if (dietician && dietician.slots.length > 0) {
      const first = dietician.slots[0];
      setSelectedDay(first.day);
      setSelectedDate(first.date || '');
      setSelectedTime(first.slots[0]);
    }
  }, [dietician]);

  if (!dietician) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: colors.primaryLight }}>
        <p style={{ color: colors.primary }}>
          Select a {serviceType || 'service'} to book an appointment
        </p>
      </div>
    );
  }

  /** ✅ LOGIN CHECK (CLIENT SIDE) */
  const isLoggedIn = () => {
    if (typeof document === 'undefined') return false;
    return document.cookie.includes('patient_token=');
  };

  const handleBook = () => {
    if (!isLoggedIn()) {
      alert('Please login first to book an appointment');
      router.push(`/auth/login?redirect=/appointments/book`);
      return;
    }

    // ✅ middleware will also check
    router.push(
      `/appointments/book?type=${serviceType}&id=${dietician.id}&day=${selectedDay}&date=${selectedDate}&time=${selectedTime}`
    );
  };

  const currentSlots =
    dietician.slots.find(s => s.day === selectedDay)?.slots || [];

  return (
    <div className="rounded-2xl p-6 bg-white shadow-lg flex flex-col gap-4">
      <h3 className="text-xl font-bold" style={{ color: colors.primary }}>
        Book Appointment
      </h3>

      {/* Date */}
      <label className="font-bold text-sm" style={{ color: colors.primary }}>
        Select Date *
      </label>
      <div className="flex flex-wrap gap-2">
        {dietician.slots.map(slot => (
          <Button
            key={slot.day}
            onClick={() => {
              setSelectedDay(slot.day);
              setSelectedDate(slot.date || '');
              setSelectedTime(slot.slots[0]);
            }}
            className="rounded-lg py-1 px-3 text-xs font-bold"
            style={{
              backgroundColor:
                selectedDay === slot.day ? colors.primary : colors.primaryLightest,
              color:
                selectedDay === slot.day ? colors.white : colors.primary,
            }}
          >
            {slot.day}{slot.date ? `, ${slot.date}` : ''}
          </Button>
        ))}
      </div>

      {/* Time */}
      <label className="font-bold text-sm mt-2" style={{ color: colors.primary }}>
        Select Time *
      </label>
      <div className="flex flex-wrap gap-2">
        {currentSlots.map(time => (
          <Button
            key={time}
            onClick={() => setSelectedTime(time)}
            className="rounded-lg py-1 px-3 text-xs font-bold"
            style={{
              backgroundColor:
                selectedTime === time ? colors.primary : colors.primaryLightest,
              color:
                selectedTime === time ? colors.white : colors.primary,
            }}
          >
            {time}
          </Button>
        ))}
      </div>

      <Button
        onClick={handleBook}
        disabled={!selectedDay || !selectedTime}
        className="mt-4 py-2 font-bold"
        style={{ backgroundColor: colors.primary, color: colors.white }}
      >
        Book Appointment
      </Button>
    </div>
  );
}
