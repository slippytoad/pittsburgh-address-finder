
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ViolationRecord, AppSettings } from "./types.ts";

export class DatabaseService {
  private supabase;

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async getAppSettings(): Promise<AppSettings | null> {
    const { data: settings, error: settingsError } = await this.supabase
      .from("app_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (settingsError) {
      console.error("Error fetching app settings:", settingsError);
      throw new Error(`Failed to fetch app settings: ${settingsError.message}`);
    }

    return settings;
  }

  async getExistingViolations(): Promise<Set<number>> {
    const { data: existingRecords, error: fetchError } = await this.supabase
      .from('violations')
      .select('_id');

    if (fetchError) {
      console.error('Error fetching existing violations:', fetchError);
      throw new Error(`Failed to fetch existing violations: ${fetchError.message}`);
    }

    return new Set(existingRecords?.map(record => record._id) || []);
  }

  async saveNewViolations(violationRecords: ViolationRecord[]): Promise<void> {
    const { error: insertError } = await this.supabase
      .from('violations')
      .insert(violationRecords);

    if (insertError) {
      console.error('Error saving new violations:', insertError);
      throw new Error(`Failed to save new violations: ${insertError.message}`);
    }

    console.log('Successfully saved', violationRecords.length, 'new violations to database');
  }

  async logEmailNotification(newRecordsCount: number, emailAddress: string): Promise<void> {
    const { error: logError } = await this.supabase
      .from('email_notifications')
      .insert({
        new_records_count: newRecordsCount,
        email_address: emailAddress,
        status: 'sent'
      });

    if (logError) {
      console.error('Error logging email notification:', logError);
      // Don't throw here - the email was sent successfully
    }
  }
}
