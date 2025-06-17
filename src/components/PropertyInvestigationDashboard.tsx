
import React from 'react';
import PropertyHeader from '@/components/property/PropertyHeader';
import PropertyList from '@/components/property/PropertyList';
import StatusFilter from '@/components/property/StatusFilter';
import AddressManager from '@/components/AddressManager';
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

  const {
    data,
    isLoading,
    error,
    showResults,
    availableStatuses,
    filteredRecords,
    statusCounts,
    lastNewRecordsCount,
    lastApiNewRecordsCount,
    appSettings,
    handleFetchData,
    getLatestDate,
    formatLastApiCheckTime
  } = usePropertyData(selectedStatuses);

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-6 space-y-4 sm:space-y-6">
      <PropertyHeader 
        onFetchData={handleFetchData}
        isLoading={isLoading}
        showResults={showResults}
        newRecordsCount={lastNewRecordsCount}
        lastApiCheckTime={formatLastApiCheckTime(appSettings?.last_api_check_time || null)}
        lastApiNewRecordsCount={lastApiNewRecordsCount}
      />

      <AddressManager />

      {error && <ErrorDisplay error={error} />}

      {data && (
        <div className="space-y-4 sm:space-y-6">
          <StatusFilter
            availableStatuses={availableStatuses}
            selectedStatuses={selectedStatuses}
            onStatusChange={setSelectedStatuses}
            statusCounts={statusCounts}
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
