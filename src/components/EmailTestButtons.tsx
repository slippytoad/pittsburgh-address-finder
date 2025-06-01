
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send, Play } from 'lucide-react';

const EmailTestButtons: React.FC = () => {
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingDaily, setSendingDaily] = useState(false);
  const [runningCheck, setRunningCheck] = useState(false);
  const { toast } = useToast();

  const sendTestEmail = async () => {
    setSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke('daily-violation-check', {
        body: { test_run: true }
      });

      if (error) {
        console.error('Error sending test email:', error);
        toast({
          title: "Test Email Failed",
          description: "Failed to send test email",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Test Email Sent",
        description: "Test email has been sent successfully. Check your inbox!"
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Test Email Failed",
        description: "Failed to send test email",
        variant: "destructive"
      });
    } finally {
      setSendingTest(false);
    }
  };

  const sendDailyReport = async () => {
    setSendingDaily(true);
    try {
      const { data, error } = await supabase.functions.invoke('daily-violation-check', {
        body: { test_run: false }
      });

      if (error) {
        console.error('Error sending daily report:', error);
        toast({
          title: "Daily Report Failed",
          description: "Failed to send daily report email",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Daily Report Sent",
        description: "Daily violation report has been sent successfully. Check your inbox!"
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Daily Report Failed",
        description: "Failed to send daily report email",
        variant: "destructive"
      });
    } finally {
      setSendingDaily(false);
    }
  };

  const runDailyCheck = async () => {
    setRunningCheck(true);
    try {
      const { data, error } = await supabase.functions.invoke('daily-violation-check', {
        body: { test_run: false }
      });

      if (error) {
        console.error('Error running daily check:', error);
        toast({
          title: "Daily Check Failed",
          description: `Failed to run daily check: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Daily check response:', data);
      toast({
        title: "Daily Check Completed",
        description: `Daily check completed successfully. ${data?.newRecordsCount || 0} new records found.`
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Daily Check Failed",
        description: "Failed to run daily check",
        variant: "destructive"
      });
    } finally {
      setRunningCheck(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Email Testing & Daily Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={sendTestEmail} 
            disabled={sendingTest}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Mail className="h-4 w-4" />
            {sendingTest ? 'Sending...' : 'Send Test Email'}
          </Button>
          
          <Button 
            onClick={sendDailyReport} 
            disabled={sendingDaily}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {sendingDaily ? 'Sending...' : 'Send Daily Report'}
          </Button>

          <Button 
            onClick={runDailyCheck} 
            disabled={runningCheck}
            className="flex items-center gap-2"
            variant="default"
          >
            <Play className="h-4 w-4" />
            {runningCheck ? 'Running...' : 'Run Daily Check'}
          </Button>
        </div>
        
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
          <strong>Test Email:</strong> Sends a simple test message to verify email functionality.<br/>
          <strong>Daily Report:</strong> Sends the actual daily violation report with current data.<br/>
          <strong>Run Daily Check:</strong> Executes the full daily violation check process including data fetching and database updates.
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailTestButtons;
