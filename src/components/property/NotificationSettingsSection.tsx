
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationSettings from '@/components/NotificationSettings';
import NotificationTestButtons from '@/components/NotificationTestButtons';

const NotificationSettingsSection: React.FC = () => {
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  return (
    <Card className="border border-gray-200">
      <CardContent className="pt-6">
        <Button
          variant="ghost"
          onClick={() => setShowNotificationSettings(!showNotificationSettings)}
          className="w-full justify-between p-0 h-auto font-medium text-left"
        >
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <span>Notification Settings</span>
          </div>
          {showNotificationSettings ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        
        {showNotificationSettings && (
          <div className="mt-4 space-y-4">
            <NotificationSettings />
            <NotificationTestButtons />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettingsSection;
