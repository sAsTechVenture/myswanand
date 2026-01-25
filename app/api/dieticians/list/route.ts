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
  const dieticians = [
    {
      id: 1,
      name: 'Dt. Kavita Deshmukh',
      specialty: 'Clinical Nutritionist',
      qualification: 'MSc (Nutrition), RD',
      experience: '12 years',
      consultationFee: 600,
      languages: ['English', 'Hindi', 'Marathi'],
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      availability: 'Available Today',
      about: 'Expert in weight management, diabetes diet, and therapeutic nutrition.',
      nextAvailable: '10:00 AM',
      slots: [
        { day: 'Monday', slots: ['10:00 AM', '11:30 AM', '01:00 PM'] },
        { day: 'Tuesday', slots: ['10:00 AM', '11:00 AM', '2:00 PM'] },
        { day: 'Wednesday', slots: ['10:00 AM', '11:00 AM', '2:00 PM'] },
        { day: 'Thursday', slots: ['10:00 AM', '11:00 AM', '2:00 PM'] },
        { day: 'Friday', slots: ['10:00 AM', '11:00 AM', '2:00 PM'] },
      ],
    },
    {
      id: 2,
      name: 'Dt. Rahul Joshi',
      specialty: 'Sports Nutritionist',
      qualification: 'MSc (Sports Nutrition)',
      experience: '8 years',
      consultationFee: 700,
      languages: ['English', 'Hindi'],
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
      availability: 'Available Tomorrow',
      about: 'Specializes in athletic performance nutrition.',
      nextAvailable: '11:00 AM',
      slots: [
        { day: 'Monday', slots: ['10:00 AM', '11:00 AM', '2:00 PM'] },
        { day: 'Tuesday', slots: ['10:00 AM', '11:00 AM', '2:00 PM'] },
        { day: 'Wednesday', slots: ['10:00 AM', '11:00 AM', '2:00 PM'] },
      ],
    },
  ];

  
  const dieticiansWithDates = dieticians.map(dietician => ({
    ...dietician,
    slots: dietician.slots.map(slot => ({
      ...slot,
      date: getNextDateForDay(slot.day),
    })),
  }));

  return NextResponse.json(dieticiansWithDates);
}
