import axios from 'axios';

// Determine API base URL
const getBaseURL = () => {
    // In development, use Vite proxy (same origin)
    if (import.meta.env.DEV) {
        return '';
    }
    // In production, use environment variable
    return import.meta.env.VITE_API_BASE_URL || '';
};

const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true, // Enable cookies for cross-origin requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle common error cases
        if (error.response) {
            const { status, data } = error.response;

            // Return the error with proper message
            const errorMessage = data?.error || 'An error occurred';

            switch (status) {
                case 401:
                    // Unauthorized - might need to redirect to login
                    break;
                case 409:
                    // Conflict - duplicate email/username
                    break;
                case 429:
                    // Rate limited
                    break;
                case 500:
                    // Server error
                    break;
            }

            return Promise.reject({ status, message: errorMessage });
        } else if (error.request) {
            // Network error
            return Promise.reject({ status: 0, message: 'Connection failed. Please try again' });
        }

        return Promise.reject({ status: -1, message: error.message });
    }
);

export default api;
