
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar } from 'lucide-react';
import { PropertyRecord } from '@/types/propertyTypes';
import { formatDate, getStatusColor } from '@/utils/propertyUtils';

interface PropertyCardProps {
  record: PropertyRecord;
  index: number;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ record, index }) => {
  return (
    <Card key={record._id || index} className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-900">{record.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {formatDate(record.investigation_date)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            {record.violation_type && (
              <div>
                <span className="text-sm font-medium text-gray-700">Violation Type:</span>
                <p className="text-sm text-gray-600">{record.violation_type}</p>
              </div>
            )}
            {record.inspector && (
              <div>
                <span className="text-sm font-medium text-gray-700">Inspector:</span>
                <p className="text-sm text-gray-600">{record.inspector}</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end justify-start gap-2">
            {record.status && (
              <Badge variant={getStatusColor(record.status)}>
                {record.status}
              </Badge>
            )}
            <span className="text-xs text-gray-500">ID: {record._id}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <details className="group">
            <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
              View all record details
            </summary>
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(record, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
