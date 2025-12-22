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

    // Google OAuth
    googleAuth: async (idToken) => {
        const response = await api.post('/auth/google', { id_token: idToken });
        return response.data;
    },
};
