import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FetchDataResult {
  newRecordsCount?: number;
  newCasefilesCount?: number;
  newRecordsForExistingCasesCount?: number;
}

export const usePropertyDataMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<FetchDataResult> => {
      console.log('Calling check-property-updates Edge function...');
      
      const { data, error } = await supabase.functions.invoke('check-property-updates');
      
      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Failed to check for updates: ${error.message}`);
      }
      
      if (!data?.success) {
        throw new Error(data?.error || 'Update check failed');
      }
      
      console.log('Edge function response:', data);
      
      return {
        newRecordsCount: data.newRecordsCount,
        newCasefilesCount: data.newCasefilesCount,
        newRecordsForExistingCasesCount: data.newRecordsForExistingCasesCount,
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