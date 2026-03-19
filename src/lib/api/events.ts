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
        const res = await api.get<{ events: Event[] }>('/api/events');
        return { success: true, data: res.events };
    },

    get: async (id: number) => {
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
