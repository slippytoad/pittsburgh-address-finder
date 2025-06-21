import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchViolationsFromDatabase } from '@/services/violationsService';
import { getAppSettings } from '@/services/appSettingsService';
import { usePropertyCases } from './usePropertyCases';
import { usePropertyDataMutation } from './usePropertyDataMutation';
import { 
  filterCasesByStatus, 
  filterCasesByAddress, 
  getStatusCounts, 
  getAvailableStatuses,
  formatLastApiCheckTime 
} from '@/utils/propertyFilters';

export const usePropertyData = (selectedStatuses: string[], addressSearch?: string) => {
  const [showResults, setShowResults] = useState(false);
  const [lastNewRecordsCount, setLastNewRecordsCount] = useState<number | undefined>(undefined);
  const [lastNewCasefilesCount, setLastNewCasefilesCount] = useState<number | undefined>(undefined);
  const [lastNewRecordsForExistingCasesCount, setLastNewRecordsForExistingCasesCount] = useState<number | undefined>(undefined);

  // Query for app settings to get the last API check time
  const { data: appSettings } = useQuery({
    queryKey: ['app-settings'],
    queryFn: getAppSettings,
  });

  // Query for database violations (always enabled)
  const { data: dbData, isLoading: dbLoading, error: dbError } = useQuery({
    queryKey: ['violations-database'],
    queryFn: fetchViolationsFromDatabase,
  });

  // Use database data
  const data = { result: { records: dbData || [] } };
  const isLoading = dbLoading;

  // Get grouped cases
  const groupedCases = usePropertyCases(data?.result?.records);

  // Mutation for fetching fresh data
  const mutation = usePropertyDataMutation();

  const handleFetchData = async () => {
    setShowResults(true);
    
    try {
      const result = await mutation.mutateAsync();
      
      // Set the detailed new records counts if available
      if (result?.newRecordsCount !== undefined) {
        setLastNewRecordsCount(result.newRecordsCount);
      }
      if (result?.newCasefilesCount !== undefined) {
        setLastNewCasefilesCount(result.newCasefilesCount);
      }
      if (result?.newRecordsForExistingCasesCount !== undefined) {
        setLastNewRecordsForExistingCasesCount(result.newRecordsForExistingCasesCount);
      }
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  // Get available statuses, status counts, and filtered data
  const { availableStatuses, statusCounts, filteredRecords } = useMemo(() => {
    if (!groupedCases.length) {
      return { availableStatuses: [], statusCounts: {}, filteredRecords: [] };
    }

    const availableStatuses = getAvailableStatuses(groupedCases);
    const statusCounts = getStatusCounts(groupedCases);
    
    // Filter cases based on selected statuses
    let filteredCases = filterCasesByStatus(groupedCases, selectedStatuses);

    // Filter by address search if provided
    if (addressSearch) {
      filteredCases = filterCasesByAddress(filteredCases, addressSearch);
    }

    return { 
      availableStatuses,
      statusCounts,
      filteredRecords: filteredCases.flatMap(c => c.records)
    };
  }, [groupedCases, selectedStatuses, addressSearch]);

  // Get the latest date from the grouped cases
  const getLatestDate = () => {
    return groupedCases.length > 0 ? groupedCases[0].latestDate : undefined;
  };

  return {
    data,
    isLoading,
    error: dbError,
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
    formatLastApiCheckTime: (timestamp: string | null) => formatLastApiCheckTime(timestamp)
  };
};
