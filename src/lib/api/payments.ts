import { api } from './client';

// Types
export interface PaymentCheckoutResponse {
    success: boolean;
    data: {
        type: string;
        sessionId?: string;
        url?: string;
        regCode?: string;
    };
}

// Payments API
export const paymentsApi = {
    createCheckout: (data: { registrationId: number; ticketTypeId: number; promoCode?: string }) =>
        api.post<PaymentCheckoutResponse>('/api/payments/create-checkout', data),
};
