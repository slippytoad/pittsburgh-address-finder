
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, FileText, Calendar, Clock, Plus } from 'lucide-react';
import LoadingOverlay from '@/components/ui/loading-overlay';

interface PropertyHeaderProps {
  onFetchData: () => void;
  isLoading: boolean;
  showResults: boolean;
  newRecordsCount?: number;
  lastApiCheckTime?: string;
  nextApiCheckTime?: string;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({
  onFetchData,
  isLoading,
  showResults,
  newRecordsCount,
  lastApiCheckTime,
  nextApiCheckTime
}) => {
  return (
    <>
      <LoadingOverlay isVisible={isLoading} message="Refreshing data..." />
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            JPW Oakland Violations Dashboard
          </h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          View property investigation records from Pittsburgh's open data portal for specific addresses since 2024.
        </p>
        
        {showResults && (
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            {lastApiCheckTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Last API check: {lastApiCheckTime}</span>
                {newRecordsCount !== undefined && (
                  <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    <Plus className="h-3 w-3" />
                    <span>{newRecordsCount} new</span>
                  </div>
                )}
              </div>
            )}
            {nextApiCheckTime && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Next API check: {nextApiCheckTime}</span>
              </div>
            )}
            <Button
              onClick={onFetchData}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Refresh Data
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default PropertyHeader;
