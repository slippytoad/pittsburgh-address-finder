import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { GroupedCase } from '@/types/propertyTypes';
import CaseItem from './CaseItem';

interface PropertyCardProps {
  property: {
    address: string;
    fullAddress: string;
    cases: GroupedCase[];
  };
  highlightedCaseNumber?: string | null;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  highlightedCaseNumber = null 
}) => {
  // Convert street address to mixed case
  const formattedStreetAddress = property.address.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  
  // Sort cases by latest date (most recent first)
  const sortedCases = [...property.cases].sort((a, b) => 
    new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime()
  );

  return (
    <Card className="border-2 border-gray-300 hover:border-gray-400 transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <h3 className="text-lg font-semibold truncate">
            {formattedStreetAddress}
          </h3>
          <span className="text-sm text-gray-500 ml-auto flex-shrink-0">
            {property.cases.length} open {property.cases.length === 1 ? 'case' : 'cases'}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {sortedCases.map((groupedCase, index) => (
            <CaseItem 
              key={groupedCase.casefileNumber || index} 
              groupedCase={groupedCase}
              isHighlighted={highlightedCaseNumber === groupedCase.casefileNumber}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;