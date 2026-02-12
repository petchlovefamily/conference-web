import {
    eventsApi,
    registrationsApi,
    paymentsApi,
    Event as ApiEvent,
    EventWithTickets,
    CreateRegistrationData,
    TicketType as ApiTicketType,
    ApiSpeaker,
    ApiSession,
    EventImage as ApiEventImage,
    EventAttachment as ApiEventAttachment,
} from './api';
import {
    Event,
    ApiResponse,
    RegistrationRequest,
    RegistrationResponse,
    MemberVerifyResponse,
    CheckoutResponse,
    PaymentVerifyResponse,
    FeedbackRequest,
    TicketType,
    Speaker,
    Session,
    EventImage,
    EventAttachment,
} from '@/types';
import { MOCK_EVENTS, getMockEventById } from './mockData';

// ===========================================
// API Service Layer
// Backend: localhost:8080 or friend's server
// Toggle via NEXT_PUBLIC_USE_MOCK env var
// ===========================================

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ========== EVENT SERVICES ==========

/**
 * Get all published events
 */
export async function getEvents(): Promise<Event[]> {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_EVENTS as Event[];
    }

    try {
        const response = await eventsApi.list();
        const events = response.data || [];
        // Map API response to frontend Event type
        return events.map(mapApiEventToEvent).filter(e => e.status === 'published');
    } catch {
        // Fallback to mock data on error
        return MOCK_EVENTS as Event[];
    }
}

/**
 * Get single event by ID
 */
export async function getEventById(id: string): Promise<Event> {
    // Always try mock first for string IDs like 'event-1'
    const mockEvent = getMockEventById(id);

    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (!mockEvent) {
            throw new Error('Event not found');
        }
        return mockEvent;
    }

    // Try to parse as number for API call
    const numericId = parseInt(id);

    // If ID is not a number (like 'event-1'), use mock data
    if (isNaN(numericId)) {
        if (mockEvent) {
            return mockEvent;
        }
        throw new Error('Event not found');
    }

    try {
        const response = await eventsApi.get(numericId);
        const eventData = response.data;

        if (!eventData || !eventData.id) {
            if (mockEvent) return mockEvent;
            throw new Error('Event not found');
        }

        return mapApiEventWithTicketsToEvent(eventData);
    } catch (error) {
        // Fallback to mock
        if (mockEvent) return mockEvent;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to fetch event: ${errorMessage}`);
    }
}

// ========== MEMBER VERIFICATION ==========

/**
 * Verify pharmacist license number
 */
export async function verifyMember(licenseNumber: string): Promise<MemberVerifyResponse> {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (licenseNumber.startsWith('ภ.')) {
            return { valid: true, member: { id: 'member-1', name: 'ผู้ใช้ทดสอบ', licenseNumber } };
        }
        return { valid: false };
    }

    // Note: Backend API for member verification is not yet implemented
    try {
        const response = await fetch(`${API_URL}/api/auth/verify-member`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseNumber }),
        });
        return response.json();
    } catch {
        return { valid: false };
    }
}

// ========== REGISTRATION SERVICES ==========

/**
 * Create new registration
 */
export async function createRegistration(data: RegistrationRequest): Promise<RegistrationResponse> {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            registration: {
                id: `reg-${Date.now()}`,
                registrationNumber: `REG-${Date.now().toString(36).toUpperCase()}`,
                qrCode: `QR-${data.eventId}-${Date.now()}`,
                amount: 2500,
            },
        };
    }

    try {
        const apiData: CreateRegistrationData = {
            eventId: parseInt(data.eventId),
            ticketTypeId: parseInt(data.ticketTypeId || '1'),
            attendeeType: (data.attendeeType as 'guest' | 'public' | 'member') || 'public',
            firstName: data.firstName || data.nameTh?.split(' ')[0] || '',
            lastName: data.lastName || data.nameTh?.split(' ').slice(1).join(' ') || '',
            email: data.email,
            phone: data.phone,
            organization: data.organization,
            licenseNumber: data.licenseNumber,
        };

        const response = await registrationsApi.create(apiData);
        return {
            registration: {
                id: response.data.regCode,
                registrationNumber: response.data.regCode,
                qrCode: response.data.qrCode || '',
                amount: 0,
            },
        };
    } catch (error) {
        throw error;
    }
}

// ========== PAYMENT SERVICES ==========

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(
    registrationId: string,
    successUrl: string,
    cancelUrl: string
): Promise<CheckoutResponse> {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            checkoutUrl: `${successUrl}?session_id=mock_session_${Date.now()}`,
            sessionId: `mock_session_${Date.now()}`,
        };
    }

    try {
        const response = await paymentsApi.createCheckout({
            registrationId: parseInt(registrationId),
            ticketTypeId: 1, // Note: ticketTypeId should ideally come from registration data
        });

        return {
            checkoutUrl: response.data.url || successUrl,
            sessionId: response.data.regCode || '',
        };
    } catch (error) {
        throw error;
    }
}

/**
 * Verify payment status
 */
export async function verifyPayment(sessionId: string): Promise<PaymentVerifyResponse> {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { status: 'paid', registrationId: 'mock-reg-123' };
    }

    try {
        const response = await fetch(`${API_URL}/api/payments/verify/${sessionId}`);

        if (!response.ok) {
            return { status: 'unpaid', registrationId: '' };
        }

        const data = await response.json();
        return data;
    } catch {
        return { status: 'unpaid', registrationId: '' };
    }
}

// ========== FEEDBACK SERVICES ==========

/**
 * Submit feedback
 */
export async function submitFeedback(data: FeedbackRequest): Promise<{ success: boolean }> {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
    }

    try {
        await fetch(`${API_URL}/api/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return { success: true };
    } catch {
        return { success: false };
    }
}

