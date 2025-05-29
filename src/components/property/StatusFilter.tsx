
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import { getStatusColor } from '@/utils/propertyUtils';

interface StatusFilterProps {
  availableStatuses: string[];
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  availableStatuses,
  selectedStatuses,
  onStatusChange,
}) => {
  const handleStatusToggle = (status: string) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter(s => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-blue-600" />
          <h3 className="font-medium text-sm">Filter by Status</h3>
        </div>
        
        <div className="space-y-2">
          {availableStatuses.map((status) => (
            <div
              key={status}
              onClick={() => handleStatusToggle(status)}
              className={`
                cursor-pointer p-2 rounded-md border transition-all duration-200
                ${selectedStatuses.includes(status) 
                  ? 'bg-gray-900 border-gray-900 text-white' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Badge 
                variant={getStatusColor(status)} 
                className={`text-xs ${
                  selectedStatuses.includes(status) 
                    ? 'bg-white text-gray-900' 
                    : ''
                }`}
              >
                {status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusFilter;
