
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings } from 'lucide-react';

interface AppSettings {
  id: number;
  email_reports_enabled: boolean;
  email_report_address: string | null;
  violation_checks_enabled: boolean;
}

const EmailSettings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    id: 1,
    email_reports_enabled: false,
    email_report_address: '',
    violation_checks_enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: "Error",
          description: "Failed to load email settings",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load email settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          id: 1,
          email_reports_enabled: settings.email_reports_enabled,
          email_report_address: settings.email_report_address,
          violation_checks_enabled: settings.violation_checks_enabled,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving settings:', error);
        toast({
          title: "Error",
          description: "Failed to save email settings",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Settings Saved",
        description: "Email notification settings have been updated successfully"
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to save email settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Email Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-reports">Enable Hourly Email Reports</Label>
              <p className="text-sm text-gray-600">
                Receive email notifications when new violation records are found
              </p>
            </div>
            <Switch
              id="email-reports"
              checked={settings.email_reports_enabled}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, email_reports_enabled: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-address">Email Address</Label>
            <Input
              id="email-address"
              type="email"
              placeholder="Enter email address for notifications"
              value={settings.email_report_address || ''}
              onChange={(e) => 
                setSettings(prev => ({ ...prev, email_report_address: e.target.value }))
              }
              disabled={!settings.email_reports_enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="violation-checks">Enable Violation Checks</Label>
              <p className="text-sm text-gray-600">
                Enable the hourly automated violation checking system
              </p>
            </div>
            <Switch
              id="violation-checks"
              checked={settings.violation_checks_enabled}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, violation_checks_enabled: checked }))
              }
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
          <strong>Note:</strong> The hourly email check runs automatically at 5 minutes past every hour. 
          You will only receive emails when new violation records are found.
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSettings;
