
import { ApiResponse } from '@/types/propertyTypes';
import { saveViolationsToDatabase } from './violationsService';
import { supabase } from '@/integrations/supabase/client';

export interface ApiResponseWithNewCount extends ApiResponse {
  newRecordsCount?: number;
  newCasefilesCount?: number;
  newRecordsForExistingCasesCount?: number;
}

const getParcelIdsFromDatabase = async (): Promise<string[]> => {
  console.log('Fetching parcel IDs from database...');
  
  const { data: addresses, error } = await supabase
    .from('addresses')
    .select('parcel_id')
    .not('parcel_id', 'is', null);

  if (error) {
    console.error('Error fetching parcel IDs:', error);
    throw new Error(`Failed to fetch parcel IDs: ${error.message}`);
  }

  const parcelIdList = addresses?.map(item => item.parcel_id).filter(Boolean) || [];
  console.log('Found', parcelIdList.length, 'parcel IDs in database');
  return parcelIdList;
};

const getLatestViolationDate = async (): Promise<string | null> => {
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
  
  // Log the constructed URL
  console.log('=== API URL CONSTRUCTION ===');
  console.log('Base URL:', baseUrl);
  console.log('Parcel ID condition:', parcelIdCondition);
  console.log('Latest date from DB:', latestDate);
  console.log('Date filter:', dateFilter);
  console.log('Order by:', orderBy);
  console.log('Limit:', limit);
  console.log('FULL API URL:', fullUrl);
  console.log('URL Length:', fullUrl.length);
  console.log('=== END API URL CONSTRUCTION ===');
  
  return fullUrl;
};

export const fetchPropertyData = async (fullSync: boolean = false): Promise<ApiResponseWithNewCount> => {
  console.log('Fetching parcel IDs from database...');
  const parcelIds = await getParcelIdsFromDatabase();
  
  if (parcelIds.length === 0) {
    console.log('No parcel IDs found in database');
    return {
      success: true,
      result: { records: [], total: 0 },
      newRecordsCount: 0,
      newCasefilesCount: 0,
      newRecordsForExistingCasesCount: 0
    };
  }
  
  // Get the latest violation date unless doing a full sync
  const latestDate = fullSync ? null : await getLatestViolationDate();
  console.log('Latest violation date from database:', latestDate);
  
  const apiUrl = buildApiUrl(parcelIds, latestDate, fullSync);
  const yearText = fullSync ? '2024' : (latestDate || '2025');
  console.log(`Fetching property investigation data with ${parcelIds.length} parcel IDs from ${yearText} onwards...`);
  console.log('Making API call to URL:', apiUrl);
  
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
      saveResult = await saveViolationsToDatabase(data.result.records);
      console.log('New violations breakdown:', saveResult);
    } catch (error) {
      console.error('Failed to save violations to database:', error);
      // Don't throw here - we still want to return the API data even if saving fails
    }
  }
  
  return {
    ...data,
    newRecordsCount: saveResult.newRecordsCount,
    newCasefilesCount: saveResult.newCasefilesCount,
    newRecordsForExistingCasesCount: saveResult.newRecordsForExistingCasesCount
  };
};
