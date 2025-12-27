import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check session on mount
    const checkSession = useCallback(async () => {
        try {
            const response = await api.get('/api/session');
            if (response.data.authenticated) {
                setIsAuthenticated(true);
                // Fetch user profile
                try {
                    const profileResponse = await api.get('/api/profile');
                    // Extract user object from response
                    setUser(profileResponse.data.user || profileResponse.data);
                } catch (err) {
                    console.error('Failed to fetch profile:', err);
                }
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.error('Session check failed:', error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    // Login function
    const login = async (email, password) => {
        const response = await api.post('/api/auth/login', { email, password });
        if (response.data.success) {
            setIsAuthenticated(true);
            // Fetch profile after login
            try {
                const profileResponse = await api.get('/api/profile');
                // Extract user object from response
                setUser(profileResponse.data.user || profileResponse.data);
            } catch (err) {
                console.error('Failed to fetch profile after login:', err);
            }
        }
        return response.data;
    };

    // Signup function
    const signup = async (username, email, password) => {
        const response = await api.post('/api/auth/register', { username, email, password });
        if (response.data.success) {
            setIsAuthenticated(true);
            // Fetch profile after signup
            try {
                const profileResponse = await api.get('/api/profile');
                // Extract user object from response
                setUser(profileResponse.data.user || profileResponse.data);
            } catch (err) {
                console.error('Failed to fetch profile after signup:', err);
            }
        }
        return response.data;
    };

    // Logout function
    const logout = async () => {
        try {
            await api.post('/api/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    // Refresh user profile
    const refreshProfile = async () => {
        try {
            const response = await api.get('/api/profile');
            // Extract user object from response
            const userData = response.data.user || response.data;
            setUser(userData);
            return userData;
        } catch (error) {
            console.error('Failed to refresh profile:', error);
            throw error;
        }
    };

    const value = {
        isAuthenticated,
        user,
        loading,
        login,
        signup,
        logout,
        checkSession,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
