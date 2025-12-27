import axios from 'axios';

// Determine API base URL based on environment
const getBaseURL = () => {
    // In development, use Vite proxy (empty = same origin)
    if (import.meta.env.DEV) {
        return '';
    }
    // In production, use environment variable or deployed Render URL
    return import.meta.env.VITE_API_URL || 'https://smart-career-advisor-api.onrender.com';
};

const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle common error cases
        if (error.response) {
            const { status, data } = error.response;
            const errorMessage = data?.error || data?.message || 'An error occurred';

            switch (status) {
                case 401:
                    // Unauthorized - might need to redirect to login
                    console.log('Unauthorized access');
                    break;
                case 404:
                    // Not found
                    console.log('Resource not found');
                    break;
                case 409:
                    // Conflict - duplicate email/username
                    break;
                case 429:
                    // Rate limited
                    break;
                case 500:
                    // Server error
                    console.log('Server error');
                    break;
            }

            return Promise.reject({ status, message: errorMessage });
        } else if (error.request) {
            // Network error
            return Promise.reject({ status: 0, message: 'Connection failed. Please check your internet connection.' });
        }

        return Promise.reject({ status: -1, message: error.message });
    }
);

export default api;
