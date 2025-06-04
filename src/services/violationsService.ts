
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

export const fetchViolationsFromDatabase = async (): Promise<PropertyRecord[]> => {
  console.log('Fetching violations from database...');
  
  const { data: violations, error } = await supabase
    .from('violations')
    .select('*')
    .order('investigation_date', { ascending: false });

  if (error) {
    console.error('Error fetching violations:', error);
    throw new Error(`Failed to fetch violations: ${error.message}`);
  }

  console.log('Fetched', violations?.length || 0, 'violations from database');

  // Map the database format to the expected PropertyRecord format
  const propertyRecords: PropertyRecord[] = (violations || []).map(violation => ({
    _id: violation._id,
    address: violation.address || 'Unknown Address',
    investigation_date: violation.investigation_date || '',
    violation_type: violation.violation_description || '',
    status: violation.status || 'Unknown',
    casefile_number: violation.casefile_number || '',
    parcel_id: violation.parcel_id || '',
    violation_description: violation.violation_description || '',
    violation_code_section: violation.violation_code_section || '',
    violation_spec_instructions: violation.violation_spec_instructions || '',
    investigation_outcome: violation.investigation_outcome || '',
    investigation_findings: violation.investigation_findings || '',
  }));

  return propertyRecords;
};

export const saveViolationsToDatabase = async (records: PropertyRecord[]): Promise<number> => {
  console.log('Checking for new violations...', records.length, 'records from API');
  
  // Get existing record IDs from database
  const { data: existingRecords, error: fetchError } = await supabase
    .from('violations')
    .select('_id');

  if (fetchError) {
    console.error('Error fetching existing violations:', fetchError);
    throw new Error(`Failed to fetch existing violations: ${fetchError.message}`);
  }

  const existingIds = new Set(existingRecords?.map(record => record._id) || []);
  console.log('Found', existingIds.size, 'existing records in database');

  // Get the latest investigation date from the database
  const { data: latestRecord, error: latestError } = await supabase
    .from('violations')
    .select('investigation_date')
    .not('investigation_date', 'is', null)
    .order('investigation_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) {
    console.error('Error fetching latest violation date:', latestError);
    throw new Error(`Failed to fetch latest violation date: ${latestError.message}`);
  }

  const latestDate = latestRecord?.investigation_date || null;
  console.log('Latest violation date in database:', latestDate);

  // Filter records that don't exist in database
  const nonExistingRecords = records.filter(record => !existingIds.has(record._id));
  console.log('Found', nonExistingRecords.length, 'records that do not exist in database');

  // If we have a latest date, only include records newer than that date
  let newRecords = nonExistingRecords;
  if (latestDate) {
    newRecords = nonExistingRecords.filter(record => {
      if (!record.investigation_date) return false;
      return record.investigation_date > latestDate;
    });
    console.log('Filtered by date: Found', newRecords.length, 'records newer than', latestDate);
  }

  console.log('Final new records count:', newRecords.length);

  if (newRecords.length === 0) {
    console.log('No new records to save');
    return 0;
  }

  // Map new records to database format
  const violationRecords: ViolationRecord[] = newRecords.map(record => ({
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

  // Insert only new records
  const { data, error } = await supabase
    .from('violations')
    .insert(violationRecords);

  if (error) {
    console.error('Error saving new violations:', error);
    throw new Error(`Failed to save new violations: ${error.message}`);
  }

  console.log('Successfully saved', newRecords.length, 'new violations to database');
  return newRecords.length;
};
