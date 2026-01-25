import { NextResponse } from 'next/server';

function getNextDateForDay(dayName: string): string {
  const dayMap: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  const today = new Date();
  const todayDay = today.getDay();
  const targetDay = dayMap[dayName];
  const diff = (targetDay + 7 - todayDay) % 7 || 7; 
  const nextDate = new Date();
  nextDate.setDate(today.getDate() + diff);
  return nextDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export async function GET() {
  const doctors = [
    {
      id: 1,
      name: 'Dr. Rajesh Sharma',
      specialty: 'General Physician',
      qualification: 'MBBS, MD',
      experience: '15 years',
      consultationFee: 500,
      languages: ['English', 'Hindi'],
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      availability: 'Available Today',
      about: 'Expert in internal medicine and chronic care.',
      nextAvailable: '10:00 AM',
      slots: [
        { day: 'Monday', slots: ['10:00 AM', '12:00 PM'] },
        { day: 'Tuesday', slots: ['11:00 AM', '2:00 PM'] },
        { day: 'Wednesday', slots: ['10:00 AM', '1:00 PM'] },
      ],
    },
    {
      id: 2,
      name: 'Dr. Priya Patel',
      specialty: 'Cardiologist',
      qualification: 'MBBS, DM',
      experience: '12 years',
      consultationFee: 800,
      languages: ['English', 'Hindi'],
      photo: 'https://images.unsplash.com/photo-1550831107-1553da8c8464?w=400',
      availability: 'Available Tomorrow',
      about: 'Heart specialist with lifestyle guidance.',
      nextAvailable: '2:00 PM',
      slots: [
        { day: 'Wednesday', slots: ['10:00 AM', '1:00 PM'] },
        { day: 'Thursday', slots: ['11:00 AM', '3:00 PM'] },
      ],
    },
  ];

  
  const doctorsWithDates = doctors.map(doc => ({
    ...doc,
    slots: doc.slots.map(slot => ({
      ...slot,
      date: getNextDateForDay(slot.day),
    })),
  }));

  return NextResponse.json(doctorsWithDates);
}
