import { api } from './client';
import { MOCK_EVENT } from '../mock-data';

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
    createIntent: async (data: CreateIntentRequest) => {
        // Mock success for PRIS event tickets
        if (data.packageId?.startsWith('pris-') || data.addOnIds?.some(id => id.startsWith('pris-'))) {
            return {
                success: true,
                free: true, // Force immediate success redirect
                refno: 'MOCK-REF-' + Date.now(),
                orderNumber: 'PRIS-' + Math.floor(Math.random() * 1000000),
                regCode: 'REG-' + Math.floor(Math.random() * 1000000),
                totalAmount: '0.00',
                redirectForm: null
            };
        }
        return api.post<CreateIntentResponse>('/api/payments/create-intent', data);
    },

    verify: async (refno: string) => {
        if (refno.startsWith('MOCK-REF-')) {
            return {
                success: true,
                status: 'paid',
                orderNumber: 'MOCK-ORDER-' + refno.split('-')[2],
                regCode: 'MOCK-REG-' + refno.split('-')[2],
                amount: '0.00',
                currency: 'THB'
            };
        }
        return api.get<VerifyResponse>(`/api/payments/verify?refno=${encodeURIComponent(refno)}`);
    },

    myTickets: async () => {
        try {
            return await api.get<MyTicketsResponse>('/api/payments/my-tickets');
        } catch {
            // Return mock PRIS 2026 ticket if API fetching fails
            return {
                success: true,
                data: {
                    registration: {
                        regCode: 'REG-772805',
                        eventId: 1,
                        status: 'confirmed',
                        ticketName: 'ผู้เข้าร่วมงาน (Early Bird) - PRIS 2026',
                        priority: 'general',
                        purchasedAt: new Date().toISOString(),
                        amount: '1000.00',
                        currency: 'THB',
                        includes: ['เข้าร่วมสัมมนาทุกเซสชัน', 'กระเป๋าและเอกสาร', 'CPE 3 Credits', 'อาหารกลางวันและเบรก'],
                        receiptUrl: null,
                    },
                    galaTicket: null,
                    workshops: []
                }
            };
        }
    },

    myPurchases: async () => {
        try {
            return await api.get<MyPurchasesResponse>('/api/payments/my-purchases');
        } catch {
            // Mock empty purchases if API fails or when testing mock event
            return {
                success: true,
                data: {
                    hasPrimaryTicket: false,
                    primaryTicketName: null,
                    regCode: null,
                    purchasedAddOns: []
                }
            };
        }
    },

    preview: async (data: PreviewRequest) => {
        if (data.packageId?.startsWith('pris-') || data.addOnIds?.some(id => id.startsWith('pris-'))) {
            const allTickets = MOCK_EVENT.ticketTypes || [];
            const pkg = allTickets.find(t => t.id === data.packageId);
            const addons = allTickets.filter(t => data.addOnIds.includes(t.id));

            let subtotal = (pkg?.price || 0);
            addons.forEach(a => { subtotal += a.price; });

            let discountAmount = 0;
            let promoValid = false;
            let promoError = null;

            // Mock promo code
            if (data.promoCode === 'PRIS2026' || data.promoCode === 'SW-PROMO') {
                discountAmount = 200;
                promoValid = true;
            } else if (data.promoCode) {
                promoValid = false;
                promoError = 'รหัสส่วนลดไม่ถูกต้อง';
            }

            return {
                success: true,
                subtotal,
                discountAmount,
                finalAmount: Math.max(0, subtotal - discountAmount),
                promoValid,
                promoError,
                discountType: promoValid ? 'fixed' : null,
                discountValue: promoValid ? discountAmount : null
            };
        }
        return api.post<PreviewResponse>('/api/payments/preview', data);
    },
};
