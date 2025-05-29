
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPropertyData, ApiResponseWithNewCount } from '@/services/propertyApi';
import { fetchViolationsFromDatabase } from '@/services/violationsService';
import { groupRecordsByCase } from '@/utils/propertyUtils';
import PropertyHeader from '@/components/property/PropertyHeader';
import PropertyList from '@/components/property/PropertyList';
import StatusFilter from '@/components/property/StatusFilter';
import EmailSettings from '@/components/EmailSettings';
import EmailTestButtons from '@/components/EmailTestButtons';
import { Button } from '@/components/ui/button';

const PropertyInvestigationDashboard: React.FC = () => {
  const [showResults, setShowResults] = useState(true); // Show results by default
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [lastNewRecordsCount, setLastNewRecordsCount] = useState<number | undefined>(undefined);
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [useApiData, setUseApiData] = useState(false); // Toggle between database and API

  // Query for database violations (enabled by default)
  const { data: dbData, isLoading: dbLoading, error: dbError, refetch: refetchDb } = useQuery({
    queryKey: ['violations-database'],
    queryFn: fetchViolationsFromDatabase,
    enabled: !useApiData,
  });

  // Query for API data (only when explicitly requested)
  const { data: apiData, isLoading: apiLoading, error: apiError, refetch: refetchApi } = useQuery({
    queryKey: ['propertyInvestigations'],
    queryFn: fetchPropertyData,
    enabled: useApiData && showResults,
  });

  // Use the appropriate data source
  const data = useApiData ? apiData : { result: { records: dbData || [] } };
  const isLoading = useApiData ? apiLoading : dbLoading;
  const error = useApiData ? apiError : dbError;

  // Handle updating the new records count when data changes
  useEffect(() => {
    if (apiData?.newRecordsCount !== undefined) {
      setLastNewRecordsCount(apiData.newRecordsCount);
    }
  }, [apiData]);

  const handleFetchData = () => {
    console.log('Button clicked - fetching data...');
    setUseApiData(true); // Switch to API data when button is clicked
    setShowResults(true);
    if (showResults) {
      refetchApi();
    }
  };

  // Get available statuses and filtered data
  const { availableStatuses, filteredRecords } = useMemo(() => {
    if (!data?.result?.records) {
      return { availableStatuses: [], filteredRecords: [] };
    }

    const groupedCases = groupRecordsByCase(data.result.records);
    const statuses = Array.from(new Set(groupedCases.map(c => c.currentStatus)));
    
    console.log('Available statuses:', statuses);
    console.log('Selected statuses:', selectedStatuses);

    // Filter cases based on selected statuses
    let filteredCases = groupedCases;
    if (selectedStatuses.length > 0) {
      filteredCases = groupedCases.filter(caseGroup => 
        selectedStatuses.includes(caseGroup.currentStatus)
      );
    }

    console.log('Filtered cases count:', filteredCases.length);

    return { 
      availableStatuses: statuses,
      filteredRecords: filteredCases.flatMap(c => c.records)
    };
  }, [data, selectedStatuses]);

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
        newRecordsCount={lastNewRecordsCount}
      />

      {/* Data Source Toggle */}
      <Card className="border border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="font-medium">Data Source:</span>
            <Button
              variant={!useApiData ? "default" : "outline"}
              onClick={() => { setUseApiData(false); refetchDb(); }}
              size="sm"
            >
              Database ({dbData?.length || 0} records)
            </Button>
            <Button
              variant={useApiData ? "default" : "outline"}
              onClick={() => setUseApiData(true)}
              size="sm"
            >
              Live API
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {useApiData 
              ? "Showing live data from the external API" 
              : "Showing stored data from the violations database"
            }
          </p>
        </CardContent>
      </Card>

      {/* Email Settings Toggle */}
      <Card className="border border-gray-200">
        <CardContent className="pt-6">
          <Button
            variant="ghost"
            onClick={() => setShowEmailSettings(!showEmailSettings)}
            className="w-full justify-between p-0 h-auto font-medium text-left"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span>Email Notification Settings</span>
            </div>
            {showEmailSettings ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          
          {showEmailSettings && (
            <div className="mt-4 space-y-4">
              <EmailSettings />
              <EmailTestButtons />
            </div>
          )}
        </CardContent>
      </Card>

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

      {data && (
        <div className="space-y-4 sm:space-y-6">
          <StatusFilter
            availableStatuses={availableStatuses}
            selectedStatuses={selectedStatuses}
            onStatusChange={setSelectedStatuses}
          />
          <PropertyList records={filteredRecords} />
        </div>
      )}
    </div>
  );
};

export default PropertyInvestigationDashboard;
