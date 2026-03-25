import { api, apiClient } from './client';

// Types matching the actual API response
export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    country: string | null;
    delegateType?: string;
    isThai?: boolean;
    idCard?: string | null;
}

interface LoginResponse {
    success: boolean;
    token: string;
    user: User;
}

interface RegisterResponse {
    success: boolean;
    user: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
    };
}

// Auth API
export const authApi = {
    login: async (email: string | undefined, password: string, pharmacyLicenseId?: string) => {
        // Mock successful login
        console.log('Mock login for:', email);
        return {
            success: true,
            token: 'mock-jwt-token-' + btoa(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + 86400 })),
            user: {
                id: 1,
                email: email || 'mock@example.com',
                firstName: 'Pharmacist',
                lastName: 'Sample',
                role: 'member',
                country: 'Thailand',
                isThai: true,
                delegateType: 'Pharmacist'
            }
        };
    },

    register: async (formData: FormData) => {
        // Mock successful registration
        const email = formData.get('email') as string;
        console.log('Mock register for:', email);
        return {
            success: true,
            user: {
                id: 2,
                email: email || 'new-mock@example.com',
                firstName: (formData.get('firstName') as string) || 'New',
                lastName: (formData.get('lastName') as string) || 'User',
                role: 'member',
                status: 'active'
            }
        };
    },

    me: async () => {
        // Mock profile
        return {
            success: true,
            user: {
                id: 1,
                email: 'mock@example.com',
                firstName: 'Pharmacist',
                lastName: 'Sample',
                role: 'member',
                country: 'Thailand'
            }
        };
    },

    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },
};
