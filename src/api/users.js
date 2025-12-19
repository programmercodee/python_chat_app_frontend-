/**
 * Users API calls.
 */

import api from './axios';

export const usersApi = {
    // Search users
    search: async (query, limit = 20) => {
        const response = await api.get('/users/search', {
            params: { q: query, limit },
        });
        return response.data;
    },

    // Get user by ID
    getById: async (userId) => {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    },

    // Update profile
    updateProfile: async (data) => {
        const response = await api.patch('/users/me', data);
        return response.data;
    },

    // Get user's public key
    getPublicKey: async (userId) => {
        const response = await api.get(`/users/${userId}/public-key`);
        return response.data;
    },

    // Update public key
    updatePublicKey: async (publicKey) => {
        const response = await api.put('/users/me/public-key', {
            public_key: publicKey,
        });
        return response.data;
    },

    // Get user online status
    getStatus: async (userId) => {
        const response = await api.get(`/users/${userId}/status`);
        return response.data;
    },
};
