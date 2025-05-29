
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmailSettings from '@/components/EmailSettings';
import EmailTestButtons from '@/components/EmailTestButtons';

const EmailSettingsSection: React.FC = () => {
  const [showEmailSettings, setShowEmailSettings] = useState(false);

  return (
    <Card className="border border-gray-200">
      <CardContent className="pt-6">
        <Button
          variant="ghost"
          onClick={() => setShowEmailSettings(!showEmailSettings)}
          className="w-full justify-between p-0 h-auto font-medium text-left"
        >
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <span>Email Notification Settings</span>
          </div>
          {showEmailSettings ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        
        {showEmailSettings && (
          <div className="mt-4 space-y-4">
            <EmailSettings />
            <EmailTestButtons />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailSettingsSection;
