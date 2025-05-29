
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, FileText } from 'lucide-react';
import { PropertyRecord } from '@/types/propertyTypes';
import { groupRecordsByCase } from '@/utils/propertyUtils';
import CaseCard from './CaseCard';

interface PropertyListProps {
  records: PropertyRecord[];
  expandAllCards?: boolean;
}

export const PropertyList: React.FC<PropertyListProps> = ({ records, expandAllCards = false }) => {
  const groupedCases = groupRecordsByCase(records);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Investigation Cases
        </CardTitle>
        <CardDescription>
          Found {groupedCases.length} case{groupedCases.length !== 1 ? 's' : ''} with {records.length} total record{records.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {groupedCases.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No investigation records found for the specified criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedCases.map((groupedCase, index) => (
              <CaseCard 
                key={groupedCase.casefileNumber || index} 
                groupedCase={groupedCase} 
                defaultExpanded={expandAllCards}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyList;
