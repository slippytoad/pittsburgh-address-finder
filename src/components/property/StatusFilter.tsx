
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
    // Radio button behavior - only one status can be selected
    if (selectedStatuses.includes(status)) {
      // If clicking the already selected status, deselect it
      onStatusChange([]);
    } else {
      // Select only this status
      onStatusChange([status]);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-blue-600" />
          <h3 className="font-medium text-sm">Filter by Status</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {availableStatuses.map((status) => {
            const isSelected = selectedStatuses.includes(status);
            return (
              <Badge
                key={status}
                variant={getStatusColor(status)}
                onClick={() => handleStatusToggle(status)}
                className={`
                  cursor-pointer transition-all duration-200 hover:opacity-80
                  ${isSelected 
                    ? 'ring-2 ring-blue-300 shadow-md scale-105' 
                    : 'hover:scale-105'
                  }
                `}
              >
                {status}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusFilter;
