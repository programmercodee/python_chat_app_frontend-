/**
 * Chat page - Main chat interface.
 */

import { useEffect, useState, useRef } from 'react';
import { MessageCircle, Plus, Send, Paperclip, Smile, ArrowLeft } from 'lucide-react';
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
        setTyping,
        setUserOnline,
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
        requestOnlineStatus
    } = useSocketStore();

    const [messageText, setMessageText] = useState('');
    const [showMobileChat, setShowMobileChat] = useState(false); // for mobile: show chat or list
    const [isInputFocused, setIsInputFocused] = useState(false); // for hiding nav when keyboard opens
    const messagesEndRef = useRef(null);
    const socketInitialized = useRef(false);
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);

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
                addMessage(msg);
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
            className={isInputFocused ? 'keyboard-open' : ''}
            style={{
                display: 'flex',
                height: '100%',
                backgroundColor: '#0a0a0a',
                overflow: 'hidden', // prevent iOS overscroll
                position: 'relative',
            }}
        >
            {/* Chat List Panel - hidden on mobile when chat is open */}
            <div
                className="chat-list-panel"
                style={{
                    width: '360px',
                    minWidth: '360px',
                    borderRight: '1px solid #1f1f1f',
                    display: showMobileChat ? 'none' : 'flex', // hide on mobile when chat open
                    flexDirection: 'column',
                    backgroundColor: '#0f0f0f',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #1f1f1f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>Chats</h1>
                    <button style={{
                        padding: '10px',
                        borderRadius: '10px',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #262626',
                        color: '#a1a1aa',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Plus style={{ width: '20px', height: '20px' }} />
                    </button>
                </div>

                {/* Connection Status */}
                {!isConnected && (
                    <div style={{
                        padding: '12px 20px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
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
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    {isLoading ? (
                        /* Loading state */
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            padding: '40px',
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                border: '3px solid #262626',
                                borderTop: '3px solid #3b82f6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                            }} />
                            <p style={{ color: '#71717a', marginTop: '16px' }}>Loading chats...</p>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: '#52525b',
                            textAlign: 'center',
                            padding: '40px',
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '20px',
                                backgroundColor: '#1a1a1a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px',
                            }}>
                                <MessageCircle style={{ width: '40px', height: '40px', color: '#3b82f6' }} />
                            </div>
                            <p style={{ fontSize: '16px', fontWeight: '500', color: '#a1a1aa' }}>No conversations yet</p>
                            <p style={{ fontSize: '14px', marginTop: '4px' }}>Start a new chat!</p>
                        </div>
                    ) : (
                        conversations.map((conv) => {
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
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '14px',
                                        borderRadius: '14px',
                                        marginBottom: '8px',
                                        border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                                        backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : '#1a1a1a',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <Avatar name={name} isOnline={otherIsOnline} size="md" />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <p style={{
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: isActive ? 'white' : '#e4e4e7',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}>
                                                {name}
                                            </p>
                                            {conv.last_message && (
                                                <span style={{ fontSize: '12px', color: '#52525b' }}>
                                                    {new Date(conv.last_message.created_at).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                        <p style={{
                                            fontSize: '13px',
                                            color: typingHere.length > 0 ? '#10b981' : '#71717a',
                                            marginTop: '2px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            fontStyle: typingHere.length > 0 ? 'italic' : 'normal',
                                        }}>
                                            {lastMsgPreview}
                                        </p>
                                    </div>
                                    {conv.unread_count > 0 && (
                                        <span style={{
                                            padding: '4px 10px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            borderRadius: '10px',
                                        }}>
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
                className="chat-window"
                style={{
                    flex: 1,
                    display: showMobileChat ? 'flex' : 'none', // show on mobile only when chat selected
                    flexDirection: 'column',
                    backgroundColor: '#0a0a0a',
                }}
            >
                {activeConversation ? (
                    <>
                        {/* Chat Header - fixed at top on mobile */}
                        <div
                            className="chat-header"
                            style={{
                                padding: '16px 20px',
                                borderBottom: '1px solid #1f1f1f',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                backgroundColor: '#0f0f0f',
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
                                    e.stopPropagation();
                                    setShowMobileChat(false);
                                    setIsInputFocused(false);
                                    document.body.classList.remove('keyboard-open');
                                }}
                                className="mobile-back-btn"
                                style={{
                                    padding: '12px',
                                    borderRadius: '10px',
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid #262626',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'none', // hidden by default, shown on mobile via CSS
                                    flexShrink: 0,
                                    WebkitTapHighlightColor: 'transparent',
                                    touchAction: 'manipulation',
                                }}
                            >
                                <ArrowLeft style={{ width: '20px', height: '20px' }} />
                            </button>
                            <Avatar name={chatName} isOnline={isOtherOnline} size="md" />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>{chatName}</h2>
                                <p style={{ fontSize: '13px', color: isOtherTyping ? '#10b981' : (isOtherOnline ? '#10b981' : '#71717a') }}>
                                    {isOtherTyping ? 'typing...' : (isOtherOnline ? 'Online' : 'Offline')}
                                </p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            className="messages-area"
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                            }}
                        >
                            {isLoading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#71717a' }}>
                                    Loading messages...
                                </div>
                            ) : messages.length === 0 ? (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    color: '#52525b',
                                }}>
                                    <p style={{ color: '#a1a1aa' }}>No messages yet</p>
                                    <p style={{ fontSize: '14px' }}>Send a message to start the conversation</p>
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg) => {
                                        const isOwn = msg.sender_id === user?.id;
                                        const messageContent = decodeMessage(msg.encrypted_content);

                                        return (
                                            <div
                                                key={msg.id}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                                                }}
                                            >
                                                <div style={{
                                                    maxWidth: '70%',
                                                    padding: '12px 16px',
                                                    borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                    backgroundColor: isOwn ? '#3b82f6' : '#1a1a1a',
                                                    color: 'white',
                                                }}>
                                                    <p style={{ fontSize: '14px', wordBreak: 'break-word' }}>{messageContent}</p>
                                                    <p style={{
                                                        fontSize: '11px',
                                                        marginTop: '4px',
                                                        opacity: 0.7,
                                                        textAlign: isOwn ? 'right' : 'left',
                                                    }}>
                                                        {formatMessageTime(msg.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Typing indicator */}
                                    {isOtherTyping && (
                                        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '8px' }}>
                                            <div style={{
                                                padding: '14px 18px',
                                                borderRadius: '18px 18px 18px 4px',
                                                backgroundColor: '#1a1a1a',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                            }}>
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
                            className="message-input-form"
                            style={{
                                padding: '12px 16px',
                                borderTop: '1px solid #1f1f1f',
                                backgroundColor: '#0f0f0f',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            {/* Attachment button */}
                            <button
                                type="button"
                                style={{
                                    padding: '10px',
                                    borderRadius: '10px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: '#71717a',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                            >
                                <Paperclip style={{ width: '20px', height: '20px' }} />
                            </button>

                            {/* Message input - takes all available space */}
                            <input
                                type="text"
                                value={messageText}
                                onChange={handleInputChange}
                                onFocus={() => setIsInputFocused(true)}
                                onBlur={() => setIsInputFocused(false)}
                                placeholder="Type a message..."
                                style={{
                                    flex: 1,
                                    minWidth: 0, /* allow shrinking */
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid #262626',
                                    color: 'white',
                                    fontSize: '16px', /* prevent iOS zoom on focus */
                                    outline: 'none',
                                }}
                            />

                            {/* Emoji button */}
                            <button
                                type="button"
                                style={{
                                    padding: '10px',
                                    borderRadius: '10px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: '#71717a',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                            >
                                <Smile style={{ width: '20px', height: '20px' }} />
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
                                style={{
                                    padding: '12px',
                                    borderRadius: '12px',
                                    background: messageText.trim() ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : '#262626',
                                    border: 'none',
                                    color: 'white',
                                    cursor: messageText.trim() ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    WebkitTapHighlightColor: 'transparent',
                                }}
                            >
                                <Send style={{ width: '18px', height: '18px' }} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#52525b',
                    }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '30px',
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '24px',
                        }}>
                            <MessageCircle style={{ width: '60px', height: '60px', color: '#3b82f6' }} />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                            Welcome to ChatApp
                        </h2>
                        <p style={{ color: '#71717a' }}>Select a conversation to start messaging</p>
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
                    
                    /* make chat window full screen on mobile */
                    .chat-window {
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        right: 0 !important;
                        bottom: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        z-index: 100 !important;
                        display: flex !important;
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
                }

                /* When keyboard is open on mobile */
                @media (max-width: 768px) {
                    .keyboard-open .chat-window {
                        height: 100vh !important;
                        height: 100dvh !important;
                    }
                    
                    /* Header stays fixed at visual viewport top */
                    .keyboard-open .chat-header {
                        position: fixed !important;
                        top: 0 !important;
                        z-index: 999 !important;
                    }
                    
                    /* Input stays at visual bottom */
                    .keyboard-open .message-input-form {
                        position: fixed !important;
                        bottom: 0 !important;
                        z-index: 999 !important;
                    }
                    
                    /* Messages area adjusts */
                    .keyboard-open .messages-area {
                        top: 70px !important;
                        bottom: 60px !important;
                    }
                }
                
                .keyboard-open ~ .mobile-nav {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
