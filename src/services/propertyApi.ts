
import { ApiResponse } from '@/types/propertyTypes';
import { saveViolationsToDatabase } from './violationsService';
import { supabase } from '@/integrations/supabase/client';

export interface ApiResponseWithNewCount extends ApiResponse {
  newRecordsCount?: number;
  newCasefilesCount?: number;
  newRecordsForExistingCasesCount?: number;
}

const getAddressesFromDatabase = async (): Promise<string[]> => {
  console.log('Fetching addresses from database...');
  
  const { data: addresses, error } = await supabase
    .from('addresses')
    .select('address');

  if (error) {
    console.error('Error fetching addresses:', error);
    throw new Error(`Failed to fetch addresses: ${error.message}`);
  }

  const addressList = addresses?.map(item => item.address) || [];
  console.log('Found', addressList.length, 'addresses in database');
  return addressList;
};

const buildApiUrl = (addresses: string[], fullSync: boolean = false): string => {
  const baseUrl = 'https://data.wprdc.org/api/3/action/datastore_search_sql?sql=SELECT%20%2A%20FROM%20%2270c06278-92c5-4040-ab28-17671866f81c%22%20WHERE%20';
  
  // Build the address conditions dynamically
  const addressConditions = addresses.map(address => 
    `address%20ILIKE%20%27${encodeURIComponent(address)}%25%27`
  ).join('%20OR%20');
  
  // Use different date filter based on fullSync parameter
  const dateFilter = fullSync 
    ? '%20AND%20investigation_date%20%3E%3D%20%272024-01-01%27'
    : '%20AND%20investigation_date%20%3E%3D%20%272025-01-01%27';
  const orderBy = '%20ORDER%20BY%20investigation_date%20DESC';
  const limit = '%20LIMIT%201000'; // Add limit to fetch more records
  
  const fullUrl = baseUrl + '(' + addressConditions + ')' + dateFilter + orderBy + limit;
  
  // Log the constructed URL
  console.log('=== API URL CONSTRUCTION ===');
  console.log('Base URL:', baseUrl);
  console.log('Address conditions:', addressConditions);
  console.log('Date filter:', dateFilter);
  console.log('Order by:', orderBy);
  console.log('Limit:', limit);
  console.log('FULL API URL:', fullUrl);
  console.log('=== END API URL CONSTRUCTION ===');
  
  return fullUrl;
};

export const fetchPropertyData = async (fullSync: boolean = false): Promise<ApiResponseWithNewCount> => {
  console.log('Fetching addresses from database...');
  const addresses = await getAddressesFromDatabase();
  
  if (addresses.length === 0) {
    console.log('No addresses found in database');
    return {
      success: true,
      result: { records: [], total: 0 },
      newRecordsCount: 0,
      newCasefilesCount: 0,
      newRecordsForExistingCasesCount: 0
    };
  }
  
  const apiUrl = buildApiUrl(addresses, fullSync);
  const yearText = fullSync ? '2024' : '2025';
  console.log(`Fetching property investigation data with ${addresses.length} addresses from ${yearText} onwards...`);
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
