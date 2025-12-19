/**
 * Chat store using Zustand.
 * Manages conversations, messages, and chat state.
 */

import { create } from 'zustand';
import { conversationsApi, messagesApi } from '../api';

const useChatStore = create((set, get) => ({
    // State
    conversations: [],
    activeConversation: null,
    messages: [],
    isLoading: false,
    typingUsers: {}, // { conversationId: [userId, ...] }

    // Actions

    // Fetch all conversations
    fetchConversations: async () => {
        set({ isLoading: true });
        try {
            const data = await conversationsApi.getAll();
            set({ conversations: data.conversations || [], isLoading: false });
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
            set({ isLoading: false });
        }
    },

    // Select a conversation
    selectConversation: async (conversationId) => {
        const conversation = get().conversations.find(c => c.id === conversationId);
        set({ activeConversation: conversation, messages: [], isLoading: true });

        try {
            const data = await messagesApi.getByConversation(conversationId);
            set({ messages: data.messages || [], isLoading: false });
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            set({ isLoading: false });
        }
    },

    // Add new message (from socket) - prevent duplicates
    addMessage: (message) => {
        set((state) => {
            // Check if message already exists (prevent duplicates)
            const exists = state.messages.some(m => m.id === message.id);
            if (exists) {
                return state;
            }

            // Only add if it's for the active conversation or update conversation list
            const isActiveConversation = state.activeConversation?.id === message.conversation_id;

            return {
                messages: isActiveConversation
                    ? [...state.messages, message]
                    : state.messages,
                // Update conversation's last message
                conversations: state.conversations.map(conv =>
                    conv.id === message.conversation_id
                        ? { ...conv, last_message: message }
                        : conv
                ),
            };
        });
    },

    // Create direct conversation
    createDirectChat: async (userId) => {
        try {
            const conversation = await conversationsApi.createDirect(userId);
            set((state) => ({
                conversations: [conversation, ...state.conversations],
                activeConversation: conversation,
            }));
            return conversation;
        } catch (error) {
            console.error('Failed to create conversation:', error);
            return null;
        }
    },

    // Set typing indicator
    setTyping: (conversationId, userId, isTyping) => {
        set((state) => {
            const current = state.typingUsers[conversationId] || [];
            const updated = isTyping
                ? [...new Set([...current, userId])]
                : current.filter(id => id !== userId);

            return {
                typingUsers: {
                    ...state.typingUsers,
                    [conversationId]: updated,
                },
            };
        });
    },

    // Mark messages as read
    markAsRead: async (messageIds) => {
        try {
            await messagesApi.markAsRead(messageIds);
            set((state) => ({
                messages: state.messages.map(msg =>
                    messageIds.includes(msg.id)
                        ? { ...msg, is_read: true }
                        : msg
                ),
            }));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    },

    // Update online status for a user
    setUserOnline: (userId, isOnline) => {
        set((state) => ({
            conversations: state.conversations.map(conv => ({
                ...conv,
                members: conv.members?.map(m =>
                    m.user_id === userId ? { ...m, is_online: isOnline } : m
                ),
            })),
        }));
    },

    // Clear chat state
    clear: () => set({
        conversations: [],
        activeConversation: null,
        messages: [],
        typingUsers: {},
    }),
}));

export default useChatStore;
