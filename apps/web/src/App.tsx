import { useTranslation } from 'react-i18next';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from './lib/api';
import Login from './pages/Login';
import AppLayout from './layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Suppliers from './pages/Suppliers';
import Products from './pages/Products';
import CreateOrder from './pages/CreateOrder';
import Reconciliation from './pages/Reconciliation';
import ControlPanel from './pages/ControlPanel';
import Analytics from './pages/Analytics';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get<{ id: string; email: string; role: string }>('/auth/me'),
    retry: false,
  });
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-black">
        <div className="text-luxury-gold">{t('common.loading')}</div>
      </div>
    );
  }
  if (!data?.data) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="products" element={<Products />} />
        <Route path="create-order" element={<CreateOrder />} />
        <Route path="reconciliation" element={<Reconciliation />} />
        <Route path="control-panel" element={<ControlPanel />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
