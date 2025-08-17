import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Building2, RefreshCw, Loader2, CheckCircle } from 'lucide-react';

interface PropertyHeaderProps {
  onFetchData: () => void;
  isLoading: boolean;
  showResults: boolean;
  newRecordsCount: number | undefined;
  newCasefilesCount: number | undefined;
  newRecordsForExistingCasesCount: number | undefined;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({
  onFetchData,
  isLoading,
  showResults,
  newRecordsCount,
  newCasefilesCount,
  newRecordsForExistingCasesCount,
}) => {
  
  const [buttonState, setButtonState] = useState<'default' | 'loading' | 'success'>('default');
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  const handleButtonClick = () => {
    setHasBeenClicked(true);
    onFetchData();
  };

  useEffect(() => {
    // Only update button state if the button has been clicked
    if (!hasBeenClicked) return;

    if (isLoading) {
      setButtonState('loading');
    } else if (buttonState === 'loading' && showResults && newRecordsCount !== undefined) {
      setButtonState('success');
      
      // Revert to default after 2 seconds
      const timer = setTimeout(() => {
        setButtonState('default');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, showResults, newRecordsCount, hasBeenClicked]);

  const getButtonContent = () => {
    switch (buttonState) {
      case 'loading':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            {newRecordsCount === 0 ? 'No new records' : `Found ${newRecordsCount} new`}
          </>
        );
      default:
        return (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Check for Updates
          </>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl">
      <div className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand/10 rounded-xl">
                <Building2 className="h-6 w-6 text-brand" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  JFW Oakland Property Investigation Dashboard
                </h1>
              </div>
            </div>
          </div>
          
        </div>


        {showResults && newRecordsCount !== undefined && newRecordsCount > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-sm text-gray-600 space-y-1 bg-green-50 px-4 py-3 rounded-xl border border-green-200">
              <div className="font-normal text-green-800">
                Found <span className="font-bold">{newRecordsCount}</span> new records total.
              </div>
              {(newCasefilesCount !== undefined && newCasefilesCount > 0) && (
                <div className="text-xs text-green-700">
                  • <span className="font-bold">{newCasefilesCount}</span> new casefiles
                </div>
              )}
              {(newRecordsForExistingCasesCount !== undefined && newRecordsForExistingCasesCount > 0) && (
                <div className="text-xs text-green-700">
                  • <span className="font-bold">{newRecordsForExistingCasesCount}</span> new records for existing cases
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
