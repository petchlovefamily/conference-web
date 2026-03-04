'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EventWithTickets, ApiSession, ApiSpeaker } from '@/lib/api';
import { getEvents, getEventById } from '@/lib/services';
import { Calendar, Clock, MapPin, User, Search, Filter, ChevronRight, AlertCircle } from 'lucide-react';
import { format, parseISO, isSameDay, compareAsc } from 'date-fns';
import { th } from 'date-fns/locale';

interface DayTab {
    date: Date;
    label: string;
}

export default function AgendaPage() {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<EventWithTickets[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<EventWithTickets | null>(null);
    const [activeDay, setActiveDay] = useState<Date | null>(null);
    const [days, setDays] = useState<DayTab[]>([]);
    const [sessions, setSessions] = useState<ApiSession[]>([]);
    const [speakers, setSpeakers] = useState<ApiSpeaker[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            // 1. Fetch list of events (mock)
            const allEvents = await getEvents();
            if (allEvents.length > 0) {
                // Filter for published events and sort by date descending
                const publishedEvents = allEvents
                    .filter((e: any) => e.status === 'published' || !e.status)
                    .sort((a: any, b: any) => new Date(b.startDate || b.date || '').getTime() - new Date(a.startDate || a.date || '').getTime());

                if (publishedEvents.length === 0) {
                    setError('No upcoming events found.');
                    setLoading(false);
                    return;
                }

                setEvents(publishedEvents as unknown as EventWithTickets[]);

                // 2. Select the most relevant event (first one) and fetch details
                const firstEvent = publishedEvents[0] as any;
                await selectEvent(firstEvent.id);
            } else {
                setError('No events found.');
            }
        } catch (err) {
            console.error('Failed to fetch agenda data:', err);
            setError('Failed to load agenda. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const selectEvent = async (eventId: number) => {
        try {
            setLoading(true);
            // Mock: fetch event by ID
            const eventData = await getEventById(eventId.toString()) as unknown as EventWithTickets;
            if (eventData) {
                setSelectedEvent(eventData);

                // Process sessions and speakers
                setSessions(eventData.sessions || []);
                setSpeakers(eventData.speakers || []);

                // Generate day tabs
                const start = new Date(eventData.startDate);
                const end = new Date(eventData.endDate);
                const dayTabs: DayTab[] = [];

                let current = new Date(start);
                while (current <= end) {
                    dayTabs.push({
                        date: new Date(current),
                        label: format(current, 'd MMM', { locale: th })
                    });
                    current.setDate(current.getDate() + 1);
                }

                // If only one day or just start/end match, just show that
                if (dayTabs.length === 0) {
                    dayTabs.push({ date: start, label: format(start, 'd MMM', { locale: th }) });
                }

                setDays(dayTabs);
                setActiveDay(dayTabs[0]?.date || start);
            }
        } catch (err) {
            console.error('Failed to fetch event details:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter sessions for active day
    const getFilteredSessions = () => {
        if (!activeDay || !sessions) return [];
        return sessions
            .filter(session => isSameDay(parseISO(session.startTime), activeDay))
            .sort((a, b) => compareAsc(parseISO(a.startTime), parseISO(b.startTime)));
    };

    const getSpeakerNames = (speakerIdsStr: string | null) => {
        if (!speakerIdsStr) return [];
        try {
            // Check if it's a JSON array of IDs
            if (speakerIdsStr.startsWith('[')) {
                const ids = JSON.parse(speakerIdsStr);
                if (Array.isArray(ids)) {
                    return ids.map(id => speakers.find(s => s.id === id)).filter(Boolean) as ApiSpeaker[];
                }
            }
            // If it's just a string name (legacy), return it as a single speaker object-ish
            return [{ id: 0, name: speakerIdsStr, imageUrl: null, title: null, organization: null, bio: null, role: null }];
        } catch (e) {
            return [{ id: 0, name: speakerIdsStr, imageUrl: null, title: null, organization: null, bio: null, role: null }];
        }
    };

    const filteredSessions = getFilteredSessions();

    return (
        <div className="min-h-screen bg-white text-[#6f7e0d] font-sans">
            <Navbar />

            {/* Header */}
            <div className="pt-24 pb-12 bg-gradient-to-br from-[#537547] via-[#456339] to-[#537547] border-b border-[#537547]/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <span className="inline-block py-1 px-3 rounded-full bg-white/15 border border-white/25 text-white/90 text-sm font-medium mb-3">
                                <Calendar className="w-4 h-4 inline-block mr-1" />
                                Conference Schedule
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                                กำหนดการประชุม
                            </h1>
                            <p className="text-white/80 max-w-xl text-lg">
                                ตารางกิจกรรมและหัวข้อการบรรยายทั้งหมดในการประชุมวิชาการ
                            </p>
                        </div>

                        {/* Event Selector (if multiple events) */}
                        {events.length > 1 && (
                            <div className="w-full md:w-auto">
                                <label className="block text-sm text-white/80 mb-2">เลือกงานประชุม</label>
                                <select
                                    className="w-full bg-white/15 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                                    onChange={(e) => selectEvent(parseInt(e.target.value))}
                                    value={selectedEvent?.id || ''}
                                >
                                    {events.map(e => (
                                        <option key={e.id} value={e.id} className="bg-white text-[#6f7e0d]">
                                            {e.eventName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[#537547] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">เกิดข้อผิดพลาด</h3>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <button
                            onClick={fetchInitialData}
                            className="px-6 py-2 bg-[#537547] hover:bg-[#456339] text-white rounded-lg transition-colors"
                        >
                            ลองใหม่อีกครั้ง
                        </button>
                    </div>
                ) : !selectedEvent ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500">ไม่พบงานประชุมที่เผยแพร่ในขณะนี้</p>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Sidebar / Filters (Optional - simpler for now just days) */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                    <h3 className="font-bold mb-4 flex items-center">
                                        <Calendar className="w-5 h-5 mr-2 text-[#537547]" />
                                        วันที่จัดงาน
                                    </h3>
                                    <div className="space-y-2">
                                        {days.map((day) => (
                                            <button
                                                key={day.date.toISOString()}
                                                onClick={() => setActiveDay(day.date)}
                                                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex justify-between items-center ${activeDay && isSameDay(activeDay, day.date)
                                                    ? 'bg-[#537547] text-white shadow-lg shadow-[#537547]/20'
                                                    : 'hover:bg-gray-100 text-gray-500 hover:text-[#6f7e0d]'
                                                    }`}
                                            >
                                                <span>{day.label}</span>
                                                {activeDay && isSameDay(activeDay, day.date) && (
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                    <h3 className="font-bold mb-4 flex items-center">
                                        <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                                        สถานที่
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {selectedEvent.location || 'Online / Virtual'}
                                    </p>
                                    {selectedEvent.mapUrl && (
                                        <a
                                            href={selectedEvent.mapUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block mt-3 text-sm text-[#537547] hover:underline"
                                        >
                                            ดูแผนที่ Google Maps
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Schedule List */}
                        <div className="lg:col-span-3">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Clock className="w-6 h-6 mr-3 text-[#537547]" />
                                {activeDay && format(activeDay, 'EEEE d MMMM yyyy', { locale: th })}
                            </h2>

                            <div className="space-y-4">
                                {filteredSessions.length > 0 ? (
                                    filteredSessions.map((session) => {
                                        const sessionSpeakers = getSpeakerNames(session.speakers);
                                        return (
                                            <div
                                                key={session.id}
                                                className="group bg-gray-50 border border-gray-200 rounded-xl overflow-hidden hover:border-[#537547]/30 transition-all hover:bg-gray-100"
                                            >
                                                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                                                    {/* Time & Room */}
                                                    <div className="md:w-48 flex-shrink-0 flex flex-col justify-start">
                                                        <div className="text-2xl font-bold text-[#537547] mb-1">
                                                            {format(parseISO(session.startTime), 'HH:mm')}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mb-2">
                                                            ถึง {format(parseISO(session.endTime), 'HH:mm')}
                                                        </div>
                                                        {session.room && (
                                                            <div className="inline-flex items-center text-xs px-2 py-1 rounded bg-gray-200 text-gray-600 w-fit mt-1">
                                                                <MapPin className="w-3 h-3 mr-1" />
                                                                {session.room}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-grow">
                                                        {/* Code Badge */}
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                                {session.sessionCode}
                                                            </span>
                                                        </div>

                                                        <h3 className="text-xl font-bold text-[#6f7e0d] mb-2 group-hover:text-[#537547] transition-colors">
                                                            {session.sessionName}
                                                        </h3>

                                                        {session.description && (
                                                            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                                                {session.description}
                                                            </p>
                                                        )}

                                                        {/* Speakers */}
                                                        {sessionSpeakers.length > 0 && (
                                                            <div className="border-t border-gray-200 pt-4 mt-auto">
                                                                <div className="flex flex-wrap gap-4">
                                                                    {sessionSpeakers.map((speaker, idx) => (
                                                                        <div key={idx} className="flex items-center gap-3">
                                                                            {speaker.imageUrl ? (
                                                                                <img
                                                                                    src={speaker.imageUrl}
                                                                                    alt={speaker.name}
                                                                                    className="w-10 h-10 rounded-full object-cover border border-white/20"
                                                                                />
                                                                            ) : (
                                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-200 flex items-center justify-center border border-gray-300">
                                                                                    <User className="w-5 h-5 text-gray-500" />
                                                                                </div>
                                                                            )}
                                                                            <div>
                                                                                <div className="font-medium text-sm text-[#6f7e0d]">{speaker.name}</div>
                                                                                {speaker.title && (
                                                                                    <div className="text-xs text-gray-500">{speaker.title}</div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                                        <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-500">ไม่มีรายการในช่วงเวลานี้</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
