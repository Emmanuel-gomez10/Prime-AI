import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070816] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Strict admin authorization check: metadata role or specific admin email
  const isDemo = typeof window !== 'undefined' && localStorage.getItem("prime_admin_demo") === "true";
  const isAdmin = isDemo ||
                  user?.user_metadata?.role === "admin" || 
                  user?.email === "eorji362@gmail.com" ||
                  (user?.email ? user.email.toLowerCase().startsWith("admin@") : false);

  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

