import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Dashboard from "./Dashboard";
import Login from "./Login";
import LoadingOverlay from "@/components/ui/loading-overlay";

const Root: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Keep session in state to react to changes
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    // Listen for auth changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setHasSession(!!session);
      // Defer any Supabase calls out of the callback to avoid deadlocks
      if (session) {
        setTimeout(() => verifyRole(session.user.id), 0);
      } else {
        setIsAuthorized(false);
      }
    });

    // Then check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setHasSession(!!session);
      if (session) {
        await verifyRole(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const verifyRole = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (data) {
        setIsAuthorized(true);
      } else {
        // If no role, sign out to prevent access
        await supabase.auth.signOut();
        setIsAuthorized(false);
      }
    } catch (_e) {
      // On any error, consider unauthorized
      setIsAuthorized(false);
    }
  };

  // While determining state, show a small overlay
  if (isLoading) {
    return <LoadingOverlay isVisible={true} message="Loading application..." />;
  }

  // If logged in and authorized, show Dashboard at root
  if (hasSession && isAuthorized) {
    return <Dashboard />;
  }

  // Otherwise show Login
  return <Login />;
};

export default Root;
