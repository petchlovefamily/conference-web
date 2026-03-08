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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ตรวจสอบ login state ตอนโหลดหน้า
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                if (!storedToken) {
                    setIsLoading(false);
                    return;
                }

                // Verify token by fetching user profile
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/users/profile`, {
                    headers: {
                        'Authorization': `Bearer ${storedToken}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.user) {
                        const profileUser = {
                            ...data.user,
                            name: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() || data.user.email,
                        };
                        setToken(storedToken);
                        setUser(profileUser);
                        localStorage.setItem('user', JSON.stringify(profileUser));
                    } else {
                        throw new Error('Invalid profile response');
                    }
                } else {
                    throw new Error('Token verification failed');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                // Clear invalid data
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
