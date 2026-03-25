import { api } from './client';

// Types
export interface Event {
    id: number;
    eventCode: string;
    eventName: string;
    description: string | null;
    eventType: string;
    location: string | null;
    startDate: string;
    endDate: string;
    maxCapacity: number;
    cpeCredits: string;
    status: string;
    imageUrl: string | null;
    websiteUrl: string | null;
}

export interface TicketType {
    id: number;
    eventId: number;
    name: string;
    groupName?: string;
    description: string | null;
    price: string;
    currency?: string;
    quota: number;
    soldCount: number;
    isActive: boolean;
    category?: string;        // 'primary' | 'addon'
    ticketCategory?: string;  // legacy alias
    features?: string[];
    badgeText?: string | null;
    originalPrice?: string | null;
    allowedRoles?: string[];
    salesStart?: string;
    salesEnd?: string;
    available?: number;
    // Sessions linked to this ticket (for workshop tickets)
    sessions?: Array<{
        id: number;
        sessionCode?: string;
        sessionName: string;
        description?: string | null;
        startTime?: string;
        endTime?: string;
        room?: string | null;
        maxCapacity?: number;
    }>;
}

export interface Speaker {
    id: number;
    name: string;
    title: string;
    organization: string;
    imageUrl?: string;
    role?: string;
}

export interface EventWithTickets extends Event {
    ticketTypes: TicketType[];
    speakers?: Speaker[];
    coverImage?: string | null;
    videoUrl?: string | null;
    mapUrl?: string | null;
    documents?: Array<{ name: string; url: string }>;
    sessions?: Array<{
        id: number;
        sessionCode?: string;
        sessionName: string;
        description?: string | null;
        startTime?: string;
        endTime?: string;
        room?: string | null;
        maxCapacity?: number;
        speakers?: string;
    }>;
    images?: Array<{ id: number; imageUrl: string; caption?: string }>;
    registeredCount?: number;
}

interface CreateEventData {
    eventCode: string;
    eventName: string;
    description?: string;
    eventType: string;
    location?: string;
    startDate: string;
    endDate: string;
    maxCapacity: number;
    cpeCredits?: number;
    status: string;
}

// Events API
export const eventsApi = {
    list: async () => {
        // In dev mode, we could prepend mock events here if needed
        const res = await api.get<{ events: Event[] }>('/api/events');
        return { success: true, data: res.events };
    },

    get: async (id: number | string) => {
        // Handle mock event ID
        if (id === 'mock-event-2025' || String(id) === 'NaN') {
            // Need to import MOCK_EVENT dynamically or just define it here.
            // Since this is a small file, I'll import it if possible or use a local mock.
            // Looking at the project structure, I can import from '@/lib/mock-data'
            const { MOCK_EVENT } = await import('@/lib/mock-data');
            
            // Map MOCK_EVENT (frontend type) to EventWithTickets (API type)
            const mockEvent: EventWithTickets = {
                id: 0,
                eventCode: MOCK_EVENT.code,
                eventName: MOCK_EVENT.name,
                description: MOCK_EVENT.description,
                eventType: MOCK_EVENT.eventType,
                location: MOCK_EVENT.location || MOCK_EVENT.venue,
                startDate: MOCK_EVENT.startDate,
                endDate: MOCK_EVENT.endDate,
                maxCapacity: MOCK_EVENT.maxCapacity || 1000,
                cpeCredits: String(MOCK_EVENT.cpeCredits),
                status: MOCK_EVENT.status,
                imageUrl: MOCK_EVENT.imageUrl || null,
                websiteUrl: null,
                coverImage: MOCK_EVENT.coverImage || null,
                videoUrl: MOCK_EVENT.videoUrl || null,
                mapUrl: MOCK_EVENT.mapUrl || null,
                registeredCount: MOCK_EVENT.registeredCount,
                ticketTypes: MOCK_EVENT.ticketTypes?.map((t: any) => ({
                    id: t.id,
                    eventId: 0,
                    name: t.name,
                    groupName: t.groupName || t.name,
                    description: t.description || null,
                    price: String(t.price),
                    currency: 'THB',
                    quota: t.quota || 0,
                    soldCount: 0,
                    isActive: true,
                    category: t.ticketCategory || 'primary',
                    allowedRoles: t.allowedRoles || [],
                })) || [],
                images: MOCK_EVENT.images?.map((img: any) => ({
                    id: img.id,
                    imageUrl: img.imageUrl,
                    caption: img.caption
                })) || [],
            };
            return { success: true, data: mockEvent };
        }

        const res = await api.get<{ event: EventWithTickets }>(`/api/events/${id}`);
        return { success: true, data: res.event };
    },

    create: (data: CreateEventData) =>
        api.post<{ success: boolean; data: Event }>('/api/events', data),

    update: (id: number, data: Partial<CreateEventData>) =>
        api.put<{ success: boolean; data: Event }>(`/api/events/${id}`, data),

    delete: (id: number) =>
        api.delete<{ success: boolean }>(`/api/events/${id}`),
};
