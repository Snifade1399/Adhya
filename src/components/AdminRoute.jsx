import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { supabase } from "../lib/supabaseClient";


function AdminRoute({ children }) {

  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  const [isAdmin, setIsAdmin] = useState(null);
  const [checking, setChecking] = useState(true);


  useEffect(() => {

    if (authLoading) {
      return;
    }

    if (!user) {
      setChecking(false);
      return;
    }

    let active = true;

    supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {

        if (!active) {
          return;
        }

        setIsAdmin(Boolean(data));
        setChecking(false);

      });

    return () => {
      active = false;
    };

  }, [user, authLoading]);


  if (authLoading || checking) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center">
        <p className="text-sm text-[var(--muted)]">
          Verifying admin access...
        </p>
      </main>
    );
  }


  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }


  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }


  return children;
}


export default AdminRoute;
