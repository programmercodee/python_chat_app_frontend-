/**
 * Register page component.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Mail, Lock, User, ArrowRight, Shield, Zap, Users } from 'lucide-react';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function Register() {
    const navigate = useNavigate();
    const { register, isLoading, error, clearError } = useAuthStore();

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

    const smallInputStyle = {
        ...inputStyle,
        paddingLeft: '44px',
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

    const smallIconStyle = {
        ...iconStyle,
        left: '14px',
        width: '18px',
        height: '18px',
    };

    const features = [
        { icon: Shield, title: 'Secure', desc: 'End-to-end encryption' },
        { icon: Zap, title: 'Fast', desc: 'Real-time messaging' },
        { icon: Users, title: 'Social', desc: 'Connect with friends' },
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#0a0a0a' }}>
            {/* Left Side - Form */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    {/* Mobile Logo */}
                    <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                            marginBottom: '16px',
                        }}>
                            <MessageCircle style={{ width: '32px', height: '32px', color: 'white' }} />
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Create account</h2>
                        <p style={{ color: '#71717a' }}>Join thousands of users on ChatApp</p>
                    </div>

                    {/* Form Card */}
                    <div style={{
                        backgroundColor: '#111111',
                        border: '1px solid #1f1f1f',
                        borderRadius: '16px',
                        padding: '32px',
                    }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#a1a1aa', marginBottom: '8px' }}>
                                    Email
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail style={iconStyle} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#a1a1aa', marginBottom: '8px' }}>
                                    Username
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <User style={iconStyle} />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Choose a username"
                                        required
                                        pattern="[a-zA-Z0-9_]+"
                                        minLength={3}
                                        maxLength={50}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#a1a1aa', marginBottom: '8px' }}>
                                        Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock style={smallIconStyle} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Min 8 chars"
                                            required
                                            minLength={8}
                                            style={smallInputStyle}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#a1a1aa', marginBottom: '8px' }}>
                                        Confirm
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock style={smallIconStyle} />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repeat"
                                            required
                                            style={smallInputStyle}
                                        />
                                    </div>
                                </div>
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
                                    marginBottom: '16px',
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
                                    background: 'linear-gradient(135deg, #10b981, #3b82f6)',
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
                                    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)',
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
                                        Create account
                                        <ArrowRight style={{ width: '20px', height: '20px' }} />
                                    </>
                                )}
                            </button>

                            <p style={{ fontSize: '12px', color: '#52525b', textAlign: 'center', marginTop: '16px' }}>
                                By signing up, you agree to our Terms of Service and Privacy Policy
                            </p>
                        </form>

                        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #1f1f1f', textAlign: 'center' }}>
                            <p style={{ color: '#71717a' }}>
                                Already have an account?{' '}
                                <Link to="/login" style={{ color: '#3b82f6', fontWeight: '500', textDecoration: 'none' }}>
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Branding (hidden on mobile) */}
            <div className="hidden lg:flex" style={{ width: '50%', position: 'relative', overflow: 'hidden' }}>
                {/* Gradient Background */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)',
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
                        Start your<br />
                        <span style={{ opacity: 0.8 }}>journey today</span>
                    </h1>

                    <p style={{ fontSize: '18px', opacity: 0.7, maxWidth: '400px', marginBottom: '48px' }}>
                        Join our community and experience the future of secure messaging.
                    </p>

                    {/* Feature Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <feature.icon style={{ width: '20px', height: '20px' }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{feature.title}</div>
                                    <div style={{ fontSize: '14px', opacity: 0.6 }}>{feature.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Floating Elements */}
                <div style={{
                    position: 'absolute',
                    top: '80px',
                    right: '80px',
                    width: '96px',
                    height: '96px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    backdropFilter: 'blur(8px)',
                    transform: 'rotate(12deg)',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '80px',
                    right: '64px',
                    width: '64px',
                    height: '64px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(8px)',
                    transform: 'rotate(-12deg)',
                }} />
            </div>
        </div>
    );
}
