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
    fetchConversations: async (forceRefresh = false) => {
        const { conversations } = get();

        // Only show loading if no conversations loaded yet
        if (conversations.length === 0 || forceRefresh) {
            set({ isLoading: true });
        }

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
        const { activeConversation } = get();

        // If already on this conversation, don't refetch
        if (activeConversation?.id === conversationId) {
            return;
        }

        const conversation = get().conversations.find(c => c.id === conversationId);
        // Set conversation immediately, don't show loading (fetch in background)
        set({ activeConversation: conversation, messages: [] });

        try {
            const data = await messagesApi.getByConversation(conversationId);
            // Only update if still on same conversation
            if (get().activeConversation?.id === conversationId) {
                set({ messages: data.messages || [] });
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    },

    // Add a pending message (for optimistic UI)
    addPendingMessage: (message) => {
        set((state) => ({
            messages: [...state.messages, { ...message, isPending: true }],
        }));
    },

    // Add new message (from socket) - prevent duplicates and update pending messages
    addMessage: (message, currentUserId) => {
        set((state) => {
            // Check if message already exists by id
            const existsById = state.messages.some(m => m.id === message.id);
            if (existsById) {
                return state;
            }

            // Check if we have a pending message with same nonce (optimistic update)
            const pendingIndex = state.messages.findIndex(
                m => m.isPending && m.nonce === message.nonce
            );

            const isActiveConversation = state.activeConversation?.id === message.conversation_id;
            const isFromOtherUser = message.sender_id !== currentUserId;

            let updatedMessages;
            if (pendingIndex !== -1) {
                // Replace pending message with confirmed message
                updatedMessages = [...state.messages];
                updatedMessages[pendingIndex] = { ...message, isPending: false };
            } else {
                // Only add if it's for the active conversation
                updatedMessages = isActiveConversation
                    ? [...state.messages, message]
                    : state.messages;
            }

            return {
                messages: updatedMessages,
                // Update conversation's last message and increment unread count if not active
                conversations: state.conversations.map(conv =>
                    conv.id === message.conversation_id
                        ? {
                            ...conv,
                            last_message: message,
                            // Increment unread count if message is from other user and not in active conversation
                            unread_count: (!isActiveConversation && isFromOtherUser)
                                ? (conv.unread_count || 0) + 1
                                : conv.unread_count
                        }
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

    // Clear unread count for a conversation
    clearUnreadCount: (conversationId) => {
        set((state) => ({
            conversations: state.conversations.map(conv =>
                conv.id === conversationId
                    ? { ...conv, unread_count: 0 }
                    : conv
            ),
        }));
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
