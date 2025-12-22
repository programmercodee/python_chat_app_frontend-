/**
 * Sidebar component for navigation.
 */

import { NavLink } from 'react-router-dom';
import { MessageCircle, Users, Settings, LogOut, Search } from 'lucide-react';
import { Avatar } from '../ui';
import { useAuthStore, useChatStore, useSocketStore } from '../../store';
import logo from '../../assets/logo.png';

export default function Sidebar() {
    const { user, logout } = useAuthStore();
    const { conversations } = useChatStore();
    const { disconnect } = useSocketStore();

    const handleLogout = () => {
        // Disconnect socket before logout
        disconnect();
        // Logout clears storage and redirects
        logout();
    };

    const navItems = [
        { icon: MessageCircle, label: 'Chats', path: '/', count: conversations?.length },
        { icon: Users, label: 'Contacts', path: '/contacts' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside style={{
            width: '280px',
            height: '100vh',
            backgroundColor: '#111111',
            borderRight: '1px solid #1f1f1f',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Logo */}
            <div className="!p-5 !border-b !border-[#1f1f1f]">
                <div className="flex items-center gap-1">
                    <div className="!w-14 !h-14 !rounded-xl flex items-center justify-center overflow-hidden bg-transparent">
                        <img src={logo} alt="TalkTogether" className="!w-full !h-full !object-cover" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">TalkTogether</span>
                </div>
            </div>

            {/* Search */}
            {/* <div style={{ padding: '16px' }}>
                <div style={{ position: 'relative' }}>
                    <Search style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '16px',
                        height: '16px',
                        color: '#52525b',
                    }} />
                    <input
                        type="text"
                        placeholder="Search..."
                        style={{
                            width: '100%',
                            paddingLeft: '40px',
                            paddingRight: '16px',
                            paddingTop: '10px',
                            paddingBottom: '10px',
                            borderRadius: '10px',
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #262626',
                            color: 'white',
                            fontSize: '14px',
                            outline: 'none',
                        }}
                    />
                </div>
            </div> */}

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '8px 12px' }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            marginBottom: '4px',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                            color: isActive ? '#3b82f6' : '#a1a1aa',
                            border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                        })}
                    >
                        <item.icon style={{ width: '20px', height: '20px' }} />
                        <span style={{ fontWeight: '500' }}>{item.label}</span>
                        {item.count > 0 && (
                            <span style={{
                                marginLeft: 'auto',
                                fontSize: '12px',
                                backgroundColor: '#262626',
                                padding: '2px 8px',
                                borderRadius: '10px',
                            }}>
                                {item.count}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Profile */}
            <div style={{
                padding: '16px',
                borderTop: '1px solid #1f1f1f',
                backgroundColor: '#0a0a0a',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar
                        name={user?.username}
                        size="md"
                        isOnline={true}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: 'white',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {user?.username}
                        </p>
                        <p style={{
                            fontSize: '12px',
                            color: '#71717a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {user?.email}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '8px',
                            borderRadius: '8px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#71717a',
                            cursor: 'pointer',
                        }}
                        title="Logout"
                    >
                        <LogOut style={{ width: '18px', height: '18px' }} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
