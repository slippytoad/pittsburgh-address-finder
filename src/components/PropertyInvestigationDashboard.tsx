
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPropertyData, ApiResponseWithNewCount } from '@/services/propertyApi';
import { groupRecordsByCase } from '@/utils/propertyUtils';
import PropertyHeader from '@/components/property/PropertyHeader';
import PropertyList from '@/components/property/PropertyList';
import StatusFilter from '@/components/property/StatusFilter';
import EmailSettings from '@/components/EmailSettings';
import { Button } from '@/components/ui/button';

const PropertyInvestigationDashboard: React.FC = () => {
  const [showResults, setShowResults] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [lastNewRecordsCount, setLastNewRecordsCount] = useState<number | undefined>(undefined);
  const [showEmailSettings, setShowEmailSettings] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['propertyInvestigations'],
    queryFn: fetchPropertyData,
    enabled: showResults,
  });

  // Handle updating the new records count when data changes
  useEffect(() => {
    if (data?.newRecordsCount !== undefined) {
      setLastNewRecordsCount(data.newRecordsCount);
    }
  }, [data]);

  const handleFetchData = () => {
    console.log('Button clicked - fetching data...');
    setShowResults(true);
    if (showResults) {
      refetch();
    }
  };

  // Get available statuses and filtered data
  const { availableStatuses, filteredRecords } = useMemo(() => {
    if (!data?.result?.records) {
      return { availableStatuses: [], filteredRecords: [] };
    }

    const groupedCases = groupRecordsByCase(data.result.records);
    const statuses = Array.from(new Set(groupedCases.map(c => c.currentStatus)));
    
    // Initialize selected statuses to all statuses when data first loads
    if (selectedStatuses.length === 0 && statuses.length > 0) {
      setSelectedStatuses(statuses);
    }

    // Filter records based on selected statuses
    const filtered = groupedCases.filter(caseGroup => 
      selectedStatuses.includes(caseGroup.currentStatus)
    );

    return { 
      availableStatuses: statuses,
      filteredRecords: filtered.flatMap(c => c.records)
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
            <div className="mt-4">
              <EmailSettings />
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

      {showResults && data && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-1">
            <StatusFilter
              availableStatuses={availableStatuses}
              selectedStatuses={selectedStatuses}
              onStatusChange={setSelectedStatuses}
            />
          </div>
          <div className="lg:col-span-3">
            <PropertyList records={filteredRecords} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyInvestigationDashboard;
