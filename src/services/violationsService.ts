
import { supabase } from '@/integrations/supabase/client';
import { PropertyRecord } from '@/types/propertyTypes';

export interface ViolationRecord {
  _id: number;
  casefile_number?: string;
  address?: string;
  parcel_id?: string;
  status?: string;
  investigation_date?: string;
  violation_description?: string;
  violation_code_section?: string;
  violation_spec_instructions?: string;
  investigation_outcome?: string;
  investigation_findings?: string;
}

export const saveViolationsToDatabase = async (records: PropertyRecord[]): Promise<void> => {
  console.log('Saving violations to database...', records.length, 'records');
  
  // Map API records to database format
  const violationRecords: ViolationRecord[] = records.map(record => ({
    _id: record._id,
    casefile_number: record.casefile_number || null,
    address: record.address || null,
    parcel_id: record.parcel_id || null,
    status: record.status || null,
    investigation_date: record.investigation_date || null,
    violation_description: record.violation_description || null,
    violation_code_section: record.violation_code_section || null,
    violation_spec_instructions: record.violation_spec_instructions || null,
    investigation_outcome: record.investigation_outcome || null,
    investigation_findings: record.investigation_findings || null,
  }));

  // Use upsert to handle duplicates based on _id
  const { data, error } = await supabase
    .from('violations')
    .upsert(violationRecords, { 
      onConflict: '_id',
      ignoreDuplicates: false 
    });

  if (error) {
    console.error('Error saving violations:', error);
    throw new Error(`Failed to save violations: ${error.message}`);
  }

  console.log('Successfully saved violations to database:', data);
};
