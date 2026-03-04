'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getEventById } from '@/lib/services';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { SpeakerMarquee } from '@/components/ui/speaker-marquee';
import { Calendar, MapPin, Clock, Share2, ArrowLeft, Users, CheckCircle, Award, Ticket, X, ChevronLeft, ChevronRight, Images, Check } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Event, Round } from '@/types';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

// Helper function to format date
const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return 'TBA';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'TBA';
    return date.toLocaleDateString('th-TH', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export default function EventDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [selectedRound, setSelectedRound] = useState<string | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    // Scroll animation refs
    const { ref: aboutRef, isVisible: aboutVisible } = useScrollAnimation();
    const { ref: venueRef, isVisible: venueVisible } = useScrollAnimation();
    const { ref: speakersRef, isVisible: speakersVisible } = useScrollAnimation();
    const { ref: sessionsRef, isVisible: sessionsVisible } = useScrollAnimation();
    const { ref: sidebarRef, isVisible: sidebarVisible } = useScrollAnimation();

    useEffect(() => {
        requestAnimationFrame(() => setMounted(true));
    }, []);

    // Session selection state
    const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

    // Promo code state
    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoDiscount, setPromoDiscount] = useState<{ type: 'percentage' | 'fixed', value: number } | null>(null);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [checkingPromo, setCheckingPromo] = useState(false);

    // Add-on selection state
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

    // User role state (check localStorage for logged-in user)
    const [userRole, setUserRole] = useState<'public' | 'member' | 'vip' | 'student'>('public');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check user role from localStorage on mount
    useState(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            if (token && userData) {
                setIsLoggedIn(true);
                try {
                    const user = JSON.parse(userData);
                    if (user.role === 'admin' || user.role === 'member' || user.isMember) {
                        setUserRole('member');
                    } else if (user.isVip) {
                        setUserRole('vip');
                    } else if (user.isStudent) {
                        setUserRole('student');
                    }
                } catch { /* ignore */ }
            }
        }
    });

    const { data: event, isLoading, isError } = useQuery({
        queryKey: ['event', id],
        queryFn: async () => {
            const result = await getEventById(id);
            if (!result) {
                throw new Error('Event not found');
            }
            return result;
        },
        enabled: !!id,
        retry: 1,
    });

    // Toggle session selection
    const toggleSession = (sessionId: string) => {
        setSelectedSessions(prev =>
            prev.includes(sessionId)
                ? prev.filter(id => id !== sessionId)
                : [...prev, sessionId]
        );
    };

    // Toggle add-on selection
    const toggleAddon = (addonId: string) => {
        setSelectedAddons(prev =>
            prev.includes(addonId)
                ? prev.filter(id => id !== addonId)
                : [...prev, addonId]
        );
    };

    // Apply promo code
    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setCheckingPromo(true);
        setPromoError(null);

        try {
            // Simulate API call - replace with real API
            await new Promise(resolve => setTimeout(resolve, 500));

            // Mock promo codes
            const mockCodes: Record<string, { type: 'percentage' | 'fixed', value: number }> = {
                'MEMBER20': { type: 'percentage', value: 20 },
                'SAVE500': { type: 'fixed', value: 500 },
                'VIP50': { type: 'percentage', value: 50 },
            };

            const discount = mockCodes[promoCode.toUpperCase()];
            if (discount) {
                setPromoDiscount(discount);
                setPromoApplied(true);
            } else {
                setPromoError('โค้ดส่วนลดไม่ถูกต้อง');
            }
        } catch {
            setPromoError('เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setCheckingPromo(false);
        }
    };

    // Clear promo code
    const clearPromo = () => {
        setPromoCode('');
        setPromoApplied(false);
        setPromoDiscount(null);
        setPromoError(null);
    };

    // Calculate discounted price
    const getDiscountedPrice = (price: number): number => {
        if (!promoDiscount) return price;
        if (promoDiscount.type === 'percentage') {
            return price * (1 - promoDiscount.value / 100);
        }
        return Math.max(0, price - promoDiscount.value);
    };

    // Auto-detect the best ticket for current user (like Eventpass)
    // Priority: Early Bird (if available and within sale period) > Member (if logged in) > Public
    const getAutoSelectedTicket = () => {
        if (!event?.ticketTypes || event.ticketTypes.length === 0) return null;

        // Filter out add-on tickets
        const primaryTickets = event.ticketTypes.filter(t => t.ticketCategory !== 'addon');
        if (primaryTickets.length === 0) return null;

        const now = new Date();
        const eventStart = event.startDate ? new Date(event.startDate) : null;
        const sevenDaysBeforeEvent = eventStart ? new Date(eventStart.getTime() - 7 * 24 * 60 * 60 * 1000) : null;

        // Find tickets by category from primary tickets only
        const earlyBirdTicket = primaryTickets.find(t =>
            t.name.toLowerCase().includes('early') || t.name.toLowerCase().includes('bird')
        );
        const memberTicket = primaryTickets.find(t =>
            t.name.toLowerCase().includes('member') || t.name.toLowerCase().includes('สมาชิก')
        );
        const publicTicket = primaryTickets.find(t =>
            t.name.toLowerCase().includes('public') || t.name.toLowerCase().includes('ทั่วไป') || t.name.toLowerCase().includes('general')
        );

        // Check Early Bird availability (before 7 days of event OR within sale period)
        if (earlyBirdTicket) {
            const salesStart = earlyBirdTicket.salesStart ? new Date(earlyBirdTicket.salesStart) : null;
            const salesEnd = earlyBirdTicket.salesEnd ? new Date(earlyBirdTicket.salesEnd) : sevenDaysBeforeEvent;

            const isWithinSalePeriod = (!salesStart || now >= salesStart) && (!salesEnd || now <= salesEnd);
            const hasAvailability = earlyBirdTicket.available === undefined || earlyBirdTicket.available > 0;

            if (isWithinSalePeriod && hasAvailability) {
                return earlyBirdTicket;
            }
        }

        // If user is member, return member ticket
        if (userRole === 'member' && memberTicket) {
            const hasAvailability = memberTicket.available === undefined || memberTicket.available > 0;
            if (hasAvailability) {
                return memberTicket;
            }
        }

        // Default to public ticket
        if (publicTicket) {
            return publicTicket;
        }

        // Fallback to first available primary ticket
        return primaryTickets[0];
    };

    if (isLoading) return <div className="min-h-screen bg-white text-[#6f7e0d] flex items-center justify-center">Loading event details...</div>;
    if (isError || !event) return <div className="min-h-screen bg-white text-[#6f7e0d] flex items-center justify-center">Event not found</div>;

    const currentRound = event.rounds?.find((r: Round) => r.id === selectedRound) || event.rounds?.[0];
    const autoSelectedTicket = getAutoSelectedTicket();

    // Get add-on tickets
    const addonTickets = event.ticketTypes?.filter(t => t.ticketCategory === 'addon') || [];
    const selectedAddonTickets = event.ticketTypes?.filter(t => selectedAddons.includes(t.id)) || [];
    const addonsTotal = selectedAddonTickets.reduce((sum, t) => sum + (t.price || 0), 0);
    const basePrice = autoSelectedTicket?.price || 0;
    const totalPrice = getDiscountedPrice(basePrice) + addonsTotal;

    return (
        <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
            <Navbar />

            {/* Hero Section - Responsive */}
            <section className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] min-h-[400px] md:min-h-[500px] w-full">
                <div className="absolute inset-0">
                    <img src={event.coverImage} alt={event.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-12">
                    <div className="container mx-auto max-w-7xl">
                        <Link href="/events" className={`inline-flex items-center text-white/80 hover:text-white mb-3 sm:mb-4 md:mb-6 transition-colors text-sm sm:text-base scroll-animate fade-up ${mounted ? 'is-visible' : ''}`}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> กลับไปหน้ารายการ
                        </Link>

                        {/* Badges */}
                        <div className={`flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4 scroll-animate fade-up stagger-1 ${mounted ? 'is-visible' : ''}`}>
                            <span className="bg-white/20 text-white border border-white/30 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium backdrop-blur-md">
                                {event.eventType === 'single' ? 'One Day Event' : 'Multi-Day Conference'}
                            </span>
                            <span className="bg-white/20 text-white border border-white/30 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium backdrop-blur-md">
                                {event.cpeCredits} CPE Credits
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 leading-tight max-w-4xl text-white scroll-animate fade-up stagger-2 ${mounted ? 'is-visible' : ''}`}>
                            {event.name}
                        </h1>

                        {/* Meta Info */}
                        <div className={`flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 md:gap-6 text-white/80 text-sm sm:text-base scroll-animate fade-up stagger-3 ${mounted ? 'is-visible' : ''}`}>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
                                <span className="truncate">
                                    {currentRound?.date ? new Date(currentRound.date).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBA'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
                                <span className="truncate">{currentRound?.location || 'TBA'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 md:py-12">
                {/* Mobile: Sidebar First (for important info) */}
                <div className="lg:hidden space-y-4 mb-6">
                    {/* Countdown Timer */}
                    {currentRound?.date && (
                        <CountdownTimer targetDate={currentRound.date} />
                    )}

                    {/* Quick Info Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* CPE Credits */}
                        <div className="bg-[#537547]/10 border border-[#537547]/20 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#537547]/10 flex items-center justify-center flex-shrink-0">
                                    <Award className="w-5 h-5 text-[#537547]" />
                                </div>
                                <div>
                                    <div className="text-xs text-[#537547]">CPE Credits</div>
                                    <div className="text-xl font-bold text-gray-900">{event.cpeCredits}</div>
                                </div>
                            </div>
                        </div>

                        {/* Tickets */}
                        <div className="bg-[#537547]/10 border border-[#537547]/20 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#537547]/10 flex items-center justify-center flex-shrink-0">
                                    <Ticket className="w-5 h-5 text-[#537547]" />
                                </div>
                                <div>
                                    <div className="text-xs text-[#537547]">ที่นั่งเหลือ</div>
                                    <div className="text-xl font-bold text-gray-900">
                                        {currentRound ? currentRound.capacity - currentRound.registered : 0}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Price & Book Button */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-500">ราคา</div>
                            <div className="text-2xl font-bold text-[#537547]">
                                ฿{(event.price ?? 0).toLocaleString()}
                            </div>
                        </div>
                        <Link href={`/checkout/${event.id}?round=${selectedRound || currentRound?.id}`}>
                            <Button className="bg-[#537547] hover:bg-[#456339] text-white px-6 h-12 font-bold rounded-xl transition-transform hover:scale-105 active:scale-95">
                                จองตั๋ว
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Desktop Grid Layout */}
                <div className="grid lg:grid-cols-3 gap-6 lg:gap-10">
                    {/* Left Column: Content */}
                    <div className="lg:col-span-2 space-y-6 sm:space-y-8 md:space-y-10">

                        {/* About Section */}
                        <section ref={aboutRef} className={`bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm scroll-animate fade-up ${aboutVisible ? 'is-visible' : ''}`}>
                            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-[#6f7e0d]">รายละเอียดงาน</h2>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">
                                {event.description}
                            </p>
                        </section>

                        {/* Sessions Section - Only for multi_session events */}
                        {event.sessions && event.sessions.length > 0 && (
                            <section ref={sessionsRef} className={`bg-white border border-[#537547]/20 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm scroll-animate fade-up ${sessionsVisible ? 'is-visible' : ''}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-[#537547]">
                                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                                        เลือก Sessions ({selectedSessions.length}/{event.sessions.length})
                                    </h2>
                                    {selectedSessions.length > 0 && (
                                        <button
                                            onClick={() => setSelectedSessions([])}
                                            className="text-xs text-gray-500 hover:text-gray-900"
                                        >
                                            ล้างการเลือก
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {event.sessions.map((session) => {
                                        const isSelected = selectedSessions.includes(session.id);
                                        return (
                                            <div
                                                key={session.id}
                                                onClick={() => toggleSession(session.id)}
                                                className={cn(
                                                    "cursor-pointer rounded-xl p-4 border transition-all",
                                                    isSelected
                                                        ? "bg-[#537547]/10 border-[#537547] shadow-sm"
                                                        : "bg-gray-50 border-gray-200 hover:border-[#537547]/50"
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Checkbox */}
                                                    <div className={cn(
                                                        "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                                                        isSelected
                                                            ? "bg-[#537547] border-[#537547]"
                                                            : "border-gray-400"
                                                    )}>
                                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                                    </div>

                                                    {/* Session Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                            <span className="px-2 py-0.5 bg-[#537547]/10 text-[#537547] rounded text-xs font-medium">
                                                                {session.sessionCode}
                                                            </span>
                                                            <h3 className="font-semibold text-gray-900">{session.sessionName}</h3>
                                                        </div>
                                                        {session.description && (
                                                            <p className="text-sm text-gray-500 mb-2">{session.description}</p>
                                                        )}
                                                        <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                {session.startTime ? new Date(session.startTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : 'TBA'}
                                                                {' - '}
                                                                {session.endTime ? new Date(session.endTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : 'TBA'}
                                                            </span>
                                                            {session.room && (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                    {session.room}
                                                                </span>
                                                            )}
                                                            {session.speakers && (
                                                                <span className="flex items-center gap-1">
                                                                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                    {session.speakers}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Capacity Badge */}
                                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 flex-shrink-0">
                                                        {session.maxCapacity} seats
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Venue Section */}
                        <section ref={venueRef} className={`bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 md:p-8 overflow-hidden shadow-sm scroll-animate fade-up ${venueVisible ? 'is-visible' : ''}`}>
                            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 text-[#6f7e0d]">
                                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#537547]" />
                                สถานที่จัดงาน
                            </h2>

                            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                                {/* Venue Image - Clickable Gallery Preview */}
                                <button
                                    onClick={() => { if (event.images && event.images.length > 0) { setLightboxIndex(0); setLightboxOpen(true); } }}
                                    className={cn(
                                        "rounded-xl sm:rounded-2xl overflow-hidden h-48 sm:h-56 md:h-64 relative border border-gray-200 group text-left",
                                        event.images && event.images.length > 0 && "cursor-pointer hover:border-[#537547]/50"
                                    )}
                                    disabled={!event.images || event.images.length === 0}
                                >
                                    <img
                                        src={event.images?.[0]?.imageUrl || event.venueImage || "https://placehold.co/600x400?text=Venue"}
                                        alt="Venue"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                    {event.images && event.images.length > 0 && (
                                        <>
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                                    <Images className="w-5 h-5 text-white" />
                                                    <span className="text-white font-medium text-sm">ดูรูปภาพทั้งหมด</span>
                                                </div>
                                            </div>
                                            {event.images.length > 1 && (
                                                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
                                                    +{event.images.length - 1} รูป
                                                </div>
                                            )}
                                        </>
                                    )}
                                </button>
                                <div className="flex flex-col justify-center space-y-3 sm:space-y-4">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">{currentRound?.location || 'TBA'}</h3>
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                            <CheckCircle className="w-4 h-4 text-[#537547] flex-shrink-0" />
                                            <span>เดินทางสะดวกด้วยรถไฟฟ้า</span>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                            <CheckCircle className="w-4 h-4 text-[#537547] flex-shrink-0" />
                                            <span>มีที่จอดรถ</span>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                            <CheckCircle className="w-4 h-4 text-[#537547] flex-shrink-0" />
                                            <span>Wi-Fi ฟรีสำหรับผู้เข้าร่วม</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full mt-auto border-gray-300 hover:bg-gray-100 text-gray-700 text-sm sm:text-base"
                                        asChild
                                    >
                                        <a
                                            href={currentRound?.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentRound?.location || '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            ดูแผนที่
                                        </a>
                                    </Button>
                                </div>
                            </div>

                            {/* Event Attachments */}
                            {event.attachments && event.attachments.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold mb-3 text-gray-700">เอกสารประกอบ</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {event.attachments.map((attachment) => (
                                            <a
                                                key={attachment.id}
                                                href={attachment.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                            >
                                                <svg className="w-4 h-4 text-[#537547]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                                {attachment.fileName}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Speakers */}
                        {event.speakers && event.speakers.length > 0 && (
                            <section ref={speakersRef} className={`overflow-hidden scroll-animate fade-up ${speakersVisible ? 'is-visible' : ''}`}>
                                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 text-[#6f7e0d]">
                                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#537547]" />
                                    ผู้บรรยาย ({event.speakers.length} ท่าน)
                                </h2>
                                <SpeakerMarquee speakers={event.speakers} />
                            </section>
                        )}
                    </div>

                    {/* Right Column: Desktop Sidebar */}
                    <div ref={sidebarRef} className="hidden lg:block relative">
                        <div className={`sticky top-24 space-y-6 scroll-animate slide-right ${sidebarVisible ? 'is-visible' : ''}`}>
                            {/* Countdown Timer */}
                            {currentRound?.date && (
                                <CountdownTimer targetDate={currentRound.date} />
                            )}

                            {/* CPE Credits Badge */}
                            <div className="bg-[#537547]/10 border border-[#537547]/20 rounded-2xl p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-[#537547]/10 flex items-center justify-center">
                                        <Award className="w-7 h-7 text-[#537547]" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-[#537547]">CPE Credits</div>
                                        <div className="text-3xl font-bold text-gray-900">{event.cpeCredits} <span className="text-lg font-normal text-gray-500">หน่วยกิต</span></div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-3">Certified by the Pharmacy Council of Thailand</p>
                            </div>

                            {/* Ticket Availability */}
                            <div className="bg-[#537547]/10 border border-[#537547]/20 rounded-2xl p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-[#537547]/10 flex items-center justify-center">
                                        <Ticket className="w-7 h-7 text-[#537547]" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-[#537547]">ที่นั่งเหลือ</div>
                                        <div className="text-3xl font-bold text-gray-900">
                                            {currentRound ? currentRound.capacity - currentRound.registered : 0}
                                            <span className="text-lg font-normal text-gray-500"> / {currentRound?.capacity || 0}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Progress bar */}
                                <div className="mt-3">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#537547] rounded-full transition-all"
                                            style={{ width: `${currentRound ? (currentRound.registered / currentRound.capacity) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">{currentRound ? Math.round((currentRound.registered / currentRound.capacity) * 100) : 0}% sold</p>
                                </div>
                            </div>

                            {/* Booking Card */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold mb-6 text-gray-900">Booking Summary</h3>

                                <div className="space-y-4 mb-6">
                                    {/* User Role Badge */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">สถานะของคุณ:</span>
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-xs font-medium",
                                            userRole === 'public' ? "bg-gray-200 text-gray-600" :
                                                userRole === 'member' ? "bg-[#537547]/20 text-[#537547]" :
                                                    userRole === 'vip' ? "bg-purple-100 text-purple-600" :
                                                        "bg-blue-100 text-blue-600"
                                        )}>
                                            {userRole === 'public' ? 'Guest' :
                                                userRole === 'member' ? 'Member' :
                                                    userRole === 'vip' ? 'VIP' : 'Student'}
                                        </span>
                                    </div>

                                    {/* Auto-Detected Ticket (like Eventpass) */}
                                    {autoSelectedTicket && (
                                        <div className="bg-[#537547]/10 p-4 rounded-xl border border-[#537547]/20">
                                            <div className="text-xs text-[#537547] mb-1">ประเภทตั๋วสำหรับคุณ:</div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-bold text-gray-900 text-lg">{autoSelectedTicket.name}</div>
                                                    {autoSelectedTicket.available !== undefined && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            เหลือ {autoSelectedTicket.available} ที่นั่ง
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    {promoApplied && getDiscountedPrice(autoSelectedTicket.price) < autoSelectedTicket.price ? (
                                                        <>
                                                            <span className="text-gray-500 line-through text-sm block">
                                                                ฿{autoSelectedTicket.price.toLocaleString()}
                                                            </span>
                                                            <span className="text-2xl font-bold text-[#537547]">
                                                                ฿{getDiscountedPrice(autoSelectedTicket.price).toLocaleString()}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-2xl font-bold text-[#537547]">
                                                            ฿{autoSelectedTicket.price.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Add-on Tickets Section */}
                                    {addonTickets.length > 0 && (
                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="text-sm text-[#537547] mb-3 flex items-center gap-2">
                                                <Ticket className="w-4 h-4" />
                                                เพิ่มเติม (Add-ons)
                                            </div>
                                            <div className="space-y-2">
                                                {addonTickets.map(addon => {
                                                    const isSelected = selectedAddons.includes(addon.id);
                                                    const isSoldOut = addon.available !== undefined && addon.available <= 0;
                                                    return (
                                                        <button
                                                            key={addon.id}
                                                            onClick={() => !isSoldOut && toggleAddon(addon.id)}
                                                            disabled={isSoldOut}
                                                            className={cn(
                                                                "w-full p-3 rounded-lg border text-left transition-all",
                                                                isSoldOut ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200" :
                                                                    isSelected ? "bg-[#537547]/10 border-[#537547]" :
                                                                        "bg-gray-50 border-gray-200 hover:border-[#537547]/50"
                                                            )}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={cn(
                                                                        "w-4 h-4 rounded border-2 flex items-center justify-center",
                                                                        isSelected ? "border-[#537547] bg-[#537547]" : "border-gray-400"
                                                                    )}>
                                                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium text-gray-900 text-sm">{addon.name}</div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {isSoldOut
                                                                                ? <span className="text-red-400">เต็มแล้ว</span>
                                                                                : `เหลือ ${addon.available ?? addon.quota} ที่นั่ง`
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <span className="text-[#537547] font-bold">+฿{addon.price.toLocaleString()}</span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Total Price Summary */}
                                    {(autoSelectedTicket || selectedAddonTickets.length > 0) && (
                                        <div className="bg-[#537547]/10 p-4 rounded-xl border border-[#537547]/20">
                                            {selectedAddonTickets.length > 0 && (
                                                <div className="mb-2 pb-2 border-b border-gray-200 space-y-1">
                                                    {selectedAddonTickets.map(addon => (
                                                        <div key={addon.id} className="flex justify-between text-sm">
                                                            <span className="text-[#537547]">+ {addon.name}</span>
                                                            <span className="text-[#537547]">฿{addon.price.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-900">รวมทั้งหมด</span>
                                                <span className="text-2xl font-bold text-[#537547]">
                                                    ฿{totalPrice.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Promo Code Section */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="text-sm text-gray-500 mb-2">โค้ดส่วนลด:</div>
                                        {promoApplied ? (
                                            <div className="bg-[#537547]/10 p-3 rounded-lg border border-[#537547]/20">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-[#537547] font-medium">{promoCode.toUpperCase()}</span>
                                                        <div className="text-xs text-[#537547]">
                                                            {promoDiscount?.type === 'percentage'
                                                                ? `ลด ${promoDiscount.value}%`
                                                                : `ลด ฿${promoDiscount?.value}`}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={clearPromo}
                                                        className="text-red-400 hover:text-red-300 text-sm"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={promoCode}
                                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                    placeholder="กรอกโค้ด"
                                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#537547]"
                                                    disabled={checkingPromo}
                                                />
                                                <Button
                                                    onClick={handleApplyPromo}
                                                    disabled={checkingPromo || !promoCode.trim()}
                                                    className="bg-[#537547] hover:bg-[#456339] text-white px-4 text-sm"
                                                >
                                                    {checkingPromo ? '...' : 'ใช้'}
                                                </Button>
                                            </div>
                                        )}
                                        {promoError && (
                                            <p className="text-red-400 text-xs mt-2">{promoError}</p>
                                        )}
                                    </div>

                                    {/* Selected Sessions Summary */}
                                    {selectedSessions.length > 0 && (
                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="text-sm text-gray-500 mb-2">Sessions ที่เลือก:</div>
                                            <div className="text-xs text-[#537547]">
                                                {selectedSessions.length} sessions
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Link
                                    href={`/checkout/${event.id}?ticket=${autoSelectedTicket?.id || ''}${selectedSessions.length > 0 ? `&sessions=${selectedSessions.join(',')}` : ''}${selectedAddons.length > 0 ? `&addons=${selectedAddons.join(',')}` : ''}${promoApplied ? `&promo=${promoCode}` : ''}`}
                                    className="block"
                                >
                                    <Button className="w-full h-14 text-lg font-bold bg-[#537547] hover:bg-[#456339] text-white shadow-lg rounded-xl transition-transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]">
                                        จองตั๋วเลย
                                    </Button>
                                </Link>

                                {!isLoggedIn && userRole === 'public' && (
                                    <p className="text-xs text-center text-[#537547] mt-3">
                                        <Link href="/login" className="underline hover:text-[#456339]">เข้าสู่ระบบ</Link> เพื่อดูราคาสมาชิก
                                    </p>
                                )}

                                <p className="text-xs text-center text-gray-500 mt-3">
                                    ชำระเงินปลอดภัย • ยืนยันทันที
                                </p>
                            </div>

                            <div className="bg-[#537547]/10 border border-[#537547]/20 rounded-2xl p-6">
                                <h4 className="font-bold text-[#537547] mb-2">ต้องการความช่วยเหลือ?</h4>
                                <p className="text-sm text-gray-500 mb-4">ติดต่อทีมงานสำหรับการจองกลุ่มหรือคำถามเพิ่มเติม</p>
                                <Link href="/contact">
                                    <Button variant="link" className="text-[#537547] p-0 h-auto">ติดต่อเรา &rarr;</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Sticky Bottom Bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 p-4 z-40">
                    <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
                        <div>
                            <div className="text-xs text-gray-500">เริ่มต้นที่</div>
                            <div className="text-xl font-bold text-[#537547]">
                                ฿{(event.price ?? 0).toLocaleString()}
                            </div>
                        </div>
                        <Link href={`/checkout/${event.id}?round=${selectedRound || currentRound?.id}`} className="flex-1 max-w-[200px]">
                            <Button className="w-full bg-[#537547] hover:bg-[#456339] text-white h-12 font-bold rounded-xl transition-transform hover:scale-105 active:scale-95">
                                จองตั๋วเลย
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Spacer for mobile sticky bar */}
                <div className="lg:hidden h-24" />
            </div>

            <Footer />

            {/* Lightbox Modal */}
            {lightboxOpen && event?.images && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex flex-col"
                    onClick={() => setLightboxOpen(false)}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 text-white">
                        <span className="text-sm">{lightboxIndex + 1} / {event.images.length}</span>
                        <button
                            onClick={() => setLightboxOpen(false)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Main Image */}
                    <div className="flex-1 flex items-center justify-center px-4 relative" onClick={(e) => e.stopPropagation()}>
                        {/* Previous Button */}
                        {event.images.length > 1 && (
                            <button
                                onClick={() => setLightboxIndex(prev => prev === 0 ? event.images!.length - 1 : prev - 1)}
                                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                        )}

                        <img
                            src={event.images[lightboxIndex].imageUrl}
                            alt={event.images[lightboxIndex].caption || 'Venue photo'}
                            className="max-h-[70vh] max-w-full object-contain rounded-lg"
                        />

                        {/* Next Button */}
                        {event.images.length > 1 && (
                            <button
                                onClick={() => setLightboxIndex(prev => prev === event.images!.length - 1 ? 0 : prev + 1)}
                                className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <ChevronRight className="w-6 h-6 text-white" />
                            </button>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {event.images.length > 1 && (
                        <div className="p-4 flex justify-center gap-2 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
                            {event.images.map((img, idx) => (
                                <button
                                    key={img.id}
                                    onClick={() => setLightboxIndex(idx)}
                                    className={cn(
                                        "w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all",
                                        idx === lightboxIndex ? "border-[#537547]" : "border-transparent opacity-60 hover:opacity-100"
                                    )}
                                >
                                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
