const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Get token from localStorage
const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

// Generic API call function
async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();

    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
}

// ============ AUTH ============
export const authApi = {
    login: (email: string, password: string) =>
        apiClient<{ success: boolean; token: string; user: User }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (data: { email: string; password: string; name: string; phone?: string; organization?: string }) =>
        apiClient<{ success: boolean; message: string; data: { id: number; email: string; name: string } }>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

// ============ EVENTS ============
export const eventsApi = {
    list: () => apiClient<{ success: boolean; data: Event[] }>('/api/events'),

    get: (id: number) => apiClient<{ success: boolean; data: EventWithTickets }>(`/api/events/${id}`),

    create: (data: CreateEventData) =>
        apiClient<{ success: boolean; data: Event }>('/api/events', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: number, data: Partial<CreateEventData>) =>
        apiClient<{ success: boolean; data: Event }>(`/api/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: number) =>
        apiClient<{ success: boolean }>(`/api/events/${id}`, { method: 'DELETE' }),
};

// ============ REGISTRATIONS ============
export const registrationsApi = {
    create: (data: CreateRegistrationData) =>
        apiClient<{ success: boolean; data: Registration }>('/api/registrations', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    get: (regCode: string) =>
        apiClient<{ success: boolean; data: Registration }>(`/api/registrations/${regCode}`),

    listByEvent: (eventId: number) =>
        apiClient<{ success: boolean; data: Registration[] }>(`/api/events/${eventId}/registrations`),
};

// ============ CHECK-IN ============
export const checkinApi = {
    lookup: (regCode: string) =>
        apiClient<{ success: boolean; data: Registration }>(`/api/check-in/${regCode}`),

    checkIn: (regCode: string) =>
        apiClient<{ success: boolean; data: Registration }>(`/api/check-in/${regCode}`, {
            method: 'POST',
        }),
};

// ============ PAYMENTS ============
export const paymentsApi = {
    createCheckout: (data: { registrationId: number; ticketTypeId: number; promoCode?: string }) =>
        apiClient<{ success: boolean; data: { type: string; url?: string; regCode?: string } }>(
            '/api/payments/create-checkout',
            { method: 'POST', body: JSON.stringify(data) }
        ),

    createIntent: (data: { registrationId: number; ticketTypeId: number; promoCode?: string; paymentMethodType?: 'card' | 'promptpay' }) =>
        apiClient<{ success: boolean; data: { clientSecret: string; amount: number } }>(
            '/api/payments/create-intent',
            { method: 'POST', body: JSON.stringify(data) }
        ),
};

// ============ TICKET TYPES ============
export const ticketTypesApi = {
    create: (eventId: number, data: CreateTicketData) =>
        apiClient<{ success: boolean; data: TicketType }>(`/api/events/${eventId}/ticket-types`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: number, data: Partial<CreateTicketData>) =>
        apiClient<{ success: boolean; data: TicketType }>(`/api/ticket-types/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: number) =>
        apiClient<{ success: boolean }>(`/api/ticket-types/${id}`, { method: 'DELETE' }),
};

// ============ PROMO CODES ============
export const promoCodesApi = {
    list: () => apiClient<{ success: boolean; data: PromoCode[] }>('/api/promo-codes'),

    create: (data: CreatePromoCodeData) =>
        apiClient<{ success: boolean; data: PromoCode }>('/api/promo-codes', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: number, data: Partial<CreatePromoCodeData>) =>
        apiClient<{ success: boolean; data: PromoCode }>(`/api/promo-codes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: number) =>
        apiClient<{ success: boolean }>(`/api/promo-codes/${id}`, { method: 'DELETE' }),
};

// ============ USERS ============
export const usersApi = {
    list: () => apiClient<{ success: boolean; data: AdminUser[] }>('/api/users'),

    create: (data: { email: string; password: string; name: string; role: string }) =>
        apiClient<{ success: boolean; data: AdminUser }>('/api/users', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: number, data: Partial<{ email: string; name: string; role: string; isActive: boolean }>) =>
        apiClient<{ success: boolean; data: AdminUser }>(`/api/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: number) =>
        apiClient<{ success: boolean }>(`/api/users/${id}`, { method: 'DELETE' }),
};

// ============ TYPES ============
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

// Create types
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
