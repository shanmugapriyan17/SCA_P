import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

// Token storage helpers
const getStoredToken = () => localStorage.getItem('authToken');
const setStoredToken = (token) => localStorage.setItem('authToken', token);
const removeStoredToken = () => localStorage.removeItem('authToken');

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check session/token on mount
    const checkSession = useCallback(async () => {
        const token = getStoredToken();

        if (!token) {
            setIsAuthenticated(false);
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            // Set token in API headers
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Try to get profile (this validates the token)
            const profileResponse = await api.get('/api/profile');
            setIsAuthenticated(true);
            setUser(profileResponse.data.user || profileResponse.data);
        } catch (error) {
            console.error('Session check failed:', error);
            // Token invalid or expired
            removeStoredToken();
            delete api.defaults.headers.common['Authorization'];
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
        if (response.data.success && response.data.token) {
            // Store token
            setStoredToken(response.data.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

            setIsAuthenticated(true);

            // Fetch profile
            try {
                const profileResponse = await api.get('/api/profile');
                setUser(profileResponse.data.user || profileResponse.data);
            } catch (err) {
                console.error('Failed to fetch profile after login:', err);
                setUser(response.data.user);
            }
        }
        return response.data;
    };

    // Signup function
    const signup = async (username, email, password) => {
        const response = await api.post('/api/auth/register', { username, email, password });
        if (response.data.success && response.data.token) {
            // Store token
            setStoredToken(response.data.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

            setIsAuthenticated(true);

            // Fetch profile
            try {
                const profileResponse = await api.get('/api/profile');
                setUser(profileResponse.data.user || profileResponse.data);
            } catch (err) {
                console.error('Failed to fetch profile after signup:', err);
                setUser(response.data.user);
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
            removeStoredToken();
            delete api.defaults.headers.common['Authorization'];
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    // Refresh user profile
    const refreshProfile = async () => {
        try {
            const response = await api.get('/api/profile');
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
