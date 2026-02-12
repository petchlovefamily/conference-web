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
}

export interface TicketType {
    id: number;
    eventId: number;
    name: string;
    description: string | null;
    price: string;
    quota: number;
    soldCount: number;
    isActive: boolean;
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
    list: () => api.get<{ success: boolean; data: Event[] }>('/api/events'),

    get: (id: number) => api.get<{ success: boolean; data: EventWithTickets }>(`/api/events/${id}`),

    create: (data: CreateEventData) =>
        api.post<{ success: boolean; data: Event }>('/api/events', data),

    update: (id: number, data: Partial<CreateEventData>) =>
        api.put<{ success: boolean; data: Event }>(`/api/events/${id}`, data),

    delete: (id: number) =>
        api.delete<{ success: boolean }>(`/api/events/${id}`),
};
