
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

  async getExistingViolationIds(): Promise<Set<number>> {
    const { data: existingRecords, error: fetchError } = await this.supabase
      .from('violations')
      .select('_id');

    if (fetchError) {
      console.error('Error fetching existing violation IDs:', fetchError);
      throw new Error(`Failed to fetch existing violation IDs: ${fetchError.message}`);
    }

    const existingIds = new Set(existingRecords?.map(record => record._id) || []);
    console.log('Found', existingIds.size, 'existing violation IDs in database');
    return existingIds;
  }

  async saveNewViolations(violationRecords: ViolationRecord[]): Promise<void> {
    if (violationRecords.length === 0) {
      console.log('No new violations to save');
      return;
    }

    // Use upsert with onConflict to handle duplicates gracefully
    const { error: insertError } = await this.supabase
      .from('violations')
      .upsert(violationRecords, { 
        onConflict: '_id',
        ignoreDuplicates: true 
      });

    if (insertError) {
      console.error('Error saving new violations:', insertError);
      throw new Error(`Failed to save new violations: ${insertError.message}`);
    }

    console.log('Successfully processed', violationRecords.length, 'violation records (duplicates ignored)');
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

  async updateLastApiCheckTime(): Promise<void> {
    const now = new Date().toISOString();
    
    const { error } = await this.supabase
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
  }
}
