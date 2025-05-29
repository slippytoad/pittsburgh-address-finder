
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Search, FileText, Calendar, Clock, Plus } from 'lucide-react';

interface PropertyHeaderProps {
  onFetchData: () => void;
  isLoading: boolean;
  showResults: boolean;
  latestDate?: string;
  newRecordsCount?: number;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ 
  onFetchData, 
  isLoading, 
  showResults, 
  latestDate,
  newRecordsCount 
}) => {
  // Format current timestamp for "last check"
  const formatLastCheck = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-2 mb-4">
        <FileText className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Property Investigation Dashboard
        </h1>
      </div>
      <p className="text-gray-600 max-w-2xl mx-auto">
        View property investigation records from Pittsburgh's open data portal for specific addresses since 2024.
      </p>
      
      <div className="flex items-center justify-center gap-4">
        <Button 
          onClick={onFetchData}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading Data...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              {showResults ? 'Refresh Data' : 'Fetch Investigation Data'}
            </>
          )}
        </Button>
        
        {showResults && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {latestDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Latest: {formatDate(latestDate)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>Last check: {formatLastCheck()}</span>
              {newRecordsCount !== undefined && (
                <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  <Plus className="h-3 w-3" />
                  <span>{newRecordsCount} new</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyHeader;
