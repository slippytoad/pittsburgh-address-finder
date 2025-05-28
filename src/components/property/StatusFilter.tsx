
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  const handleStatusToggle = (status: string, checked: boolean) => {
    if (checked) {
      onStatusChange([...selectedStatuses, status]);
    } else {
      onStatusChange(selectedStatuses.filter(s => s !== status));
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
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Checkbox
              id="select-all"
              checked={selectedStatuses.length === availableStatuses.length}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
              Select All ({availableStatuses.length})
            </label>
          </div>
          
          {availableStatuses.map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status}`}
                checked={selectedStatuses.includes(status)}
                onCheckedChange={(checked) => handleStatusToggle(status, checked as boolean)}
              />
              <label htmlFor={`status-${status}`} className="text-sm cursor-pointer flex-1">
                <Badge variant={getStatusColor(status)} className="text-xs">
                  {status}
                </Badge>
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusFilter;
