
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
    <Card className="border-t-4 border-t-blue-500">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <Building2 className="h-6 w-6 text-blue-600" />
              JFW Oakland Property Investigation Dashboard
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Monitor property violations and investigation records from Pittsburgh's official database
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={onFetchData}
              disabled={isLoading}
              className="w-full sm:w-auto"
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

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {showResults && newRecordsCount !== null && newRecordsCount > 0 && (
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                Found <span className="font-medium">{newRecordsCount}</span> new records total.
              </div>
              {(newCasefilesCount !== null && newCasefilesCount > 0) && (
                <div className="text-xs">
                  • <span className="font-medium">{newCasefilesCount}</span> new casefiles
                </div>
              )}
              {(newRecordsForExistingCasesCount !== null && newRecordsForExistingCasesCount > 0) && (
                <div className="text-xs">
                  • <span className="font-medium">{newRecordsForExistingCasesCount}</span> new records for existing cases
                </div>
              )}
            </div>
          )}
          {lastApiCheckTime && (
            <div className="text-sm text-muted-foreground">
              Last API Check: <span className="font-medium">{lastApiCheckTime} </span>
              {lastApiNewRecordsCount !== null && (
                <>
                   (<span className="font-medium">{lastApiNewRecordsCount}</span> new)
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};

export default PropertyHeader;
