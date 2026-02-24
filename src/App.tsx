import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Order from './pages/Order';
import Orders from './pages/Orders';
import Wallet from './pages/Wallet';
import Notifications from './pages/Notifications';
import Goals from './pages/Goals';
import Profile from './pages/Profile';
import Feedback from './pages/Feedback';
import AdminDashboard from './pages/AdminDashboard';
import Auth from './pages/Auth';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(state => state.token);
  if (!token) return <Navigate to="/auth" replace />;
  return <Layout>{children}</Layout>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  if (!token || user?.role !== 'admin') return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/order" 
            element={
              <ProtectedRoute>
                <Order />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/wallet" 
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/goals" 
            element={
              <ProtectedRoute>
                <Goals />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/feedback" 
            element={
              <ProtectedRoute>
                <Feedback />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
