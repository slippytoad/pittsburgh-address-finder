
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmailSettingsSection from '@/components/property/EmailSettingsSection';
import AddressManager from '@/components/AddressManager';

const Admin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-4xl mx-auto p-2 sm:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Admin Settings</h1>
        </div>
        
        <AddressManager />
        <EmailSettingsSection />
      </div>
    </div>
  );
};

export default Admin;
