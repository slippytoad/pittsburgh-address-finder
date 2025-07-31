import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { GroupedCase, PropertyRecord } from '@/types/propertyTypes';
import { formatDate } from '@/utils/propertyUtils';

interface CaseHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  groupedCase: GroupedCase;
}

interface FieldChange {
  field: string;
  oldValue: string;
  newValue: string;
  displayName: string;
}

const getFieldDisplayName = (field: string): string => {
  const fieldMap: Record<string, string> = {
    status: 'Status',
    violation_description: 'Violation Description',
    violation_code_section: 'Code Section',
    violation_spec_instructions: 'Instructions',
    investigation_outcome: 'Investigation Outcome',
    investigation_findings: 'Investigation Findings'
  };
  return fieldMap[field] || field;
};

const formatFieldValue = (value: string | null | undefined): string => {
  if (!value) return 'None';
  return value.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'IN VIOLATION':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'IN COURT':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'CLOSED':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'READY TO CLOSE':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'IN VIOLATION':
      return <AlertTriangle className="h-4 w-4" />;
    case 'IN COURT':
      return <FileText className="h-4 w-4" />;
    case 'CLOSED':
      return <CheckCircle className="h-4 w-4" />;
    case 'READY TO CLOSE':
      return <Clock className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const compareRecords = (current: PropertyRecord, previous: PropertyRecord | null): FieldChange[] => {
  if (!previous) return [];
  
  const changes: FieldChange[] = [];
  const fieldsToCheck = [
    'status',
    'violation_description',
    'violation_code_section',
    'violation_spec_instructions',
    'investigation_outcome',
    'investigation_findings'
  ];

  fieldsToCheck.forEach(field => {
    const currentValue = current[field as keyof PropertyRecord];
    const previousValue = previous[field as keyof PropertyRecord];
    
    if (currentValue !== previousValue) {
      changes.push({
        field,
        oldValue: formatFieldValue(previousValue as string),
        newValue: formatFieldValue(currentValue as string),
        displayName: getFieldDisplayName(field)
      });
    }
  });

  return changes;
};

export const CaseHistoryDialog: React.FC<CaseHistoryDialogProps> = ({
  isOpen,
  onOpenChange,
  groupedCase
}) => {
  // Sort records by date (oldest first for timeline)
  const sortedRecords = [...groupedCase.records].sort((a, b) => 
    new Date(a.investigation_date || '').getTime() - new Date(b.investigation_date || '').getTime()
  );

  const originalRecord = sortedRecords[0];
  const streetAddress = originalRecord?.address?.split(',')[0] || 'Unknown Address';
  const formattedStreetAddress = streetAddress.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Case History - {formattedStreetAddress}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Case Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Original Case Created
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Address:</span>
                <p className="text-sm">{formatFieldValue(originalRecord?.address)}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Case Number:</span>
                <p className="text-sm font-mono">{originalRecord?.casefile_number}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Parcel ID:</span>
                <p className="text-sm font-mono">{originalRecord?.parcel_id || 'N/A'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Date:</span>
                <p className="text-sm">{formatDate(originalRecord?.investigation_date || '')}</p>
              </div>
              
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-gray-600">Initial Status:</span>
                <div className="mt-1">
                  <Badge className={getStatusColor(originalRecord?.status || '')} variant="outline">
                    {getStatusIcon(originalRecord?.status || '')}
                    <span className="ml-1">{formatFieldValue(originalRecord?.status)}</span>
                  </Badge>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-gray-600">Violation Description:</span>
                <p className="text-sm mt-1">{formatFieldValue(originalRecord?.violation_description)}</p>
              </div>
              
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-gray-600">Code Section:</span>
                <p className="text-sm mt-1">{formatFieldValue(originalRecord?.violation_code_section)}</p>
              </div>
              
              {originalRecord?.violation_spec_instructions && (
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-gray-600">Instructions:</span>
                  <p className="text-sm mt-1">{formatFieldValue(originalRecord.violation_spec_instructions)}</p>
                </div>
              )}
              
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-gray-600">Investigation Outcome:</span>
                <p className="text-sm mt-1">{formatFieldValue(originalRecord?.investigation_outcome)}</p>
              </div>
              
              {originalRecord?.investigation_findings && (
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-gray-600">Investigation Findings:</span>
                  <p className="text-sm mt-1">{formatFieldValue(originalRecord.investigation_findings)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline of Updates */}
          {sortedRecords.length > 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Timeline of Updates</h3>
              
              <div className="space-y-4">
                {sortedRecords.slice(1).map((record, index) => {
                  const previousRecord = sortedRecords[index]; // Previous record in timeline
                  const changes = compareRecords(record, previousRecord);
                  
                  return (
                    <div key={record._id} className="border-l-2 border-blue-200 pl-6 pb-6 relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Update - {formatDate(record.investigation_date || '')}
                          </h4>
                          <Badge className={getStatusColor(record.status || '')} variant="outline">
                            {getStatusIcon(record.status || '')}
                            <span className="ml-1">{formatFieldValue(record.status)}</span>
                          </Badge>
                        </div>
                        
                        {changes.length > 0 ? (
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600 font-medium">Changed Fields:</p>
                            {changes.map((change, changeIndex) => (
                              <div key={changeIndex} className="bg-yellow-50 border border-yellow-200 rounded p-3">
                                <p className="text-sm font-medium text-gray-700 mb-1">{change.displayName}:</p>
                                <div className="grid grid-cols-1 gap-2">
                                  <div>
                                    <span className="text-xs text-gray-500">Previous:</span>
                                    <p className="text-sm text-gray-600 line-through">{change.oldValue}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-green-600">Updated:</span>
                                    <p className="text-sm text-green-700 font-medium">{change.newValue}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            No field changes detected. This may be a duplicate entry or investigation update.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};