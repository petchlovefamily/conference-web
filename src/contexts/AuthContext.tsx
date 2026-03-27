'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    country?: string | null;
    delegateType?: string;
    isThai?: boolean;
    phone?: string | null;
    pharmacyLicenseId?: string | null;
    // Computed display name for backward compatibility
    name: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_UNAUTHORIZED_EVENT = 'conference-web-auth:unauthorized';

function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}

async function verifyTokenWithApi(tokenToVerify: string): Promise<User | null> {
    // Handle mock tokens for in-memory mockup
    if (tokenToVerify?.startsWith('mock-jwt-token-')) {
        try {
            const base64Payload = tokenToVerify.split('-').pop() || '';
            const payload = JSON.parse(atob(base64Payload));
            return {
                id: 1,
                email: payload.email || 'mock@example.com',
                firstName: payload.firstName || 'Pharmacist',
                lastName: payload.lastName || 'Sample',
                role: payload.role || 'member',
                name: `${payload.firstName || 'Pharmacist'} ${payload.lastName || 'Sample'}`.trim(),
            };
        } catch (e) {
            console.error('Failed to parse mock token:', e);
        }
    }

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/users/profile`, {
            headers: {
                'Authorization': `Bearer ${tokenToVerify}`,
            },
        });

        if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) {
                return {
                    ...data.user,
                    name: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() || data.user.email,
                };
            }
        }
    } catch (error) {
        console.error('Token verification failed:', error);
    }
    return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ตรวจสอบ login state ตอนโหลดหน้า
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // 1. Check URL parameters for SSO/Token (Auto-login)
                const urlParams = new URLSearchParams(window.location.search);
                const urlToken = urlParams.get('token') || urlParams.get('sso');

                let resolvedToken = urlToken || localStorage.getItem('token');

                // DEFAULT MOCK LOGIN: If no token is found, use a default mock token
                if (!resolvedToken) {
                    resolvedToken = 'mock-jwt-token-eyJlbWFpbCI6InBocmlzMjAyNkBleGFtcGxlLmNvbSIsImZpcnN0TmFtZSI6IlNoYXJlZCIsImxhc3ROYW1lIjoiTW9ja3VwIn0=';
                }

                if (!resolvedToken || isTokenExpired(resolvedToken)) {
                    if (!urlToken && !resolvedToken.startsWith('mock-')) { // Only clear if we didn't just try to login via URL or Mock
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                    if (!resolvedToken.startsWith('mock-')) {
                        setIsLoading(false);
                        return;
                    }
                }

                // Verify token with API
                const profileUser = await verifyTokenWithApi(resolvedToken);

                if (profileUser) {
                    setToken(resolvedToken);
                    setUser(profileUser);
                    localStorage.setItem('token', resolvedToken);
                    localStorage.setItem('user', JSON.stringify(profileUser));

                    // If we logged in via URL, clean up the URL
                    if (urlToken) {
                        const newUrl = window.location.pathname + window.location.search.replace(/[?&](token|sso)=[^&]+/, '').replace(/^&/, '?');
                        window.history.replaceState({}, '', newUrl);
                    }
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Centralized 401 handling
    useEffect(() => {
        const handleUnauthorized = () => {
            console.warn('Unauthorized API response, logging out');
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        };

        window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
        return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    }, []);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        isLoggedIn: !!user && !!token,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use auth
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
