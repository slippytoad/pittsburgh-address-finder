
import { supabase } from '@/integrations/supabase/client';

export interface AppSettings {
  id: number;
  email_reports_enabled: boolean;
  email_report_address: string;
  violation_checks_enabled: boolean;
  sms_reports_enabled: boolean;
  sms_report_phone: string | null;
  last_api_check_time: string | null;
  last_api_new_records_count?: number | null;
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

export const updateLastApiCheckTime = async (newRecordsCount?: number): Promise<void> => {
  const now = new Date().toISOString();
  
  const updateData: any = {
    id: 1,
    last_api_check_time: now
  };

  // Only update the count if provided
  if (newRecordsCount !== undefined) {
    updateData.last_api_new_records_count = newRecordsCount;
  }
  
  const { error } = await supabase
    .from('app_settings')
    .upsert(updateData, {
      onConflict: 'id'
    });

  if (error) {
    console.error('Error updating last API check time:', error);
    throw new Error(`Failed to update last API check time: ${error.message}`);
  }

  console.log('Last API check time updated to:', now, 'with new records count:', newRecordsCount);
};
