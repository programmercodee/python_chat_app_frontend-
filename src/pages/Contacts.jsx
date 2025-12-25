/**
 * Contacts page component.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Check, X, Users, Mail, MessageCircle } from 'lucide-react';
import { Avatar } from '../components/ui';
import { contactsApi, usersApi, conversationsApi } from '../api';
import { useChatStore } from '../store';
import toast from 'react-hot-toast';

export default function Contacts() {
    const navigate = useNavigate();
    const { fetchConversations, selectConversation } = useChatStore();

    const [contacts, setContacts] = useState([]);
    const [requests, setRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [activeTab, setActiveTab] = useState('contacts');
    const [loadingMessage, setLoadingMessage] = useState(null);
    const [isLoadingContacts, setIsLoadingContacts] = useState(true);
    const [isLoadingRequests, setIsLoadingRequests] = useState(true);

    useEffect(() => {
        loadContacts();
        loadRequests();
    }, []);

    const loadContacts = async () => {
        setIsLoadingContacts(true);
        try {
            const data = await contactsApi.getAll('accepted');
            setContacts(data.contacts || []);
        } catch (error) {
            console.error('Failed to load contacts:', error);
        } finally {
            setIsLoadingContacts(false);
        }
    };

    const loadRequests = async () => {
        setIsLoadingRequests(true);
        try {
            const data = await contactsApi.getPendingRequests();
            setRequests(data.requests || []);
        } catch (error) {
            console.error('Failed to load requests:', error);
        } finally {
            setIsLoadingRequests(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const results = await usersApi.search(searchQuery);
            setSearchResults(results || []);
        } catch (error) {
            toast.error('Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddContact = async (userId) => {
        try {
            await contactsApi.add(userId);
            toast.success('Contact request sent!');
            setSearchResults(searchResults.filter(u => u.id !== userId));
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to add contact');
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            await contactsApi.accept(requestId);
            toast.success('Contact accepted!');
            loadContacts();
            loadRequests();
        } catch (error) {
            toast.error('Failed to accept request');
        }
    };

    const handleMessageContact = async (contactUserId) => {
        setLoadingMessage(contactUserId);
        try {
            // Create or get existing direct conversation
            const conversation = await conversationsApi.createDirect(contactUserId);

            // Refresh conversations and select the new one
            await fetchConversations();
            await selectConversation(conversation.id);

            // Navigate to chat
            navigate('/');
        } catch (error) {
            toast.error('Failed to start conversation');
            console.error(error);
        } finally {
            setLoadingMessage(null);
        }
    };

    const tabs = [
        { id: 'contacts', label: 'Contacts', count: contacts.length },
        { id: 'requests', label: 'Requests', count: requests.length },
        { id: 'search', label: 'Find Users', count: null },
    ];

    const cardStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        borderRadius: '16px',
        backgroundColor: '#111111',
        border: '1px solid #1f1f1f',
        marginBottom: '12px',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#0a0a0a' }}>
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid #1f1f1f' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '20px' }}>Contacts</h1>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '500',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: activeTab === tab.id ? '#3b82f6' : '#1a1a1a',
                                color: activeTab === tab.id ? 'white' : '#a1a1aa',
                            }}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span style={{
                                    marginLeft: '8px',
                                    padding: '2px 8px',
                                    fontSize: '12px',
                                    backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : '#262626',
                                    borderRadius: '8px',
                                }}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                {/* Contacts Tab */}
                {activeTab === 'contacts' && (
                    <div>
                        {isLoadingContacts ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '60px 40px',
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    border: '3px solid #262626',
                                    borderTop: '3px solid #3b82f6',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                }} />
                                <p style={{ color: '#71717a', marginTop: '16px' }}>Loading contacts...</p>
                            </div>
                        ) : contacts.length === 0 ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '60px 40px',
                                textAlign: 'center',
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
                                    <Users style={{ width: '40px', height: '40px', color: '#3b82f6' }} />
                                </div>
                                <p style={{ fontSize: '18px', fontWeight: '500', color: '#a1a1aa' }}>No contacts yet</p>
                                <p style={{ fontSize: '14px', color: '#52525b', marginTop: '4px' }}>Find users to add them as contacts</p>
                            </div>
                        ) : (
                            contacts.map((contact) => (
                                <div key={contact.id} style={cardStyle}>
                                    <Avatar src={contact.contact_user?.avatar_url} name={contact.contact_user?.username} isOnline={contact.contact_user?.is_online} size="md" />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '15px', fontWeight: '500', color: 'white' }}>
                                            {contact.contact_user?.username}
                                        </p>
                                        <p style={{ fontSize: '13px', color: '#71717a' }}>
                                            {contact.contact_user?.email}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleMessageContact(contact.contact_id)}
                                        disabled={loadingMessage === contact.contact_id}
                                        style={{
                                            padding: '10px 16px',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                            border: 'none',
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: loadingMessage === contact.contact_id ? 'not-allowed' : 'pointer',
                                            opacity: loadingMessage === contact.contact_id ? 0.5 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                        }}
                                    >
                                        <MessageCircle style={{ width: '16px', height: '16px' }} />
                                        {loadingMessage === contact.contact_id ? 'Loading...' : 'Message'}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Requests Tab */}
                {activeTab === 'requests' && (
                    <div>
                        {isLoadingRequests ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '60px 40px',
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    border: '3px solid #262626',
                                    borderTop: '3px solid #3b82f6',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                }} />
                                <p style={{ color: '#71717a', marginTop: '16px' }}>Loading requests...</p>
                            </div>
                        ) : requests.length === 0 ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '60px 40px',
                                textAlign: 'center',
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
                                    <Mail style={{ width: '40px', height: '40px', color: '#3b82f6' }} />
                                </div>
                                <p style={{ fontSize: '18px', fontWeight: '500', color: '#a1a1aa' }}>No pending requests</p>
                            </div>
                        ) : (
                            requests.map((request) => (
                                <div key={request.id} style={cardStyle}>
                                    <Avatar src={request.from_user?.avatar_url} name={request.from_user?.username} size="md" />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '15px', fontWeight: '500', color: 'white' }}>
                                            {request.from_user?.username}
                                        </p>
                                        <p style={{ fontSize: '13px', color: '#71717a' }}>
                                            {request.from_user?.email}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleAcceptRequest(request.id)}
                                            style={{
                                                padding: '10px',
                                                borderRadius: '10px',
                                                backgroundColor: '#10b981',
                                                border: 'none',
                                                color: 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Check style={{ width: '18px', height: '18px' }} />
                                        </button>
                                        <button style={{
                                            padding: '10px',
                                            borderRadius: '10px',
                                            backgroundColor: '#ef4444',
                                            border: 'none',
                                            color: 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <X style={{ width: '18px', height: '18px' }} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Search Tab */}
                {activeTab === 'search' && (
                    <div>
                        <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
                            <div style={{ position: 'relative' }}>
                                <Search style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '20px',
                                    height: '20px',
                                    color: '#52525b',
                                }} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by username or email..."
                                    style={{
                                        width: '100%',
                                        paddingLeft: '50px',
                                        paddingRight: '16px',
                                        paddingTop: '14px',
                                        paddingBottom: '14px',
                                        borderRadius: '14px',
                                        backgroundColor: '#111111',
                                        border: '1px solid #1f1f1f',
                                        color: 'white',
                                        fontSize: '15px',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </form>

                        {isSearching ? (
                            <p style={{ textAlign: 'center', color: '#71717a' }}>Searching...</p>
                        ) : searchResults.length === 0 && searchQuery ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '40px',
                            }}>
                                <p style={{ color: '#71717a' }}>No users found</p>
                            </div>
                        ) : (
                            searchResults.map((user) => (
                                <div key={user.id} style={cardStyle}>
                                    <Avatar src={user.avatar_url} name={user.username} size="md" />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '15px', fontWeight: '500', color: 'white' }}>
                                            {user.username}
                                        </p>
                                        <p style={{ fontSize: '13px', color: '#71717a' }}>
                                            {user.email}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleAddContact(user.id)}
                                        style={{
                                            padding: '10px',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                            border: 'none',
                                            color: 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <UserPlus style={{ width: '18px', height: '18px' }} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Loading spinner animation */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
