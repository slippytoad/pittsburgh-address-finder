
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ViolationRecord } from "./types.ts";

interface SaveResult {
  newRecordsCount: number;
  newCasefilesCount: number;
  newRecordsForExistingCasesCount: number;
}

export class DatabaseService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async getAddresses(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('addresses')
      .select('address');

    if (error) {
      console.error('Error fetching addresses:', error);
      throw new Error(`Failed to fetch addresses: ${error.message}`);
    }

    return data?.map(item => item.address) || [];
  }

  async getParcelIds(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('addresses')
      .select('parcel_id')
      .not('parcel_id', 'is', null);

    if (error) {
      console.error('Error fetching parcel IDs:', error);
      throw new Error(`Failed to fetch parcel IDs: ${error.message}`);
    }

    return data?.map(item => item.parcel_id).filter(Boolean) || [];
  }

  async saveViolations(violations: ViolationRecord[]): Promise<SaveResult> {
    console.log(`Attempting to save ${violations.length} violation records...`);
    
    if (violations.length === 0) {
      console.log('No violations to save');
      return {
        newRecordsCount: 0,
        newCasefilesCount: 0,
        newRecordsForExistingCasesCount: 0
      };
    }

    // Get existing violation IDs to check which ones are new
    const violationIds = violations.map(v => v._id);
    const { data: existingViolations, error: fetchError } = await this.supabase
      .from('violations')
      .select('_id, casefile_number')
      .in('_id', violationIds);

    if (fetchError) {
      console.error('Error fetching existing violations:', fetchError);
      throw new Error(`Failed to fetch existing violations: ${fetchError.message}`);
    }

    const existingIds = new Set(existingViolations?.map(v => v._id) || []);
    const existingCaseNumbers = new Set(existingViolations?.map(v => v.casefile_number) || []);
    
    // Filter out violations that already exist
    const newViolations = violations.filter(v => !existingIds.has(v._id));
    
    console.log(`Found ${newViolations.length} new violations out of ${violations.length} total`);

    if (newViolations.length === 0) {
      console.log('All violations already exist in database');
      return {
        newRecordsCount: 0,
        newCasefilesCount: 0,
        newRecordsForExistingCasesCount: 0
      };
    }

    // Count new casefiles and new records for existing cases
    const newCaseNumbers = new Set(newViolations.map(v => v.casefile_number));
    const newCasefilesCount = Array.from(newCaseNumbers).filter(caseNum => !existingCaseNumbers.has(caseNum)).length;
    const newRecordsForExistingCasesCount = newViolations.length - Array.from(newCaseNumbers).filter(caseNum => !existingCaseNumbers.has(caseNum)).reduce((count, caseNum) => {
      return count + newViolations.filter(v => v.casefile_number === caseNum).length;
    }, 0);

    // Save new violations
    const { error: insertError } = await this.supabase
      .from('violations')
      .insert(newViolations);

    if (insertError) {
      console.error('Error saving violations:', insertError);
      throw new Error(`Failed to save violations: ${insertError.message}`);
    }

    console.log(`Successfully saved ${newViolations.length} new violation records`);
    console.log(`New casefiles: ${newCasefilesCount}`);
    console.log(`New records for existing cases: ${newRecordsForExistingCasesCount}`);
    
    return {
      newRecordsCount: newViolations.length,
      newCasefilesCount,
      newRecordsForExistingCasesCount
    };
  }

  async updateLastApiCheckTime(newRecordsCount?: number): Promise<void> {
    const { error } = await this.supabase
      .from('app_settings')
      .update({ 
        last_api_check_time: new Date().toISOString(),
        last_api_new_records_count: newRecordsCount || 0
      })
      .eq('id', 1);

    if (error) {
      console.error('Error updating last API check time:', error);
      throw new Error(`Failed to update last API check time: ${error.message}`);
    }
  }

  async getAppSettings() {
    const { data, error } = await this.supabase
      .from('app_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Error fetching app settings:', error);
      throw new Error(`Failed to fetch app settings: ${error.message}`);
    }

    return data;
  }
}
