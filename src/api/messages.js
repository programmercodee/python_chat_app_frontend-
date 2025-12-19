/**
 * Messages API calls.
 */

import api from './axios';

export const messagesApi = {
    // Get messages for a conversation
    getByConversation: async (conversationId, page = 1, pageSize = 50) => {
        const response = await api.get(`/messages/conversation/${conversationId}`, {
            params: { page, page_size: pageSize },
        });
        return response.data;
    },

    // Send a message (via REST - prefer Socket.IO for real-time)
    send: async (conversationId, encryptedContent, nonce, contentType = 'text') => {
        const response = await api.post('/messages', {
            conversation_id: conversationId,
            encrypted_content: encryptedContent,
            nonce,
            content_type: contentType,
        });
        return response.data;
    },

    // Mark messages as read
    markAsRead: async (messageIds) => {
        const response = await api.post('/messages/read', {
            message_ids: messageIds,
        });
        return response.data;
    },
};
