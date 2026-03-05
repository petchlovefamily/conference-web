'use client';

import { useState, useMemo, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { eventsApi, type ApiEvent } from '@/lib/api/events';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Clock, ArrowRight, Send, Search, Filter, X, Award } from 'lucide-react';
import Link from 'next/link';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

export default function EventsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [mounted, setMounted] = useState(false);
    const ITEMS_PER_PAGE = 4; // จำนวน Event ต่อหน้า

    const { ref: eventsRef, isVisible: eventsVisible } = useScrollAnimation({ rootMargin: '0px 0px -20px 0px' });
    const { ref: newsletterRef, isVisible: newsletterVisible } = useScrollAnimation();

    useEffect(() => {
        requestAnimationFrame(() => setMounted(true));
    }, []);

    const { data: events, isLoading } = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const res = await eventsApi.list();
            return res.events;
        },
    });

    // Get unique categories
    const categories = useMemo(() => {
        if (!events) return [];
        const cats = events.map((e: ApiEvent) => e.category).filter((c): c is string => !!c);
        return ['all', ...Array.from(new Set(cats))];
    }, [events]);

    // Filter events based on search and category
    const filteredEvents = useMemo(() => {
        if (!events) return [];
        return events.filter((event: ApiEvent) => {
            const searchLower = searchQuery.toLowerCase();
            const eventTitle = event.eventName || '';
            const eventDesc = event.description || '';
            const eventLocation = event.location || '';

            const matchesSearch =
                eventTitle.toLowerCase().includes(searchLower) ||
                eventDesc.toLowerCase().includes(searchLower) ||
                eventLocation.toLowerCase().includes(searchLower);

            const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [events, searchQuery, selectedCategory]);

    // Pagination
    const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
    const paginatedEvents = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredEvents, currentPage]);

    // Reset to page 1 when search or filter changes
    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const handleCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        setCurrentPage(1);
    };

    // Scroll to top when page changes
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col">
            <Navbar />

            {/* Header Section */}
            <section className="relative pt-40 pb-20 bg-gradient-to-br from-[#537547] via-[#456339] to-[#3d5733] overflow-hidden">
                {/* Animated background shapes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
                </div>

                <div className="container mx-auto text-center px-4 relative z-10">
                    <h1 className={`text-5xl font-bold mb-4 text-white scroll-animate fade-up ${mounted ? 'is-visible' : ''}`}>
                        ค้นหาการประชุม
                    </h1>
                    <div className={`flex justify-center items-center gap-2 text-white/60 text-sm font-medium uppercase tracking-wider scroll-animate fade-up stagger-1 ${mounted ? 'is-visible' : ''}`}>
                        <Link href="/" className="hover:text-white transition-colors">หน้าหลัก</Link>
                        <span>&gt;</span>
                        <span className="text-white">งานประชุม</span>
                    </div>
                </div>
            </section>

            {/* Search & Filter Section */}
            <section className={`py-8 px-4 md:px-6 border-b border-gray-200 scroll-animate fade-up stagger-2 ${mounted ? 'is-visible' : ''}`}>
                <div className="container mx-auto max-w-5xl">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อการประชุม, สถานที่..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full h-12 pl-12 pr-10 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#537547]/30 focus:border-[#537547] transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => handleSearch('')}
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-700 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-2 flex-wrap">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === cat
                                        ? 'bg-[#537547] text-white scale-105 shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 hover:scale-105'
                                        }`}
                                >
                                    {cat === 'all' ? 'ทั้งหมด' : cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="mt-4 text-sm text-gray-500">
                        พบ <span className="text-[#537547] font-bold">{filteredEvents.length}</span> รายการ
                        {searchQuery && <span className="ml-1">สำหรับ "{searchQuery}"</span>}
                    </div>
                </div>
            </section>

            {/* Event List Section */}
            <section className="py-12 px-4 md:px-6 flex-grow">
                <div className="container mx-auto max-w-5xl">
                    <div ref={eventsRef} className={`mb-8 scroll-animate fade-up ${eventsVisible ? 'is-visible' : ''}`}>
                        <span className="text-[#537547] font-bold text-sm tracking-wider uppercase mb-2 block">Event Schedule</span>
                        <h2 className="text-3xl font-bold text-[#6f7e0d]">รายการการประชุม</h2>
                    </div>

                    <div className="space-y-6">
                        {isLoading ? (
                            // Skeleton loading with pulse animation
                            <div className="space-y-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
                                        <div className="flex flex-col md:flex-row gap-8 items-center">
                                            <div className="w-full md:w-64 h-48 bg-gray-100 rounded-xl animate-pulse" />
                                            <div className="flex-1 space-y-4 w-full">
                                                <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
                                                <div className="h-7 bg-gray-100 rounded w-3/4 animate-pulse" />
                                                <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                                                <div className="flex gap-4">
                                                    <div className="h-8 bg-gray-100 rounded w-28 animate-pulse" />
                                                    <div className="h-8 bg-gray-100 rounded w-28 animate-pulse" />
                                                    <div className="h-8 bg-gray-100 rounded w-28 animate-pulse" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredEvents.length === 0 ? (
                            <div className="text-center py-20 scroll-animate fade-up is-visible">
                                <div className="text-gray-500 text-lg mb-2">ไม่พบการประชุมที่ค้นหา</div>
                                <button
                                    onClick={() => { handleSearch(''); handleCategoryChange('all'); }}
                                    className="text-[#537547] hover:text-[#456339] transition-colors"
                                >
                                    ล้างการค้นหา
                                </button>
                            </div>
                        ) : paginatedEvents.map((event: ApiEvent, index: number) => (
                            <div
                                key={event.id}
                                className={`group bg-white border border-gray-200 rounded-2xl p-6 md:p-8 hover:border-[#537547]/50 hover:shadow-xl transition-all duration-500 scroll-animate fade-up stagger-${index + 1} ${eventsVisible ? 'is-visible' : ''}`}
                                style={{ transitionProperty: 'border-color, box-shadow, transform' }}
                            >
                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    {/* Thumbnail */}
                                    <div className="w-full md:w-64 h-48 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                                        <img src={event.imageUrl || 'https://placehold.co/600x400?text=Event'} alt={event.eventName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/10">
                                            {event.eventType === 'single_room' ? 'Single Session' : 'Conference'}
                                        </div>
                                        {/* CPE Credits badge */}
                                        {event.cpeCredits && Number(event.cpeCredits) > 0 && (
                                            <div className="absolute top-3 right-3 bg-[#537547]/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1">
                                                <Award className="w-3 h-3" />
                                                {event.cpeCredits} CPE
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-4 text-center md:text-left">
                                        <div>
                                            {event.category && (
                                                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-2">
                                                    <span className="text-xs px-2 py-1 rounded-full bg-[#537547]/10 text-[#537547] border border-[#537547]/20">
                                                        {event.category}
                                                    </span>
                                                </div>
                                            )}
                                            <h3 className="text-2xl font-bold mb-2 text-gray-900 group-hover:text-[#537547] transition-colors duration-300">{event.eventName}</h3>
                                            <p className="text-gray-500 text-sm line-clamp-2 md:line-clamp-none">{event.description}</p>
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-sm text-gray-600 justify-center md:justify-start">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-[#537547]/10 flex items-center justify-center text-[#537547] group-hover:bg-[#537547]/20 transition-colors">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-xs text-gray-400">เวลา</div>
                                                    <div>{event.startDate ? new Date(event.startDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : 'TBA'}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-[#537547]/10 flex items-center justify-center text-[#537547] group-hover:bg-[#537547]/20 transition-colors">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-xs text-gray-400">วันที่</div>
                                                    <div>{event.startDate ? new Date(event.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-[#537547]/10 flex items-center justify-center text-[#537547] group-hover:bg-[#537547]/20 transition-colors">
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-xs text-gray-400">สถานที่</div>
                                                    <div>{event.location || 'TBA'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="flex-shrink-0">
                                        <Link href={`/events/${event.id}`}>
                                            <Button className="h-12 px-8 rounded-full bg-[#537547] hover:bg-[#456339] text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95">
                                                ลงทะเบียน <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-12">
                            {/* Previous Button */}
                            <button
                                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                            >
                                ก่อนหน้า
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    // Show first, last, current, and nearby pages
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${currentPage === page
                                                    ? 'bg-[#537547] text-white scale-110 shadow-md'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 hover:scale-105'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    } else if (
                                        page === currentPage - 2 ||
                                        page === currentPage + 2
                                    ) {
                                        return <span key={page} className="px-1 text-gray-400">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                            >
                                ถัดไป
                            </button>
                        </div>
                    )}

                    {/* Page Info */}
                    {filteredEvents.length > 0 && (
                        <div className="text-center mt-4 text-sm text-gray-500">
                            แสดง {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredEvents.length)} จาก {filteredEvents.length} รายการ
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter Section */}
            <section ref={newsletterRef} className="bg-gradient-to-br from-[#537547] via-[#456339] to-[#3d5733] py-20 px-6 relative overflow-hidden">
                {/* Animated background shapes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="absolute -bottom-16 -left-10 w-72 h-72 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
                </div>

                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <h2 className={`text-3xl md:text-5xl font-bold mb-6 text-white leading-tight scroll-animate fade-up ${newsletterVisible ? 'is-visible' : ''}`}>
                        รับข่าวสารล่าสุด<br />
                        สมัครรับจดหมายข่าว
                    </h2>

                    <div className={`max-w-xl mx-auto relative scroll-animate fade-up stagger-1 ${newsletterVisible ? 'is-visible' : ''}`}>
                        <input
                            type="email"
                            placeholder="กรอกอีเมลของคุณ"
                            className="w-full h-14 pl-6 pr-32 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        />
                        <button className="absolute right-1 top-1 h-12 w-12 rounded-full bg-white text-[#537547] flex items-center justify-center hover:bg-gray-100 transition-all hover:scale-110 active:scale-95">
                            <Send className="w-5 h-5 ml-1" />
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
