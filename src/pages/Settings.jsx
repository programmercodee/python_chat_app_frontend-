/**
 * Settings page component.
 */

import { useState } from 'react';
import { User, Mail, Key, LogOut, Shield, Bell, Palette } from 'lucide-react';
import { Avatar } from '../components/ui';
import { useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../api';
import toast from 'react-hot-toast';

export default function Settings() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [username, setUsername] = useState(user?.username || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await usersApi.updateProfile({ username });
            toast.success('Profile updated!');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const sectionStyle = {
        backgroundColor: '#111111',
        border: '1px solid #1f1f1f',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
    };

    const inputStyle = {
        width: '100%',
        padding: '14px 16px',
        borderRadius: '12px',
        backgroundColor: '#0a0a0a',
        border: '1px solid #262626',
        color: 'white',
        fontSize: '14px',
        outline: 'none',
    };

    const labelStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#a1a1aa',
        marginBottom: '8px',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#0a0a0a' }}>
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid #1f1f1f' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>Settings</h1>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: '600px' }}>
                {/* Profile Section */}
                <section style={sectionStyle}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '20px' }}>Profile</h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                        <Avatar name={user?.username} size="xl" />
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'white' }}>{user?.username}</h3>
                            <p style={{ fontSize: '14px', color: '#71717a' }}>{user?.email}</p>
                            <p style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>● Online</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateProfile}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>
                                <User style={{ width: '16px', height: '16px' }} />
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>
                                <Mail style={{ width: '16px', height: '16px' }} />
                                Email
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                style={{ ...inputStyle, color: '#52525b', cursor: 'not-allowed' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                border: 'none',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.5 : 1,
                            }}
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </section>

                {/* Security Section */}
                <section style={sectionStyle}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '20px' }}>Security</h2>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        backgroundColor: '#0a0a0a',
                        borderRadius: '12px',
                        marginBottom: '12px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                backgroundColor: '#1a1a1a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Key style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>Encryption Key</p>
                                <p style={{ fontSize: '13px', color: '#71717a' }}>Manage your E2E encryption keys</p>
                            </div>
                        </div>
                        <button style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #262626',
                            color: '#a1a1aa',
                            fontSize: '13px',
                            cursor: 'pointer',
                        }}>
                            Generate New
                        </button>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        backgroundColor: '#0a0a0a',
                        borderRadius: '12px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                backgroundColor: '#1a1a1a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Shield style={{ width: '20px', height: '20px', color: '#10b981' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>Two-Factor Auth</p>
                                <p style={{ fontSize: '13px', color: '#71717a' }}>Add an extra layer of security</p>
                            </div>
                        </div>
                        <button style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #262626',
                            color: '#a1a1aa',
                            fontSize: '13px',
                            cursor: 'pointer',
                        }}>
                            Enable
                        </button>
                    </div>
                </section>

                {/* Preferences Section */}
                <section style={sectionStyle}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '20px' }}>Preferences</h2>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        backgroundColor: '#0a0a0a',
                        borderRadius: '12px',
                        marginBottom: '12px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                backgroundColor: '#1a1a1a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Bell style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>Notifications</p>
                                <p style={{ fontSize: '13px', color: '#71717a' }}>Manage notification settings</p>
                            </div>
                        </div>
                        <div style={{
                            width: '44px',
                            height: '24px',
                            borderRadius: '12px',
                            backgroundColor: '#3b82f6',
                            padding: '2px',
                            cursor: 'pointer',
                        }}>
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                marginLeft: '18px',
                            }} />
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        backgroundColor: '#0a0a0a',
                        borderRadius: '12px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                backgroundColor: '#1a1a1a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Palette style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>Theme</p>
                                <p style={{ fontSize: '13px', color: '#71717a' }}>Dark mode enabled</p>
                            </div>
                        </div>
                        <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Dark</span>
                    </div>
                </section>

                {/* Account Section */}
                <section style={sectionStyle}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '20px' }}>Account</h2>

                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            width: '100%',
                            padding: '16px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            textAlign: 'left',
                        }}
                    >
                        <LogOut style={{ width: '20px', height: '20px' }} />
                        Log out
                    </button>
                </section>
            </div>
        </div>
    );
}
