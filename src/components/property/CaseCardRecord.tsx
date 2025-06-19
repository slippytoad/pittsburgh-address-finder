import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PropertyRecord } from '@/types/propertyTypes';
import { formatDate } from '@/utils/propertyUtils';

interface CaseCardRecordProps {
  record: PropertyRecord;
  index: number;
}

export const CaseCardRecord: React.FC<CaseCardRecordProps> = ({ record, index }) => {
  // Fields to exclude from the expanded view
  const excludedFields = ['_id', 'full_text', '_full_text', 'casefile_number', 'address', 'parcel_id', 'violation_type'];

  // Field order for better presentation
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
  );
};
