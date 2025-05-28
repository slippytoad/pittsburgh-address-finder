
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Search, FileText } from 'lucide-react';

interface PropertyHeaderProps {
  onFetchData: () => void;
  isLoading: boolean;
  showResults: boolean;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ onFetchData, isLoading, showResults }) => {
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
    </div>
  );
};

export default PropertyHeader;
