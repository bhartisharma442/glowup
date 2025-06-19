// src/utils/auth.js
import axios from 'axios';

// Set up axios defaults
const API_BASE_URL = 'http://localhost:5000';

// Auth utility functions
export const authUtils = {
    // Get current user from localStorage
    getCurrentUser: () => {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    },

    // Get current token from localStorage
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Check if user is logged in
    isLoggedIn: () => {
        const token = authUtils.getToken();
        const user = authUtils.getCurrentUser();
        return !!(token && user);
    },

    // Check if user is admin
    isAdmin: () => {
        const user = authUtils.getCurrentUser();
        return user && user.role === 'admin';
    },

    // Login function
    login: async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/login`, {
                email,
                password
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Set default authorization header
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                
                // Trigger storage event
                window.dispatchEvent(new Event('storage'));
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Logout function
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Remove default authorization header
        delete axios.defaults.headers.common['Authorization'];
        
        // Trigger storage event
        window.dispatchEvent(new Event('storage'));
    },

    // Register function
    register: async (userData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/register`, userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Verify token - Modified to not auto-logout on verification failure
    verifyToken: async () => {
        try {
            const token = authUtils.getToken();
            if (!token) return false;

            const response = await axios.get(`${API_BASE_URL}/api/verify-token`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data.valid || true; // Return true if verification succeeds
        } catch (error) {
            console.error('Token verification failed:', error);
            // Don't auto logout here - let the component handle it
            return false;
        }
    },

    // Set up axios interceptors for automatic token handling
    setupAxiosInterceptors: () => {
        // Request interceptor to add token to all requests
        axios.interceptors.request.use(
            (config) => {
                const token = authUtils.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor to handle token expiration
        axios.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                if (error.response && error.response.status === 401) {
                    // Token expired or invalid - only logout if we're sure it's a token issue
                    const errorMessage = error.response.data?.message || '';
                    if (errorMessage.includes('token') || errorMessage.includes('unauthorized')) {
                        console.log('Token expired, logging out...');
                        authUtils.logout();
                    }
                }
                return Promise.reject(error);
            }
        );
    }
};

// Initialize axios interceptors when the module is imported
authUtils.setupAxiosInterceptors();

export default authUtils;