import {
    Event,
    RegistrationRequest,
    RegistrationResponse,
    MemberVerifyResponse,
    CheckoutResponse,
    PaymentVerifyResponse,
    FeedbackRequest,
} from '@/types';
import { MOCK_EVENTS, getMockEventById } from './mockData';

// ===========================================
// Mock Service Layer
// All functions return mock data only.
// Replace with real API calls when new API is ready.
// ===========================================

// ========== EVENT SERVICES ==========

/**
 * Get all published events
 */
export async function getEvents(): Promise<Event[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_EVENTS as Event[];
}

/**
 * Get single event by ID
 */
export async function getEventById(id: string): Promise<Event> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const mockEvent = getMockEventById(id);
    if (!mockEvent) {
        throw new Error('Event not found');
    }
    return mockEvent;
}

// ========== MEMBER VERIFICATION ==========

/**
 * Verify pharmacist license number (mock)
 */
export async function verifyMember(licenseNumber: string): Promise<MemberVerifyResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (licenseNumber.startsWith('ภ.')) {
        return { valid: true, member: { id: 'member-1', name: 'ผู้ใช้ทดสอบ', licenseNumber } };
    }
    return { valid: false };
}

// ========== REGISTRATION SERVICES ==========

/**
 * Create new registration (mock)
 */
export async function createRegistration(data: RegistrationRequest): Promise<RegistrationResponse> {
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

// ========== PAYMENT SERVICES ==========

/**
 * Create Stripe checkout session (mock)
 */
export async function createCheckoutSession(
    registrationId: string,
    successUrl: string,
    _cancelUrl: string
): Promise<CheckoutResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        checkoutUrl: `${successUrl}?session_id=mock_session_${Date.now()}`,
        sessionId: `mock_session_${Date.now()}`,
    };
}

/**
 * Verify payment status (mock)
 */
export async function verifyPayment(_sessionId: string): Promise<PaymentVerifyResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { status: 'paid', registrationId: 'mock-reg-123' };
}

// ========== FEEDBACK SERVICES ==========

/**
 * Submit feedback (mock)
 */
export async function submitFeedback(_data: FeedbackRequest): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
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
 * Get current user's registrations (mock)
 */
export async function getUserRegistrations(_token: string): Promise<UserRegistration[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [];
}