// ========== USER REGISTRATION SERVICES ==========

export interface UserRegistration {
    id: number;
    regCode: string;
    status: string;
    createdAt: string;
    event: {
        id: number;
        eventName: string;
        startDate: string;
        endDate: string | null;
        location: string | null;
        imageUrl: string | null;
    } | null;
    ticketType: {
        id: number;
        name: string;
        price: string;
    } | null;
    payment: {
        id: number;
        amount: string;
        status: string;
        paidAt: string | null;
    } | null;
}

/**
 * Get current user's registrations (My Tickets + Payment History)
 */
export async function getUserRegistrations(token: string): Promise<UserRegistration[]> {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [];
    }

    try {
        const response = await fetch(`${API_URL}/api/users/me/registrations`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch registrations');
        }

        const data = await response.json();
        return data.data || [];
    } catch {
        return [];
    }
}

// ========== HELPER FUNCTIONS ==========

function mapApiEventToEvent(apiEvent: ApiEvent): Event {
    // Type-safe speaker mapping
    const apiEventWithSpeakers = apiEvent as ApiEvent & { speakers?: ApiSpeaker[] };
    const speakers: Speaker[] = apiEventWithSpeakers.speakers?.map((s: ApiSpeaker) => ({
        id: s.id?.toString() || String(s.id),
        name: s.name,
        title: s.title || '',
        organization: s.organization || '',
        imageUrl: s.imageUrl || '',
    })) || [];

    return {
        id: apiEvent.id.toString(),
        code: apiEvent.eventCode || `EVT-${apiEvent.id}`,
        name: apiEvent.eventName,
        title: apiEvent.eventName,
        description: apiEvent.description || '',
        eventType: (apiEvent.eventType as Event['eventType']) || 'single',
        status: (apiEvent.status as Event['status']) || 'published',
        venue: apiEvent.location || 'TBA',
        capacity: apiEvent.maxCapacity,
        cpeCredits: apiEvent.cpeCredits || '0',
        startDate: apiEvent.startDate,
        endDate: apiEvent.endDate,
        registrationOpens: apiEvent.startDate,
        registrationCloses: apiEvent.endDate,
        // UI compatibility fields
        date: apiEvent.startDate,
        time: new Date(apiEvent.startDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        location: apiEvent.location || 'TBA',
        image: apiEvent.imageUrl || '/images/default-event.jpg',
        coverImage: apiEvent.imageUrl || '/images/default-event.jpg',
        category: apiEvent.eventType,
        price: 0,
        registeredCount: 0,
        ticketTypes: [],
        speakers,
        schedule: [],
    };
}

function mapApiEventWithTicketsToEvent(apiEvent: EventWithTickets): Event {
    const baseEvent = mapApiEventToEvent(apiEvent);

    // Type for ticket with optional category field
    interface TicketWithCategory extends ApiTicketType {
        category?: string;
        saleStartDate?: string;
        saleEndDate?: string;
    }

    // Map ticket types
    baseEvent.ticketTypes = apiEvent.ticketTypes?.map((tt): TicketType => {
        const ticketWithCategory = tt as TicketWithCategory;
        return {
            id: tt.id.toString(),
            name: tt.name,
            ticketCategory: (ticketWithCategory.category === 'addon' ? 'addon' : 'primary') as 'primary' | 'addon',
            description: tt.description || '',
            price: parseFloat(tt.price),
            quota: tt.quota,
            soldCount: tt.soldCount,
            available: tt.quota - tt.soldCount,
            salesStart: ticketWithCategory.saleStartDate || undefined,
            salesEnd: ticketWithCategory.saleEndDate || undefined,
            maxPerOrder: 5,
            benefits: [],
        };
    }) || [];

    // Set price from first ticket type
    if (baseEvent.ticketTypes.length > 0) {
        baseEvent.price = baseEvent.ticketTypes[0].price;
    }

    // Create rounds from event data for frontend compatibility
    // Only count PRIMARY tickets for capacity (not add-ons)
    const primaryTickets = apiEvent.ticketTypes?.filter((tt) => {
        const ticketWithCategory = tt as TicketWithCategory;
        return ticketWithCategory.category !== 'addon';
    }) || [];
    const totalQuota = primaryTickets.reduce((sum, tt) => sum + tt.quota, 0) || apiEvent.maxCapacity;
    const totalSold = primaryTickets.reduce((sum, tt) => sum + tt.soldCount, 0) || 0;

    // Keep date as ISO string for page.tsx to format
    const startDateStr = apiEvent.startDate || '';
    const startDate = startDateStr ? new Date(startDateStr) : null;
    const isValidDate = startDate && !isNaN(startDate.getTime());

    baseEvent.rounds = [{
        id: `round-${apiEvent.id}`,
        date: isValidDate ? startDate.toISOString() : '',
        time: isValidDate
            ? startDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
            : '',
        location: apiEvent.location || '',
        mapUrl: apiEvent.mapUrl || '',
        capacity: totalQuota,
        registered: totalSold,
    }];

    // Map images from API
    interface EventWithExtras {
        images?: ApiEventImage[];
        attachments?: ApiEventAttachment[];
        sessions?: ApiSession[];
        mapUrl?: string | null;
    }
    const apiEventExtended = apiEvent as EventWithTickets & EventWithExtras;

    if (apiEventExtended.images && Array.isArray(apiEventExtended.images)) {
        baseEvent.images = apiEventExtended.images.map((img: ApiEventImage): EventImage => ({
            id: img.id,
            eventId: apiEvent.id,
            imageUrl: img.imageUrl,
            caption: img.caption || '',
            imageType: 'venue',
            sortOrder: 0,
        }));
    }

    // Map attachments from API
    if (apiEventExtended.attachments && Array.isArray(apiEventExtended.attachments)) {
        baseEvent.attachments = apiEventExtended.attachments.map((att: ApiEventAttachment): EventAttachment => ({
            id: att.id,
            eventId: apiEvent.id,
            fileName: att.fileName,
            fileUrl: att.fileUrl,
            fileType: '',
            fileSize: 0,
            description: '',
        }));
    }

    // Map sessions from API
    if (apiEventExtended.sessions && Array.isArray(apiEventExtended.sessions)) {
        baseEvent.sessions = apiEventExtended.sessions.map((session: ApiSession): Session => ({
            id: session.id?.toString() || String(session.id),
            sessionCode: session.sessionCode || '',
            sessionName: session.sessionName || '',
            description: session.description || '',
            room: session.room || '',
            startTime: session.startTime || '',
            endTime: session.endTime || '',
            speakers: session.speakers || '',
            maxCapacity: session.maxCapacity || 0,
        }));
    }

    return baseEvent;
}
