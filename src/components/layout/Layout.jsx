/**
 * Main layout wrapper for authenticated pages.
 */

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function Layout() {
    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0a0a0a' }}>
            {/* Sidebar - hidden on mobile */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Main content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Outlet />
            </main>

            {/* Mobile navigation */}
            <MobileNav />
        </div>
    );
}
