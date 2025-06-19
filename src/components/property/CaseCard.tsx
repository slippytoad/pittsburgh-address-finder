import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, FileText, MapPin, Calendar, ExternalLink, House, Scale } from 'lucide-react';
import { GroupedCase } from '@/types/propertyTypes';
import { formatDate, getStatusColor } from '@/utils/propertyUtils';

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

  // Generate court filing URL based on parcel_id for Pennsylvania/Pittsburgh court
  const getCourtFilingUrl = (parcelId: string) => {
    // Pennsylvania Unified Judicial System web portal
    return `https://ujsportal.pacourts.us/CaseSearch?parcel_id=${encodeURIComponent(parcelId)}`;
  };

  // Get the earliest investigation date (when case was first opened)
  const earliestDate = groupedCase.records.reduce((earliest, record) => {
    if (!record.investigation_date) return earliest;
    if (!earliest) return record.investigation_date;
    return new Date(record.investigation_date) < new Date(earliest) ? record.investigation_date : earliest;
  }, '');

  // Fields to exclude from the expanded view - added violation_type
  const excludedFields = ['_id', 'full_text', '_full_text', 'casefile_number', 'address', 'parcel_id', 'violation_type'];

  // Field order for better presentation - removed violation_type from the ordered fields
  const getOrderedFields = (record: any) => {
    const orderedKeys = ['investigation_date', 'status', 'investigation_outcome'];
    const remainingKeys = Object.keys(record).filter(
      key => !excludedFields.includes(key) && !orderedKeys.includes(key)
    );
    return [...orderedKeys, ...remainingKeys].filter(key => record[key] !== undefined);
  };

  // Function to format field names to mixed case
  const formatFieldName = (fieldName: string) => {
    const fieldNameMap: { [key: string]: string } = {
      'investigation_date': 'Investigation Date',
      'status': 'Status',
      'violation_type': 'Violation Type',
      'investigation_outcome': 'Investigation Outcome',
      'violation_description': 'Violation Description',
      'violation_code_section': 'Violation Code Section',
      'violation_spec_instructions': 'Violation Specific Instructions',
      'investigation_findings': 'Investigation Findings',
      'inspector': 'Inspector'
    };

    return fieldNameMap[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Function to format field values to mixed case (except status)
  const formatFieldValue = (key: string, value: any) => {
    if (key === 'investigation_date') {
      return formatDate(value as string);
    }
    
    if (key === 'status') {
      // Keep status as-is (don't change case)
      return typeof value === 'object' ? JSON.stringify(value) : String(value);
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    const stringValue = String(value);
    
    // Convert to mixed case for other fields
    return stringValue.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className={`hover:shadow-md transition-shadow duration-200 ${
      isHighlighted ? 'ring-2 ring-blue-500 bg-blue-50' : ''
    }`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex flex-col gap-3 min-w-0 flex-1">
                  {/* Address Section */}
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <CardTitle className="text-lg lg:text-xl truncate">
                      {formattedStreetAddress}
                    </CardTitle>
                  </div>
                  
                  {/* Parcel ID Section with House Icon */}
                  {parcelId && (
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <House className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Parcel ID:</span>
                        <span className="font-mono ml-1">{parcelId}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Case Number Section */}
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span className={`text-sm ${
                      isHighlighted ? 'text-blue-700 font-medium' : 'text-gray-600'
                    }`}>
                      Case #{groupedCase.casefileNumber}
                    </span>
                  </div>
                  
                  {/* Date Opened Section */}
                  {earliestDate && (
                    <div className="flex items-start gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>Opened: {formatDate(earliestDate)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-3 lg:items-end lg:flex-shrink-0 lg:min-w-[300px]">
                  {/* Status and Expand Controls */}
                  <div className="flex items-center justify-between lg:justify-end gap-3">
                    <Badge variant={getStatusColor(groupedCase.currentStatus)} className="w-fit">
                      {groupedCase.currentStatus}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <span>
                        {groupedCase.records.length} record{groupedCase.records.length !== 1 ? 's' : ''}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  
                  {/* Outcome Section with Scales Icon */}
                  <div className="flex items-start gap-2 text-sm text-gray-600 lg:text-right">
                    <Scale className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <div>
                        <span className="font-medium">Outcome:</span> 
                        <span className="ml-1 break-words">{formattedOutcome}</span>
                      </div>
                      <div className="flex items-start gap-1 text-gray-500">
                        <Calendar className="h-3 w-3 flex-shrink-0 mt-0.5" />
                        <span>Last update: {formatDate(groupedCase.latestDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add violation instructions for IN VIOLATION and IN COURT statuses */}
              {formattedInstructions && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-700 bg-amber-50 p-3 rounded-md border border-amber-200">
                    <span className="font-medium">Instructions:</span>
                    <span className="ml-1 break-words">{formattedInstructions}</span>
                  </div>
                </div>
              )}

              {/* Add court filing link for IN COURT status */}
              {isInCourt && groupedCase.records[0]?.parcel_id && (
                <div className={`${formattedInstructions ? 'pt-2' : 'pt-3 border-t border-gray-200'}`}>
                  <div className="text-sm">
                    <a 
                      href={getCourtFilingUrl(groupedCase.records[0].parcel_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline font-medium bg-blue-50 px-3 py-2 rounded-md border border-blue-200 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Court Filing
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {groupedCase.records.map((record, index) => (
                <Card key={record._id || index} className="border border-gray-200 bg-gray-50">
                  <CardContent className="p-3 lg:p-4">
                    <div className="space-y-3">
                      {getOrderedFields(record).map((key) => {
                        const value = record[key];
                        return (
                          <div key={key} className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4">
                            <div className="font-medium text-gray-700 text-sm lg:text-base">
                              {formatFieldName(key)}:
                            </div>
                            <div className="sm:col-span-2 text-gray-600 text-sm lg:text-base break-words">
                              {formatFieldValue(key, value)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CaseCard;
