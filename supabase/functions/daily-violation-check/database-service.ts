
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ViolationRecord, AppSettings } from "./types.ts";

export class DatabaseService {
  private supabase;

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    });
    console.log('DatabaseService initialized with service role');
  }

  async getAddresses(): Promise<string[]> {
    const { data: addresses, error } = await this.supabase
      .from('addresses')
      .select('address');

    if (error) {
      console.error('Error fetching addresses:', error);
      throw new Error(`Failed to fetch addresses: ${error.message}`);
    }

    const addressList = addresses?.map(item => item.address) || [];
    console.log('Found', addressList.length, 'addresses in database');
    return addressList;
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

  async getLatestViolationDate(): Promise<string | null> {
    const { data: latestRecord, error: fetchError } = await this.supabase
      .from('violations')
      .select('investigation_date')
      .not('investigation_date', 'is', null)
      .order('investigation_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching latest violation date:', fetchError);
      throw new Error(`Failed to fetch latest violation date: ${fetchError.message}`);
    }

    const latestDate = latestRecord?.investigation_date || null;
    console.log('Latest violation date in database:', latestDate);
    return latestDate;
  }

  async saveNewViolations(violationRecords: ViolationRecord[]): Promise<void> {
    if (violationRecords.length === 0) {
      console.log('No new violations to save');
      return;
    }

    console.log('Attempting to save', violationRecords.length, 'violation records using service role');

    try {
      // First, try a batch insert with proper RLS bypass
      const { data, error: insertError } = await this.supabase
        .from('violations')
        .insert(violationRecords)
        .select();

      if (insertError) {
        console.error('Batch insert failed:', insertError);
        
        // If batch insert fails due to RLS or other issues, try individual inserts
        console.log('Attempting individual record inserts...');
        
        let successCount = 0;
        let lastError = null;
        
        for (let i = 0; i < violationRecords.length; i++) {
          const record = violationRecords[i];
          try {
            const { data: singleData, error: singleError } = await this.supabase
              .from('violations')
              .insert([record])
              .select();
            
            if (singleError) {
              console.error(`Failed to insert record ${i} with _id ${record._id}:`, singleError);
              lastError = singleError;
            } else {
              console.log(`Successfully inserted record ${i} with _id ${record._id}`);
              successCount++;
            }
          } catch (singleException) {
            console.error(`Exception inserting record ${i}:`, singleException);
            lastError = singleException;
          }
        }
        
        if (successCount === 0) {
          throw new Error(`Failed to save any violations. Last error: ${lastError?.message || 'Unknown error'}`);
        } else {
          console.log(`Successfully saved ${successCount} out of ${violationRecords.length} violations`);
        }
      } else {
        console.log('Successfully saved all', violationRecords.length, 'violation records');
      }
    } catch (error) {
      console.error('Error in saveNewViolations:', error);
      throw error;
    }
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

  async updateLastApiCheckTime(newRecordsCount?: number): Promise<void> {
    const now = new Date().toISOString();
    
    const updateData: any = {
      id: 1,
      last_api_check_time: now
    };

    // Only update the count if provided
    if (newRecordsCount !== undefined) {
      updateData.last_api_new_records_count = newRecordsCount;
    }
    
    const { error } = await this.supabase
      .from('app_settings')
      .upsert(updateData, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Error updating last API check time:', error);
      throw new Error(`Failed to update last API check time: ${error.message}`);
    }

    console.log('Last API check time updated to:', now, 'with new records count:', newRecordsCount);
  }
}
