import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import PropertyHeader from '@/components/property/PropertyHeader';
import PropertyList from '@/components/property/PropertyList';
import PropertyView from '@/components/property/PropertyView';
import StatusTabs from '@/components/property/StatusTabs';
import ErrorDisplay from '@/components/property/ErrorDisplay';
import { useUrlParameters } from '@/hooks/useUrlParameters';
import { usePropertyData } from '@/hooks/usePropertyData';
import { useAddressSearch } from '@/hooks/useAddressSearch';

const PropertyInvestigationDashboard: React.FC = () => {
  const [isPropertyView, setIsPropertyView] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    selectedStatuses,
    setSelectedStatuses,
    expandAllCards,
    highlightedCaseNumber
  } = useUrlParameters();

  const { addressSearch, setAddressSearch } = useAddressSearch();

  const {
    data,
    isLoading,
    error,
    showResults,
    availableStatuses,
    filteredRecords,
    allRecords,
    statusCounts,
    lastNewRecordsCount,
    lastNewCasefilesCount,
    lastNewRecordsForExistingCasesCount,
    lastApiNewRecordsCount,
    appSettings,
    handleFetchData,
    formatLastApiCheckTime,
    recentCount
  } = usePropertyData(selectedStatuses, addressSearch);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PropertyHeader 
          onFetchData={handleFetchData}
          isLoading={isLoading}
          showResults={showResults}
          newRecordsCount={lastNewRecordsCount}
          newCasefilesCount={lastNewCasefilesCount}
          newRecordsForExistingCasesCount={lastNewRecordsForExistingCasesCount}
        />

        {error && <ErrorDisplay error={error} />}

        {data && (
          <div className="space-y-8">
            <StatusTabs
              availableStatuses={availableStatuses}
              selectedStatuses={selectedStatuses}
              onStatusChange={setSelectedStatuses}
              statusCounts={statusCounts}
              onAddressSearch={setAddressSearch}
              addressSearch={addressSearch}
              recentCount={recentCount}
              isPropertyView={isPropertyView}
              onViewToggle={setIsPropertyView}
            />
            {isPropertyView ? (
              <PropertyView 
                records={allRecords}
                highlightedCaseNumber={highlightedCaseNumber}
              />
            ) : (
              <PropertyList 
                records={filteredRecords} 
                expandAllCards={expandAllCards}
                highlightedCaseNumber={highlightedCaseNumber}
              />
            )}
          </div>
        )}

        <div className="pt-12 border-t border-gray-100 flex justify-center gap-4">
          <Link to="/admin">
            <Button variant="outline" className="flex items-center gap-2 rounded-full px-6 py-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50">
              <Settings className="h-4 w-4" />
              Admin Settings
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                await supabase.auth.signOut();
                toast({
                  title: "Signed out successfully",
                  description: "You have been logged out of the system",
                });
                navigate('/');
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to sign out",
                  variant: "destructive",
                });
              }
            }}
            className="flex items-center gap-2 rounded-full px-6 py-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyInvestigationDashboard;
