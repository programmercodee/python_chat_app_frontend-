/**
 * Socket store using Zustand.
 * Manages Socket.IO connection.
 */

import { create } from 'zustand';
import { io } from 'socket.io-client';

// Use environment variable for Socket URL (set in .env or Render dashboard)
// Development: http://localhost:8000
// Production: https://your-backend.onrender.com
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

const useSocketStore = create((set, get) => ({
    // State
    socket: null,
    isConnected: false,
    onlineUsers: new Set(),

    // Actions

    // Connect to socket server
    connect: (token) => {
        const existingSocket = get().socket;
        if (existingSocket?.connected) {
            return existingSocket;
        }

        if (existingSocket) {
            existingSocket.disconnect();
        }

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            set({ isConnected: true });

            // Setup call signaling listeners when socket connects
            import('./callStore').then(module => {
                module.setupCallSocketListeners();
            });
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            set({ isConnected: false });
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            set({ isConnected: false });
        });

        // Track online users
        socket.on('user_online', (data) => {
            console.log('User online:', data.user_id);
            set((state) => {
                const newOnline = new Set(state.onlineUsers);
                newOnline.add(data.user_id);
                return { onlineUsers: newOnline };
            });
        });

        socket.on('user_offline', (data) => {
            console.log('User offline:', data.user_id);
            set((state) => {
                const newOnline = new Set(state.onlineUsers);
                newOnline.delete(data.user_id);
                return { onlineUsers: newOnline };
            });
        });

        socket.on('online_users', (data) => {
            console.log('Online users:', data.users);
            set({ onlineUsers: new Set(data.users) });
        });

        set({ socket });
        return socket;
    },

    // Disconnect from socket server
    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, isConnected: false, onlineUsers: new Set() });
        }
    },

    // Check if user is online
    isUserOnline: (userId) => {
        return get().onlineUsers.has(userId);
    },

    // Request online status for specific users
    requestOnlineStatus: (userIds) => {
        const { socket } = get();
        if (socket && userIds.length > 0) {
            socket.emit('get_online_users', { user_ids: userIds });
        }
    },

    // Send a message
    sendMessage: (conversationId, encryptedContent, nonce, contentType = 'text') => {
        const { socket } = get();
        if (socket) {
            socket.emit('send_message', {
                conversation_id: conversationId,
                encrypted_content: encryptedContent,
                nonce,
                content_type: contentType,
            });
        }
    },

    // Start typing
    startTyping: (conversationId) => {
        const { socket } = get();
        if (socket) {
            socket.emit('typing_start', { conversation_id: conversationId });
        }
    },

    // Stop typing
    stopTyping: (conversationId) => {
        const { socket } = get();
        if (socket) {
            socket.emit('typing_stop', { conversation_id: conversationId });
        }
    },

    // Mark messages as read
    markRead: (messageIds) => {
        const { socket } = get();
        if (socket && messageIds.length > 0) {
            socket.emit('message_read', { message_ids: messageIds });
        }
    },

    // Confirm message delivery to server
    confirmDelivery: (messageId) => {
        const { socket } = get();
        if (socket) {
            socket.emit('message_delivered', { message_id: messageId });
        }
    },
}));

export default useSocketStore;
