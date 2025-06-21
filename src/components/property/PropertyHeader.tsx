
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, RefreshCw, Loader2 } from 'lucide-react';

interface PropertyHeaderProps {
  onFetchData: () => void;
  isLoading: boolean;
  showResults: boolean;
  newRecordsCount: number | null;
  newCasefilesCount: number | null;
  newRecordsForExistingCasesCount: number | null;
  lastApiCheckTime: string | null;
  lastApiNewRecordsCount: number | null;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({
  onFetchData,
  isLoading,
  showResults,
  newRecordsCount,
  newCasefilesCount,
  newRecordsForExistingCasesCount,
  lastApiCheckTime,
  lastApiNewRecordsCount
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  JFW Oakland Property Investigation Dashboard
                </CardTitle>
                <CardDescription className="text-base text-gray-600 mt-1">
                  Monitor property violations and investigation records from Pittsburgh's official database
                </CardDescription>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onFetchData}
              disabled={isLoading}
              className="rounded-full px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium"
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check for New
                </>
              )}
            </Button>
          </div>
        </div>

        {(showResults && newRecordsCount !== null && newRecordsCount > 0) || lastApiCheckTime ? (
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start justify-between gap-4">
            {showResults && newRecordsCount !== null && newRecordsCount > 0 && (
              <div className="text-sm text-gray-600 space-y-1 bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                <div className="font-medium text-green-800">
                  Found <span className="font-semibold">{newRecordsCount}</span> new records total.
                </div>
                {(newCasefilesCount !== null && newCasefilesCount > 0) && (
                  <div className="text-xs text-green-700">
                    • <span className="font-medium">{newCasefilesCount}</span> new casefiles
                  </div>
                )}
                {(newRecordsForExistingCasesCount !== null && newRecordsForExistingCasesCount > 0) && (
                  <div className="text-xs text-green-700">
                    • <span className="font-medium">{newRecordsForExistingCasesCount}</span> new records for existing cases
                  </div>
                )}
              </div>
            )}
            {lastApiCheckTime && (
              <div className="text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-xl">
                Last API Check: <span className="font-medium text-gray-700">{lastApiCheckTime}</span>
                {lastApiNewRecordsCount !== null && (
                  <>
                    {' '}(<span className="font-medium text-gray-700">{lastApiNewRecordsCount}</span> new)
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyHeader;
