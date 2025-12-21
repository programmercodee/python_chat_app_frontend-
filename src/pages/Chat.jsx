/**
 * Chat page - Main chat interface.
 */

import { useEffect, useState, useRef } from 'react';
import { MessageCircle, Plus, Send, Paperclip, Smile, ArrowLeft, Clock, Search } from 'lucide-react';
import { useAuthStore, useChatStore, useSocketStore } from '../store';
import { Avatar } from '../components/ui';

// Helper to decode base64 message
const decodeMessage = (encryptedContent) => {
    try {
        return atob(encryptedContent);
    } catch {
        return '🔒 Unable to decrypt';
    }
};

// Helper to format message time
const formatMessageTime = (dateString) => {
    // Ensure UTC dates are parsed correctly (backend stores in UTC)
    let dateStr = dateString;
    if (!dateStr.endsWith('Z') && !dateStr.includes('+')) {
        dateStr = dateStr + 'Z'; // treat as UTC if no timezone specified
    }
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) {
        return 'just now';
    } else if (diffMins < 60) {
        return `${diffMins} min ago`;
    } else if (diffHours < 24 && date.getDate() === now.getDate()) {
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } else {
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' +
            date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
};

export default function Chat() {
    const { user } = useAuthStore();
    const {
        conversations,
        activeConversation,
        messages,
        typingUsers,
        fetchConversations,
        selectConversation,
        addMessage,
        addPendingMessage,
        setTyping,
        setUserOnline,
        clearUnreadCount,
        isLoading
    } = useChatStore();
    const {
        socket,
        isConnected,
        connect,
        sendMessage,
        startTyping,
        stopTyping,
        isUserOnline,
        requestOnlineStatus,
        markRead
    } = useSocketStore();

    const [messageText, setMessageText] = useState('');
    const [showMobileChat, setShowMobileChat] = useState(false); // for mobile: show chat or list
    const [isInputFocused, setIsInputFocused] = useState(false); // for hiding nav when keyboard opens
    const [viewportHeight, setViewportHeight] = useState(window.innerHeight); // track viewport for keyboard
    const [searchQuery, setSearchQuery] = useState(''); // search filter for conversations
    const messagesEndRef = useRef(null);
    const socketInitialized = useRef(false);
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);
    const chatWindowRef = useRef(null);

    // Handle Visual Viewport API for mobile keyboard
    useEffect(() => {
        const updateViewportHeight = () => {
            // Use visualViewport if available (for mobile keyboard handling)
            const vh = window.visualViewport?.height || window.innerHeight;
            setViewportHeight(vh);

            // Update CSS custom property for dynamic viewport height
            document.documentElement.style.setProperty('--viewport-height', `${vh}px`);

            // Scroll the chat window into view when keyboard opens
            if (chatWindowRef.current && window.visualViewport) {
                const offsetTop = window.visualViewport.offsetTop;
                document.documentElement.style.setProperty('--viewport-offset', `${offsetTop}px`);
            }
        };

        // Initial update
        updateViewportHeight();

        // Listen for visual viewport changes (keyboard open/close)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', updateViewportHeight);
            window.visualViewport.addEventListener('scroll', updateViewportHeight);
        }

        // Fallback for browsers without visualViewport
        window.addEventListener('resize', updateViewportHeight);

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', updateViewportHeight);
                window.visualViewport.removeEventListener('scroll', updateViewportHeight);
            }
            window.removeEventListener('resize', updateViewportHeight);
        };
    }, []);

    // Fetch conversations on mount
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Connect socket when user is authenticated
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token && !socketInitialized.current) {
            socketInitialized.current = true;
            const s = connect(token);

            // Listen for new messages
            s.on('new_message', (msg) => {
                console.log('Received new message:', msg);
                // Get current user id from localStorage since user might not be in closure
                const currentUserId = localStorage.getItem('userId');
                addMessage(msg, currentUserId);
            });

            // Listen for typing events
            s.on('user_typing', (data) => {
                console.log('User typing:', data);
                setTyping(data.conversation_id, data.user_id, true);
            });

            s.on('user_stopped_typing', (data) => {
                console.log('User stopped typing:', data);
                setTyping(data.conversation_id, data.user_id, false);
            });

            // Listen for online/offline events
            s.on('user_online', (data) => {
                setUserOnline(data.user_id, true);
            });

            s.on('user_offline', (data) => {
                setUserOnline(data.user_id, false);
            });
        }

        return () => {
            // Don't disconnect on unmount - keep socket alive
        };
    }, [connect, addMessage, setTyping, setUserOnline]);

    // Request online status when conversations load
    useEffect(() => {
        if (conversations.length > 0 && isConnected) {
            const userIds = [];
            conversations.forEach(conv => {
                conv.members?.forEach(m => {
                    if (m.user_id !== user?.id && !userIds.includes(m.user_id)) {
                        userIds.push(m.user_id);
                    }
                });
            });
            if (userIds.length > 0) {
                requestOnlineStatus(userIds);
            }
        }
    }, [conversations, isConnected, user?.id, requestOnlineStatus]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mark messages as read when conversation is opened
    useEffect(() => {
        if (activeConversation && messages.length > 0 && user?.id) {
            // Find unread messages not sent by current user
            const unreadMessageIds = messages
                .filter(msg => !msg.is_read && msg.sender_id !== user.id)
                .map(msg => msg.id);

            if (unreadMessageIds.length > 0) {
                // Mark as read via socket
                markRead(unreadMessageIds);
                // Clear unread count in UI
                clearUnreadCount(activeConversation.id);
            } else {
                // Even if no unread messages, ensure badge is cleared
                clearUnreadCount(activeConversation.id);
            }
        }
    }, [activeConversation?.id, messages, user?.id, markRead, clearUnreadCount]);

    // toggle body class when input focused (for hiding nav)
    useEffect(() => {
        if (isInputFocused) {
            document.body.classList.add('keyboard-open');
        } else {
            document.body.classList.remove('keyboard-open');
        }
        return () => document.body.classList.remove('keyboard-open');
    }, [isInputFocused]);

    const handleSelectConversation = (id) => {
        selectConversation(id);
        setShowMobileChat(true); // show chat on mobile when conversation is selected
    };

    // go back to conversation list on mobile
    const handleBackToList = () => {
        console.log('Back button clicked'); // debug
        setShowMobileChat(false);
        setIsInputFocused(false); // clear input focus state
        document.body.classList.remove('keyboard-open');
    };

    const handleInputChange = (e) => {
        setMessageText(e.target.value);

        if (!activeConversation) return;

        // Send typing start event
        if (!isTypingRef.current && e.target.value.length > 0) {
            isTypingRef.current = true;
            startTyping(activeConversation.id);
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            if (isTypingRef.current) {
                isTypingRef.current = false;
                stopTyping(activeConversation.id);
            }
        }, 2000);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageText.trim() || !activeConversation) return;

        // Stop typing indicator
        if (isTypingRef.current) {
            isTypingRef.current = false;
            stopTyping(activeConversation.id);
        }
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        const encryptedContent = btoa(messageText);
        const nonce = btoa(Date.now().toString());

        // Create a pending message for optimistic UI (shows immediately with clock icon)
        const pendingMessage = {
            id: `pending-${nonce}`, // Temporary ID
            conversation_id: activeConversation.id,
            sender_id: user?.id,
            encrypted_content: encryptedContent,
            nonce: nonce,
            content_type: 'text',
            created_at: new Date().toISOString(),
            isPending: true,
        };

        // Add pending message to UI immediately
        addPendingMessage(pendingMessage);

        // Send via socket (server will respond with confirmed message)
        sendMessage(activeConversation.id, encryptedContent, nonce);
        setMessageText('');
    };

    const getOtherMember = (conv = activeConversation) => {
        if (!conv || conv.type === 'group') return null;
        return conv.members?.find(m => m.user_id !== user?.id);
    };

    const otherMember = getOtherMember();
    const chatName = activeConversation?.type === 'group'
        ? activeConversation.name
        : otherMember?.username || 'Chat';

    // Check online status from socket store
    const isOtherOnline = otherMember ? isUserOnline(otherMember.user_id) : false;

    // Check if other user is typing
    const typingInConversation = activeConversation
        ? (typingUsers[activeConversation.id] || []).filter(id => id !== user?.id)
        : [];
    const isOtherTyping = typingInConversation.length > 0;

    return (
        <div
            className={`flex h-full bg-[#0a0a0a] overflow-hidden relative ${isInputFocused ? 'keyboard-open' : ''}`}
        >
            {/* Chat List Panel - hidden on mobile when chat is open */}
            <div
                className="chat-list-panel flex-col bg-[#0f0f0f]"
                style={{
                    width: '360px',
                    minWidth: '360px',
                    borderRight: '1px solid #1f1f1f',
                    display: showMobileChat ? 'none' : 'flex', // hide on mobile when chat open
                }}
            >
                {/* Header */}
                <div className="!p-5 flex items-center justify-between border-b border-[#1f1f1f]">
                    <h1 className="text-2xl font-bold text-white">Chats</h1>
                    <button className="!p-2.5 rounded-[10px] bg-[#1a1a1a] border border-[#262626] text-[#a1a1aa] cursor-pointer flex items-center justify-center">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Box */}
                <div className="!px-4 !py-3 border-b border-[#1f1f1f]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search conversations..."
                            className="w-full !py-2.5 !pl-10 !pr-4 rounded-xl bg-[#1a1a1a] border border-[#262626] text-white text-sm outline-none placeholder:text-[#52525b] focus:border-blue-500/50 transition-colors"
                        />
                    </div>
                </div>

                {/* Connection Status */}
                {!isConnected && (
                    <div className="!py-3 !px-5 bg-red-500/10 border-b border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#ef4444',
                            animation: 'pulse 2s infinite',
                        }} />
                        Connecting to server...
                    </div>
                )}

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto !p-3">
                    {isLoading ? (
                        /* Loading state */
                        <div className="flex flex-col items-center justify-center h-full !p-10">
                            <div style={{
                                width: '40px',
                                height: '40px',
                                border: '3px solid #262626',
                                borderTop: '3px solid #3b82f6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                            }} />
                            <p className="text-[#71717a] !mt-4">Loading chats...</p>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-[#52525b] text-center !p-10">
                            <div className="w-20 h-20 rounded-[20px] bg-[#1a1a1a] flex items-center justify-center !mb-4">
                                <MessageCircle className="w-10 h-10 text-blue-500" />
                            </div>
                            <p className="text-base font-medium text-[#a1a1aa]">No conversations yet</p>
                            <p className="text-sm !mt-1">Start a new chat!</p>
                        </div>
                    ) : (
                        conversations
                            .filter((conv) => {
                                if (!searchQuery.trim()) return true;
                                const other = getOtherMember(conv);
                                const name = conv.type === 'group' ? conv.name : other?.username || '';
                                return name.toLowerCase().includes(searchQuery.toLowerCase());
                            })
                            .map((conv) => {
                                const other = getOtherMember(conv);
                                const name = conv.type === 'group' ? conv.name : other?.username || 'Unknown';
                                const isActive = activeConversation?.id === conv.id;
                                const otherIsOnline = other ? isUserOnline(other.user_id) : false;

                                // Check if typing in this conversation
                                const typingHere = (typingUsers[conv.id] || []).filter(id => id !== user?.id);

                                // Decode last message preview
                                const lastMsgPreview = typingHere.length > 0
                                    ? 'typing...'
                                    : conv.last_message?.encrypted_content
                                        ? decodeMessage(conv.last_message.encrypted_content)
                                        : 'No messages yet';

                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => handleSelectConversation(conv.id)}
                                        className="w-full flex items-center !gap-3 !p-3.5 !rounded-[14px] !mb-2 cursor-pointer text-left transition-all"
                                        style={{
                                            border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                                            backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : '#1a1a1a',
                                        }}
                                    >
                                        <Avatar name={name} isOnline={otherIsOnline} size="md" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p
                                                    className="text-sm font-medium truncate"
                                                    style={{ color: isActive ? 'white' : '#e4e4e7' }}
                                                >
                                                    {name}
                                                </p>
                                                {conv.last_message && (
                                                    <span className="text-xs text-[#52525b]">
                                                        {new Date(conv.last_message.created_at).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                            <p
                                                className="text-[13px] !mt-0.5 truncate"
                                                style={{
                                                    color: typingHere.length > 0 ? '#10b981' : '#71717a',
                                                    fontStyle: typingHere.length > 0 ? 'italic' : 'normal',
                                                }}
                                            >
                                                {lastMsgPreview}
                                            </p>
                                        </div>
                                        {conv.unread_count > 0 && (
                                            <span className="!py-1 !px-2.5 text-xs font-semibold bg-blue-500 text-white rounded-[10px]">
                                                {conv.unread_count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                    )}
                </div>
            </div>

            {/* Chat Window - takes full width on mobile */}
            <div
                ref={chatWindowRef}
                className="chat-window flex-1 flex-col bg-[#0a0a0a]"
                style={{
                    display: showMobileChat ? 'flex' : 'none', // show on mobile only when chat selected
                }}
            >
                {activeConversation ? (
                    <>
                        {/* Chat Header - fixed at top on mobile */}
                        <div
                            className="chat-header !py-4 !px-5 flex items-center gap-3 bg-[#0f0f0f] border-b border-[#1f1f1f]"
                            style={{
                                position: 'sticky',
                                top: 0,
                                zIndex: 50,
                                pointerEvents: 'auto',
                            }}
                        >
                            {/* Back button for mobile - go back to chat list */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Back button clicked!');
                                    setShowMobileChat(false);
                                    setIsInputFocused(false);
                                    document.body.classList.remove('keyboard-open');
                                }}
                                onTouchEnd={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Back button touched!');
                                    setShowMobileChat(false);
                                    setIsInputFocused(false);
                                    document.body.classList.remove('keyboard-open');
                                }}
                                className="mobile-back-btn !p-3 rounded-[10px] bg-[#1a1a1a] border border-[#262626] text-white cursor-pointer shrink-0"
                                style={{
                                    WebkitTapHighlightColor: 'transparent',
                                    touchAction: 'manipulation',
                                }}
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <Avatar name={chatName} isOnline={isOtherOnline} size="md" />
                            <div className="flex-1 min-w-0">
                                <h2 className="text-base font-semibold text-white">{chatName}</h2>
                                <p
                                    className="text-[13px]"
                                    style={{ color: isOtherTyping ? '#10b981' : (isOtherOnline ? '#10b981' : '#71717a') }}
                                >
                                    {isOtherTyping ? 'typing...' : (isOtherOnline ? 'Online' : 'Offline')}
                                </p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="messages-area flex-1 overflow-y-auto !p-6 flex flex-col gap-2">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full text-[#71717a]">
                                    Loading messages...
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-[#52525b]">
                                    <p className="text-[#a1a1aa]">No messages yet</p>
                                    <p className="text-sm">Send a message to start the conversation</p>
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg) => {
                                        const isOwn = msg.sender_id === user?.id;
                                        const messageContent = decodeMessage(msg.encrypted_content);

                                        return (
                                            <div
                                                key={msg.id}
                                                className="flex"
                                                style={{ justifyContent: isOwn ? 'flex-end' : 'flex-start' }}
                                            >
                                                <div
                                                    className="max-w-[70%] !py-3 !px-4 text-white"
                                                    style={{
                                                        borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                        backgroundColor: isOwn ? '#3b82f6' : '#1a1a1a',
                                                        opacity: msg.isPending ? 0.7 : 1,
                                                    }}
                                                >
                                                    <p className="text-sm break-words">{messageContent}</p>
                                                    <div
                                                        className="text-[11px] !mt-1 opacity-70 flex items-center gap-1"
                                                        style={{ justifyContent: isOwn ? 'flex-end' : 'flex-start' }}
                                                    >
                                                        {msg.isPending ? (
                                                            <>
                                                                <Clock className="w-3 h-3" />
                                                                <span>Sending...</span>
                                                            </>
                                                        ) : (
                                                            formatMessageTime(msg.created_at)
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Typing indicator */}
                                    {isOtherTyping && (
                                        <div className="flex justify-start !mb-2">
                                            <div className="!py-3.5 !px-[18px] rounded-[18px] rounded-bl-[4px] bg-[#1a1a1a] flex items-center gap-1.5">
                                                <span style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    backgroundColor: '#10b981',
                                                    borderRadius: '50%',
                                                    display: 'inline-block',
                                                    animation: 'typingBounce 1.2s ease-in-out infinite',
                                                }} />
                                                <span style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    backgroundColor: '#10b981',
                                                    borderRadius: '50%',
                                                    display: 'inline-block',
                                                    animation: 'typingBounce 1.2s ease-in-out 0.2s infinite',
                                                }} />
                                                <span style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    backgroundColor: '#10b981',
                                                    borderRadius: '50%',
                                                    display: 'inline-block',
                                                    animation: 'typingBounce 1.2s ease-in-out 0.4s infinite',
                                                }} />
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Message Input */}
                        <form
                            onSubmit={handleSendMessage}
                            className="message-input-form !py-3 !px-4 flex items-center gap-2 bg-[#0f0f0f] border-t border-[#1f1f1f]"
                        >
                            {/* Attachment button */}
                            <button
                                type="button"
                                className="!p-2.5 rounded-[10px] bg-transparent border-none text-[#71717a] cursor-pointer shrink-0"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>

                            {/* Message input - takes all available space */}
                            <input
                                type="text"
                                value={messageText}
                                onChange={handleInputChange}
                                onFocus={() => setIsInputFocused(true)}
                                onBlur={() => setIsInputFocused(false)}
                                placeholder="Type a message..."
                                className="flex-1 min-w-0 !py-3 !px-4 rounded-xl bg-[#1a1a1a] border border-[#262626] text-white text-base outline-none"
                            />

                            {/* Emoji button */}
                            <button
                                type="button"
                                className="!p-2.5 rounded-[10px] bg-transparent border-none text-[#71717a] cursor-pointer shrink-0"
                            >
                                <Smile className="w-5 h-5" />
                            </button>

                            {/* Send button - prevent blur on click so keyboard stays open */}
                            <button
                                type="submit"
                                disabled={!messageText.trim()}
                                onMouseDown={(e) => e.preventDefault()}
                                onTouchStart={(e) => {
                                    // prevent input blur when tapping send
                                    if (messageText.trim()) {
                                        e.preventDefault();
                                    }
                                }}
                                className="!p-3 rounded-xl border-none text-white flex items-center justify-center shrink-0"
                                style={{
                                    background: messageText.trim() ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : '#262626',
                                    cursor: messageText.trim() ? 'pointer' : 'not-allowed',
                                    WebkitTapHighlightColor: 'transparent',
                                }}
                            >
                                <Send className="w-[18px] h-[18px]" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#52525b]">
                        <div
                            className="w-[120px] h-[120px] rounded-[30px] flex items-center justify-center !mb-6"
                            style={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                            }}
                        >
                            <MessageCircle className="w-[60px] h-[60px] text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-semibold text-white !mb-2">
                            Welcome to TalkTogether
                        </h2>
                        <p className="text-[#71717a]">Select a conversation to start messaging</p>
                    </div>
                )}
            </div>

            {/* CSS for animations and mobile responsive layout */}
            <style>{`
                @keyframes typingBounce {
                    0%, 100% { transform: translateY(0); opacity: 0.5; }
                    50% { transform: translateY(-6px); opacity: 1; }
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                /* Mobile styles - screens smaller than 768px */
                @media (max-width: 768px) {
                    /* make sidebar full width on mobile */
                    .chat-list-panel {
                        width: 100% !important;
                        min-width: 100% !important;
                        border-right: none !important;
                        padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px)) !important;
                        overscroll-behavior: contain;
                    }
                    
                    /* make chat window full screen on mobile - DON'T set display here, let JS control */
                    .chat-window {
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        right: 0 !important;
                        bottom: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        z-index: 100 !important;
                        /* display controlled by inline style */
                        flex-direction: column !important;
                        background-color: #0a0a0a !important;
                    }

                    /* CRITICAL: Header must stay at top, never scroll */
                    .chat-header {
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        right: 0 !important;
                        z-index: 200 !important;
                        background-color: #0f0f0f !important;
                        flex-shrink: 0 !important;
                        min-height: 60px !important;
                    }
                    
                    /* Messages area - between header and input (above nav) */
                    .messages-area {
                        position: fixed !important;
                        top: 70px !important;
                        left: 0 !important;
                        right: 0 !important;
                        bottom: 120px !important; /* space for input + nav */
                        overflow-y: auto !important;
                        -webkit-overflow-scrolling: touch !important;
                        padding: 16px !important;
                    }
                    
                    /* Input form stays above navigation bar */
                    .message-input-form {
                        position: fixed !important;
                        bottom: calc(56px + env(safe-area-inset-bottom, 0px)) !important; /* above nav bar */
                        left: 0 !important;
                        right: 0 !important;
                        z-index: 200 !important;
                        background-color: #0f0f0f !important;
                        padding: 12px 16px !important;
                        border-top: 1px solid #1f1f1f !important;
                    }
                    
                    /* show back button on mobile and ensure clickable */
                    .mobile-back-btn {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        pointer-events: auto !important;
                        position: relative !important;
                        z-index: 999 !important;
                        -webkit-tap-highlight-color: transparent !important;
                        touch-action: manipulation !important;
                    }
                }

                /* Desktop styles - keep both panels visible */
                @media (min-width: 769px) {
                    .chat-list-panel {
                        display: flex !important;
                    }
                    .chat-window {
                        display: flex !important;
                        position: relative !important;
                    }
                    .chat-header {
                        position: sticky !important;
                    }
                    .messages-area {
                        position: relative !important;
                        top: auto !important;
                        bottom: auto !important;
                    }
                    .message-input-form {
                        position: relative !important;
                    }
                    /* Hide back button on desktop */
                    .mobile-back-btn {
                        display: none !important;
                    }
                }

                /* When keyboard is open on mobile - use dynamic viewport height */
                @media (max-width: 768px) {
                    .keyboard-open .chat-window {
                        height: var(--viewport-height, 100vh) !important;
                        max-height: var(--viewport-height, 100vh) !important;
                        top: var(--viewport-offset, 0) !important;
                    }
                    
                    /* Header stays fixed at visual viewport top */
                    .keyboard-open .chat-header {
                        position: fixed !important;
                        top: var(--viewport-offset, 0) !important;
                        z-index: 999 !important;
                    }
                    
                    /* Input stays at bottom of visual viewport */
                    .keyboard-open .message-input-form {
                        position: fixed !important;
                        bottom: 0 !important;
                        top: auto !important;
                        z-index: 999 !important;
                    }
                    
                    /* Messages area fills between header and input */
                    .keyboard-open .messages-area {
                        position: fixed !important;
                        top: calc(var(--viewport-offset, 0px) + 70px) !important;
                        bottom: 60px !important;
                        height: auto !important;
                    }
                }
                
                .keyboard-open ~ .mobile-nav {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
