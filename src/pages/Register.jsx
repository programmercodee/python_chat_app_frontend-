/**
 * Register page component with email OTP verification.
 * Step 1: Email entry
 * Step 2: OTP verification
 * Then navigates to /set-password page.
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Mail, ArrowRight, ArrowLeft, Shield, Zap, Users, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store';
import { authApi } from '../api';
import toast from 'react-hot-toast';

// Google Client ID
const GOOGLE_CLIENT_ID = '87264285698-fje9uht65ugnmbfv710lperi6ejlp29a.apps.googleusercontent.com';

export default function Register() {
    const navigate = useNavigate();
    const { isLoading, error, clearError } = useAuthStore();

    // Step management (1 = email, 2 = OTP verification)
    const [step, setStep] = useState(1);

    // Form state
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [submitting, setSubmitting] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    // Clear error on mount
    useEffect(() => {
        clearError();
    }, []);

    // Countdown timer effect for Resend OTP
    useEffect(() => {
        if (resendTimer > 0) {
            const interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [resendTimer]);

    // Handle OTP input
    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    // Step 1: Submit email and send OTP
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        clearError();

        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        setSubmitting(true);
        try {
            await authApi.sendRegistrationOtp(email);
            toast.success('OTP sent to your email!');
            setResendTimer(120); // Start 2-minute timer
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to send OTP');
        } finally {
            setSubmitting(false);
        }
    };

    // Step 2: Verify OTP and navigate to set-password
    const handleOtpSubmit = async (e) => {
        e.preventDefault();

        const fullOtp = otp.join('');
        if (fullOtp.length !== 6) {
            toast.error('Please enter the complete OTP');
            return;
        }

        setSubmitting(true);
        try {
            const data = await authApi.verifyRegistrationOtp(email, fullOtp);
            toast.success('Email verified successfully!');

            // Navigate to set-password page with email token
            navigate('/set-password', {
                state: {
                    email: email,
                    email_verified_token: data.email_verified_token
                }
            });
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Invalid OTP');
        } finally {
            setSubmitting(false);
        }
    };

    // Resend OTP handler
    const handleResendOtp = async () => {
        if (resendTimer > 0) return;

        setSubmitting(true);
        try {
            await authApi.sendRegistrationOtp(email);
            toast.success('OTP resent to your email!');
            setResendTimer(120);
            setOtp(['', '', '', '', '', '']);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to resend OTP');
        } finally {
            setSubmitting(false);
        }
    };

    // Google OAuth success handler
    const handleGoogleSuccess = async (response) => {
        clearError();
        setSubmitting(true);

        try {
            const pendingData = await authApi.googleRegister(response.credential);

            if (pendingData.pending) {
                navigate('/choose-username', {
                    state: {
                        type: 'google',
                        pendingData: pendingData
                    }
                });
            }
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Google registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    // Google Sign-In button ref and state
    const googleButtonRef = useRef(null);
    const [googleLoaded, setGoogleLoaded] = useState(false);

    // Initialize Google Sign-In with retry
    useEffect(() => {
        const initGoogleButton = () => {
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
                setGoogleLoaded(true);
                return true;
            }
            return false;
        };

        if (initGoogleButton()) return;

        let attempts = 0;
        const maxAttempts = 30;
        const interval = setInterval(() => {
            attempts++;
            if (initGoogleButton() || attempts >= maxAttempts) {
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
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
                        <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
                            {step === 1 ? 'Create account' : 'Verify your email'}
                        </h2>
                        <p className="text-zinc-500 text-sm sm:text-base">
                            {step === 1
                                ? 'Enter your email to get started'
                                : `Enter the code sent to ${email}`
                            }
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5 sm:p-8">

                        {/* Step 1: Email */}
                        {step === 1 && (
                            <>
                                <form onSubmit={handleEmailSubmit}>
                                    <div className="mb-6">
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

                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center mb-4">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading || submitting}
                                        className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {(isLoading || submitting) ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Continue
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
                                <div className="flex justify-center">
                                    <div
                                        ref={googleButtonRef}
                                        className={googleLoaded ? 'block' : 'hidden'}
                                    />

                                    {!googleLoaded && (
                                        <button
                                            type="button"
                                            className="flex items-center justify-center gap-3 w-full max-w-[320px] py-3 px-4 rounded-lg bg-[#131314] border border-[#303134] text-white font-medium hover:bg-[#1f1f23] transition-colors cursor-pointer"
                                            onClick={() => {
                                                if (window.google) {
                                                    window.google.accounts.id.prompt();
                                                } else {
                                                    toast.error('Google Sign-In is loading, please wait...');
                                                }
                                            }}
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            Sign up with Google
                                        </button>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Step 2: OTP Verification */}
                        {step === 2 && (
                            <form onSubmit={handleOtpSubmit}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-zinc-400 mb-3 text-center">
                                        Enter 6-digit OTP
                                    </label>
                                    <div className="flex justify-center gap-2">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                className="w-12 h-12 text-center text-xl font-bold rounded-xl bg-[#0a0a0a] border border-[#262626] text-white outline-none focus:border-blue-500 transition-colors"
                                            />
                                        ))}
                                    </div>
                                </div>

                                <p className="text-center text-zinc-500 text-sm mb-4">
                                    Didn't receive the code?{' '}
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={resendTimer > 0 || submitting}
                                        className={`font-medium ${resendTimer > 0 ? 'text-zinc-600 cursor-not-allowed' : 'text-blue-500 hover:text-blue-400'}`}
                                    >
                                        {resendTimer > 0
                                            ? `Resend in ${Math.floor(resendTimer / 60)}:${(resendTimer % 60).toString().padStart(2, '0')}`
                                            : 'Resend OTP'
                                        }
                                    </button>
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3 px-4 rounded-xl bg-[#1a1a1a] border border-[#333] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#222] transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Verify
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

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
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-500" />

                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '32px 32px',
                    }}
                />

                <div className="relative z-10 flex flex-col justify-center p-16 text-white">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold">TalkTogether</span>
                    </div>

                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Join the<br />
                        <span className="opacity-80">conversation</span>
                    </h1>

                    <p className="text-lg opacity-70 max-w-md mb-12">
                        Connect with friends and communities. Share moments, ideas, and experiences in real-time.
                    </p>

                    <div className="space-y-4">
                        {features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-4">
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

                <div className="absolute top-20 right-20 w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-lg" />
                <div className="absolute bottom-32 right-32 w-16 h-16 bg-white/10 rounded-full backdrop-blur-lg" />
            </div>
        </div>
    );
}
