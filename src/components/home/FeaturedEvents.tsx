import Link from 'next/link';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Event } from '@/types';

interface FeaturedEventsProps {
    events: Event[];
}

export function FeaturedEvents({ events }: FeaturedEventsProps) {
    return (
        <section className="py-20 px-6">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                    <div>
                        <span className="text-emerald-400 text-sm font-bold uppercase tracking-wider">งานที่กำลังจะมาถึง</span>
                        <h2 className="text-3xl md:text-4xl font-bold mt-2">งานประชุมวิชาการ</h2>
                    </div>
                    <Link href="/events">
                        <Button variant="outline" className="border-white/20 hover:bg-white/5">
                            ดูทั้งหมด <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {events.length > 0 ? (
                        events.map((event) => (
                            <Link href={`/events/${event.id}`} key={event.id}>
                                <div className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all hover:-translate-y-1">
                                    <div className="aspect-video relative overflow-hidden">
                                        <img
                                            src={
                                                event.coverImage ||
                                                event.image ||
                                                `https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=800&auto=format&fit=crop`
                                            }
                                            alt={event.name || event.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                            {event.cpeCredits} CPE
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
                                            {event.name || event.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-3 text-sm text-gray-400">
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
                            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                <div className="aspect-video bg-white/5 animate-pulse" />
                                <div className="p-5 space-y-3">
                                    <div className="h-6 bg-white/5 rounded animate-pulse" />
                                    <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
