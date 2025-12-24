/**
 * Choose Username page.
 * Full-page for username selection after email/password or Google OAuth validation.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, ArrowRight, Loader2, Check, X, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../store';
import { authApi } from '../api';
import toast from 'react-hot-toast';

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export default function ChooseUsername() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuthStore();

    // Get pending data from navigation state
    const pendingData = location.state?.pendingData;
    const registrationType = location.state?.type; // 'email' or 'google'
    const emailData = location.state?.emailData; // { email, password } for email registration

    // If no pending data, redirect back to register
    useEffect(() => {
        if (!pendingData && !emailData) {
            navigate('/register');
        }
    }, [pendingData, emailData, navigate]);

    // State
    const [username, setUsername] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Debounced username check
    const checkUsernameDebounced = useCallback(
        debounce(async (value) => {
            if (value.length < 3) {
                setUsernameAvailable(null);
                setCheckingUsername(false);
                return;
            }

            try {
                const result = await authApi.checkUsername(value);
                setUsernameAvailable(result.available);
            } catch (err) {
                setUsernameAvailable(null);
            } finally {
                setCheckingUsername(false);
            }
        }, 300),
        []
    );

    // Handle username input change
    const handleUsernameChange = (e) => {
        const value = e.target.value;
        setUsername(value);
        setUsernameAvailable(null);

        if (value.length >= 3) {
            setCheckingUsername(true);
            checkUsernameDebounced(value);
        }
    };

    // Complete registration
    const handleComplete = async () => {
        if (!usernameAvailable || username.length < 3) {
            toast.error('Please choose an available username');
            return;
        }

        setSubmitting(true);

        try {
            if (registrationType === 'google' && pendingData) {
                // Google registration flow
                const data = await authApi.completeGoogleRegistration(pendingData, username);

                // Store tokens
                localStorage.setItem('accessToken', data.access_token);
                localStorage.setItem('refreshToken', data.refresh_token);

                // Get user data and update auth store
                const user = await authApi.me();
                localStorage.setItem('userId', user.id);
                setUser(user);

                toast.success('Welcome to TalkTogether!');
                navigate('/');
            } else if (registrationType === 'email' && emailData) {
                // Email/password registration flow with OTP verification
                const data = await authApi.completeRegistration(
                    emailData.email_verified_token,
                    username,
                    emailData.password
                );

                // Store tokens
                localStorage.setItem('accessToken', data.access_token);
                localStorage.setItem('refreshToken', data.refresh_token);

                // Get user data and update auth store
                const user = await authApi.me();
                localStorage.setItem('userId', user.id);
                setUser(user);

                toast.success('Welcome to TalkTogether!');
                navigate('/');
            }
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
            {/* Background gradient */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 via-transparent to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/10 via-transparent to-transparent rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white">TalkTogether</span>
                </div>

                {/* Card */}
                <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 sm:p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 mx-auto mb-4 flex items-center justify-center">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Choose your username</h1>
                        <p className="text-zinc-500">This will be your unique identity on TalkTogether</p>
                    </div>

                    <div className="mb-6">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                            <input
                                type="text"
                                value={username}
                                onChange={handleUsernameChange}
                                placeholder="Enter username"
                                autoFocus
                                minLength={3}
                                maxLength={50}
                                className={`w-full pl-12 pr-12 py-3.5 rounded-xl bg-[#0a0a0a] border text-white text-sm outline-none transition-colors ${usernameAvailable === true
                                    ? 'border-green-500 focus:border-green-500'
                                    : usernameAvailable === false
                                        ? 'border-red-500 focus:border-red-500'
                                        : 'border-[#262626] focus:border-blue-500'
                                    }`}
                            />
                            {/* Status indicator */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                {checkingUsername && (
                                    <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                                )}
                                {!checkingUsername && usernameAvailable === true && (
                                    <Check className="w-5 h-5 text-green-500" />
                                )}
                                {!checkingUsername && usernameAvailable === false && (
                                    <X className="w-5 h-5 text-red-500" />
                                )}
                            </div>
                        </div>

                        {/* Status message */}
                        {usernameAvailable === false && (
                            <p className="text-red-500 text-sm mt-2">Username is already taken</p>
                        )}
                        {usernameAvailable === true && (
                            <p className="text-green-500 text-sm mt-2">Username is available!</p>
                        )}
                        {username.length > 0 && username.length < 3 && (
                            <p className="text-zinc-500 text-sm mt-2">Username must be at least 3 characters</p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleComplete}
                        disabled={!usernameAvailable || submitting}
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Complete Registration
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>

                    <p className="text-xs text-zinc-600 text-center mt-4">
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
}
