import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { History } from 'lucide-react';
import { GroupedCase } from '@/types/propertyTypes';
import { CaseCardHeader } from './CaseCardHeader';
import { CaseCardStatus } from './CaseCardStatus';
import { CaseCardOutcome } from './CaseCardOutcome';
import { CaseCardInstructions } from './CaseCardInstructions';
import { CaseCardDescription } from './CaseCardDescription';
import { CaseCardRecord } from './CaseCardRecord';
import { CaseHistoryDialog } from './CaseHistoryDialog';

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
  const [showCaseHistory, setShowCaseHistory] = useState(false);

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

  // Get violation description from the latest record
  const violationDescription = groupedCase.records[0]?.violation_description || null;
  const formattedDescription = violationDescription ? 
    violationDescription.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : null;

  // Get the earliest investigation date (when case was first opened)
  const earliestDate = groupedCase.records.reduce((earliest, record) => {
    if (!record.investigation_date) return earliest;
    if (!earliest) return record.investigation_date;
    return new Date(record.investigation_date) < new Date(earliest) ? record.investigation_date : earliest;
  }, '');

  // Check if case is new (opened < 1 week ago) or updated (last update < 1 week ago)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const isNew = earliestDate && new Date(earliestDate) > oneWeekAgo;
  const isUpdated = !isNew && groupedCase.latestDate && new Date(groupedCase.latestDate) > oneWeekAgo;

  return (
    <Card className={`border-2 rounded-lg hover:bg-muted/50 transition-all duration-300 ${
      isHighlighted ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300' : 'border-gray-300 hover:border-gray-400'
    }`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors p-0">
            <div className="flex flex-col gap-4 p-6 relative">
              {/* New/Updated Badge */}
              {(isNew || isUpdated) && (
                <div className="absolute top-4 right-4">
                  <Badge variant="default" className="bg-blue-600 text-white">
                    {isNew ? 'New' : 'Updated'}
                  </Badge>
                </div>
              )}
              
              {/* Desktop Layout - Two Column Structure */}
              <div className="hidden sm:grid sm:grid-cols-2 sm:gap-8">
                {/* Column 1: Property Information */}
                <div className="flex flex-col gap-3">
                  <CaseCardHeader
                    formattedStreetAddress={formattedStreetAddress}
                    parcelId={parcelId}
                    casefileNumber={groupedCase.casefileNumber}
                    earliestDate={earliestDate}
                    isHighlighted={isHighlighted}
                  />
                </div>
                
                {/* Column 2: Status and Case Information */}
                <div className="flex flex-col gap-3">
                  <CaseCardStatus
                    currentStatus={groupedCase.currentStatus}
                    recordCount={groupedCase.records.length}
                    isOpen={isOpen}
                  />
                  
                  {/* Description */}
                  <CaseCardDescription formattedDescription={formattedDescription} />
                  
                  {(groupedCase.currentStatus === 'CLOSED' || groupedCase.currentStatus === 'READY TO CLOSE') ? (
                    <CaseCardOutcome
                      formattedOutcome={formattedOutcome}
                      latestDate={groupedCase.latestDate}
                    />
                  ) : (
                    <CaseCardInstructions 
                      formattedInstructions={formattedInstructions} 
                      latestDate={groupedCase.latestDate}
                    />
                  )}
                </div>
              </div>

              {/* Mobile Layout - status right after street address */}
              <div className="flex flex-col gap-4 sm:hidden">
                {/* Street Address */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-5 w-5 text-blue-600 flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold truncate">
                    {formattedStreetAddress}
                  </h3>
                </div>

                {/* Status and Toggle immediately after street address */}
                <CaseCardStatus
                  currentStatus={groupedCase.currentStatus}
                  recordCount={groupedCase.records.length}
                  isOpen={isOpen}
                />

                {/* Rest of header info */}
                <div className="flex flex-col gap-3">
                  {/* Parcel ID */}
                  {parcelId && (
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                          <polyline points="9,22 9,12 15,12 15,22"/>
                        </svg>
                      </div>
                      <div>
                        <span className="font-normal">Parcel ID:</span>
                        <span className="font-bold font-mono ml-1">{parcelId}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Case Number */}
                  <div className="flex items-start gap-2">
                    <div className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                    </div>
                    <span className={`text-sm font-normal ${
                      isHighlighted ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      Case #<span className="font-bold">{groupedCase.casefileNumber}</span>
                    </span>
                  </div>
                  
                  {/* Date Opened */}
                  {earliestDate && (
                    <div className="flex items-start gap-2 text-sm text-gray-500">
                      <div className="h-4 w-4 flex-shrink-0 mt-0.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </div>
                      <span className="font-normal">Opened: <span className="font-bold">{new Date(earliestDate).toLocaleDateString()}</span></span>
                    </div>
                  )}
                </div>

                {/* Description, Outcome or Instructions based on status */}
                <CaseCardDescription formattedDescription={formattedDescription} />
                
                {(groupedCase.currentStatus === 'CLOSED' || groupedCase.currentStatus === 'READY TO CLOSE') ? (
                  <CaseCardOutcome
                    formattedOutcome={formattedOutcome}
                    latestDate={groupedCase.latestDate}
                  />
                ) : (
                  <CaseCardInstructions 
                    formattedInstructions={formattedInstructions} 
                    latestDate={groupedCase.latestDate}
                  />
                )}
              </div>

              
              {/* Case History Button - Bottom Right of Main Card */}
              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCaseHistory(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  Case History
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 p-0">
            <div className="space-y-4 px-6 pb-6">
              {groupedCase.records.map((record, index) => (
                <CaseCardRecord key={record._id || index} record={record} index={index} />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Case History Dialog */}
      <CaseHistoryDialog
        isOpen={showCaseHistory}
        onOpenChange={setShowCaseHistory}
        groupedCase={groupedCase}
      />
    </Card>
  );
};

export default CaseCard;
