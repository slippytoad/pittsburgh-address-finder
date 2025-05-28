
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPropertyData } from '@/services/propertyApi';
import { groupRecordsByCase } from '@/utils/propertyUtils';
import PropertyHeader from '@/components/property/PropertyHeader';
import PropertyList from '@/components/property/PropertyList';

const PropertyInvestigationDashboard: React.FC = () => {
  const [showResults, setShowResults] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['propertyInvestigations'],
    queryFn: fetchPropertyData,
    enabled: showResults,
  });

  const handleFetchData = () => {
    console.log('Button clicked - fetching data...');
    setShowResults(true);
    if (showResults) {
      refetch();
    }
  };

  // Get the latest date from the grouped cases
  const getLatestDate = () => {
    if (!data?.result?.records) return undefined;
    const groupedCases = groupRecordsByCase(data.result.records);
    return groupedCases.length > 0 ? groupedCases[0].latestDate : undefined;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-6 space-y-4 sm:space-y-6">
      <PropertyHeader 
        onFetchData={handleFetchData}
        isLoading={isLoading}
        showResults={showResults}
        latestDate={getLatestDate()}
      />

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <FileText className="h-5 w-5" />
              <span className="font-medium">Error fetching data:</span>
            </div>
            <p className="text-red-600 mt-2">{error.message}</p>
          </CardContent>
        </Card>
      )}

      {showResults && data && (
        <PropertyList records={data.result.records} />
      )}
    </div>
  );
};

export default PropertyInvestigationDashboard;
