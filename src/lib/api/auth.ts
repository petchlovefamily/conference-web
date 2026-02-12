import { api } from './client';

// Types
export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface LoginResponse {
    success: boolean;
    token: string;
    user: User;
}

interface RegisterData {
    email: string;
    password: string;
    name: string;
    phone?: string;
    organization?: string;
}

interface RegisterResponse {
    success: boolean;
    message: string;
    data: { id: number; email: string; name: string };
}

// Auth API
export const authApi = {
    login: (email: string, password: string) =>
        api.post<LoginResponse>('/api/auth/login', { email, password }),

    register: (data: RegisterData) =>
        api.post<RegisterResponse>('/api/auth/register', data),

    me: () => api.get<{ success: boolean; user: User }>('/api/auth/me'),

    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },
};
