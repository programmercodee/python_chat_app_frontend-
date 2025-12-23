/**
 * Auth store using Zustand.
 * Manages user authentication state.
 */

import { create } from 'zustand';
import { authApi } from '../api';

// Helper to extract robust error message
const getErrorMessage = (error, type = 'default') => {
    // Try to get message from backend response
    let message = error.response?.data?.detail;

    // If backend sent a message, use it
    if (message) return message;

    // If no message but we have a response (server error, 404, etc.)
    if (error.response) {
        const status = error.response.status;

        switch (type) {
            case 'loginWithGoogle':
                if (status === 404) return "Account not found. Please create an account first.";
                if (status === 400) return "Invalid Google account data received.";
                return "Unable to sign in with Google. Please try again.";

            case 'registerWithGoogle':
                if (status === 409) return "Account already exists. Please sign in instead.";
                if (status === 400) return "Invalid Google account data received.";
                return "Unable to sign up with Google. Please try again.";

            case 'login':
                if (status === 401) return "Invalid email or password.";
                return "Login failed. Please try again.";

            case 'register':
                if (status === 409) return "Email already registered.";
                return "Registration failed. Please try again.";

            default:
                return "An unexpected error occurred.";
        }
    }

    // Network error or no response
    return "Connection failed. Please check your internet.";
};

const useAuthStore = create((set, get) => ({
    // State
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    // Actions

    // Login user
    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const data = await authApi.login(email, password);

            // Store tokens
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);

            // Get user data
            const user = await authApi.me();

            // Store user ID for socket handlers
            localStorage.setItem('userId', user.id);

            set({ user, isAuthenticated: true, isLoading: false });
            return { success: true };
        } catch (error) {
            const message = getErrorMessage(error, 'login');
            set({ error: message, isLoading: false });
            return { success: false, error: message };
        }
    },

    // Login with Google OAuth (existing users only)
    loginWithGoogle: async (idToken) => {
        set({ isLoading: true, error: null });
        try {
            // Send Google ID token to backend for verification
            const data = await authApi.googleLogin(idToken);

            // Store tokens (our JWT, not Google's)
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);

            // Get user data
            const user = await authApi.me();

            // Store user ID for socket handlers
            localStorage.setItem('userId', user.id);

            set({ user, isAuthenticated: true, isLoading: false });
            return { success: true };
        } catch (error) {
            const message = getErrorMessage(error, 'loginWithGoogle');
            set({ error: message, isLoading: false });
            return { success: false, error: message };
        }
    },

    // Register with Google OAuth (new users only)
    registerWithGoogle: async (idToken) => {
        set({ isLoading: true, error: null });
        try {
            // Send Google ID token to backend for registration
            const data = await authApi.googleRegister(idToken);

            // Store tokens (our JWT, not Google's)
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);

            // Get user data
            const user = await authApi.me();

            // Store user ID for socket handlers
            localStorage.setItem('userId', user.id);

            set({ user, isAuthenticated: true, isLoading: false });
            return { success: true };
        } catch (error) {
            const message = getErrorMessage(error, 'registerWithGoogle');
            set({ error: message, isLoading: false });
            return { success: false, error: message };
        }
    },

    // Register new user
    register: async (email, username, password) => {
        set({ isLoading: true, error: null });
        try {
            await authApi.register(email, username, password);

            // Auto-login after register
            return await get().login(email, password);
        } catch (error) {
            const message = getErrorMessage(error, 'register');
            set({ error: message, isLoading: false });
            return { success: false, error: message };
        }
    },

    // Logout user - clear all storage and reset state
    logout: () => {
        // Clear all localStorage
        localStorage.clear();

        // Also clear sessionStorage if used
        sessionStorage.clear();

        // Reset auth state
        set({ user: null, isAuthenticated: false, error: null, isLoading: false });

        // Redirect to login
        window.location.href = '/login';
    },

    // Check auth status (on app load)
    checkAuth: async () => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            set({ isLoading: false, isAuthenticated: false });
            return;
        }

        try {
            const user = await authApi.me();
            // Store user ID for socket handlers
            localStorage.setItem('userId', user.id);
            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            // Token invalid, clear it
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            set({ isLoading: false, isAuthenticated: false });
        }
    },

    // Clear error
    clearError: () => set({ error: null }),

    /**
     * Update user data in the store.
     * Used when user updates their profile (e.g., avatar).
     */
    setUser: (userData) => set({ user: userData }),
}));

export default useAuthStore;
