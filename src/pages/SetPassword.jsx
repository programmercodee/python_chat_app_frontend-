/**
 * Set Password page.
 * Step 3 of registration: Set password after email verification.
 * Then navigates to /choose-username page.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowRight, Loader2, MessageCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SetPassword() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get email data from navigation state
    const email = location.state?.email;
    const emailVerifiedToken = location.state?.email_verified_token;

    // Redirect if no verified email
    useEffect(() => {
        if (!email || !emailVerifiedToken) {
            navigate('/register');
        }
    }, [email, emailVerifiedToken, navigate]);

    // Form state
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setSubmitting(true);

        // Navigate to choose-username with email and password
        navigate('/choose-username', {
            state: {
                type: 'email',
                emailData: {
                    email: email,
                    email_verified_token: emailVerifiedToken,
                    password: password
                }
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
            {/* Background gradient */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/10 via-transparent to-transparent rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white">TalkTogether</span>
                </div>

                {/* Card */}
                <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 sm:p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 mx-auto mb-4 flex items-center justify-center">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Create your password</h1>
                        <p className="text-zinc-500">Secure your account with a strong password</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min 8 characters"
                                    required
                                    minLength={8}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#262626] text-white text-sm outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat your password"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#262626] text-white text-sm outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password requirements */}
                        <div className="mb-6 p-3 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                            <p className="text-xs text-zinc-500">Password must:</p>
                            <ul className="text-xs text-zinc-500 mt-1 space-y-0.5">
                                <li className={password.length >= 8 ? 'text-green-500' : ''}>
                                    • Be at least 8 characters
                                </li>
                            </ul>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || password.length < 8 || password !== confirmPassword}
                            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Continue
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
