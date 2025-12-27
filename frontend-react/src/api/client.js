import axios from 'axios';

// With Vercel rewrites/proxy, all API calls go through same origin
// No need for cross-domain - Vercel proxies /api/* to Render backend
const api = axios.create({
    baseURL: '',  // Empty = same origin (works with Vercel proxy)
    withCredentials: true,
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
                    console.log('Unauthorized access');
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
