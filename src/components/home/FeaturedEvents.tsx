'use client';

import Link from 'next/link';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Event } from '@/types';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

interface FeaturedEventsProps {
    events: Event[];
}

export function FeaturedEvents({ events }: FeaturedEventsProps) {
    const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
    const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation({ rootMargin: '0px 0px -30px 0px' });

    return (
        <section className="py-20 px-6">
            <div className="container mx-auto">
                <div
                    ref={headerRef}
                    className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4 scroll-animate fade-up ${headerVisible ? 'is-visible' : ''}`}
                >
                    <div>
                        <span className="text-[#537547] text-sm font-bold uppercase tracking-wider">งานที่กำลังจะมาถึง</span>
                        <h2 className="text-3xl md:text-4xl font-bold mt-2 text-[#6f7e0d]">งานประชุมวิชาการ</h2>
                    </div>
                    <Link href="/events">
                        <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-transform hover:scale-105">
                            ดูทั้งหมด <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>

                <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {events.length > 0 ? (
                        events.map((event, index) => (
                            <Link href={`/events/${event.id}`} key={event.id}>
                                <div
                                    className={`group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-[#537547]/50 transition-all hover:-translate-y-2 shadow-sm hover:shadow-xl scroll-animate fade-up stagger-${index + 1} ${cardsVisible ? 'is-visible' : ''}`}
                                >
                                    <div className="aspect-video relative overflow-hidden">
                                        <img
                                            src={
                                                event.imageUrl ||
                                                event.coverImage ||
                                                event.image ||
                                                `https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=800&auto=format&fit=crop`
                                            }
                                            alt={event.name || event.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        {event.cpeCredits && Number(event.cpeCredits) > 0 && (
                                            <div className="absolute top-3 right-3 bg-[#537547] text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                                                {event.cpeCredits} CPE
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-lg font-bold mb-2 text-[#6f7e0d] group-hover:text-[#537547] transition-colors line-clamp-2">
                                            {event.name || event.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(event.startDate || event.date || '').toLocaleDateString('th-TH', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {event.venue || event.location || 'TBA'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        // Placeholder cards
                        [1, 2, 3].map((i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="aspect-video bg-gray-100 animate-pulse" />
                                <div className="p-5 space-y-3">
                                    <div className="h-6 bg-gray-100 rounded animate-pulse" />
                                    <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
