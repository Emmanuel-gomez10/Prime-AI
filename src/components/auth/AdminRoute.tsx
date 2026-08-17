import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export const AdminRoute = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAdmin = async () => {
      // 1. If AuthContext is still loading session, do not complete checkingAdmin
      if (authLoading) {
        return;
      }

      // 2. Auth has finished loading: if no user, deny admin
      if (!user) {
        if (isMounted) {
          setIsAdmin(false);
          setCheckingAdmin(false);
        }
        return;
      }

      // 3. User is present: query profiles table
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin, role")
          .eq("id", user.id)
          .maybeSingle();

        if (isMounted) {
          if (error) {
            console.error("Admin authorization check failed:", error);
            setIsAdmin(false);
          } else {
            const isAdminUser = data?.is_admin === true || data?.role === "admin";
            setIsAdmin(isAdminUser);
          }
          setCheckingAdmin(false);
        }
      } catch (err) {
        console.error("Unexpected error in checkAdmin:", err);
        if (isMounted) {
          setIsAdmin(false);
          setCheckingAdmin(false);
        }
      }
    };

    checkAdmin();

    return () => {
      isMounted = false;
    };
  }, [user?.id, authLoading]);

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-[#070816] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};