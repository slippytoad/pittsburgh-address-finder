
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import EmailSettingsSection from '@/components/property/EmailSettingsSection';
import AddressManager from '@/components/AddressManager';
import EmailTestButtons from '@/components/EmailTestButtons';
import UserManagement from '@/components/UserManagement';

const Admin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-4xl mx-auto p-2 sm:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Admin Settings</h1>
        </div>
        
        <UserManagement />
        <AddressManager />
        <EmailSettingsSection />
        <EmailTestButtons />
      </div>
    </div>
  );
};

export default Admin;
