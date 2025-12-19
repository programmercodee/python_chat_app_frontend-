/**
 * Contacts API calls.
 */

import api from './axios';

export const contactsApi = {
    // Get all contacts
    getAll: async (status = null) => {
        const params = status ? { status } : {};
        const response = await api.get('/contacts', { params });
        return response.data;
    },

    // Add a contact
    add: async (contactId, nickname = null) => {
        const response = await api.post('/contacts', {
            contact_id: contactId,
            nickname,
        });
        return response.data;
    },

    // Get pending requests
    getPendingRequests: async () => {
        const response = await api.get('/contacts/requests');
        return response.data;
    },

    // Accept a contact request
    accept: async (requestId) => {
        const response = await api.post(`/contacts/requests/${requestId}/accept`);
        return response.data;
    },

    // Block a user
    block: async (contactId) => {
        const response = await api.post(`/contacts/${contactId}/block`);
        return response.data;
    },

    // Remove a contact
    remove: async (contactId) => {
        await api.delete(`/contacts/${contactId}`);
    },
};
