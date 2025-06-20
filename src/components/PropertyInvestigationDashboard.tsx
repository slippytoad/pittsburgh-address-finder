
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyHeader from '@/components/property/PropertyHeader';
import PropertyList from '@/components/property/PropertyList';
import StatusFilter from '@/components/property/StatusFilter';
import ErrorDisplay from '@/components/property/ErrorDisplay';
import { useUrlParameters } from '@/hooks/useUrlParameters';
import { usePropertyData } from '@/hooks/usePropertyData';

const PropertyInvestigationDashboard: React.FC = () => {
  const {
    selectedStatuses,
    setSelectedStatuses,
    expandAllCards,
    highlightedCaseNumber
  } = useUrlParameters();

  const [addressSearch, setAddressSearch] = useState('');

  const {
    data,
    isLoading,
    error,
    showResults,
    availableStatuses,
    filteredRecords,
    statusCounts,
    lastNewRecordsCount,
    lastNewCasefilesCount,
    lastNewRecordsForExistingCasesCount,
    lastApiNewRecordsCount,
    appSettings,
    handleFetchData,
    getLatestDate,
    formatLastApiCheckTime
  } = usePropertyData(selectedStatuses, addressSearch);

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-6 space-y-4 sm:space-y-6">
      <PropertyHeader 
        onFetchData={handleFetchData}
        isLoading={isLoading}
        showResults={showResults}
        newRecordsCount={lastNewRecordsCount}
        newCasefilesCount={lastNewCasefilesCount}
        newRecordsForExistingCasesCount={lastNewRecordsForExistingCasesCount}
        lastApiCheckTime={formatLastApiCheckTime(appSettings?.last_api_check_time || null)}
        lastApiNewRecordsCount={lastApiNewRecordsCount}
      />

      {error && <ErrorDisplay error={error} />}

      {data && (
        <div className="space-y-4 sm:space-y-6">
          <StatusFilter
            availableStatuses={availableStatuses}
            selectedStatuses={selectedStatuses}
            onStatusChange={setSelectedStatuses}
            statusCounts={statusCounts}
            onAddressSearch={setAddressSearch}
            addressSearch={addressSearch}
          />
          <PropertyList 
            records={filteredRecords} 
            expandAllCards={expandAllCards}
            highlightedCaseNumber={highlightedCaseNumber}
          />
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
        <Link to="/admin">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Admin Settings
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PropertyInvestigationDashboard;
