/**
 * Conversations API calls.
 */

import api from './axios';

export const conversationsApi = {
    // Get all conversations
    getAll: async () => {
        const response = await api.get('/conversations');
        return response.data;
    },

    // Get single conversation
    getById: async (id) => {
        const response = await api.get(`/conversations/${id}`);
        return response.data;
    },

    // Create direct conversation
    createDirect: async (userId) => {
        const response = await api.post('/conversations', {
            type: 'direct',
            member_ids: [userId],
        });
        return response.data;
    },

    // Create group conversation
    createGroup: async (name, memberIds) => {
        const response = await api.post('/conversations', {
            type: 'group',
            name,
            member_ids: memberIds,
        });
        return response.data;
    },

    // Add member to group
    addMember: async (conversationId, userId) => {
        const response = await api.post(`/conversations/${conversationId}/members`, {
            user_id: userId,
        });
        return response.data;
    },

    // Remove member from group
    removeMember: async (conversationId, userId) => {
        await api.delete(`/conversations/${conversationId}/members/${userId}`);
    },
};
