/**
 * Mobile navigation component - bottom tab bar for mobile screens.
 */

import { NavLink } from 'react-router-dom';
import { MessageCircle, Users, Settings } from 'lucide-react';

export default function MobileNav() {
    const navItems = [
        { icon: MessageCircle, label: 'Chats', path: '/' },
        { icon: Users, label: 'Contacts', path: '/contacts' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <>
            {/* bottom nav bar - only visible on mobile */}
            <nav
                className="mobile-nav"
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '56px',
                    backgroundColor: '#111111',
                    borderTop: '1px solid #262626',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '40px', /* space between icons */
                    width: '100%',
                }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={({ isActive }) => ({
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '8px 16px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                color: isActive ? '#3b82f6' : '#71717a',
                                transition: 'color 0.2s',
                            })}
                        >
                            <item.icon style={{ width: '24px', height: '24px' }} />
                            <span style={{ fontSize: '11px', fontWeight: '500' }}>{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* CSS to hide nav on desktop and support iPhone safe area */}
            <style>{`
                /* iPhone safe area support */
                .mobile-nav {
                    padding-bottom: env(safe-area-inset-bottom, 0px);
                    height: calc(56px + env(safe-area-inset-bottom, 0px)) !important;
                }
                
                /* hide on desktop */
                @media (min-width: 769px) {
                    .mobile-nav {
                        display: none !important;
                    }
                }

                /* hide when keyboard is open */
                body.keyboard-open .mobile-nav {
                    display: none !important;
                }
            `}</style>
        </>
    );
}
