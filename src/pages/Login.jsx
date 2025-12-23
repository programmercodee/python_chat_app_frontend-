/**
 * Login page component.
 * Fully responsive with Tailwind CSS.
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Mail, Lock, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

// Google Client ID
// const GOOGLE_CLIENT_ID = '657657742264-l4dkb28fhta8i6o2tn88boihmtla80mj.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID = '87264285698-fje9uht65ugnmbfv710lperi6ejlp29a.apps.googleusercontent.com';

export default function Login() {
    const navigate = useNavigate();
    const { login, loginWithGoogle, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();

        const result = await login(email, password);

        if (result.success) {
            toast.success('Welcome back!');
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
            toast.success('Welcome back!');
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
                    text: 'continue_with',
                    shape: 'rectangular',
                }
            );
        }
    }, []);

    return (
        <div className="min-h-screen flex overflow-hidden bg-[#0a0a0a]">
            {/* Left Side - Branding (hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />

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
                        Connect with<br />
                        <span className="opacity-80">anyone, anywhere</span>
                    </h1>

                    <p className="text-lg opacity-70 max-w-md">
                        Experience seamless real-time messaging with end-to-end encryption.
                        Your conversations, secured.
                    </p>

                    <div className="flex items-center gap-6 mt-12">
                        <div className="flex">
                            {['bg-amber-500', 'bg-emerald-500', 'bg-blue-500', 'bg-pink-500'].map((color, i) => (
                                <div
                                    key={i}
                                    className={`w-10 h-10 rounded-full border-2 border-white/20 ${color} ${i > 0 ? '-ml-3' : ''}`}
                                />
                            ))}
                        </div>
                        <div className="text-sm">
                            <div className="font-semibold">1000+ Users</div>
                            <div className="opacity-60">Already connected</div>
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-20 right-20 w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-lg" />
                <div className="absolute bottom-32 right-32 w-16 h-16 bg-white/10 rounded-full backdrop-blur-lg" />
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 min-w-0">
                <div className="w-full max-w-md min-w-0">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="text-4xl font-bold text-white">TalkTogether</h1>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-xl font-bold text-white mb-2">Welcome back</h2>
                        <p className="text-zinc-500">Sign in to continue to your account</p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-8">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#262626] text-white text-sm outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#262626] text-white text-sm outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm mb-5">
                                <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded" />
                                    Remember me
                                </label>
                                <a href="#" className="text-blue-500 hover:text-blue-400">
                                    Forgot password?
                                </a>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center mb-5">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-[#262626]" />
                            <span className="text-zinc-600 text-sm">or</span>
                            <div className="flex-1 h-px bg-[#262626]" />
                        </div>

                        {/* Google Sign-in */}
                        <div ref={googleButtonRef} className="flex justify-center" />

                        <div className="mt-6 pt-6 border-t border-[#1f1f1f] text-center">
                            <p className="text-zinc-500">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-blue-500 font-medium hover:text-blue-400">
                                    Create one
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mt-8 flex items-center justify-center gap-6 text-sm text-zinc-600">
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            End-to-end encrypted
                        </div>
                        <div className="w-1 h-1 bg-zinc-600 rounded-full" />
                        <div>Free forever</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
