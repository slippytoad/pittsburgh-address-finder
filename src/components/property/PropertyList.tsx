
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, FileText } from 'lucide-react';
import { PropertyRecord } from '@/types/propertyTypes';
import PropertyCard from './PropertyCard';

interface PropertyListProps {
  records: PropertyRecord[];
}

const PropertyList: React.FC<PropertyListProps> = ({ records }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Investigation Records
        </CardTitle>
        <CardDescription>
          Found {records.length} investigation records for the specified addresses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No investigation records found for the specified criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4">
              {records.map((record, index) => (
                <PropertyCard key={record._id || index} record={record} index={index} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyList;
