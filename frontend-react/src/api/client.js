import axios from 'axios';

// In production, call Render backend directly (not through Vercel proxy)
// This is necessary for session cookies to work properly
const getBaseURL = () => {
    if (import.meta.env.DEV) {
        return '';  // Vite proxy handles this in development
    }
    // Production: call Render directly
    return 'https://smart-career-advisor-api.onrender.com';
};

const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,  // Required for cross-domain cookies
    headers: {
        'Content-Type': 'application/json',
    }
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status, data } = error.response;
            const errorMessage = data?.error || data?.message || 'An error occurred';

            switch (status) {
                case 401:
                    console.log('Unauthorized access - session may have expired');
                    break;
                case 404:
                    console.log('Resource not found');
                    break;
                case 409:
                    // Conflict - duplicate email/username
                    break;
                case 429:
                    // Rate limited
                    break;
                case 500:
                    console.log('Server error');
                    break;
            }

            return Promise.reject({ status, message: errorMessage });
        } else if (error.request) {
            return Promise.reject({ status: 0, message: 'Connection failed. Please check your internet connection.' });
        }

        return Promise.reject({ status: -1, message: error.message });
    }
);

export default api;
