import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building } from 'lucide-react';
import { PropertyRecord, GroupedCase } from '@/types/propertyTypes';
import { groupRecordsByCase } from '@/utils/propertyUtils';
import PropertyCard from './PropertyCard';

interface PropertyViewProps {
  records: PropertyRecord[];
  highlightedCaseNumber?: string | null;
}

export const PropertyView: React.FC<PropertyViewProps> = ({ 
  records, 
  highlightedCaseNumber = null 
}) => {
  // Group cases by property and filter out only fully closed cases
  const groupedCases = groupRecordsByCase(records);
  const openCases = groupedCases.filter(groupedCase => {
    const status = groupedCase.currentStatus.toUpperCase();
    // Only exclude cases that are actually closed (not ready to close)
    return status !== 'CLOSED';
  });

  // Group by property address
  const propertiesMap = openCases.reduce((acc, groupedCase) => {
    const address = groupedCase.records[0]?.address || 'Unknown Address';
    const streetAddress = address.split(',')[0] || address;
    
    // Use full address as key to avoid grouping different properties with same street number
    if (!acc[address]) {
      acc[address] = {
        address: streetAddress,
        fullAddress: address,
        cases: []
      };
    }
    acc[address].cases.push(groupedCase);
    return acc;
  }, {} as Record<string, { address: string; fullAddress: string; cases: GroupedCase[] }>);

  // Convert to array and sort by most recent case activity
  const properties = Object.values(propertiesMap).sort((a, b) => {
    const latestA = Math.max(...a.cases.map(c => new Date(c.latestDate).getTime()));
    const latestB = Math.max(...b.cases.map(c => new Date(c.latestDate).getTime()));
    return latestB - latestA;
  });

  return (
    <Card className="">
      <CardContent className="p-0">
        {properties.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No properties with open cases found for the specified criteria.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {properties.map((property, index) => (
              <PropertyCard 
                key={property.address || index} 
                property={property}
                highlightedCaseNumber={highlightedCaseNumber}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyView;