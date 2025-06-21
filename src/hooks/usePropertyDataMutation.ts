import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPropertyData } from '@/services/propertyApi';
import { updateLastApiCheckTime } from '@/services/appSettingsService';

export interface FetchDataResult {
  newRecordsCount?: number;
  newCasefilesCount?: number;
  newRecordsForExistingCasesCount?: number;
}

export const usePropertyDataMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<FetchDataResult> => {
      const apiData = await fetchPropertyData();
      
      // Update the last API check time in the database
      await updateLastApiCheckTime(apiData?.newRecordsCount);
      
      return {
        newRecordsCount: apiData?.newRecordsCount,
        newCasefilesCount: apiData?.newCasefilesCount,
        newRecordsForExistingCasesCount: apiData?.newRecordsForExistingCasesCount,
      };
    },
    onSuccess: () => {
      // Refetch app settings and database data to show updated records
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      queryClient.invalidateQueries({ queryKey: ['violations-database'] });
    },
    onError: (error) => {
      console.error('Failed to update data:', error);
    },
  });
}; 