'use client';

import { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { getEvents } from '@/lib/services';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Clock, ArrowRight, Send, Search, Filter, X, Award } from 'lucide-react';
import Link from 'next/link';
import { Event } from '@/types';

export default function EventsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 4; // จำนวน Event ต่อหน้า

    const { data: events, isLoading } = useQuery({
        queryKey: ['events'],
        queryFn: getEvents,
    });

    // Get unique categories
    const categories = useMemo(() => {
        if (!events) return [];
        const cats = events.map((e: Event) => e.category).filter((c): c is string => !!c);
        return ['all', ...Array.from(new Set(cats))];
    }, [events]);

    // Filter events based on search and category
    const filteredEvents = useMemo(() => {
        if (!events) return [];
        return events.filter((event: Event) => {
            const searchLower = searchQuery.toLowerCase();
            const eventTitle = event.title || event.name || '';
            const eventDesc = event.description || '';

            const matchesSearch =
                eventTitle.toLowerCase().includes(searchLower) ||
                eventDesc.toLowerCase().includes(searchLower) ||
                event.rounds?.some((r) => r.location?.toLowerCase().includes(searchLower));

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
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            {/* Header Section */}
            <section className="relative pt-40 pb-20 bg-black/40 overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute top-0 left-10 w-64 h-64 bg-emerald-600/20 blur-[100px] rounded-full"></div>
                    <div className="absolute bottom-0 right-10 w-96 h-96 bg-green-600/20 blur-[120px] rounded-full"></div>
                    {/* Wave lines */}
                    <div className="absolute top-10 left-0 opacity-20">
                        <svg width="300" height="100" viewBox="0 0 300 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 50 C 50 20, 100 80, 150 50 S 250 20, 300 50" stroke="url(#gradient)" strokeWidth="2" />
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0">
                                    <stop stopColor="#9333ea" />
                                    <stop offset="1" stopColor="#db2777" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                <div className="container mx-auto text-center px-4">
                    <h1 className="text-5xl font-bold mb-4">ค้นหาการประชุม</h1>
                    <div className="flex justify-center items-center gap-2 text-gray-400 text-sm font-medium uppercase tracking-wider">
                        <Link href="/" className="hover:text-emerald-400">Home</Link>
                        <span>&gt;</span>
                        <span className="text-white">Event</span>
                    </div>
                </div>
            </section>

            {/* Search & Filter Section */}
            <section className="py-8 px-4 md:px-6 border-b border-white/10">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อการประชุม, สถานที่..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full h-12 pl-12 pr-10 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => handleSearch('')}
                                    className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
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
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                                        }`}
                                >
                                    {cat === 'all' ? 'ทั้งหมด' : cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="mt-4 text-sm text-gray-500">
                        พบ <span className="text-emerald-400 font-bold">{filteredEvents.length}</span> รายการ
                        {searchQuery && <span className="ml-1">สำหรับ "{searchQuery}"</span>}
                    </div>
                </div>
            </section>

            {/* Event List Section */}
            <section className="py-12 px-4 md:px-6 flex-grow">
                <div className="container mx-auto max-w-5xl">
                    <div className="mb-8">
                        <span className="text-emerald-400 font-bold text-sm tracking-wider uppercase mb-2 block">Event Schedule</span>
                        <h2 className="text-3xl font-bold">รายการการประชุม</h2>
                    </div>

                    <div className="space-y-6">
                        {isLoading ? (
                            <div className="text-center py-20">กำลังโหลด...</div>
                        ) : filteredEvents.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="text-gray-500 text-lg mb-2">ไม่พบการประชุมที่ค้นหา</div>
                                <button
                                    onClick={() => { handleSearch(''); handleCategoryChange('all'); }}
                                    className="text-emerald-400 hover:text-emerald-300"
                                >
                                    ล้างการค้นหา
                                </button>
                            </div>
                        ) : paginatedEvents.map((event: Event) => (
                            <div key={event.id} className="group bg-white/5 border border-white/5 rounded-2xl p-6 md:p-8 hover:border-emerald-500/50 transition-all duration-300">
                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    {/* Thumbnail */}
                                    <div className="w-full md:w-64 h-48 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 relative">
                                        <img src={event.coverImage} alt={event.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/10">
                                            {event.eventType === 'single' ? 'Single Session' : 'Conference'}
                                        </div>
                                        {/* CPE Credits badge */}
                                        <div className="absolute top-3 right-3 bg-green-600/80 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1">
                                            <Award className="w-3 h-3" />
                                            {event.cpeCredits} CPE
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-4 text-center md:text-left">
                                        <div>
                                            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-2">
                                                <span className="text-xs px-2 py-1 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-500/20">
                                                    {event.category}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">{event.name}</h3>
                                            <p className="text-gray-400 text-sm line-clamp-2 md:line-clamp-none">{event.description}</p>
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-sm text-gray-300 justify-center md:justify-start">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-emerald-400">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-xs text-gray-500">Time</div>
                                                    <div>{event.rounds?.[0]?.time || 'TBA'}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-green-400">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-xs text-gray-500">Date</div>
                                                    <div>{event.rounds?.[0]?.date ? new Date(event.rounds[0].date).toLocaleDateString() : 'TBA'}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-blue-400">
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-xs text-gray-500">Location</div>
                                                    <div>{event.rounds?.[0]?.location || 'TBA'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="flex-shrink-0">
                                        <Link href={`/events/${event.id}`}>
                                            <Button className="h-12 px-8 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-900/20 group-hover:shadow-emerald-900/40 transition-all">
                                                Buy Ticket <ArrowRight className="ml-2 w-4 h-4" />
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
                                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                                                className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === page
                                                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    } else if (
                                        page === currentPage - 2 ||
                                        page === currentPage + 2
                                    ) {
                                        return <span key={page} className="px-1 text-gray-500">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
            <section className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-900 py-20 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
                        Get Latest Updates Subscribe <br />
                        To Our Newsletter
                    </h2>

                    <div className="max-w-xl mx-auto relative">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full h-14 pl-6 pr-32 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                        <button className="absolute right-1 top-1 h-12 w-12 rounded-full bg-white text-emerald-900 flex items-center justify-center hover:bg-gray-100 transition-colors">
                            <Send className="w-5 h-5 ml-1" />
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
