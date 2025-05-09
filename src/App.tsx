import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { supabase } from './lib/supabase';
import { useAuthStore } from './stores/authStore';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

// Auth pages
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard';

// Record pages
import EntityList from './pages/records/EntityList';
import EntityDetails from './pages/records/EntityDetails';

// Settings pages
import Settings from './pages/settings/Settings';
import EntitySettings from './pages/settings/EntitySettings';
import FieldSettings from './pages/settings/FieldSettings';
import LayoutSettings from './pages/settings/LayoutSettings';

// Auth guard for protected routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuthStore();
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { session, setSession } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/signup" element={!session ? <SignUp /> : <Navigate to="/" replace />} />
        <Route path="/forgot-password" element={!session ? <ForgotPassword /> : <Navigate to="/" replace />} />
        <Route path="/reset-password" element={!session ? <ResetPassword /> : <Navigate to="/" replace />} />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          
          {/* Records routes */}
          <Route path=":entityType" element={<EntityList />} />
          <Route path=":entityType/:id" element={<EntityDetails />} />
          
          {/* Settings routes */}
          <Route path="settings" element={<Settings />} />
          <Route path="settings/entities" element={<EntitySettings />} />
          <Route path="settings/entities/:entityId" element={<FieldSettings />} />
          <Route path="settings/layouts/:entityId" element={<LayoutSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;