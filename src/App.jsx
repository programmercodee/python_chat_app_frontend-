/**
 * Main App component with routing.
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store';
import { Layout } from './components/layout';
import { Login, Register, SetPassword, ChooseUsername, ForgotPassword, Chat, Contacts, Settings } from './pages';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816]">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div className="w-12 h-12 border-4 border-[#1f2937] border-t-[#3b82f6] rounded-full animate-spin" />

          {/* Main text */}
          <p className="text-base font-medium text-white tracking-wide">
            Loading your dashboard...
          </p>

          {/* Sub text */}
          <p className="text-xs text-[#9ca3af] max-w-xs text-center">
            This may take a few seconds. Please do not close or refresh this window.
          </p>
        </div>
      </div>



    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public route wrapper (redirects to home if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="w-12 h-12 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const { checkAuth } = useAuthStore();

  // Check authentication on app load
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #2e2e2e',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/set-password"
          element={
            <PublicRoute>
              <SetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/choose-username"
          element={
            <PublicRoute>
              <ChooseUsername />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* Protected routes with layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Chat />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
