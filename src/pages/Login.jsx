/**
 * Login page component.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function Login() {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError } = useAuthStore();

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

    const inputStyle = {
        width: '100%',
        paddingLeft: '48px',
        paddingRight: '16px',
        paddingTop: '14px',
        paddingBottom: '14px',
        borderRadius: '12px',
        backgroundColor: '#0a0a0a',
        border: '1px solid #262626',
        color: 'white',
        fontSize: '14px',
        outline: 'none',
    };

    const iconStyle = {
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '20px',
        height: '20px',
        color: '#52525b',
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#0a0a0a' }}>
            {/* Left Side - Branding (hidden on mobile) */}
            <div className="hidden lg:flex" style={{ width: '50%', position: 'relative', overflow: 'hidden' }}>
                {/* Gradient Background */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
                }} />

                {/* Pattern Overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.1,
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '32px 32px',
                }} />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <MessageCircle style={{ width: '24px', height: '24px' }} />
                        </div>
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>ChatApp</span>
                    </div>

                    <h1 style={{ fontSize: '48px', fontWeight: 'bold', lineHeight: '1.1', marginBottom: '24px' }}>
                        Connect with<br />
                        <span style={{ opacity: 0.8 }}>anyone, anywhere</span>
                    </h1>

                    <p style={{ fontSize: '18px', opacity: 0.7, maxWidth: '400px' }}>
                        Experience seamless real-time messaging with end-to-end encryption.
                        Your conversations, secured.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '48px' }}>
                        <div style={{ display: 'flex' }}>
                            {['#f59e0b', '#10b981', '#3b82f6', '#ec4899'].map((color, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        border: '2px solid rgba(255,255,255,0.2)',
                                        backgroundColor: color,
                                        marginLeft: i > 0 ? '-12px' : 0,
                                    }}
                                />
                            ))}
                        </div>
                        <div style={{ fontSize: '14px' }}>
                            <div style={{ fontWeight: '600' }}>1000+ Users</div>
                            <div style={{ opacity: 0.6 }}>Already connected</div>
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <div style={{
                    position: 'absolute',
                    top: '80px',
                    right: '80px',
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(8px)',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '128px',
                    right: '128px',
                    width: '64px',
                    height: '64px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    backdropFilter: 'blur(8px)',
                }} />
            </div>

            {/* Right Side - Form */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    {/* Mobile Logo */}
                    <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            marginBottom: '16px',
                        }}>
                            <MessageCircle style={{ width: '32px', height: '32px', color: 'white' }} />
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Welcome back</h2>
                        <p style={{ color: '#71717a' }}>Sign in to continue to your account</p>
                    </div>

                    {/* Form Card */}
                    <div style={{
                        backgroundColor: '#111111',
                        border: '1px solid #1f1f1f',
                        borderRadius: '16px',
                        padding: '32px',
                    }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#a1a1aa', marginBottom: '8px' }}>
                                    Email
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail style={iconStyle} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#a1a1aa', marginBottom: '8px' }}>
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock style={iconStyle} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa', cursor: 'pointer' }}>
                                    <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                                    Remember me
                                </label>
                                <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                                    Forgot password?
                                </a>
                            </div>

                            {error && (
                                <div style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    color: '#ef4444',
                                    fontSize: '14px',
                                    textAlign: 'center',
                                    marginBottom: '20px',
                                }}>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    color: 'white',
                                    fontWeight: '500',
                                    fontSize: '16px',
                                    border: 'none',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.5 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.25)',
                                }}
                            >
                                {isLoading ? (
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: 'white',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite',
                                    }} />
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight style={{ width: '20px', height: '20px' }} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #1f1f1f', textAlign: 'center' }}>
                            <p style={{ color: '#71717a' }}>
                                Don't have an account?{' '}
                                <Link to="/register" style={{ color: '#3b82f6', fontWeight: '500', textDecoration: 'none' }}>
                                    Create one
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Features */}
                    <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', fontSize: '14px', color: '#52525b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sparkles style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                            End-to-end encrypted
                        </div>
                        <div style={{ width: '4px', height: '4px', backgroundColor: '#52525b', borderRadius: '50%' }} />
                        <div>Free forever</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
