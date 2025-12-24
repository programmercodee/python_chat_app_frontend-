/**
 * Forgot Password page - Static 3-step wizard.
 * Step 1: Email entry
 * Step 2: OTP verification
 * Step 3: New password
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Key, Lock, ArrowRight, ArrowLeft, Loader2, MessageCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';

export default function ForgotPassword() {
    const navigate = useNavigate();

    // Step management (1, 2, or 3)
    const [step, setStep] = useState(1);

    // Form data
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0); // Countdown in seconds

    // Handle OTP input
    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    // Handle OTP backspace
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    // Countdown timer effect for Resend OTP
    useEffect(() => {
        if (resendTimer > 0) {
            const interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [resendTimer]);

    // Step 1: Submit email
    const handleEmailSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        setIsLoading(true);

        try {
            await authApi.forgotPassword(email);
            toast.success('OTP sent to your email!');
            setResendTimer(120); // Start 2-minute timer
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    // Resend OTP handler
    const handleResendOtp = async () => {
        if (resendTimer > 0) return;

        setIsLoading(true);
        try {
            await authApi.forgotPassword(email);
            toast.success('OTP resent to your email!');
            setResendTimer(120); // Reset 2-minute timer
            setOtp(['', '', '', '', '', '']); // Clear OTP inputs
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to resend OTP');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleOtpSubmit = async (e) => {
        e.preventDefault();

        const fullOtp = otp.join('');
        if (fullOtp.length !== 6) {
            toast.error('Please enter the complete OTP');
            return;
        }

        setIsLoading(true);

        setIsLoading(true);

        try {
            const data = await authApi.verifyOtp(email, fullOtp);
            setResetToken(data.reset_token);
            toast.success('OTP verified successfully!');
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset password
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);

        setIsLoading(true);

        try {
            await authApi.resetPassword(resetToken, newPassword);
            toast.success('Password reset successfully! Please login with your new password.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    // Step indicator
    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= s
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'bg-[#1f1f1f] text-zinc-500'
                            }`}
                    >
                        {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                    </div>
                    {s < 3 && (
                        <div className={`w-8 h-0.5 ${step > s ? 'bg-blue-500' : 'bg-[#1f1f1f]'}`} />
                    )}
                </div>
            ))}
        </div>
    );

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
                    <StepIndicator />

                    {/* Step 1: Email */}
                    {step === 1 && (
                        <form onSubmit={handleEmailSubmit}>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mx-auto mb-4 flex items-center justify-center">
                                    <Mail className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
                                <p className="text-zinc-500">Enter your email address and we'll send you an OTP to reset your password.</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        autoFocus
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#262626] text-white text-sm outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Send OTP
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 2 && (
                        <form onSubmit={handleOtpSubmit}>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mx-auto mb-4 flex items-center justify-center">
                                    <Key className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-2">Verify OTP</h1>
                                <p className="text-zinc-500">
                                    We've sent a 6-digit code to <span className="text-white">{email}</span>
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-zinc-400 mb-3 text-center">
                                    Enter OTP
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
                                    disabled={resendTimer > 0 || isLoading}
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
                                    className="flex-1 py-3 px-4 rounded-xl bg-[#1f1f1f] text-zinc-400 font-medium flex items-center justify-center gap-2 hover:bg-[#262626] transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
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

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 mx-auto mb-4 flex items-center justify-center">
                                    <Lock className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-2">Create New Password</h1>
                                <p className="text-zinc-500">Your new password must be at least 8 characters long.</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Min 8 characters"
                                            required
                                            minLength={8}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#262626] text-white text-sm outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repeat password"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#262626] text-white text-sm outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Reset Password
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Back to login link */}
                    <div className="mt-6 pt-6 border-t border-[#1f1f1f] text-center">
                        <p className="text-zinc-500 text-sm">
                            Remember your password?{' '}
                            <Link to="/login" className="text-blue-500 font-medium hover:text-blue-400">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
