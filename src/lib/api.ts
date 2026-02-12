// ===========================================
// Type definitions only (API client removed)
// These types are used by pages and components
// ===========================================

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface Event {
    id: number;
    eventCode: string;
    eventName: string;
    description: string | null;
    eventType: string;
    location: string | null;
    mapUrl: string | null;
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

export interface ApiSpeaker {
    id: number;
    name: string;
    title: string | null;
    organization: string | null;
    bio: string | null;
    imageUrl: string | null;
    role: string | null;
}

export interface ApiSession {
    id: number;
    sessionCode: string;
    sessionName: string;
    description: string | null;
    room: string | null;
    startTime: string;
    endTime: string;
    speakers: string | null;
    maxCapacity: number;
}

export interface EventImage {
    id: number;
    imageUrl: string;
    caption: string | null;
}

export interface EventAttachment {
    id: number;
    fileUrl: string;
    fileName: string;
}

export interface EventWithTickets extends Event {
    ticketTypes: TicketType[];
    speakers?: ApiSpeaker[];
    sessions?: ApiSession[];
    category?: string | null;
    images?: EventImage[];
    attachments?: EventAttachment[];
}

export interface Registration {
    id: number;
    regCode: string;
    eventId: number;
    ticketTypeId: number;
    attendeeType: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    organization: string | null;
    status: string;
    qrCode: string | null;
    checkInTime: string | null;
    addons?: {
        id: number;
        name: string;
        price: string;
    }[];
}

export interface PromoCode {
    id: number;
    code: string;
    description: string | null;
    discountType: string;
    discountValue: number;
    maxUses: number;
    usedCount: number;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
}

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateEventData {
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

export interface CreateRegistrationData {
    eventId: number;
    ticketTypeId: number;
    addonTicketTypeIds?: number[];
    attendeeType: 'guest' | 'public' | 'member';
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    organization?: string;
    licenseNumber?: string;
}

export interface CreateTicketData {
    name: string;
    description?: string;
    price: number;
    quota: number;
    isActive?: boolean;
}

export interface CreatePromoCodeData {
    code: string;
    description?: string;
    discountType: string;
    discountValue: number;
    maxUses: number;
    validFrom: string;
    validUntil: string;
}
