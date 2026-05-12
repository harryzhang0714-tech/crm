import { useState, useEffect } from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Deals from './pages/Deals';
import Reminders from './pages/Reminders';
import DailyTodos from './pages/DailyTodos';
import Opportunities from './pages/Opportunities';
import FBGroups from './pages/FBGroups';
import DSGallery from './pages/DSGallery';
import { useCRMStore } from './store/crmStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const currentUser = useCRMStore(s => s.currentUser);

  useEffect(() => {
    // Wait for zustand persist to rehydrate from localStorage
    const stored = localStorage.getItem('teamcrm-store');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.state?.currentUser) {
          useCRMStore.setState({ currentUser: parsed.state.currentUser });
        }
      } catch {}
    }
    setHydrated(true);
  }, []);

  if (!hydrated) return null; // or a loading spinner

  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const [hydrated, setHydrated] = useState(false);
  const currentUser = useCRMStore(s => s.currentUser);

  useEffect(() => {
    const stored = localStorage.getItem('teamcrm-store');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.state?.currentUser) {
          useCRMStore.setState({ currentUser: parsed.state.currentUser });
        }
      } catch {}
    }
    setHydrated(true);
  }, []);

  if (!hydrated) return <div style={{ background: '#1C1C1E', height: '100vh' }} />;

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