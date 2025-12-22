/**
 * Settings page component.
 */

import { useState, useRef } from 'react';
import { User, Mail, Key, LogOut, Shield, Bell, Palette, Camera, Loader2, Edit2 } from 'lucide-react';
import { Avatar } from '../components/ui';
import { useAuthStore, useSocketStore } from '../store';
import { usersApi } from '../api';
import toast from 'react-hot-toast';

export default function Settings() {
    const { user, logout, setUser } = useAuthStore();
    const { disconnect } = useSocketStore();
    const [username, setUsername] = useState(user?.username || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Hidden file input reference
    const fileInputRef = useRef(null);

    // Handle avatar upload
    const handleAvatarClick = () => {
        // Trigger the hidden file input
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please select a valid image (JPG, PNG, WebP, GIF)');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image too large. Maximum size is 5MB.');
            return;
        }

        setIsUploading(true);
        try {
            // Upload to server
            const result = await usersApi.uploadAvatar(file);

            // Update local user state with new avatar URL
            setUser({ ...user, avatar_url: result.avatar_url });

            toast.success('Avatar updated!');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to upload avatar');
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        // Don't call API if nothing changed
        if (username === user?.username) {
            toast('No changes to save', { icon: 'ℹ️' });
            return;
        }

        setIsLoading(true);

        try {
            const updated = await usersApi.updateProfile({ username });
            // Update local state with new username
            setUser({ ...user, username: updated.username });
            toast.success('Profile updated!');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        // Disconnect socket before logout
        disconnect();
        // Logout clears storage and redirects
        logout();
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-[#1f1f1f]">
                <h1 className="text-2xl font-bold text-white">Settings</h1>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 max-w-xl">
                {/* Profile Section */}
                <section className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-5">Profile</h2>

                    {/* Avatar with Upload */}
                    <div className="flex items-center gap-5 mb-6">
                        {/* Clickable Avatar Container */}
                        <div
                            className="relative cursor-pointer group"
                            onClick={handleAvatarClick}
                        >
                            {/* The Avatar */}
                            <Avatar
                                src={user?.avatar_url}
                                name={user?.username}
                                size="xl"
                            />

                            {/* Loader Overlay (Always visible when uploading) */}
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            )}

                            {/* Camera Overlay (Shows on hover when not uploading) */}
                            {!isUploading && (
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            )}

                            {/* Edit Badge (Always visible when not uploading) */}
                            {!isUploading && (
                                <div className="absolute bottom-0 right-0 p-1.5 bg-blue-500 rounded-full border-[3px] border-[#111111] text-white shadow-sm">
                                    <Edit2 className="w-3.5 h-3.5" />
                                </div>
                            )}
                        </div>

                        {/* Hidden File Input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {/* User Info */}
                        <div>
                            <h3 className="text-lg font-medium text-white">{user?.username}</h3>
                            <p className="text-sm text-[#71717a]">{user?.email}</p>
                            <p className="text-xs text-[#10b981] mt-1">● Online</p>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={handleUpdateProfile}>
                        <div className="mb-4">
                            <label className="flex items-center gap-2 text-sm font-medium text-[#a1a1aa] mb-2">
                                <User className="w-4 h-4" />
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full py-3.5 px-4 rounded-xl bg-[#0a0a0a] border border-[#262626] text-white text-sm outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div className="mb-5">
                            <label className="flex items-center gap-2 text-sm font-medium text-[#a1a1aa] mb-2">
                                <Mail className="w-4 h-4" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full py-3.5 px-4 rounded-xl bg-[#0a0a0a] border border-[#262626] text-[#52525b] text-sm cursor-not-allowed"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </section>

                {/* Security Section */}
                <section className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-5">Security</h2>

                    <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl mb-3">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                                <Key className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Encryption Key</p>
                                <p className="text-[13px] text-[#71717a]">Manage your E2E encryption keys</p>
                            </div>
                        </div>
                        <button className="py-2 px-4 rounded-lg bg-[#1a1a1a] border border-[#262626] text-[#a1a1aa] text-[13px] hover:bg-[#262626] transition-colors">
                            Generate New
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                                <Shield className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Two-Factor Auth</p>
                                <p className="text-[13px] text-[#71717a]">Add an extra layer of security</p>
                            </div>
                        </div>
                        <button className="py-2 px-4 rounded-lg bg-[#1a1a1a] border border-[#262626] text-[#a1a1aa] text-[13px] hover:bg-[#262626] transition-colors">
                            Enable
                        </button>
                    </div>
                </section>

                {/* Preferences Section */}
                <section className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-5">Preferences</h2>

                    <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl mb-3">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                                <Bell className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Notifications</p>
                                <p className="text-[13px] text-[#71717a]">Manage notification settings</p>
                            </div>
                        </div>
                        {/* Toggle Switch */}
                        <div className="w-11 h-6 rounded-full bg-blue-500 p-0.5 cursor-pointer">
                            <div className="w-5 h-5 rounded-full bg-white ml-auto" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                                <Palette className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Theme</p>
                                <p className="text-[13px] text-[#71717a]">Dark mode enabled</p>
                            </div>
                        </div>
                        <span className="text-[13px] text-[#a1a1aa]">Dark</span>
                    </div>
                </section>

                {/* Account Section */}
                <section className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-5">Account</h2>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium hover:bg-red-500/20 transition-colors text-left"
                    >
                        <LogOut className="w-5 h-5" />
                        Log out
                    </button>
                </section>
            </div>
        </div>
    );
}
