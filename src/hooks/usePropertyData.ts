
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPropertyData } from '@/services/propertyApi';
import { fetchViolationsFromDatabase } from '@/services/violationsService';
import { getAppSettings, updateLastApiCheckTime } from '@/services/appSettingsService';
import { groupRecordsByCase } from '@/utils/propertyUtils';

export const usePropertyData = (selectedStatuses: string[]) => {
  const [showResults, setShowResults] = useState(true);
  const [lastNewRecordsCount, setLastNewRecordsCount] = useState<number | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Query for app settings to get the last API check time
  const { data: appSettings, refetch: refetchAppSettings } = useQuery({
    queryKey: ['app-settings'],
    queryFn: getAppSettings,
  });

  // Query for database violations (always enabled)
  const { data: dbData, isLoading: dbLoading, error: dbError, refetch: refetchDb } = useQuery({
    queryKey: ['violations-database'],
    queryFn: fetchViolationsFromDatabase,
  });

  // Use database data
  const data = { result: { records: dbData || [] } };
  const isLoading = dbLoading || isRefreshing;
  const error = dbError;

  const handleFetchData = async () => {
    console.log('Button clicked - fetching data...');
    setIsRefreshing(true);
    setShowResults(true);
    
    try {
      // Fetch fresh data from API
      const apiData = await fetchPropertyData();
      
      // Update the last API check time in the database with the new records count
      await updateLastApiCheckTime(apiData?.newRecordsCount);
      
      // Set the new records count if available
      if (apiData?.newRecordsCount !== undefined) {
        setLastNewRecordsCount(apiData.newRecordsCount);
      }
      
      // Refetch app settings to get the updated timestamp
      refetchAppSettings();
      
      // Refetch database data to show the updated records
      refetchDb();
    } catch (error) {
      console.error('Failed to update data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get available statuses and filtered data
  const { availableStatuses, filteredRecords } = useMemo(() => {
    if (!data?.result?.records) {
      console.log('usePropertyData - no data available');
      return { availableStatuses: [], filteredRecords: [] };
    }

    const groupedCases = groupRecordsByCase(data.result.records);
    const statuses = Array.from(new Set(groupedCases.map(c => c.currentStatus)));
    
    console.log('usePropertyData - Available statuses:', statuses);
    console.log('usePropertyData - Selected statuses:', selectedStatuses);
    console.log('usePropertyData - Total grouped cases:', groupedCases.length);

    // Filter cases based on selected statuses
    let filteredCases = groupedCases;
    if (selectedStatuses.length > 0) {
      filteredCases = groupedCases.filter(caseGroup => {
        const matches = selectedStatuses.includes(caseGroup.currentStatus);
        console.log(`usePropertyData - Case ${caseGroup.casefileNumber} with status "${caseGroup.currentStatus}" matches filter: ${matches}`);
        return matches;
      });
    }

    console.log('usePropertyData - Filtered cases count:', filteredCases.length);

    return { 
      availableStatuses: statuses,
      filteredRecords: filteredCases.flatMap(c => c.records)
    };
  }, [data, selectedStatuses]);

  // Get the latest date from the grouped cases
  const getLatestDate = () => {
    if (!data?.result?.records) return undefined;
    const groupedCases = groupRecordsByCase(data.result.records);
    return groupedCases.length > 0 ? groupedCases[0].latestDate : undefined;
  };

  // Format the last API check time for display
  const formatLastApiCheckTime = (timestamp: string | null) => {
    if (!timestamp) return undefined;
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return undefined;
    }
  };

  return {
    data,
    isLoading,
    error,
    showResults,
    availableStatuses,
    filteredRecords,
    lastNewRecordsCount,
    lastApiNewRecordsCount: appSettings?.last_api_new_records_count,
    appSettings,
    handleFetchData,
    getLatestDate,
    formatLastApiCheckTime
  };
};
