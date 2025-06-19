import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { GroupedCase } from '@/types/propertyTypes';
import { CaseCardHeader } from './CaseCardHeader';
import { CaseCardStatus } from './CaseCardStatus';
import { CaseCardOutcome } from './CaseCardOutcome';
import { CaseCardInstructions } from './CaseCardInstructions';
import { CaseCardCourtLink } from './CaseCardCourtLink';
import { CaseCardRecord } from './CaseCardRecord';

interface CaseCardProps {
  groupedCase: GroupedCase;
  defaultExpanded?: boolean;
  isHighlighted?: boolean;
}

export const CaseCard: React.FC<CaseCardProps> = ({ 
  groupedCase, 
  defaultExpanded = false, 
  isHighlighted = false 
}) => {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  // Get the primary address from the first record and extract just the street
  const fullAddress = groupedCase.records[0]?.address || 'Unknown Address';
  const streetAddress = fullAddress.split(',')[0] || fullAddress;
  // Convert street address to mixed case
  const formattedStreetAddress = streetAddress.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

  // Get the parcel ID from the first record
  const parcelId = groupedCase.records[0]?.parcel_id || null;

  // Get the investigation outcome from the latest record
  const latestOutcome = groupedCase.records[0]?.investigation_outcome || 'No outcome recorded';
  // Convert outcome to mixed case
  const formattedOutcome = latestOutcome.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

  // Get violation specific instructions for IN VIOLATION and IN COURT statuses
  const shouldShowInstructions = groupedCase.currentStatus === 'IN VIOLATION' || groupedCase.currentStatus === 'IN COURT';
  const violationInstructions = shouldShowInstructions ? 
    groupedCase.records[0]?.violation_spec_instructions || null : null;
  const formattedInstructions = violationInstructions ? 
    violationInstructions.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : null;

  // Check if this is an IN COURT case for showing court filing link
  const isInCourt = groupedCase.currentStatus === 'IN COURT';

  // Get the earliest investigation date (when case was first opened)
  const earliestDate = groupedCase.records.reduce((earliest, record) => {
    if (!record.investigation_date) return earliest;
    if (!earliest) return record.investigation_date;
    return new Date(record.investigation_date) < new Date(earliest) ? record.investigation_date : earliest;
  }, '');

  return (
    <Card className={`hover:shadow-md transition-shadow duration-200 ${
      isHighlighted ? 'ring-2 ring-blue-500 bg-blue-50' : ''
    }`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex flex-col gap-3 min-w-0 flex-1">
                  <CaseCardHeader
                    formattedStreetAddress={formattedStreetAddress}
                    parcelId={parcelId}
                    casefileNumber={groupedCase.casefileNumber}
                    earliestDate={earliestDate}
                    isHighlighted={isHighlighted}
                  />
                  
                  <CaseCardOutcome
                    formattedOutcome={formattedOutcome}
                    latestDate={groupedCase.latestDate}
                  />
                </div>
                
                <div className="flex justify-end sm:flex-shrink-0 sm:min-w-[300px]">
                  <CaseCardStatus
                    currentStatus={groupedCase.currentStatus}
                    recordCount={groupedCase.records.length}
                    isOpen={isOpen}
                  />
                </div>
              </div>

              <CaseCardInstructions formattedInstructions={formattedInstructions} />

              {isInCourt && parcelId && (
                <CaseCardCourtLink 
                  parcelId={parcelId} 
                  hasInstructions={!!formattedInstructions} 
                />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {groupedCase.records.map((record, index) => (
                <CaseCardRecord key={record._id || index} record={record} index={index} />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CaseCard;
