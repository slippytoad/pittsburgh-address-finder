import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPropertyData, ApiResponseWithNewCount } from '@/services/propertyApi';
import { fetchViolationsFromDatabase } from '@/services/violationsService';
import { getAppSettings, updateLastApiCheckTime } from '@/services/appSettingsService';
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
  const [expandAllCards, setExpandAllCards] = useState(false);
  const [highlightedCaseNumber, setHighlightedCaseNumber] = useState<string | null>(null);

  // Check URL parameters for pre-selected status or case
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get('status');
    const caseParam = urlParams.get('case');
    
    if (statusParam) {
      const decodedStatus = decodeURIComponent(statusParam);
      setSelectedStatuses([decodedStatus]);
      setExpandAllCards(true); // Expand cards when coming from email link
    }
    
    if (caseParam) {
      const decodedCase = decodeURIComponent(caseParam);
      setHighlightedCaseNumber(decodedCase);
      setExpandAllCards(true); // Expand cards when coming from case link
    }
    
    // Clear the URL parameters to keep URL clean
    if (statusParam || caseParam) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Query for app settings to get the last API check time
  const { data: appSettings, refetch: refetchAppSettings } = useQuery({
    queryKey: ['app-settings'],
    queryFn: getAppSettings,
  });

  // Query for database violations (always enabled)
  const { data: dbData, isLoading: dbLoading, error: dbError, refetch: refetchDb } = useQuery({
    queryKey: ['violations-database'],
    queryFn: fetchViolationsFromDatabase,
  });

  // Use database data
  const data = { result: { records: dbData || [] } };
  const isLoading = dbLoading;
  const error = dbError;

  const handleFetchData = async () => {
    console.log('Button clicked - fetching data...');
    setShowResults(true);
    
    try {
      // Fetch fresh data from API
      const apiData = await fetchPropertyData();
      
      // Update the last API check time in the database
      await updateLastApiCheckTime();
      
      // Set the new records count if available
      if (apiData?.newRecordsCount !== undefined) {
        setLastNewRecordsCount(apiData.newRecordsCount);
      }
      
      // Refetch app settings to get the updated timestamp
      refetchAppSettings();
      
      // Refetch database data to show the updated records
      refetchDb();
    } catch (error) {
      console.error('Failed to update data:', error);
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

  // Format the last API check time for display
  const formatLastApiCheckTime = (timestamp: string | null) => {
    if (!timestamp) return undefined;
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return undefined;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-6 space-y-4 sm:space-y-6">
      <PropertyHeader 
        onFetchData={handleFetchData}
        isLoading={isLoading}
        showResults={showResults}
        latestDate={getLatestDate()}
        newRecordsCount={lastNewRecordsCount}
        lastApiCheckTime={formatLastApiCheckTime(appSettings?.last_api_check_time || null)}
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
          <PropertyList 
            records={filteredRecords} 
            expandAllCards={expandAllCards}
            highlightedCaseNumber={highlightedCaseNumber}
          />
        </div>
      )}
    </div>
  );
};

export default PropertyInvestigationDashboard;
