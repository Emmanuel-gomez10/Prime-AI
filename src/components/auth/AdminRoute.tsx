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

  // Admin authorization check: metadata role, admin email override, or local override
  const isAdmin = user?.user_metadata?.role === "admin" || 
                  user?.email?.toLowerCase().includes("admin") || 
                  user?.email === "eorji362@gmail.com" ||
                  localStorage.getItem("prime_admin_demo") === "true";

  return (user && isAdmin) ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

