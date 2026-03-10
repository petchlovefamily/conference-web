'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { eventsApi, type ApiEvent, type ApiTicketType, type ApiSession, type ApiSpeaker, type ApiEventImage, type ApiEventAttachment } from '@/lib/api/events';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { SpeakerMarquee } from '@/components/ui/speaker-marquee';
import { Calendar, MapPin, Clock, Share2, ArrowLeft, Users, CheckCircle, Award, Ticket, X, ChevronLeft, ChevronRight, ChevronDown, Images, Check } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import NextImage from 'next/image';

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
    // Removed rounds-based state — using event.startDate/endDate directly
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


    // Expanded sessions state (for accordion)
    const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set());

    const toggleExpandSession = (sessionId: number) => {
        setExpandedSessions(prev => {
            const next = new Set(prev);
            if (next.has(sessionId)) {
                next.delete(sessionId);
            } else {
                next.add(sessionId);
            }
            return next;
        });
    };

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

    const { data: apiData, isLoading, isError, error } = useQuery({
        queryKey: ['event', id],
        queryFn: async () => {
            const result = await eventsApi.get(id);
            if (!result?.event) {
                throw new Error('Event not found');
            }
            return result;
        },
        enabled: !!id,
        retry: 1,
    });

    const event = apiData?.event;
    const eventSessions = (apiData?.sessions || []).filter((s: ApiSession) => !s.isMainSession);
    const eventTicketTypes = apiData?.ticketTypes || [];
    const eventImages = apiData?.images || [];
    const eventAttachments = apiData?.attachments || [];
    const eventSpeakers = apiData?.speakers || [];

    // Map speakers for SpeakerMarquee component
    const mappedSpeakers = useMemo(() => eventSpeakers.map(s => ({
        id: String(s.speakerId),
        name: `${s.firstName} ${s.lastName}`,
        title: s.position || s.speakerType,
        organization: s.organization || '',
        imageUrl: s.photoUrl || undefined,
    })), [eventSpeakers]);



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

    const currentRound = null; // rounds removed — use event.startDate/endDate/location directly

    // Helper: check if a ticket is within its sale period
    const isTicketOnSale = (ticket: ApiTicketType) => {
        const now = new Date();
        const saleStart = ticket.saleStartDate ? new Date(ticket.saleStartDate) : null;
        const saleEnd = ticket.saleEndDate ? new Date(ticket.saleEndDate) : null;
        if (saleStart && now < saleStart) return false;
        if (saleEnd && now > saleEnd) return false;
        return true;
    };

    // Find the nearest upcoming sale start date across all primary tickets
    const getNextSaleStartDate = (): Date | null => {
        const now = new Date();
        const primaryTickets = eventTicketTypes.filter((t: ApiTicketType) => t.category !== 'addon');
        const futureDates = primaryTickets
            .filter((t: ApiTicketType) => t.saleStartDate)
            .map((t: ApiTicketType) => new Date(t.saleStartDate!))
            .filter((d: Date) => d > now)
            .sort((a: Date, b: Date) => a.getTime() - b.getTime());
        return futureDates[0] || null;
    };

    // Auto-detect the best ticket for current user
    const getAutoSelectedTicket = () => {
        if (eventTicketTypes.length === 0) return null;

        // Filter out add-on tickets
        const primaryTickets = eventTicketTypes.filter((t: ApiTicketType) => t.category !== 'addon');
        if (primaryTickets.length === 0) return null;

        // Only consider tickets that are currently within their sale period
        const onSaleTickets = primaryTickets.filter((t: ApiTicketType) => isTicketOnSale(t));
        if (onSaleTickets.length === 0) return null;

        // Find tickets by category from on-sale tickets only
        const earlyBirdTicket = onSaleTickets.find((t: ApiTicketType) =>
            t.name.toLowerCase().includes('early') || t.name.toLowerCase().includes('bird')
        );
        const memberTicket = onSaleTickets.find((t: ApiTicketType) =>
            t.name.toLowerCase().includes('member') || t.name.toLowerCase().includes('สมาชิก')
        );
        const publicTicket = onSaleTickets.find((t: ApiTicketType) =>
            t.name.toLowerCase().includes('public') || t.name.toLowerCase().includes('ทั่วไป') || t.name.toLowerCase().includes('general')
        );

        // Check Early Bird availability
        if (earlyBirdTicket) {
            const hasAvailability = (earlyBirdTicket.quota - earlyBirdTicket.soldCount) > 0;
            if (hasAvailability) {
                return earlyBirdTicket;
            }
        }

        // If user is member, return member ticket (TODO: get userRole from auth context)
        const currentUserRole = '' as string; // Temporarily empty string until auth is integrated fully on frontend
        if (currentUserRole === 'member' && memberTicket) {
            const hasAvailability = (memberTicket.quota - memberTicket.soldCount) > 0;
            if (hasAvailability) {
                return memberTicket;
            }
        }

        // Otherwise return public ticket
        return publicTicket || onSaleTickets[0] || null;
    };

    if (isLoading) return <div className="min-h-screen bg-white text-[#6f7e0d] flex items-center justify-center">Loading event details...</div>;
    if (isError || !event) return <div className="min-h-screen bg-white text-[#6f7e0d] flex items-center justify-center">Event not found</div>;

    const autoSelectedTicket = getAutoSelectedTicket();
    const nextSaleStart = !autoSelectedTicket ? getNextSaleStartDate() : null;
    const isSaleNotStarted = !autoSelectedTicket && !!nextSaleStart;

    // Get add-on tickets (only show add-ons within their sale period)
    const addonTickets = eventTicketTypes.filter((t: ApiTicketType) => t.category === 'addon' && isTicketOnSale(t));
    const selectedAddonTickets = eventTicketTypes.filter((t: ApiTicketType) => selectedAddons.includes(String(t.id)));
    const addonsTotal = selectedAddonTickets.reduce((sum: number, t: ApiTicketType) => sum + Number(t.price || 0), 0);
    const basePrice = autoSelectedTicket ? Number(autoSelectedTicket.price) : 0;
    const totalPrice = getDiscountedPrice(basePrice) + addonsTotal;

    const venueImages = eventImages.filter(img => img.imageType === 'venue' || !img.imageType);

    return (
        <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
            <Navbar />

            {/* Hero Section - Responsive */}
            <section className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] min-h-[400px] md:min-h-[500px] w-full">
                <div className="absolute inset-0">
                    {(() => {
                        const heroUrl = eventImages.find(img => img.imageType === 'detail_hero')?.imageUrl || event.imageUrl || 'https://placehold.co/1200x600?text=Event';
                        const isVideo = /\.(mp4|webm|mov)$/i.test(heroUrl);
                        return isVideo ? (
                            <video src={heroUrl} className="object-cover w-full h-full" autoPlay muted loop playsInline />
                        ) : (
                            <img src={heroUrl} alt={event.eventName} className="object-cover w-full h-full" />
                        );
                    })()}
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
                                {event.eventType === 'single_room' ? 'One Day Event' : 'Multi-Day Conference'}
                            </span>
                            <span className="bg-white/20 text-white border border-white/30 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium backdrop-blur-md">
                                {event.cpeCredits} CPE Credits
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 leading-tight max-w-4xl text-white scroll-animate fade-up stagger-2 ${mounted ? 'is-visible' : ''}`}>
                            {event.eventName}
                        </h1>

                        {/* Meta Info */}
                        <div className={`flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 md:gap-6 text-white/80 text-sm sm:text-base scroll-animate fade-up stagger-3 ${mounted ? 'is-visible' : ''}`}>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
                                <span className="truncate">
                                    {event.startDate ? new Date(event.startDate).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBA'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
                                <span className="truncate">{event.location || 'TBA'}</span>
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
                    {event.startDate && (
                        <CountdownTimer targetDate={event.startDate} />
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

                        {/* Capacity */}
                        <div className="bg-[#537547]/10 border border-[#537547]/20 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#537547]/10 flex items-center justify-center flex-shrink-0">
                                    <Ticket className="w-5 h-5 text-[#537547]" />
                                </div>
                                <div>
                                    <div className="text-xs text-[#537547]">ที่นั่ง</div>
                                    <div className="text-xl font-bold text-gray-900">
                                        {event.maxCapacity}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Price & Book Button */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            {isSaleNotStarted ? (
                                <>
                                    <div className="text-xs text-amber-600">ยังไม่เปิดจำหน่าย</div>
                                    {nextSaleStart && (
                                        <div className="text-sm font-bold text-amber-700">
                                            เปิด {nextSaleStart.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} {nextSaleStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="text-xs text-gray-500">ราคา</div>
                                    <div className="text-2xl font-bold text-[#537547]">
                                        ฿{basePrice.toLocaleString()}
                                    </div>
                                </>
                            )}
                        </div>
                        {isSaleNotStarted ? (
                            <Button disabled className="bg-gray-300 text-gray-500 px-6 h-12 font-bold rounded-xl cursor-not-allowed">
                                ยังไม่เปิดจำหน่าย
                            </Button>
                        ) : (
                            <Link href={`/checkout/${event.id}`}>
                                <Button className="bg-[#537547] hover:bg-[#456339] text-white px-6 h-12 font-bold rounded-xl transition-transform hover:scale-105 active:scale-95">
                                    จองตั๋ว
                                </Button>
                            </Link>
                        )}
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

                        {/* Sessions Section - Accordion */}
                        {eventSessions.length > 0 && (
                            <section ref={sessionsRef} className={`bg-white border border-[#537547]/20 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm scroll-animate fade-up ${sessionsVisible ? 'is-visible' : ''}`}>
                                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-[#537547] mb-4">
                                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                                    Sessions ({eventSessions.length})
                                </h2>
                                <div className="space-y-3">
                                    {eventSessions.map((session: ApiSession) => {
                                        const isExpanded = expandedSessions.has(session.id);
                                        return (
                                            <div
                                                key={session.id}
                                                className="rounded-xl border bg-gray-50 border-gray-200 overflow-hidden transition-all"
                                            >
                                                {/* Clickable Header */}
                                                <button
                                                    onClick={() => toggleExpandSession(session.id)}
                                                    className="w-full p-4 flex items-center gap-3 text-left hover:bg-gray-100 transition-colors"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="px-2 py-0.5 bg-[#537547]/10 text-[#537547] rounded text-xs font-medium">
                                                                {session.sessionCode}
                                                            </span>
                                                            <h3 className="font-semibold text-gray-900">{session.sessionName}</h3>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-500 mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                {session.startTime ? new Date(session.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'TBA'}
                                                                {' - '}
                                                                {session.endTime ? new Date(session.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'TBA'}
                                                            </span>
                                                            {session.room && (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                    {session.room}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 flex-shrink-0">
                                                        {session.maxCapacity} seats
                                                    </span>
                                                    <ChevronDown className={cn(
                                                        "w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200",
                                                        isExpanded && "rotate-180"
                                                    )} />
                                                </button>

                                                {/* Expandable Content */}
                                                <div className={cn(
                                                    "overflow-hidden transition-all duration-200 ease-in-out",
                                                    isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                                )}>
                                                    <div className="px-4 pb-4 pt-0 border-t border-gray-200">
                                                        {session.description ? (
                                                            <p className="text-sm text-gray-600 leading-relaxed mt-3 whitespace-pre-line">{session.description}</p>
                                                        ) : (
                                                            <p className="text-sm text-gray-400 italic mt-3">ยังไม่มีรายละเอียดเพิ่มเติม</p>
                                                        )}
                                                        {session.speakers && session.speakers.length > 0 && (
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                {session.speakers.map((speaker: string, idx: number) => (
                                                                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-[#537547]/10 text-[#537547] rounded-full text-xs">
                                                                        <Users className="w-3 h-3" />
                                                                        {speaker}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
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

                            {/* Masonry / Bento Gallery */}
                            {venueImages.length > 0 && (
                                <div className={cn(
                                    "grid gap-2 rounded-2xl overflow-hidden mb-6",
                                    venueImages.length === 1 && "grid-cols-1 h-64 sm:h-80",
                                    venueImages.length === 2 && "grid-cols-2 h-56 sm:h-72",
                                    venueImages.length === 3 && "grid-cols-3 grid-rows-2 h-64 sm:h-80",
                                    venueImages.length === 4 && "grid-cols-2 grid-rows-2 h-72 sm:h-96",
                                    venueImages.length >= 5 && "grid-cols-4 grid-rows-2 h-72 sm:h-96",
                                )}>
                                    {venueImages.slice(0, Math.min(venueImages.length, 5)).map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                                            className={cn(
                                                "relative overflow-hidden group cursor-pointer rounded-xl",
                                                // Layout rules for different counts
                                                venueImages.length === 3 && idx === 0 && "col-span-2 row-span-2",
                                                venueImages.length === 3 && idx > 0 && "col-span-1 row-span-1",
                                                venueImages.length >= 5 && idx === 0 && "col-span-2 row-span-2",
                                                venueImages.length >= 5 && idx > 0 && "col-span-1 row-span-1",
                                            )}
                                        >
                                            <img
                                                src={img.imageUrl}
                                                alt={img.caption || `Venue photo ${idx + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />

                                            {/* Show "+N more" on last visible image if there are more */}
                                            {idx === Math.min(venueImages.length, 5) - 1 && venueImages.length > 5 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <Images className="w-8 h-8 text-white mx-auto mb-2" />
                                                        <span className="text-white text-xl font-bold">+{venueImages.length - 5}</span>
                                                        <p className="text-white/80 text-sm">ดูเพิ่มเติม</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Caption on first image */}
                                            {idx === 0 && img.caption && (
                                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-white text-sm font-medium truncate">{img.caption}</p>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {venueImages.length === 0 && (
                                <div className="h-48 sm:h-64 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center mb-6">
                                    <div className="text-center text-gray-400">
                                        <Images className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="font-medium">ยังไม่มีรูปภาพสถานที่</p>
                                    </div>
                                </div>
                            )}

                            {/* Venue Info & Map */}
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start">
                                    <div className="flex-1 space-y-3 sm:space-y-4">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{event.location || 'TBA'}</h3>
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
                                    </div>
                                </div>

                                {/* Embedded Google Map */}
                                {event.location && (
                                    <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-gray-50 relative group">
                                        {(() => {
                                            // Helper to gracefully handle if user pastes the entire <iframe ...> string
                                            const extractMapUrl = (url: string | null | undefined) => {
                                                if (!url) return undefined;
                                                const srcMatch = url.match(/src="([^"]+)"/);
                                                return srcMatch ? srcMatch[1] : url;
                                            };

                                            const finalMapUrl = extractMapUrl(event.mapUrl);
                                            const isEmbedUrl = finalMapUrl?.includes('embed') || finalMapUrl?.includes('pb=');

                                            // Handle case where location might be null
                                            const searchLocation = event.location || '';

                                            return (
                                                <>
                                                    <iframe
                                                        width="100%"
                                                        height="100%"
                                                        style={{ border: 0 }}
                                                        loading="lazy"
                                                        allowFullScreen
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                        src={
                                                            isEmbedUrl
                                                                ? finalMapUrl
                                                                : `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(searchLocation)}`
                                                        }
                                                        className={(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || isEmbedUrl) ? "" : "hidden"}
                                                    />

                                                    {/* Fallback if no API key and no embed URL */}
                                                    {(!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && !isEmbedUrl) && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                                            <MapPin className="w-12 h-12 text-gray-300 mb-3" />
                                                            <h4 className="font-semibold text-gray-700 mb-1">สถานที่จัดงาน</h4>
                                                            <p className="text-gray-500 text-sm mb-4 line-clamp-2 max-w-md">{event.location}</p>
                                                            <Button variant="outline" asChild>
                                                                <a
                                                                    href={finalMapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchLocation)}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    เปิดใน Google Maps
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>

                            {/* Event Attachments */}
                            {eventAttachments.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold mb-3 text-gray-700">เอกสารประกอบ</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {eventAttachments.map((attachment: ApiEventAttachment) => (
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
                        {mappedSpeakers.length > 0 && (
                            <section ref={speakersRef} className={`overflow-hidden scroll-animate fade-up ${speakersVisible ? 'is-visible' : ''}`}>
                                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 text-[#6f7e0d]">
                                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#537547]" />
                                    ผู้บรรยาย ({mappedSpeakers.length} ท่าน)
                                </h2>
                                <SpeakerMarquee speakers={mappedSpeakers} />
                            </section>
                        )}
                    </div>

                    {/* Right Column: Desktop Sidebar */}
                    <div ref={sidebarRef} className="hidden lg:block relative">
                        <div className={`sticky top-24 space-y-6 scroll-animate slide-right ${sidebarVisible ? 'is-visible' : ''}`}>
                            {/* Countdown Timer */}
                            {event.startDate && (
                                <CountdownTimer targetDate={event.startDate} />
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
                                        <div className="text-sm text-[#537547]">ที่นั่ง</div>
                                        <div className="text-3xl font-bold text-gray-900">
                                            {event.maxCapacity}
                                        </div>
                                    </div>
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
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        เหลือ {autoSelectedTicket.quota - autoSelectedTicket.soldCount} ที่นั่ง
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {promoApplied && getDiscountedPrice(Number(autoSelectedTicket.price)) < Number(autoSelectedTicket.price) ? (
                                                        <>
                                                            <span className="text-gray-500 line-through text-sm block">
                                                                ฿{Number(autoSelectedTicket.price).toLocaleString()}
                                                            </span>
                                                            <span className="text-2xl font-bold text-[#537547]">
                                                                ฿{getDiscountedPrice(Number(autoSelectedTicket.price)).toLocaleString()}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-2xl font-bold text-[#537547]">
                                                            ฿{Number(autoSelectedTicket.price).toLocaleString()}
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
                                                    const isSelected = selectedAddons.includes(String(addon.id));
                                                    const isSoldOut = (addon.quota - addon.soldCount) <= 0;
                                                    return (
                                                        <button
                                                            key={addon.id}
                                                            onClick={() => !isSoldOut && toggleAddon(String(addon.id))}
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
                                                                                : `เหลือ ${addon.quota - addon.soldCount} ที่นั่ง`
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <span className="text-[#537547] font-bold">+฿{Number(addon.price).toLocaleString()}</span>
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
                                                    {selectedAddonTickets.map((addon: ApiTicketType) => (
                                                        <div key={addon.id} className="flex justify-between text-sm">
                                                            <span className="text-[#537547]">+ {addon.name}</span>
                                                            <span className="text-[#537547]">฿{Number(addon.price).toLocaleString()}</span>
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


                                </div>

                                {isSaleNotStarted ? (
                                    <Button disabled className="w-full h-14 text-lg font-bold bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed">
                                        ยังไม่เปิดจำหน่าย
                                    </Button>
                                ) : (
                                    <Link
                                        href={`/checkout/${event.id}?ticket=${autoSelectedTicket?.id || ''}${selectedAddons.length > 0 ? `&addons=${selectedAddons.join(',')}` : ''}${promoApplied ? `&promo=${promoCode}` : ''}`}
                                        className="block"
                                    >
                                        <Button className="relative overflow-hidden w-full h-14 text-lg font-bold bg-[#537547] hover:bg-[#456339] text-white shadow-lg rounded-xl transition-transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] group">
                                            <span className="relative z-10">จองตั๋วเลย</span>
                                            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70 group-hover:animate-shimmer" />
                                        </Button>
                                    </Link>
                                )}

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
                        {isSaleNotStarted ? (
                            <>
                                <div>
                                    <div className="text-xs text-amber-600">ยังไม่เปิดจำหน่าย</div>
                                    {nextSaleStart && (
                                        <div className="text-sm font-bold text-amber-700">
                                            {nextSaleStart.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} {nextSaleStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                        </div>
                                    )}
                                </div>
                                <Button disabled className="flex-1 max-w-[200px] bg-gray-300 text-gray-500 h-12 font-bold rounded-xl cursor-not-allowed">
                                    ยังไม่เปิดจำหน่าย
                                </Button>
                            </>
                        ) : (
                            <>
                                <div>
                                    <div className="text-xs text-gray-500">เริ่มต้นที่</div>
                                    <div className="text-xl font-bold text-[#537547]">
                                        ฿{basePrice.toLocaleString()}
                                    </div>
                                </div>
                                <Link href={`/checkout/${event.id}`} className="flex-1 max-w-[200px]">
                                    <Button className="w-full bg-[#537547] hover:bg-[#456339] text-white h-12 font-bold rounded-xl transition-transform hover:scale-105 active:scale-95">
                                        จองตั๋วเลย
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Spacer for mobile sticky bar */}
                <div className="lg:hidden h-24" />
            </div>

            <Footer />

            {/* Lightbox Modal */}
            {lightboxOpen && venueImages.length > 0 && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex flex-col"
                    onClick={() => setLightboxOpen(false)}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 text-white">
                        <span className="text-sm">{lightboxIndex + 1} / {venueImages.length}</span>
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
                        {venueImages.length > 1 && (
                            <button
                                onClick={() => setLightboxIndex(prev => prev === 0 ? venueImages.length - 1 : prev - 1)}
                                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                        )}

                        <img
                            src={venueImages[lightboxIndex]?.imageUrl}
                            alt="Venue preview"
                            className="max-h-[70vh] max-w-full object-contain rounded-lg"
                        />

                        {/* Next Button */}
                        {venueImages.length > 1 && (
                            <button
                                onClick={() => setLightboxIndex(prev => prev === venueImages.length - 1 ? 0 : prev + 1)}
                                className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <ChevronRight className="w-6 h-6 text-white" />
                            </button>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {venueImages.length > 1 && (
                        <div className="p-4 flex justify-center gap-2 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
                            {venueImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setLightboxIndex(idx)}
                                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${idx === lightboxIndex ? 'border-[#537547]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )
            }
        </div >
    );
}
