import { Event } from '@/types';

export const MOCK_EVENT: Event = {
    id: 'mock-event-2025',
    code: 'PRIS2025',
    name: 'Pharmacy Research and Innovation Summit 2026: Synergizing for the better future',
    title: 'Pharmacy Research and Innovation Summit 2026: Synergizing for the better future',
    description: `PRIS หรือ Pharmacy Research and Innovation Summit คือ งานประชุมวิชาการทางเภสัชกรรมและนวัตกรรมระดับชาติ ที่จัดขึ้นเพื่อรวมพลังของเภสัชกรจากทุกสาขา ทั้งภาคการศึกษา โรงพยาบาล เภสัชกรรมชุมชน การตลาด และภาคอุตสาหกรรม โดยมุ่งเน้นให้เกิดการแลกเปลี่ยนองค์ความรู้ด้าน งานวิจัยและนวัตกรรมทางเภสัชกรรม มีเป้าหมายเพื่อขับเคลื่อนวิชาชีพเภสัชกรให้ก้าวทันการเปลี่ยนแปลงของโลกสุขภาพยุคใหม่`,
    eventType: 'multi_session',
    status: 'published',
    venue: 'สำนักงานสภาเภสัชกรรม (The Pharmacy Council of Thailand)',
    location: 'Muang Thong Thani, Nonthaburi',
    capacity: 1000,
    maxCapacity: 1000,
    registeredCount: 450,
    cpeCredits: '3',
    startDate: '2026-10-15T08:30:00Z',
    endDate: '2026-10-16T17:30:00Z',
    registrationOpens: '2026-03-01T00:00:00Z',
    registrationCloses: '2026-10-10T23:59:59Z',
    coverImage: '/BG-Facebook.jpg',
    videoUrl: '/Pris_banner.mp4',
    imageUrl: '/BG-Facebook.jpg',
    venueImage: '/pris/PRIS_HighlightD2-11.jpg',
    price: 1000,
    mapUrl: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2302.7654741127617!2d100.54624072650559!3d13.912424762505445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e2830b0b06eef3%3A0x5ade5eb90113ca18!2z4Lio4Li54LiZ4Lii4LmM4LmB4Liq4LiU4LiH4Liq4Li04LiZ4LiE4LmJ4Liy4LmB4Lil4Liw4LiB4Liy4Lij4Lib4Lij4Liw4LiK4Li44Lih4Lit4Li04Lih4LmB4Lie4LmH4LiE4LmA4Lih4Li34Lit4LiH4LiX4Lit4LiH4LiY4Liy4LiZ4Li1!5e0!3m2!1sth!2sth!4v1774422903538!5m2!1sth!2sth" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
    ticketTypes: [
        {
            id: 'pris-t1',
            groupName: 'pris-t1',
            name: 'ผู้เข้าร่วมงาน (Early Bird)',
            ticketCategory: 'primary',
            category: 'early_bird',
            price: 1000,
            available: 100,
            quota: 200,
            description: 'ลงทะเบียนราคาพิเศษ เฉพาะผู้ที่ชำระเงินก่อน 30 มิ.ย. 2568'
        },
        {
            id: 'pris-t2',
            groupName: 'pris-t2',
            name: 'ผู้เข้าร่วมงาน (อัตราปกติ)',
            ticketCategory: 'primary',
            category: 'public',
            price: 1500,
            available: 500,
            quota: 500,
            description: 'บัตรเข้าประชุมทั่วไป ครอบคลุมทั้ง 3 วัน รวมอาหารและเครื่องดื่ม'
        },
        {
            id: 'pris-t3',
            groupName: 'pris-t3',
            name: 'นักศึกษา (Post Graduate)',
            ticketCategory: 'primary',
            category: 'member',
            price: 1000,
            available: 100,
            quota: 100,
            description: 'สำหรับนักศึกษาระดับบัณฑิตศึกษา'
        },
        {
            id: 'pris-t4',
            groupName: 'pris-t4',
            name: 'นักศึกษา (Under Graduate)',
            ticketCategory: 'primary',
            category: 'member',
            price: 500,
            available: 100,
            quota: 100,
            description: 'สำหรับนักศึกษาระดับปริญญาตรี'
        }
    ],
    sessions: [
        {
            id: 'pris-s1',
            sessionCode: 'KEYNOTE-01',
            sessionName: 'Synergizing for the Better Future: Global Trends in Pharmacy',
            description: 'Session เปิดงานโดยผู้เชี่ยวชาญระดับโลกที่จะพูดถึงทิศทางของวิชาชีพเภสัชกรรมในระดับสากล',
            room: 'Grand Ballroom',
            startTime: '2026-10-15T09:30:00Z',
            endTime: '2026-10-15T11:00:00Z',
            speakers: 'Dr. Mike Sterling',
            maxCapacity: 1000
        },
        {
            id: 'pris-s2',
            sessionCode: 'TECH-01',
            sessionName: 'Digital Transformation in Hospital Pharmacy',
            description: 'การนำเทคโนโลยีมาใช้ในระบบยาโรงพยาบาล เพื่อความปลอดภัยของผู้ป่วย',
            room: 'Room 201',
            startTime: '2026-10-16T13:00:00Z',
            endTime: '2026-10-16T15:00:00Z',
            speakers: 'ภญ. ดร. วิภาวัลย์',
            maxCapacity: 300
        }
    ],
    speakers: [
        {
            id: 'pris-sp1',
            name: 'Dr. Mike Sterling',
            title: 'International Pharmacy Consultant',
            organization: 'World Pharmacy Group',
            imageUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=2070&auto=format&fit=crop'
        },
        {
            id: 'pris-sp2',
            name: 'ภญ. ดร. วิภาวัลย์ สมานจิต',
            title: 'ผู้อำนวยการศูนย์นวัตกรรม',
            organization: 'สภาเภสัชกรรม',
            imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1974&auto=format&fit=crop'
        }
    ],
    images: [
        { id: 1, eventId: 0, imageUrl: '/pris/PRIS_HighlightD2-11.jpg', caption: 'PRIS Highlights', imageType: 'venue', sortOrder: 1 },
        { id: 2, eventId: 0, imageUrl: '/pris/PRIS_HighlightD2-12.jpg', caption: 'PRIS Highlights', imageType: 'venue', sortOrder: 2 },
        { id: 3, eventId: 0, imageUrl: '/pris/PRIS_HighlightD2-13.jpg', caption: 'PRIS Highlights', imageType: 'venue', sortOrder: 3 },
        { id: 4, eventId: 0, imageUrl: '/pris/PRIS_HighlightD2-2.jpg', caption: 'PRIS Highlights', imageType: 'venue', sortOrder: 4 },
        { id: 5, eventId: 0, imageUrl: '/pris/PRIS_HighlightD2-20.jpg', caption: 'PRIS Highlights', imageType: 'venue', sortOrder: 5 },
        { id: 6, eventId: 0, imageUrl: '/pris/PRIS_HighlightD2-30.jpg', caption: 'PRIS Highlights', imageType: 'venue', sortOrder: 6 },
        { id: 7, eventId: 0, imageUrl: '/pris/PRIS_HighlightD2-40.jpg', caption: 'PRIS Highlights', imageType: 'venue', sortOrder: 7 },
        { id: 8, eventId: 0, imageUrl: '/pris/PRIS_HighlightD2-7.jpg', caption: 'PRIS Highlights', imageType: 'venue', sortOrder: 8 }
    ],
    attachments: [
        { id: 1, eventId: 0, fileName: 'PRIS2025_Concept_Note.pdf', fileUrl: '#' }
    ],
    rounds: [
        { id: 'pris-r1', date: '2026-10-15T08:30:00Z', time: '08:30 - 17:30', location: 'สำนักงานสภาเภสัชกรรม', capacity: 1000, registered: 450 },
        { id: 'pris-r2', date: '2026-10-16T08:30:00Z', time: '08:30 - 17:30', location: 'สำนักงานสภาเภสัชกรรม', capacity: 1000, registered: 450 }
    ]
};
