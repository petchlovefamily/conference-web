import { api } from './client';

// ─── Types ───────────────────────────────────────────

export interface CreateIntentRequest {
    packageId: string;
    addOnIds: string[];
    currency: 'THB' | 'USD';
    paymentMethod: 'qr' | 'card';
    promoCode?: string;
    workshopSessionId?: string;
    dietaryRequirement?: string;
    needTaxInvoice: boolean;
    taxName?: string;
    taxId?: string;
    taxAddress?: string;
    taxSubDistrict?: string;
    taxDistrict?: string;
    taxProvince?: string;
    taxPostalCode?: string;
}

export interface CreateIntentResponse {
    success: boolean;
    free?: boolean;
    redirectForm: {
        actionUrl: string;
        fields: Record<string, string>;
    } | null;
    refno: string;
    orderNumber: string;
    regCode?: string;
    totalAmount: string;
}

export interface VerifyResponse {
    success: boolean;
    status: 'paid' | 'pending' | 'failed' | 'cancelled';
    orderNumber?: string;
    regCode?: string;
    amount?: string;
    currency?: string;
}

export interface MyTicketsResponse {
    success: boolean;
    data: {
        registration: {
            regCode: string;
            eventId: number;
            status: string;
            ticketName: string;
            priority: string;
            purchasedAt: string | null;
            amount: string;
            currency: string;
            includes: string[];
            receiptUrl: string | null;
        } | null;
        galaTicket: {
            id: string;
            status: string;
            name: string;
            purchasedAt: string | null;
            amount: string;
            currency: string;
            dateTimeStart: string | null;
            dateTimeEnd: string | null;
            venue: string | null;
            dietary: string | null;
        } | null;
        workshops: Array<{
            id: string;
            sessionId: number;
            status: string;
            name: string;
            purchasedAt: string | null;
            amount: string;
            currency: string;
            dateTimeStart: string | null;
            dateTimeEnd: string | null;
            venue: string | null;
        }>;
    };
}

export interface MyPurchasesResponse {
    success: boolean;
    data: {
        hasPrimaryTicket: boolean;
        primaryTicketName: string | null;
        regCode: string | null;
        purchasedAddOns: string[];
    };
}

export interface PreviewRequest {
    packageId: string;
    addOnIds: string[];
    currency: 'THB' | 'USD';
    paymentMethod: 'qr' | 'card';
    promoCode?: string;
}

export interface PreviewResponse {
    success: boolean;
    subtotal: number;
    discountAmount: number;
    finalAmount: number;
    promoValid: boolean;
    promoError: string | null;
    discountType: string | null;
    discountValue: number | null;
}

// ─── Payments API ────────────────────────────────────

export const paymentsApi = {
    createIntent: (data: CreateIntentRequest) =>
        api.post<CreateIntentResponse>('/api/payments/create-intent', data),

    verify: (refno: string) =>
        api.get<VerifyResponse>(`/api/payments/verify?refno=${encodeURIComponent(refno)}`),

    myTickets: () =>
        api.get<MyTicketsResponse>('/api/payments/my-tickets'),

    myPurchases: () =>
        api.get<MyPurchasesResponse>('/api/payments/my-purchases'),

    preview: (data: PreviewRequest) =>
        api.post<PreviewResponse>('/api/payments/preview', data),
};
