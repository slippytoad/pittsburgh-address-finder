import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApiResponse {
  success: boolean;
  result: {
    records: any[];
    total: number;
  };
}

interface SaveResult {
  newRecordsCount: number;
  newCasefilesCount: number;
  newRecordsForExistingCasesCount: number;
}

const getParcelIdsFromDatabase = async (supabase: any): Promise<string[]> => {
  console.log('Fetching parcel IDs from database...');
  
  const { data: addresses, error } = await supabase
    .from('addresses')
    .select('parcel_id')
    .not('parcel_id', 'is', null);

  if (error) {
    console.error('Error fetching parcel IDs:', error);
    throw new Error(`Failed to fetch parcel IDs: ${error.message}`);
  }

  const parcelIdList = addresses?.map((item: any) => item.parcel_id).filter(Boolean) || [];
  console.log('Found', parcelIdList.length, 'parcel IDs in database');
  return parcelIdList;
};

const getLatestViolationDate = async (supabase: any): Promise<string | null> => {
  const { data, error } = await supabase
    .from('violations')
    .select('investigation_date')
    .not('investigation_date', 'is', null)
    .order('investigation_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching latest violation date:', error);
    throw new Error(`Failed to fetch latest violation date: ${error.message}`);
  }

  return data?.investigation_date || null;
};

const buildApiUrl = (parcelIds: string[], latestDate: string | null, fullSync: boolean = false): string => {
  const baseUrl = 'https://data.wprdc.org/api/3/action/datastore_search_sql?sql=SELECT%20%2A%20FROM%20%2270c06278-92c5-4040-ab28-17671866f81c%22%20WHERE%20';
  
  // Build the parcel_id IN clause
  const parcelIdList = parcelIds.map(id => `%27${encodeURIComponent(id)}%27`).join('%2C');
  const parcelIdCondition = `parcel_id%20IN%20%28${parcelIdList}%29`;
  
  // Use different date filter based on fullSync parameter and latest date
  let dateFilter = '';
  if (fullSync) {
    dateFilter = '%20AND%20investigation_date%20%3E%3D%20%272024-01-01%27';
  } else if (latestDate) {
    // Use latest date from database, adding one day to avoid duplicates
    const nextDay = new Date(latestDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];
    dateFilter = `%20AND%20investigation_date%20%3E%3D%20%27${nextDayStr}%27`;
  } else {
    // Fallback to 2025 if no latest date found
    dateFilter = '%20AND%20investigation_date%20%3E%3D%20%272025-01-01%27';
  }
  
  const orderBy = '%20ORDER%20BY%20investigation_date%20DESC';
  const limit = '%20LIMIT%201000';
  
  const fullUrl = baseUrl + parcelIdCondition + dateFilter + orderBy + limit;
  
  console.log('=== API URL CONSTRUCTION ===');
  console.log('FULL API URL:', fullUrl);
  console.log('URL Length:', fullUrl.length);
  console.log('=== END API URL CONSTRUCTION ===');
  
  return fullUrl;
};

