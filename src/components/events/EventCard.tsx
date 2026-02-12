import { Calendar, MapPin, Award, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Event } from '@/types';

interface EventCardProps {
    event: Event;
    variant?: 'default' | 'compact';
}

// Format date to Thai format
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Get status badge color
function getStatusColor(status: string) {
    switch (status) {
        case 'published':
            return 'bg-green-500';
        case 'draft':
            return 'bg-gray-500';
        case 'cancelled':
            return 'bg-red-500';
        default:
            return 'bg-blue-500';
    }
}

// Get status label in Thai
function getStatusLabel(status: string) {
    switch (status) {
        case 'published':
            return 'เปิดรับสมัคร';
        case 'draft':
            return 'เร็วๆ นี้';
        case 'cancelled':
            return 'ยกเลิก';
        case 'completed':
            return 'เสร็จสิ้น';
        default:
            return status;
    }
}

export function EventCard({ event, variant = 'default' }: EventCardProps) {
    const minPrice = event.ticketTypes && event.ticketTypes.length > 0
        ? Math.min(...event.ticketTypes.map(t => t.price))
        : 0;

    return (
        <div className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <img
                    src={event.coverImage || event.image || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop'}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Status Badge */}
                <div className={`absolute top-4 left-4 px-3 py-1 ${getStatusColor(event.status)} rounded-full text-xs font-medium text-white flex items-center gap-1`}>
                    {event.status === 'published' && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                    {getStatusLabel(event.status)}
                </div>

                {/* CPE Badge */}
                {event.cpeCredits && Number(event.cpeCredits) > 0 && (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-emerald-500/90 rounded-lg text-xs font-medium text-white flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {event.cpeCredits} CPE
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                    {event.name}
                </h3>

                {event.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {event.description}
                    </p>
                )}

                <div className="space-y-2 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        <span>{formatDate(event.startDate)}</span>
                    </div>
                    {event.location && (
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-400" />
                            <span className="truncate">{event.location}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                        {minPrice > 0 ? (
                            <>
                                <span className="text-xs text-gray-500">เริ่มต้น</span>
                                <span className="text-lg font-bold text-emerald-400 ml-1">
                                    ฿{minPrice.toLocaleString()}
                                </span>
                            </>
                        ) : (
                            <span className="text-lg font-bold text-green-400">ฟรี</span>
                        )}
                    </div>
                    <Link href={`/events/${event.id}`}>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 rounded-lg">
                            ดูรายละเอียด
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
