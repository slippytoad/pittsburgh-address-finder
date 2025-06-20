
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPropertyData } from '@/services/propertyApi';
import { fetchViolationsFromDatabase } from '@/services/violationsService';
import { getAppSettings, updateLastApiCheckTime } from '@/services/appSettingsService';
import { groupRecordsByCase } from '@/utils/propertyUtils';

export const usePropertyData = (selectedStatuses: string[], addressSearch?: string) => {
  const [showResults, setShowResults] = useState(true);
  const [lastNewRecordsCount, setLastNewRecordsCount] = useState<number | undefined>(undefined);
  const [lastNewCasefilesCount, setLastNewCasefilesCount] = useState<number | undefined>(undefined);
  const [lastNewRecordsForExistingCasesCount, setLastNewRecordsForExistingCasesCount] = useState<number | undefined>(undefined);
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
      
      // Set the detailed new records counts if available
      if (apiData?.newRecordsCount !== undefined) {
        setLastNewRecordsCount(apiData.newRecordsCount);
      }
      if (apiData?.newCasefilesCount !== undefined) {
        setLastNewCasefilesCount(apiData.newCasefilesCount);
      }
      if (apiData?.newRecordsForExistingCasesCount !== undefined) {
        setLastNewRecordsForExistingCasesCount(apiData.newRecordsForExistingCasesCount);
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

  // Get available statuses, status counts, and filtered data
  const { availableStatuses, statusCounts, filteredRecords } = useMemo(() => {
    if (!data?.result?.records) {
      console.log('usePropertyData - no data available');
      return { availableStatuses: [], statusCounts: {}, filteredRecords: [] };
    }

    const groupedCases = groupRecordsByCase(data.result.records);
    const statuses = Array.from(new Set(groupedCases.map(c => c.currentStatus)));
    
    // Calculate status counts
    const counts: Record<string, number> = {};
    groupedCases.forEach(caseGroup => {
      const status = caseGroup.currentStatus;
      counts[status] = (counts[status] || 0) + 1;
    });
    
    console.log('usePropertyData - Available statuses:', statuses);
    console.log('usePropertyData - Status counts:', counts);
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

    // Filter by address search if provided
    if (addressSearch && addressSearch.trim()) {
      const searchTerm = addressSearch.toLowerCase().trim();
      filteredCases = filteredCases.filter(caseGroup => {
        return caseGroup.records.some(record => 
          record.address?.toLowerCase().includes(searchTerm)
        );
      });
    }

    console.log('usePropertyData - Filtered cases count:', filteredCases.length);

    return { 
      availableStatuses: statuses,
      statusCounts: counts,
      filteredRecords: filteredCases.flatMap(c => c.records)
    };
  }, [data, selectedStatuses, addressSearch]);

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
    statusCounts,
    filteredRecords,
    lastNewRecordsCount,
    lastNewCasefilesCount,
    lastNewRecordsForExistingCasesCount,
    lastApiNewRecordsCount: appSettings?.last_api_new_records_count,
    appSettings,
    handleFetchData,
    getLatestDate,
    formatLastApiCheckTime
  };
};
