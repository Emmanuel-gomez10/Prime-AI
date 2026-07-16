import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070816] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
