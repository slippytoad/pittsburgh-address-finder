
import { supabase } from '@/integrations/supabase/client';

export interface AppSettings {
  id: number;
  email_reports_enabled: boolean;
  email_report_address: string;
  violation_checks_enabled: boolean;
  last_api_check_time: string | null;
  last_api_new_records_count: number | null;
  created_at: string;
  updated_at: string;
}

export const getAppSettings = async (): Promise<AppSettings | null> => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching app settings:', error);
    throw new Error(`Failed to fetch app settings: ${error.message}`);
  }

  return data;
};

export const updateLastApiCheckTime = async (): Promise<void> => {
  const now = new Date().toISOString();
  
  const { error } = await supabase
    .from('app_settings')
    .upsert({
      id: 1,
      last_api_check_time: now
    }, {
      onConflict: 'id'
    });

  if (error) {
    console.error('Error updating last API check time:', error);
    throw new Error(`Failed to update last API check time: ${error.message}`);
  }

  console.log('Last API check time updated to:', now);
};
