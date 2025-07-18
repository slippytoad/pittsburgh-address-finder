
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { PropertyRecord } from '@/types/propertyTypes';
import { groupRecordsByCase } from '@/utils/propertyUtils';
import CaseCard from './CaseCard';

interface PropertyListProps {
  records: PropertyRecord[];
  expandAllCards?: boolean;
  highlightedCaseNumber?: string | null;
}

export const PropertyList: React.FC<PropertyListProps> = ({ 
  records, 
  expandAllCards = false, 
  highlightedCaseNumber = null 
}) => {
  const groupedCases = groupRecordsByCase(records);

  return (
    <Card className="">
      <CardContent className="pt-6 p-6">
        {groupedCases.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No investigation records found for the specified criteria.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedCases.map((groupedCase, index) => (
              <CaseCard 
                key={groupedCase.casefileNumber || index} 
                groupedCase={groupedCase} 
                defaultExpanded={expandAllCards}
                isHighlighted={highlightedCaseNumber === groupedCase.casefileNumber}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyList;
