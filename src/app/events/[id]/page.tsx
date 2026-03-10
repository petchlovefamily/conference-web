'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getEventById } from '@/lib/services';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { SpeakerMarquee } from '@/components/ui/speaker-marquee';
import { Calendar, MapPin, Clock, Share2, ArrowLeft, Users, CheckCircle, Award, Ticket, X, ChevronLeft, ChevronRight, Images, Check, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { cn, getUserRoleLabel, getUserRoleBadgeColor } from '@/lib/utils';
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
    const { ref: galleryRef, isVisible: galleryVisible } = useScrollAnimation();
    const { ref: venueRef, isVisible: venueVisible } = useScrollAnimation();
    const { ref: speakersRef, isVisible: speakersVisible } = useScrollAnimation();
    const { ref: sessionsRef, isVisible: sessionsVisible } = useScrollAnimation();
    const { ref: sidebarRef, isVisible: sidebarVisible } = useScrollAnimation();

    useEffect(() => {
        requestAnimationFrame(() => setMounted(true));
    }, []);

    // Session selection state
    const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

    // Accordion state for sessions
    const [expandedSessions, setExpandedSessions] = useState<string[]>([]);
    const toggleSessionAccordion = (id: string) => {
        setExpandedSessions(prev =>
            prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
        );
    };

    // Promo code state
    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoDiscount, setPromoDiscount] = useState<{ type: 'percentage' | 'fixed', value: number } | null>(null);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [checkingPromo, setCheckingPromo] = useState(false);

    // Add-on selection state
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [mobileBookingOpen, setMobileBookingOpen] = useState(false);

    // User role from AuthContext
    const { user: authUser, isLoggedIn } = useAuth();
    const userRole = authUser?.role || 'public';

    // Helper: check if a ticket is visible to the current user based on allowedRoles
    const isTicketAllowedForUser = (ticket: { allowedRoles?: string[] }) => {
        // If no allowedRoles defined, ticket is visible to everyone
        if (!ticket.allowedRoles || ticket.allowedRoles.length === 0) return true;
        // Map userRole to the backend role format
        // 'public' (not logged in) or 'general' => matches 'general' ticket roles
        const role = userRole === 'public' ? 'general' : userRole;
        return ticket.allowedRoles.includes(role);
    };

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
            const { validatePromoCode } = await import('@/lib/services');
            const result = await validatePromoCode(promoCode, id);
            if (result.valid && result.discount) {
                setPromoDiscount(result.discount);
                setPromoApplied(true);
            } else {
                setPromoError(result.error || 'โค้ดส่วนลดไม่ถูกต้อง');
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

    // Helper: check if a ticket is within its sale period
    const isTicketOnSale = (ticket: { salesStart?: string; salesEnd?: string }) => {
        const now = new Date();
        const saleStart = ticket.salesStart ? new Date(ticket.salesStart) : null;
        const saleEnd = ticket.salesEnd ? new Date(ticket.salesEnd) : null;
        if (saleStart && now < saleStart) return false;
        if (saleEnd && now > saleEnd) return false;
        return true;
    };

    // Find the nearest upcoming sale start date across all primary tickets
    const getNextSaleStartDate = (): Date | null => {
        if (!event?.ticketTypes) return null;
        const now = new Date();
        const futureDates = event.ticketTypes
            .filter(t => t.ticketCategory !== 'addon' && isTicketAllowedForUser(t) && t.salesStart)
            .map(t => new Date(t.salesStart!))
            .filter(d => d > now)
            .sort((a, b) => a.getTime() - b.getTime());
        return futureDates[0] || null;
    };

    // Auto-detect the best ticket for current user (like Eventpass)
    // Priority: Early Bird (if available and within sale period) > Member (if logged in) > Public
    const getAutoSelectedTicket = () => {
        if (!event?.ticketTypes || event.ticketTypes.length === 0) return null;

        // Filter out add-on tickets AND filter by user role
        const primaryTickets = event.ticketTypes.filter(t => t.ticketCategory !== 'addon' && isTicketAllowedForUser(t));
        if (primaryTickets.length === 0) return null;

        // Only consider tickets that are currently within their sale period
        const onSaleTickets = primaryTickets.filter(t => isTicketOnSale(t));
        if (onSaleTickets.length === 0) return null;

        // Find tickets by category from on-sale tickets only
        const earlyBirdTicket = onSaleTickets.find(t =>
            t.name.toLowerCase().includes('early') || t.name.toLowerCase().includes('bird')
        );
        const memberTicket = onSaleTickets.find(t =>
            t.name.toLowerCase().includes('member') || t.name.toLowerCase().includes('สมาชิก')
        );
        const publicTicket = onSaleTickets.find(t =>
            t.name.toLowerCase().includes('public') || t.name.toLowerCase().includes('ทั่วไป') || t.name.toLowerCase().includes('general')
        );

        // Check Early Bird availability
        if (earlyBirdTicket) {
            const hasAvailability = earlyBirdTicket.available === undefined || earlyBirdTicket.available > 0;
            if (hasAvailability) {
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

        // Fallback to first available on-sale ticket
        return onSaleTickets[0];
    };

    if (isLoading) return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto border-4 border-[#537547]/20 border-t-[#537547] rounded-full animate-spin" />
                <p className="text-gray-500 animate-pulse">กำลังโหลดข้อมูลงาน...</p>
            </div>
        </div>
    );
    if (isError || !event) return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center">
                    <X className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-700">ไม่พบข้อมูลงานประชุม</h2>
                <Link href="/events"><Button variant="outline" className="border-[#537547]/30 text-[#537547]">กลับหน้ารายการ</Button></Link>
            </div>
        </div>
    );

    const currentRound = event.rounds?.find((r: Round) => r.id === selectedRound) || event.rounds?.[0];
    const autoSelectedTicket = getAutoSelectedTicket();
    const nextSaleStart = !autoSelectedTicket ? getNextSaleStartDate() : null;
    const isSaleNotStarted = !autoSelectedTicket && !!nextSaleStart;

    // Detect "no tickets for your role" scenario
    const allPrimaryTickets = event.ticketTypes?.filter(t => t.ticketCategory !== 'addon') || [];
    const roleFilteredTickets = allPrimaryTickets.filter(t => isTicketAllowedForUser(t));
    const hasTicketsButNotForRole = !autoSelectedTicket && !isSaleNotStarted && allPrimaryTickets.length > 0 && roleFilteredTickets.length === 0;

    // Detect "all sold out" scenario
    const onSaleForRole = roleFilteredTickets.filter(t => isTicketOnSale(t));
    const allSoldOut = !autoSelectedTicket && !isSaleNotStarted && !hasTicketsButNotForRole && onSaleForRole.length > 0 && onSaleForRole.every(t => t.available !== undefined && t.available <= 0);

    // Get add-on tickets (only show add-ons that are within their sale period)
    const addonTickets = event.ticketTypes?.filter(t => t.ticketCategory === 'addon' && isTicketAllowedForUser(t) && isTicketOnSale(t)) || [];
    const selectedAddonTickets = event.ticketTypes?.filter(t => selectedAddons.includes(String(t.id))) || [];
    const addonsTotal = selectedAddonTickets.reduce((sum, t) => sum + Number(t.price || 0), 0);
    const basePrice = Number(autoSelectedTicket?.price || 0);
    const totalPrice = getDiscountedPrice(basePrice) + addonsTotal;

    return (
        <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
            <Navbar />

            {/* Hero Section - Responsive */}
            <section className="relative h-[50vh] sm:h-[55vh] md:h-[65vh] min-h-[400px] md:min-h-[520px] w-full bg-black">
                <div className="absolute inset-0 overflow-hidden">
                    {event.videoUrl ? (
                        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            <video src={event.videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover scale-105" />
                        </div>
                    ) : (
                        <img src={event.imageUrl || event.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop'} alt={event.name} className="w-full h-full object-cover scale-105 transition-transform duration-[20s] hover:scale-110" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 pointer-events-none" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-12 z-20">
                    <div className="container mx-auto max-w-7xl">
                        <Link href="/events" className={`inline-flex items-center text-white/90 hover:text-white mb-3 sm:mb-4 md:mb-6 transition-colors text-sm sm:text-base scroll-animate fade-up drop-shadow-md ${mounted ? 'is-visible' : ''}`}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> กลับไปหน้ารายการ
                        </Link>

                        {/* Badges */}
                        <div className={`flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4 scroll-animate fade-up stagger-1 ${mounted ? 'is-visible' : ''}`}>
                            <span className="bg-white/15 text-white border border-white/30 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold backdrop-blur-xl shadow-lg drop-shadow-md">
                                {event.eventType === 'single_room' ? '✦ Single Session' : '✦ Multi Sessions'}
                            </span>
                            {event.cpeCredits && Number(event.cpeCredits) > 0 && (
                                <span className="bg-[#537547]/60 text-white border border-[#537547]/70 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold backdrop-blur-xl shadow-lg drop-shadow-md">
                                    <Award className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                                    {event.cpeCredits} CPE Credits
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 leading-tight max-w-4xl text-white drop-shadow-lg [text-shadow:_0_2px_10px_rgba(0,0,0,0.5)] scroll-animate fade-up stagger-2 ${mounted ? 'is-visible' : ''}`}>
                            {event.name}
                        </h1>

                        {/* Meta Info */}
                        <div className={`flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 md:gap-6 text-white text-sm sm:text-base scroll-animate fade-up stagger-3 drop-shadow-md ${mounted ? 'is-visible' : ''}`}>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
                                <span className="truncate">
                                    {currentRound?.date
                                        ? new Date(currentRound.date).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                                        : event.startDate
                                            ? new Date(event.startDate).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                                            : 'TBA'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
                                <span className="truncate">{currentRound?.location || event.location || 'TBA'}</span>
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

                        {/* Tickets */}
                        <div className="bg-[#537547]/10 border border-[#537547]/20 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#537547]/10 flex items-center justify-center flex-shrink-0">
                                    <Ticket className="w-5 h-5 text-[#537547]" />
                                </div>
                                <div>
                                    <div className="text-xs text-[#537547]">ที่นั่งเหลือ</div>
                                    <div className="text-xl font-bold text-gray-900">
                                        {currentRound?.capacity
                                            ? currentRound.capacity - (currentRound.registered || 0)
                                            : event.maxCapacity
                                                ? event.maxCapacity - (event.registeredCount || 0)
                                                : 0}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Grid Layout */}
                <div className="grid lg:grid-cols-3 gap-6 lg:gap-10">
                    {/* Left Column: Content */}
                    <div className="lg:col-span-2 space-y-6 sm:space-y-8 md:space-y-10">

                        {/* About Section */}
                        <section ref={aboutRef} className={`relative bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 md:p-9 shadow-sm overflow-hidden scroll-animate fade-up ${aboutVisible ? 'is-visible' : ''}`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#537547]/5 to-transparent rounded-bl-full" />
                            <h2 className="text-xl sm:text-2xl font-bold mb-5 text-[#6f7e0d] flex items-center gap-2">
                                รายละเอียดงาน
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600 leading-[1.85] whitespace-pre-line relative z-10">
                                {event.description}
                            </p>

                            {event.documents && event.documents.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-gray-100 relative z-10">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        เอกสารประกอบ
                                    </h3>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {event.documents.map((doc, idx) => (
                                            <a
                                                key={idx}
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-[#537547]/5 hover:border-[#537547]/30 transition-all group"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-[#537547] group-hover:border-[#537547]/30 shadow-sm transition-colors flex-shrink-0">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">
                                                    {doc.name}
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Sessions Section */}
                        {event.sessions && event.sessions.length > 0 && (
                            <section ref={sessionsRef} className={`relative bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 md:p-9 shadow-sm overflow-hidden scroll-animate fade-up ${sessionsVisible ? 'is-visible' : ''}`}>
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#537547] via-[#6f7e0d] to-[#537547]/30" />
                                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-[#6f7e0d] mb-5">
                                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#537547]" />
                                    กำหนดการ Sessions
                                </h2>
                                <div className="space-y-3">
                                    {event.sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden transition-all duration-200"
                                        >
                                            <button
                                                onClick={() => toggleSessionAccordion(String(session.id))}
                                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100/50 transition-colors"
                                            >
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <span className="px-2 py-0.5 bg-[#537547]/10 text-[#537547] rounded text-xs font-medium">
                                                            {session.sessionCode}
                                                        </span>
                                                        <h3 className="font-semibold text-gray-900">{session.sessionName}</h3>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <span className="px-2 py-1 bg-gray-200/60 rounded text-xs text-gray-600 font-medium whitespace-nowrap hidden sm:inline-block">
                                                        {session.maxCapacity} seats
                                                    </span>
                                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#537547] hover:border-[#537547] transition-colors">
                                                        {expandedSessions.includes(String(session.id)) ? (
                                                            <ChevronUp className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                </div>
                                            </button>

                                            <div
                                                className={cn(
                                                    "grid transition-all duration-200 ease-in-out",
                                                    expandedSessions.includes(String(session.id)) ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                                )}
                                            >
                                                <div className="overflow-hidden">
                                                    <div className="p-4 pt-0 border-t border-gray-100/60 bg-white">
                                                        {session.description && (
                                                            <p className="text-sm text-gray-600 mb-4 mt-3 leading-relaxed">
                                                                {session.description}
                                                            </p>
                                                        )}
                                                        <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 bg-gray-50/50 rounded-lg p-3 border border-gray-100">
                                                            <span className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4 text-[#537547]" />
                                                                <span className="font-medium">
                                                                    {session.startTime ? new Date(session.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'TBA'}
                                                                    {' - '}
                                                                    {session.endTime ? new Date(session.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'TBA'}
                                                                </span>
                                                            </span>
                                                            {session.room && (
                                                                <span className="flex items-center gap-2">
                                                                    <MapPin className="w-4 h-4 text-[#537547]" />
                                                                    <span className="font-medium">{session.room}</span>
                                                                </span>
                                                            )}
                                                            {session.speakers && (
                                                                <span className="flex items-center gap-2">
                                                                    <Users className="w-4 h-4 text-[#537547]" />
                                                                    <span className="font-medium">{session.speakers}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Gallery Section */}
                        {event.images && event.images.length > 0 && (
                            <section ref={galleryRef} className={`relative bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden scroll-animate fade-up ${galleryVisible ? 'is-visible' : ''}`}>
                                <div className="p-5 sm:p-7 md:p-9 pb-0 sm:pb-0 md:pb-0">
                                    <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-7 flex items-center gap-2 text-[#6f7e0d]">
                                        <Images className="w-5 h-5 sm:w-6 sm:h-6 text-[#537547]" />
                                        แกลเลอรี่
                                        <span className="text-sm font-normal text-gray-400 ml-1">({event.images.length} รูป)</span>
                                    </h2>
                                </div>

                                {/* Airbnb-style Gallery Grid */}
                                <div className="px-5 sm:px-7 md:px-9 pb-5 sm:pb-7 md:pb-9">
                                    <div className="grid grid-cols-1 sm:grid-cols-4 sm:grid-rows-2 gap-2 sm:gap-3 h-56 sm:h-[340px] md:h-[400px] rounded-xl overflow-hidden">
                                        {/* Hero Image - Full width on mobile, Left half on Desktop */}
                                        <button
                                            onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
                                            className="col-span-1 sm:col-span-2 sm:row-span-2 relative group cursor-pointer overflow-hidden leading-0 block w-full h-full"
                                        >
                                            <img
                                                src={event.images[0]?.imageUrl || 'https://placehold.co/600x400?text=Photo'}
                                                alt={event.images[0]?.caption || 'Gallery photo 1'}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            {/* Photo count badge (Mobile only since thumbnails are hidden) */}
                                            <div className="absolute bottom-3 right-3 sm:hidden px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg flex items-center gap-1.5 text-white shadow-lg border border-white/20">
                                                <Images className="w-4 h-4" />
                                                <span className="text-xs font-semibold">1 / {event.images.length}</span>
                                            </div>
                                        </button>

                                        {/* Right side - 4 smaller images in 2x2 grid (Hidden on mobile) */}
                                        {event.images.slice(1, 5).map((img, idx) => {
                                            const actualIdx = idx + 1;
                                            const isLast = actualIdx === 4;
                                            const remaining = event.images!.length - 5;
                                            return (
                                                <button
                                                    key={img.id}
                                                    onClick={() => { setLightboxIndex(actualIdx); setLightboxOpen(true); }}
                                                    className="hidden sm:block relative group cursor-pointer overflow-hidden leading-0 w-full h-full"
                                                >
                                                    <img
                                                        src={img.imageUrl || 'https://placehold.co/600x400?text=Photo'}
                                                        alt={img.caption || `Photo ${actualIdx + 1}`}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                                    {/* "+N more" overlay on last visible thumbnail */}
                                                    {isLast && remaining > 0 && (
                                                        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors flex flex-col items-center justify-center gap-1">
                                                            <Images className="w-6 h-6 text-white/80" />
                                                            <span className="text-white text-lg sm:text-xl font-bold">+{remaining}</span>
                                                            <span className="text-white/70 text-xs">ดูเพิ่มเติม</span>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}

                                        {/* Fill empty slots if less than 5 images */}
                                        {event.images.length < 5 && Array.from({ length: 4 - (event.images.length - 1) }).map((_, i) => (
                                            <div key={`empty-${i}`} className="hidden sm:block bg-gray-100 w-full h-full" />
                                        ))}
                                    </div>

                                    {/* "View all photos" button */}
                                    {event.images.length > 1 && (
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
                                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow"
                                            >
                                                <Images className="w-4 h-4" />
                                                ดูรูปทั้งหมด ({event.images.length})
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Venue Section */}
                        <section ref={venueRef} className={`relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm scroll-animate fade-up ${venueVisible ? 'is-visible' : ''}`}>
                            <div className="p-5 sm:p-7 md:p-9">
                                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-7 flex items-center gap-2 text-[#6f7e0d]">
                                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#537547]" />
                                    สถานที่จัดงาน
                                </h2>

                                <div className="space-y-5">
                                    {/* Location Name & Details */}
                                    <div className="flex flex-col space-y-3 sm:space-y-4">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{currentRound?.location || event.location || 'TBA'}</h3>
                                        <div className="flex flex-wrap gap-3 sm:gap-4">
                                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                                                <div className="w-5 h-5 rounded-full bg-[#537547]/10 flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle className="w-3 h-3 text-[#537547]" />
                                                </div>
                                                <span>เดินทางสะดวกด้วยรถไฟฟ้า</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                                                <div className="w-5 h-5 rounded-full bg-[#537547]/10 flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle className="w-3 h-3 text-[#537547]" />
                                                </div>
                                                <span>มีที่จอดรถ</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                                                <div className="w-5 h-5 rounded-full bg-[#537547]/10 flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle className="w-3 h-3 text-[#537547]" />
                                                </div>
                                                <span>Wi-Fi ฟรี</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Google Maps Embed */}
                                    {(currentRound?.mapUrl || event.mapUrl) ? (
                                        <div className="w-full h-64 sm:h-72 md:h-80 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-inner">
                                            {(currentRound?.mapUrl || event.mapUrl || '').trim().startsWith('<iframe') ? (
                                                <div
                                                    className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
                                                    dangerouslySetInnerHTML={{ __html: currentRound?.mapUrl || event.mapUrl || '' }}
                                                />
                                            ) : (
                                                <iframe
                                                    src={currentRound?.mapUrl || event.mapUrl}
                                                    width="100%"
                                                    height="100%"
                                                    style={{ border: 0 }}
                                                    allowFullScreen={true}
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    className="w-full h-full"
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="w-full border-gray-300 hover:bg-gray-100 text-gray-700 text-sm sm:text-base"
                                            asChild
                                        >
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentRound?.location || event.location || '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <MapPin className="w-4 h-4 mr-2" />
                                                ดูแผนที่บน Google Maps
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Event Attachments */}
                            {event.attachments && event.attachments.length > 0 && (
                                <div className="mx-5 sm:mx-7 md:mx-9 mb-5 sm:mb-7 md:mb-9 pt-6 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-[#537547]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        เอกสารประกอบ
                                    </h3>
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
                                <h2 className="text-xl sm:text-2xl font-bold mb-5 flex items-center gap-2 text-[#6f7e0d]">
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
                            {event.startDate && (
                                <CountdownTimer targetDate={event.startDate} />
                            )}

                            {/* CPE Credits Badge */}
                            <div className="bg-gradient-to-br from-[#537547]/15 to-[#6f7e0d]/10 border border-[#537547]/20 rounded-2xl p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#537547]/20 to-[#537547]/10 flex items-center justify-center shadow-sm">
                                        <Award className="w-7 h-7 text-[#537547]" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-[#537547] font-medium">CPE Credits</div>
                                        <div className="text-3xl font-bold text-gray-900">{event.cpeCredits} <span className="text-lg font-normal text-gray-500">หน่วยกิต</span></div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-[#537547]" />
                                    Certified by the Pharmacy Council of Thailand
                                </p>
                            </div>

                            {/* Ticket Availability */}
                            <div className="bg-gradient-to-br from-[#537547]/15 to-[#6f7e0d]/10 border border-[#537547]/20 rounded-2xl p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#537547]/20 to-[#537547]/10 flex items-center justify-center shadow-sm">
                                        <Ticket className="w-7 h-7 text-[#537547]" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-[#537547] font-medium">ที่นั่งเหลือ</div>
                                        <div className="text-3xl font-bold text-gray-900">
                                            {currentRound?.capacity ? currentRound.capacity - (currentRound.registered || 0) : event.maxCapacity ? event.maxCapacity - (event.registeredCount || 0) : 0}
                                            <span className="text-lg font-normal text-gray-500"> / {currentRound?.capacity || event.maxCapacity || 0}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Progress bar */}
                                <div className="mt-4">
                                    <div className="h-2.5 bg-white/50 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#537547] to-[#6f7e0d] rounded-full transition-all duration-1000 ease-out"
                                            style={{
                                                width: `${currentRound?.capacity
                                                    ? ((currentRound.registered || 0) / currentRound.capacity) * 100
                                                    : event.maxCapacity
                                                        ? ((event.registeredCount || 0) / event.maxCapacity) * 100
                                                        : 0
                                                    }%`
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 font-medium">
                                        {currentRound?.capacity
                                            ? Math.round(((currentRound.registered || 0) / currentRound.capacity) * 100)
                                            : event.maxCapacity
                                                ? Math.round(((event.registeredCount || 0) / event.maxCapacity) * 100)
                                                : 0}% sold
                                    </p>
                                </div>
                            </div>

                            {/* Booking Card */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#537547] via-[#6f7e0d] to-[#537547]/30" />
                                <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                                    <Ticket className="w-5 h-5 text-[#537547]" />
                                    Booking Summary
                                </h3>

                                <div className="space-y-4 mb-6">
                                    {/* User Role Badge */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">สถานะของคุณ:</span>
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-xs font-medium",
                                            getUserRoleBadgeColor(userRole)
                                        )}>
                                            {getUserRoleLabel(userRole)}
                                        </span>
                                    </div>

                                    {/* Sale Not Started Notice */}
                                    {isSaleNotStarted && nextSaleStart && (
                                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4 text-amber-600" />
                                                <span className="text-sm font-semibold text-amber-700">ยังไม่เปิดจำหน่ายตั๋ว</span>
                                            </div>
                                            <p className="text-xs text-amber-600">
                                                เปิดจำหน่าย: {nextSaleStart.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} เวลา {nextSaleStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                            </p>
                                        </div>
                                    )}

                                    {/* No Tickets for User's Role Notice */}
                                    {hasTicketsButNotForRole && (
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-semibold text-blue-700">ยังไม่มีตั๋วสำหรับคุณ</span>
                                            </div>
                                            <p className="text-xs text-blue-600">
                                                ระบบยังไม่เปิดจำหน่ายตั๋วสำหรับคุณ กรุณาติดต่อผู้จัดงานเพื่อสอบถามรายละเอียด
                                            </p>
                                        </div>
                                    )}

                                    {/* All Sold Out Notice */}
                                    {allSoldOut && (
                                        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Ticket className="w-4 h-4 text-red-500" />
                                                <span className="text-sm font-semibold text-red-600">ตั๋วหมดแล้ว</span>
                                            </div>
                                            <p className="text-xs text-red-500">
                                                ตั๋วทุกประเภทสำหรับสถานะของคุณถูกจำหน่ายหมดแล้ว
                                            </p>
                                        </div>
                                    )}

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
                                                    {promoApplied && getDiscountedPrice(Number(autoSelectedTicket.price)) < Number(autoSelectedTicket.price) ? (
                                                        <>
                                                            <span className="text-gray-500 line-through text-sm block">
                                                                ฿{Math.round(Number(autoSelectedTicket.price)).toLocaleString()}
                                                            </span>
                                                            <span className="text-2xl font-bold text-[#537547]">
                                                                ฿{Math.round(getDiscountedPrice(Number(autoSelectedTicket.price))).toLocaleString()}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-2xl font-bold text-[#537547]">
                                                            ฿{Math.round(Number(autoSelectedTicket.price)).toLocaleString()}
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
                                                    const isSoldOut = addon.available !== undefined && addon.available <= 0;
                                                    return (
                                                        <button
                                                            key={addon.id}
                                                            onClick={() => !isSoldOut && toggleAddon(String(addon.id))}
                                                            disabled={isSoldOut}
                                                            className={cn(
                                                                "w-full p-3 rounded-lg border text-left transition-all",
                                                                isSoldOut ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200" :
                                                                    isSelected ? "bg-[#537547]/10 border-[#537547]" :
                                                                        "bg-white border-gray-200 hover:border-[#537547]/50"
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
                                                                <span className="text-[#537547] font-bold">+฿{Math.round(Number(addon.price)).toLocaleString()}</span>
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
                                                            <span className="text-[#537547]">฿{Math.round(Number(addon.price)).toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-900">รวมทั้งหมด</span>
                                                <span className="text-2xl font-bold text-[#537547]">
                                                    ฿{Math.round(totalPrice).toLocaleString()}
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
                                ) : hasTicketsButNotForRole ? (
                                    <Button disabled className="w-full h-14 text-lg font-bold bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed">
                                        ยังไม่มีตั๋วสำหรับคุณ
                                    </Button>
                                ) : allSoldOut ? (
                                    <Button disabled className="w-full h-14 text-lg font-bold bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed">
                                        ตั๋วหมดแล้ว
                                    </Button>
                                ) : (
                                    <Link
                                        href={`/checkout/${event.id}?ticket=${autoSelectedTicket?.id || ''}${selectedSessions.length > 0 ? `&sessions=${selectedSessions.join(',')}` : ''}${selectedAddons.length > 0 ? `&addons=${selectedAddons.join(',')}` : ''}${promoApplied ? `&promo=${promoCode}` : ''}`}
                                        className="block"
                                    >
                                        <Button className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#537547] to-[#456339] hover:from-[#456339] hover:to-[#3a5430] text-white shadow-lg rounded-xl transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]">
                                            จองตั๋วเลย
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

                            <div className="bg-gradient-to-br from-[#537547]/15 to-[#6f7e0d]/10 border border-[#537547]/20 rounded-2xl p-6 hover:shadow-md transition-shadow">
                                <h4 className="font-bold text-[#537547] mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    ต้องการความช่วยเหลือ?
                                </h4>
                                <p className="text-sm text-gray-500 mb-4">ติดต่อทีมงานสำหรับการจองกลุ่มหรือคำถามเพิ่มเติม</p>
                                <Link href="/contact">
                                    <Button variant="link" className="text-[#537547] p-0 h-auto font-semibold hover:text-[#456339]">ติดต่อเรา &rarr;</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Sticky Bottom Bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-gray-200/80 p-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
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
                                <Button
                                    disabled
                                    className="flex-1 max-w-[200px] bg-gray-300 text-gray-500 h-12 font-bold rounded-xl cursor-not-allowed"
                                >
                                    ยังไม่เปิดจำหน่าย
                                </Button>
                            </>
                        ) : hasTicketsButNotForRole ? (
                            <>
                                <div>
                                    <div className="text-xs text-blue-600">ยังไม่มีตั๋วสำหรับคุณ</div>
                                </div>
                                <Button
                                    disabled
                                    className="flex-1 max-w-[200px] bg-gray-300 text-gray-500 h-12 font-bold rounded-xl cursor-not-allowed text-sm"
                                >
                                    ยังไม่มีตั๋ว
                                </Button>
                            </>
                        ) : allSoldOut ? (
                            <>
                                <div>
                                    <div className="text-xs text-red-500">ตั๋วหมดแล้ว</div>
                                </div>
                                <Button
                                    disabled
                                    className="flex-1 max-w-[200px] bg-gray-300 text-gray-500 h-12 font-bold rounded-xl cursor-not-allowed"
                                >
                                    ตั๋วหมดแล้ว
                                </Button>
                            </>
                        ) : (
                            <>
                                <div>
                                    <div className="text-xs text-gray-500">รวมทั้งหมด</div>
                                    <div className="text-xl font-bold text-[#537547]">
                                        ฿{Math.round(totalPrice).toLocaleString()}
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setMobileBookingOpen(true)}
                                    className="flex-1 max-w-[200px] bg-gradient-to-r from-[#537547] to-[#456339] hover:from-[#456339] hover:to-[#3a5430] text-white h-12 font-bold rounded-xl transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                                >
                                    เลือกตั๋ว & จอง
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Booking Drawer (Slide over) */}
                {mobileBookingOpen && (
                    <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                            onClick={() => setMobileBookingOpen(false)}
                        />

                        {/* Drawer Content */}
                        <div className="relative w-full bg-white rounded-t-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-slide-up">
                            {/* Drawer Handle */}
                            <div className="w-full flex justify-center pt-3 pb-1" onClick={() => setMobileBookingOpen(false)}>
                                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                            </div>

                            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Ticket className="w-5 h-5 text-[#537547]" />
                                    รายละเอียดการจอง
                                </h3>
                                <button
                                    onClick={() => setMobileBookingOpen(false)}
                                    className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-4">
                                <div className="space-y-4 mb-6">
                                    {/* No Tickets for User's Role Notice (Mobile Drawer) */}
                                    {hasTicketsButNotForRole && (
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-semibold text-blue-700">ยังไม่มีตั๋วสำหรับคุณ</span>
                                            </div>
                                            <p className="text-xs text-blue-600">
                                                ระบบยังไม่เปิดจำหน่ายตั๋วสำหรับคุณ กรุณาติดต่อผู้จัดงานเพื่อสอบถามรายละเอียด
                                            </p>
                                        </div>
                                    )}

                                    {/* All Sold Out Notice (Mobile Drawer) */}
                                    {allSoldOut && (
                                        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Ticket className="w-4 h-4 text-red-500" />
                                                <span className="text-sm font-semibold text-red-600">ตั๋วหมดแล้ว</span>
                                            </div>
                                            <p className="text-xs text-red-500">
                                                ตั๋วทุกประเภทสำหรับสถานะของคุณถูกจำหน่ายหมดแล้ว
                                            </p>
                                        </div>
                                    )}

                                    {/* Auto-Detected Ticket */}
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
                                                    {promoApplied && getDiscountedPrice(Number(autoSelectedTicket.price)) < Number(autoSelectedTicket.price) ? (
                                                        <>
                                                            <span className="text-gray-500 line-through text-sm block">
                                                                ฿{Math.round(Number(autoSelectedTicket.price)).toLocaleString()}
                                                            </span>
                                                            <span className="text-2xl font-bold text-[#537547]">
                                                                ฿{Math.round(getDiscountedPrice(Number(autoSelectedTicket.price))).toLocaleString()}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-2xl font-bold text-[#537547]">
                                                            ฿{Math.round(Number(autoSelectedTicket.price)).toLocaleString()}
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
                                                    const isSoldOut = addon.available !== undefined && addon.available <= 0;
                                                    return (
                                                        <button
                                                            key={addon.id}
                                                            onClick={() => !isSoldOut && toggleAddon(String(addon.id))}
                                                            disabled={isSoldOut}
                                                            className={cn(
                                                                "w-full p-3 rounded-lg border text-left transition-all",
                                                                isSoldOut ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200" :
                                                                    isSelected ? "bg-[#537547]/10 border-[#537547]" :
                                                                        "bg-white border-gray-200 hover:border-[#537547]/50"
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
                                                                    </div>
                                                                </div>
                                                                <span className="text-[#537547] font-bold">+฿{Math.round(Number(addon.price)).toLocaleString()}</span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Total Price Summary */}
                                    {(autoSelectedTicket || selectedAddonTickets.length > 0) && (
                                        <div className="bg-[#537547]/10 p-4 rounded-xl border border-[#537547]/20 mt-4">
                                            {selectedAddonTickets.length > 0 && (
                                                <div className="mb-2 pb-2 border-b border-[#537547]/20 space-y-1">
                                                    {selectedAddonTickets.map(addon => (
                                                        <div key={addon.id} className="flex justify-between text-sm">
                                                            <span className="text-[#537547]">+ {addon.name}</span>
                                                            <span className="text-[#537547]">฿{Math.round(Number(addon.price)).toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-900">รวมทั้งหมด</span>
                                                <span className="text-2xl font-bold text-[#537547]">
                                                    ฿{Math.round(totalPrice).toLocaleString()}
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
                                                    <button onClick={clearPromo} className="text-red-400 hover:text-red-300 text-sm">
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
                                        {promoError && <p className="text-red-400 text-xs mt-2">{promoError}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Actions inside Drawer */}
                            <div className="p-4 border-t border-gray-200 bg-gray-50">
                                {isSaleNotStarted ? (
                                    <Button disabled className="w-full h-14 text-lg font-bold bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed">
                                        ยังไม่เปิดจำหน่าย
                                    </Button>
                                ) : hasTicketsButNotForRole ? (
                                    <Button disabled className="w-full h-14 text-lg font-bold bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed">
                                        ยังไม่มีตั๋วสำหรับคุณ
                                    </Button>
                                ) : allSoldOut ? (
                                    <Button disabled className="w-full h-14 text-lg font-bold bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed">
                                        ตั๋วหมดแล้ว
                                    </Button>
                                ) : (
                                    <Link
                                        href={`/checkout/${event.id}?ticket=${autoSelectedTicket?.id || ''}${selectedSessions.length > 0 ? `&sessions=${selectedSessions.join(',')}` : ''}${selectedAddons.length > 0 ? `&addons=${selectedAddons.join(',')}` : ''}${promoApplied ? `&promo=${promoCode}` : ''}`}
                                        className="block"
                                        onClick={() => setMobileBookingOpen(false)}
                                    >
                                        <Button className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#537547] to-[#456339] hover:from-[#456339] hover:to-[#3a5430] text-white shadow-lg rounded-xl transition-all active:scale-[0.98]">
                                            ยืนยันการจองตั๋ว
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}

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
                            src={event.images[lightboxIndex].imageUrl || 'https://placehold.co/1200x800?text=Venue+Photo'}
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
                                    <img src={img.imageUrl || 'https://placehold.co/1200x800?text=Venue+Photo'} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
