import { Event, Round } from '@/types';

// ===========================================
// Mock Data - Legacy structure for UI testing
// ===========================================

export const MOCK_EVENTS: Partial<Event>[] = [
    {
        id: 'event-1',
        name: 'Annual Pharmaceutical Congress 2025',
        description: 'Join the biggest gathering of pharmaceutical professionals in the region. Discussing the future of medicine, biotechnology, and patient care.',
        coverImage: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070&auto=format&fit=crop',
        venueImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop',
        eventType: 'conference',
        category: 'Pharmacy',
        price: 2500,
        cpeCredits: 12,
        rounds: [
            {
                id: 'round-1',
                date: '2025-06-15',
                time: '09:00',
                location: 'Grand Convention Center, Bangkok',
                capacity: 500,
                registered: 350
            },
            {
                id: 'round-2',
                date: '2025-06-16',
                time: '10:00',
                location: 'Workshop Room B',
                capacity: 50,
                registered: 20
            }
        ],
        schedule: [
            { time: '09:00', title: 'Opening Keynote', speaker: 'Dr. Somchai Prasert' },
            { time: '10:30', title: 'Panel: Future of Pharmacy', speaker: 'Multiple Speakers' },
            { time: '13:00', title: 'Workshop: Clinical Applications' }
        ],
        speakers: [
            { id: 'sp-1', name: 'ศ.ดร.นพ.สมชาย ประเสริฐ', title: 'ประธานสภาเภสัชกรรม', organization: 'สภาเภสัชกรรมแห่งประเทศไทย', imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg' },
            { id: 'sp-2', name: 'ภญ.ดร.วิภาวี ศรีสุนทร', title: 'ผู้เชี่ยวชาญด้านเภสัชกรรมคลินิก', organization: 'โรงพยาบาลจุฬาลงกรณ์', imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg' },
            { id: 'sp-3', name: 'รศ.ดร.ภก.นิติพงษ์ วงศ์สว่าง', title: 'อาจารย์คณะเภสัชศาสตร์', organization: 'จุฬาลงกรณ์มหาวิทยาลัย', imageUrl: 'https://randomuser.me/api/portraits/men/52.jpg' },
            { id: 'sp-4', name: 'ผศ.ดร.ภญ.สุดารัตน์ มั่นคง', title: 'ผู้อำนวยการฝ่ายวิจัย', organization: 'องค์การเภสัชกรรม', imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg' },
        ],
        createdAt: '2024-01-15T00:00:00Z'
    },
    {
        id: 'event-2',
        name: 'Clinical Pharmacy Workshop',
        description: 'Hands-on workshop for clinical pharmacists focusing on oncology and critical care. Learn practical skills from experienced practitioners.',
        coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop',
        eventType: 'single',
        category: 'Workshop',
        price: 1200,
        cpeCredits: 6,
        rounds: [
            {
                id: 'round-3',
                date: '2025-07-20',
                time: '09:00',
                location: 'Medical Training Center',
                capacity: 30,
                registered: 25
            }
        ],
        schedule: [
            { time: '09:00', title: 'Introduction to Clinical Practice' },
            { time: '11:00', title: 'Case Study Analysis' },
            { time: '14:00', title: 'Hands-on Practice Session' }
        ],
        speakers: [
            { id: 'sp-5', name: 'ภก.ดร.กิตติพงษ์ วัฒนเศรษฐ', title: 'Clinical Pharmacist', organization: 'โรงพยาบาลศิริราช', imageUrl: 'https://randomuser.me/api/portraits/men/62.jpg' },
            { id: 'sp-6', name: 'ภญ.อภิญญา เทพวงศ์', title: 'Senior Oncology Pharmacist', organization: 'โรงพยาบาลรามาธิบดี', imageUrl: 'https://randomuser.me/api/portraits/women/55.jpg' },
        ],
        createdAt: '2024-02-01T00:00:00Z'
    },
    {
        id: 'event-3',
        name: 'Digital Health Summit 2025',
        description: 'Exploring the intersection of technology and healthcare. Featuring AI in diagnostics, telemedicine, and digital therapeutics.',
        coverImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop',
        eventType: 'single',
        category: 'Technology',
        price: 1800,
        cpeCredits: 8,
        rounds: [
            {
                id: 'round-4',
                date: '2025-08-10',
                time: '08:30',
                location: 'Digital Innovation Hub, Bangkok',
                capacity: 200,
                registered: 120
            }
        ],
        speakers: [
            { id: 'sp-7', name: 'ดร.ปัญจพล ดิจิทัล', title: 'ผู้เชี่ยวชาญ Digital Health', organization: 'กระทรวงสาธารณสุข', imageUrl: 'https://randomuser.me/api/portraits/men/75.jpg' },
            { id: 'sp-8', name: 'รศ.ภญ.มณีรัตน์ เทคโนโลยี', title: 'AI in Healthcare Researcher', organization: 'จุฬาลงกรณ์มหาวิทยาลัย', imageUrl: 'https://randomuser.me/api/portraits/women/32.jpg' },
            { id: 'sp-9', name: 'นพ.อัจฉริยะ สมาร์ท', title: 'Telemedicine Pioneer', organization: 'โรงพยาบาลกรุงเทพ', imageUrl: 'https://randomuser.me/api/portraits/men/22.jpg' },
            { id: 'sp-10', name: 'ภก.นวัตกรรม ไทยแลนด์', title: 'Digital Therapeutics Lead', organization: 'Startup Thailand', imageUrl: 'https://randomuser.me/api/portraits/men/33.jpg' },
            { id: 'sp-11', name: 'ผศ.ดร.วีรยุทธ ศรีไทย', title: 'Telemedicine Expert', organization: 'มหาวิทยาลัยมหิดล', imageUrl: 'https://randomuser.me/api/portraits/men/41.jpg' },
        ],
        createdAt: '2024-03-01T00:00:00Z'
    }
];

// Helper function to get event by ID
export function getMockEventById(id: string): Event | undefined {
    return MOCK_EVENTS.find(event => event.id === id) as Event | undefined;
}
