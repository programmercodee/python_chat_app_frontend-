/**
 * Auth API calls.
 */

import api from './axios';

export const authApi = {
    // Register new user
    register: async (email, username, password) => {
        const response = await api.post('/auth/register', {
            email,
            username,
            password,
        });
        return response.data;
    },

    // Login user
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    // Refresh access token
    refresh: async (refreshToken) => {
        const response = await api.post('/auth/refresh', {
            refresh_token: refreshToken,
        });
        return response.data;
    },

    // Get current user
    me: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Google OAuth - Login (existing users only)
    googleLogin: async (idToken) => {
        const response = await api.post('/auth/google/login', { id_token: idToken });
        return response.data;
    },

    // Google OAuth - Register Step 1 (returns pending data for username selection)
    googleRegister: async (idToken) => {
        const response = await api.post('/auth/google/register', { id_token: idToken });
        return response.data;
    },

    // Google OAuth - Register Step 2 (complete registration with username)
    completeGoogleRegistration: async (pendingData, username) => {
        const response = await api.post('/auth/google/complete-registration', {
            email: pendingData.email,
            google_id: pendingData.google_id,
            name: pendingData.name,
            picture: pendingData.picture,
            username: username,
        });
        return response.data;
    },

    // Check username availability (for real-time validation)
    checkUsername: async (username) => {
        const response = await api.get(`/auth/check-username?username=${encodeURIComponent(username)}`);
        return response.data;
    },

    // Password Reset Flow
    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    verifyOtp: async (email, otp) => {
        const response = await api.post('/auth/verify-otp', { email, otp });
        return response.data; // returns { reset_token: "..." }
    },

    resetPassword: async (token, newPassword) => {
        // We need to set the Authorization header manually for this request since it uses a specific reset token
        // NOT the logged-in user's access token (if any)
        const response = await api.post('/auth/reset-password',
            { new_password: newPassword },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    },
};
