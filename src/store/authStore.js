/**
 * Auth store using Zustand.
 * Manages user authentication state.
 */

import { create } from 'zustand';
import { authApi } from '../api';

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
            const message = error.response?.data?.detail || 'Login failed';
            set({ error: message, isLoading: false });
            return { success: false, error: message };
        }
    },

    // Login with Google OAuth
    loginWithGoogle: async (idToken) => {
        set({ isLoading: true, error: null });
        try {
            // Send Google ID token to backend for verification
            const data = await authApi.googleAuth(idToken);

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
            const message = error.response?.data?.detail || 'Google login failed';
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
            const message = error.response?.data?.detail || 'Registration failed';
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
