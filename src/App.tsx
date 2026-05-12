import { useState, useEffect } from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Deals from './pages/Deals';
import Reminders from './pages/Reminders';
import TeamMembers from './pages/TeamMembers';
import DailyTodos from './pages/DailyTodos';
import Opportunities from './pages/Opportunities';
import FBGroups from './pages/FBGroups';
import DSGallery from './pages/DSGallery';
import { useCRMStore } from './store/supabaseStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useCRMStore(s => s.currentUser);
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>C</div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>加载中...</div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { initialized, currentUser, initFromSupabase } = useCRMStore();

  useEffect(() => {
    initFromSupabase();
  }, []);

  if (!initialized) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="deals" element={<Deals />} />
        <Route path="daily" element={<DailyTodos />} />
        <Route path="opportunities" element={<Opportunities />} />
        <Route path="fbgroups" element={<FBGroups />} />
        <Route path="gallery" element={<DSGallery />} />
        <Route path="reminders" element={<Reminders />} />
        <Route path="team" element={<TeamMembers />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
      <Toaster position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#fff',
            fontSize: '13px',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
        }}
      />
    </HashRouter>
  );
}