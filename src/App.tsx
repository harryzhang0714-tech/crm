import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Deals from './pages/Deals';
import Tasks from './pages/Tasks';
import Reminders from './pages/Reminders';
import TeamMembers from './pages/TeamMembers';
import DailyTodos from './pages/DailyTodos';
import Opportunities from './pages/Opportunities';
import FBGroups from './pages/FBGroups';
import DSGallery from './pages/DSGallery';
import { useCRMStore } from './store/crmStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useCRMStore(s => s.currentUser);
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const currentUser = useCRMStore(s => s.currentUser);
  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="deals" element={<Deals />} />
        <Route path="tasks" element={<Tasks />} />
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
    <BrowserRouter>
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
    </BrowserRouter>
  );
}