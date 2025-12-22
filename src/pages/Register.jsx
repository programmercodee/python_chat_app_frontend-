/**
 * Register page component.
 * Fully responsive with Tailwind CSS and Google OAuth.
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Mail, Lock, User, ArrowRight, Shield, Zap, Users, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

// Google Client ID
const GOOGLE_CLIENT_ID = '657657742264-l4dkb28fhta8i6o2tn88boihmtla80mj.apps.googleusercontent.com';

export default function Register() {
    const navigate = useNavigate();
    const { register, loginWithGoogle, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        const result = await register(email, username, password);

        if (result.success) {
            toast.success('Account created successfully!');
            navigate('/');
        } else {
            toast.error(result.error);
        }
    };

    // Google OAuth success handler
    const handleGoogleSuccess = async (response) => {
        clearError();
        const result = await loginWithGoogle(response.credential);

        if (result.success) {
            toast.success('Welcome to TalkTogether!');
            navigate('/');
        } else {
            toast.error(result.error);
        }
    };

    // Google Sign-In button ref
    const googleButtonRef = useRef(null);

    // Initialize Google Sign-In
    useEffect(() => {
        if (window.google && googleButtonRef.current) {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleSuccess,
            });
            window.google.accounts.id.renderButton(
                googleButtonRef.current,
                {
                    theme: 'filled_black',
                    size: 'large',
                    width: 320,
                    text: 'signup_with',
                    shape: 'rectangular',
                }
            );
        }
    }, []);

    const features = [
        { icon: Shield, title: 'Secure', desc: 'End-to-end encryption' },
        { icon: Zap, title: 'Fast', desc: 'Real-time messaging' },
        { icon: Users, title: 'Social', desc: 'Connect with friends' },
    ];

    return (
        <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-[#0a0a0a]">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 order-2 lg:order-1 min-w-0">
                <div className="w-full max-w-md min-w-0">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-6 sm:mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">TalkTogether</h1>
                    </div>

                    <div className="text-center mb-6 sm:mb-8">
                        <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Create account</h2>
                        <p className="text-zinc-500 text-sm sm:text-base">Join thousands of users on TalkTogether</p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5 sm:p-8">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full pl-12 pr-4 py-3 sm:py-3.5 rounded-xl bg-[#0a0a0a] border border-[#262626] text-white text-sm outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Choose a username"
                                        required
                                        pattern="[a-zA-Z0-9_ ]+"
                                        minLength={3}
                                        maxLength={50}
                                        className="w-full pl-12 pr-4 py-3 sm:py-3.5 rounded-xl bg-[#0a0a0a] border border-[#262626] text-white text-sm outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Min 8 chars"
                                            required
                                            minLength={8}
                                            className="w-full pl-10 pr-3 py-3 sm:py-3.5 rounded-xl bg-[#0a0a0a] border border-[#262626] text-white text-sm outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                                        Confirm
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repeat"
                                            required
                                            className="w-full pl-10 pr-3 py-3 sm:py-3.5 rounded-xl bg-[#0a0a0a] border border-[#262626] text-white text-sm outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center mb-4">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Create account
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-zinc-600 text-center mt-4">
                                By signing up, you agree to our Terms of Service and Privacy Policy
                            </p>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-5 sm:my-6">
                            <div className="flex-1 h-px bg-[#262626]" />
                            <span className="text-zinc-600 text-sm">or</span>
                            <div className="flex-1 h-px bg-[#262626]" />
                        </div>

                        {/* Google Sign-up */}
                        <div ref={googleButtonRef} className="flex justify-center" />

                        <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-[#1f1f1f] text-center">
                            <p className="text-zinc-500 text-sm sm:text-base">
                                Already have an account?{' '}
                                <Link to="/login" className="text-blue-500 font-medium hover:text-blue-400">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Branding (hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden order-1 lg:order-2">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-500" />

                {/* Pattern Overlay */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '32px 32px',
                    }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center p-16 text-white">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold">TalkTogether</span>
                    </div>

                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Start your<br />
                        <span className="opacity-80">journey today</span>
                    </h1>

                    <p className="text-lg opacity-70 max-w-md mb-12">
                        Join our community and experience the future of secure messaging.
                    </p>

                    {/* Feature Cards */}
                    <div className="flex flex-col gap-4">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-lg border border-white/10"
                            >
                                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                    <feature.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-semibold">{feature.title}</div>
                                    <div className="text-sm opacity-60">{feature.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-20 right-20 w-24 h-24 bg-white/10 rounded-3xl backdrop-blur-lg rotate-12" />
                <div className="absolute bottom-20 right-16 w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-lg -rotate-12" />
            </div>
        </div>
    );
}
