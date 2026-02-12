import { API_URL } from '@/config';

// Get token from localStorage
const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

// Generic API call function
export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

// HTTP method helpers
export const api = {
    get: <T>(endpoint: string) => apiClient<T>(endpoint),

    post: <T>(endpoint: string, data: unknown) =>
        apiClient<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    put: <T>(endpoint: string, data: unknown) =>
        apiClient<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: <T>(endpoint: string) =>
        apiClient<T>(endpoint, { method: 'DELETE' }),
};