const saveViolationsToDatabase = async (supabase: any, records: any[]): Promise<SaveResult> => {
  console.log(`Processing ${records.length} violation records for database insertion...`);
  
  if (records.length === 0) {
    return {
      newRecordsCount: 0,
      newCasefilesCount: 0,
      newRecordsForExistingCasesCount: 0
    };
  }

  // Get existing violations to check for duplicates
  const { data: existingViolations, error: fetchError } = await supabase
    .from('violations')
    .select('_id');
  
  if (fetchError) {
    console.error('Error fetching existing violations:', fetchError);
    throw new Error(`Failed to fetch existing violations: ${fetchError.message}`);
  }

  const existingIds = new Set(existingViolations?.map((v: any) => v._id) || []);
  
  // Filter out records that already exist
  const newRecords = records.filter(record => !existingIds.has(record._id));
  
  if (newRecords.length === 0) {
    console.log('No new records to insert');
    return {
      newRecordsCount: 0,
      newCasefilesCount: 0,
      newRecordsForExistingCasesCount: 0
    };
  }

  // Get existing case files to count new ones
  const { data: existingCaseFiles, error: caseFileError } = await supabase
    .from('violations')
    .select('casefile_number')
    .not('casefile_number', 'is', null);
  
  if (caseFileError) {
    console.error('Error fetching existing case files:', caseFileError);
    throw new Error(`Failed to fetch existing case files: ${caseFileError.message}`);
  }

  const existingCaseFileNumbers = new Set(existingCaseFiles?.map((v: any) => v.casefile_number) || []);
  
  // Count new case files and new records for existing cases
  const newCaseFiles = new Set();
  let newRecordsForExistingCases = 0;
  
  newRecords.forEach(record => {
    if (record.casefile_number) {
      if (existingCaseFileNumbers.has(record.casefile_number)) {
        newRecordsForExistingCases++;
      } else {
        newCaseFiles.add(record.casefile_number);
      }
    }
  });

  // Prepare records for insertion
  const recordsToInsert = newRecords.map(record => ({
    _id: record._id,
    casefile_number: record.casefile_number || null,
    address: record.address || null,
    parcel_id: record.parcel_id || null,
    status: record.status || null,
    violation_description: record.violation_description || null,
    violation_code_section: record.violation_code_section || null,
    violation_spec_instructions: record.violation_spec_instructions || null,
    investigation_outcome: record.investigation_outcome || null,
    investigation_findings: record.investigation_findings || null,
    investigation_date: record.investigation_date || null
  }));

  // Insert new records
  const { error: insertError } = await supabase
    .from('violations')
    .insert(recordsToInsert);

  if (insertError) {
    console.error('Error inserting violations:', insertError);
    throw new Error(`Failed to insert violations: ${insertError.message}`);
  }

  const result = {
    newRecordsCount: newRecords.length,
    newCasefilesCount: newCaseFiles.size,
    newRecordsForExistingCasesCount: newRecordsForExistingCases
  };

  console.log('Successfully inserted violations:', result);
  return result;
};

const updateLastApiCheckTime = async (supabase: any, newRecordsCount: number): Promise<void> => {
  const { error } = await supabase
    .from('app_settings')
    .update({
      last_api_check_time: new Date().toISOString(),
      last_api_new_records_count: newRecordsCount,
      updated_at: new Date().toISOString()
    })
    .eq('id', 1);

  if (error) {
    console.error('Error updating last API check time:', error);
    throw new Error(`Failed to update last API check time: ${error.message}`);
  }
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Starting property update check...');

    // Get parcel IDs from database
    const parcelIds = await getParcelIdsFromDatabase(supabase);
    
    if (parcelIds.length === 0) {
      console.log('No parcel IDs found in database');
      return new Response(
        JSON.stringify({
          success: true,
          newRecordsCount: 0,
          newCasefilesCount: 0,
          newRecordsForExistingCasesCount: 0
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    // Get the latest violation date
    const latestDate = await getLatestViolationDate(supabase);
    console.log('Latest violation date from database:', latestDate);
    
    // Build API URL and fetch data
    const apiUrl = buildApiUrl(parcelIds, latestDate, false);
    const yearText = latestDate || '2025';
    console.log(`Fetching property investigation data with ${parcelIds.length} parcel IDs from ${yearText} onwards...`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error('API request failed:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response received:', {
      success: data.success,
      recordCount: data?.result?.records?.length || 0,
      totalRecords: data?.result?.total || 'unknown'
    });
    
    let saveResult = {
      newRecordsCount: 0,
      newCasefilesCount: 0,
      newRecordsForExistingCasesCount: 0
    };
    
    // Save the violations to the database and get detailed count breakdown
    if (data.success && data.result?.records) {
      try {
        saveResult = await saveViolationsToDatabase(supabase, data.result.records);
        console.log('New violations breakdown:', saveResult);
      } catch (error) {
        console.error('Failed to save violations to database:', error);
        throw error;
      }
    }

    // Update the last API check time
    await updateLastApiCheckTime(supabase, saveResult.newRecordsCount);
    
    return new Response(
      JSON.stringify({
        success: true,
        newRecordsCount: saveResult.newRecordsCount,
        newCasefilesCount: saveResult.newCasefilesCount,
        newRecordsForExistingCasesCount: saveResult.newRecordsForExistingCasesCount
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in check-property-updates function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        success: false 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});