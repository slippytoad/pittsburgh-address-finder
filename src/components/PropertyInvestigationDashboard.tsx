
import React from 'react';
import PropertyHeader from '@/components/property/PropertyHeader';
import PropertyList from '@/components/property/PropertyList';
import StatusFilter from '@/components/property/StatusFilter';
import EmailSettingsSection from '@/components/property/EmailSettingsSection';
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
    lastNewRecordsCount,
    appSettings,
    handleFetchData,
    getLatestDate,
    formatLastApiCheckTime
  } = usePropertyData(selectedStatuses);

  // Calculate next API check time (24 hours from last check)
  const getNextApiCheckTime = () => {
    if (!appSettings?.last_api_check_time) return undefined;
    
    try {
      const lastCheck = new Date(appSettings.last_api_check_time);
      const nextCheck = new Date(lastCheck.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours
      
      return nextCheck.toLocaleString('en-US', {
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
        newRecordsCount={lastNewRecordsCount}
        lastApiCheckTime={formatLastApiCheckTime(appSettings?.last_api_check_time || null)}
        nextApiCheckTime={getNextApiCheckTime()}
      />

      <EmailSettingsSection />

      {error && <ErrorDisplay error={error} />}

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
