import { api } from './client';

// Types matching the real backend API
export interface ApiEvent {
    id: number;
    eventCode: string;
    eventName: string;
    description: string | null;
    eventType: 'single_room' | 'multi_session';
    location: string | null;
    startDate: string;
    endDate: string;
    maxCapacity: number;
    cpeCredits: string | null;
    status: string;
    imageUrl: string | null;
    mapUrl: string | null;
    category: string | null;
    conferenceCode: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ApiTicketType {
    id: number;
    eventId: number;
    category: 'primary' | 'addon';
    groupName: string | null;
    name: string;
    sessionId: number | null;
    price: string;
    currency: string;
    allowedRoles: string | null;
    quota: number;
    soldCount: number;
    saleStartDate: string | null;
    saleEndDate: string | null;
}

export interface ApiSession {
    id: number;
    eventId: number;
    sessionCode: string;
    sessionName: string;
    sessionType: string | null;
    isMainSession: boolean;
    description: string | null;
    room: string | null;
    startTime: string;
    endTime: string;
    maxCapacity: number | null;
    isActive: boolean;
}

export interface ApiSpeaker {
    speakerId: number;
    speakerType: string;
    topic: string | null;
    sortOrder: number;
    firstName: string;
    lastName: string;
    bio: string | null;
    photoUrl: string | null;
    organization: string | null;
    position: string | null;
}

export interface ApiEventImage {
    id: number;
    eventId: number;
    imageUrl: string;
    caption: string | null;
    imageType: string;
    sortOrder: number;
}

export interface ApiEventAttachment {
    id: number;
    eventId: number;
    fileName: string;
    fileUrl: string;
    fileType: string | null;
    fileSize: number | null;
    description: string | null;
}

// Response types
export interface EventListResponse {
    events: ApiEvent[];
}

export interface EventDetailResponse {
    event: ApiEvent;
    sessions: ApiSession[];
    ticketTypes: ApiTicketType[];
    images: ApiEventImage[];
    attachments: ApiEventAttachment[];
    speakers: ApiSpeaker[];
}

// Backward compatibility exports
export type Event = ApiEvent;
export type TicketType = ApiTicketType;
export type Speaker = ApiSpeaker;
export interface EventWithTickets extends ApiEvent {
    ticketTypes: ApiTicketType[];
    speakers?: ApiSpeaker[];
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
    // Public: list published events
    list: () => api.get<EventListResponse>('/api/events'),

    // Public: get single event with related data
    get: (id: number | string) => api.get<EventDetailResponse>(`/api/events/${id}`),

    create: (data: CreateEventData) =>
        api.post<{ success: boolean; data: Event }>('/api/events', data),

    update: (id: number, data: Partial<CreateEventData>) =>
        api.put<{ success: boolean; data: Event }>(`/api/events/${id}`, data),

    delete: (id: number) =>
        api.delete<{ success: boolean }>(`/api/events/${id}`),
};
