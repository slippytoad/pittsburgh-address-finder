import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GroupedCase } from '@/types/propertyTypes';
import { CaseCardHeader } from './CaseCardHeader';
import { CaseCardStatus } from './CaseCardStatus';
import { CaseCardOutcome } from './CaseCardOutcome';
import { CaseCardInstructions } from './CaseCardInstructions';
import { CaseCardDescription } from './CaseCardDescription';
import { CaseCardRecord } from './CaseCardRecord';

interface CaseViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  groupedCase: GroupedCase;
}

export const CaseViewDialog: React.FC<CaseViewDialogProps> = ({
  isOpen,
  onOpenChange,
  groupedCase
}) => {
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
  const violationInstructions = shouldShowInstructions ? groupedCase.records[0]?.violation_spec_instructions || null : null;
  const formattedInstructions = violationInstructions ? violationInstructions.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : null;

  // Get violation description from the latest record
  const violationDescription = groupedCase.records[0]?.violation_description || null;
  const formattedDescription = violationDescription ? violationDescription.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : null;

  // Determine notice label based on count of notices for the latest code section
  const latestCodeSectionKey = (groupedCase.records[0]?.violation_code_section || '').trim();
  const latestCodeCount = latestCodeSectionKey ? groupedCase.records.filter(r => (r.violation_code_section || '').trim() === latestCodeSectionKey).length : 0;
  let noticeLabel: string | null = 'Last update';
  if (latestCodeCount <= 1) noticeLabel = null;
  else if (latestCodeCount >= 3) noticeLabel = 'Final notice';

  // Get the earliest investigation date (when case was first opened)
  const earliestDate = groupedCase.records.reduce((earliest, record) => {
    if (!record.investigation_date) return earliest;
    if (!earliest) return record.investigation_date;
    return new Date(record.investigation_date) < new Date(earliest) ? record.investigation_date : earliest;
  }, '');

  // Determine if there is any later date than the first notice
  const hasLaterDate = Boolean(groupedCase.latestDate && earliestDate && new Date(groupedCase.latestDate) > new Date(earliestDate));

  // Hide notice label if there are no later dates than first notice
  if (!hasLaterDate) {
    noticeLabel = null;
  }

  // Check if case is new (opened < 1 week ago) or updated (last update < 1 week ago)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const isNew = earliestDate && new Date(earliestDate) > oneWeekAgo;
  const isUpdated = !isNew && groupedCase.latestDate && new Date(groupedCase.latestDate) > oneWeekAgo;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Case Details - {formattedStreetAddress}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Property Information */}
            <div className="flex flex-col gap-3">
              <CaseCardHeader 
                formattedStreetAddress={formattedStreetAddress} 
                parcelId={parcelId} 
                casefileNumber={groupedCase.casefileNumber} 
                earliestDate={earliestDate} 
                isHighlighted={false} 
              />
            </div>
            
            {/* Column 2: Status and Case Information */}
            <div className="flex flex-col gap-3">
              <CaseCardStatus 
                currentStatus={groupedCase.currentStatus} 
                groupedCase={groupedCase} 
                isNew={isNew} 
                isUpdated={isUpdated} 
              />
              
              {/* Description */}
              <CaseCardDescription formattedDescription={formattedDescription} />
              
              {groupedCase.currentStatus === 'CLOSED' || groupedCase.currentStatus === 'READY TO CLOSE' ? (
                <CaseCardOutcome 
                  formattedOutcome={formattedOutcome} 
                  latestDate={groupedCase.latestDate} 
                  noticeLabel={noticeLabel} 
                />
              ) : (
                <CaseCardInstructions 
                  formattedInstructions={formattedInstructions} 
                  latestDate={groupedCase.latestDate} 
                  noticeLabel={noticeLabel} 
                />
              )}
            </div>
          </div>

          {/* Detailed Records by Code Section */}
          <div className="space-y-6">
            {(() => {
              // Group records by violation code section
              const recordsByCodeSection = groupedCase.records.reduce((acc, record) => {
                const codeSection = record.violation_code_section || 'Unknown Code Section';
                if (!acc[codeSection]) {
                  acc[codeSection] = [];
                }
                acc[codeSection].push(record);
                return acc;
              }, {} as Record<string, typeof groupedCase.records>);

              // Sort code sections alphabetically
              const sortedCodeSections = Object.keys(recordsByCodeSection).sort();
              
              return sortedCodeSections.map(codeSection => (
                <div key={codeSection} className="space-y-4">
                  {/* Code Section Header */}
                  <div className="pb-2 border-b border-gray-300">
                    <h4 className="font-semibold text-gray-800 text-base">
                      {codeSection.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                  </div>
                  
                  {/* Records under this code section */}
                  <div className="space-y-4">
                    {recordsByCodeSection[codeSection].map((record, index) => (
                      <CaseCardRecord 
                        key={record._id || index} 
                        record={record} 
                        index={index} 
                      />
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};