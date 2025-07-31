import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PropertyInvestigationDashboard from '@/components/PropertyInvestigationDashboard';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Bypass auth check in development mode
    if (import.meta.env.DEV) {
      return;
    }

    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
      }
    };

    checkAuth();

    // Listen for auth changes (skip in development)
    if (!import.meta.env.DEV) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate('/');
        }
      });

      return () => subscription.unsubscribe();
    }

  }, [navigate]);

  return <PropertyInvestigationDashboard />;
};

export default Dashboard;