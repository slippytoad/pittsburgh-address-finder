
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

  const handleSelectAll = () => {
    if (selectedStatuses.length === availableStatuses.length) {
      onStatusChange([]);
    } else {
      onStatusChange(availableStatuses);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-blue-600" />
          <h3 className="font-medium text-sm">Filter by Status</h3>
        </div>
        
        <div className="space-y-2">
          <Button
            variant={selectedStatuses.length === availableStatuses.length ? "default" : "outline"}
            size="sm"
            onClick={handleSelectAll}
            className="w-full justify-start text-xs"
          >
            {selectedStatuses.length === availableStatuses.length ? "Deselect All" : "Select All"} ({availableStatuses.length})
          </Button>
          
          {availableStatuses.map((status) => (
            <Button
              key={status}
              variant={selectedStatuses.includes(status) ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusToggle(status)}
              className="w-full justify-start text-xs"
            >
              <Badge variant={getStatusColor(status)} className="text-xs mr-2">
                {status}
              </Badge>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusFilter;
