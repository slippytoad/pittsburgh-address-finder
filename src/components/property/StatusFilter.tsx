
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Filter, Search } from 'lucide-react';
import { getStatusColor } from '@/utils/propertyUtils';

interface StatusFilterProps {
  availableStatuses: string[];
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
  statusCounts: Record<string, number>;
  onAddressSearch?: (search: string) => void;
  addressSearch?: string;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  availableStatuses,
  selectedStatuses,
  onStatusChange,
  statusCounts,
  onAddressSearch,
  addressSearch = '',
}) => {
  // Debug logging to track props
  useEffect(() => {
    console.log('StatusFilter - availableStatuses:', availableStatuses);
    console.log('StatusFilter - selectedStatuses:', selectedStatuses);
    console.log('StatusFilter - statusCounts:', statusCounts);
  }, [availableStatuses, selectedStatuses, statusCounts]);

  const handleStatusToggle = (status: string) => {
    console.log('StatusFilter - handleStatusToggle called with:', status);
    
    if (status === 'All') {
      if (selectedStatuses.length === 0) {
        // Already showing all, do nothing
        return;
      } else {
        // Select all (empty array means all)
        console.log('StatusFilter - selecting all');
        onStatusChange([]);
      }
    } else {
      // Radio button behavior - only one status can be selected
      if (selectedStatuses.includes(status)) {
        // If clicking the already selected status, deselect it (show all)
        console.log('StatusFilter - deselecting status, showing all');
        onStatusChange([]);
      } else {
        // Select only this status
        console.log('StatusFilter - selecting status:', status);
        onStatusChange([status]);
      }
    }
  };

  const totalCases = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
  const isShowingAll = selectedStatuses.length === 0;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-blue-600" />
        <h3 className="font-medium text-sm">Filter by Status</h3>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {/* All option */}
        <Badge
          variant="secondary"
          onClick={() => handleStatusToggle('All')}
          className={`
            cursor-pointer transition-all duration-200 hover:opacity-80
            ${isShowingAll 
              ? 'ring-2 ring-blue-400 shadow-lg scale-105 bg-blue-600 text-white' 
              : 'hover:scale-105 opacity-70'
            }
          `}
        >
          All ({totalCases})
        </Badge>
        
        {/* Individual status options */}
        {availableStatuses.map((status) => {
          const isSelected = selectedStatuses.includes(status);
          const count = statusCounts[status] || 0;
          console.log(`StatusFilter - rendering ${status}, isSelected: ${isSelected}, count: ${count}`);
          return (
            <Badge
              key={status}
              variant={getStatusColor(status)}
              onClick={() => handleStatusToggle(status)}
              className={`
                cursor-pointer transition-all duration-200 hover:opacity-80
                ${isSelected 
                  ? 'ring-2 ring-blue-400 shadow-lg scale-105 bg-blue-600 text-white' 
                  : 'hover:scale-105 opacity-70'
                }
              `}
            >
              {status} ({count})
            </Badge>
          );
        })}
      </div>

      {/* Address search - only show when All is selected */}
      {isShowingAll && onAddressSearch && (
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by address..."
            value={addressSearch}
            onChange={(e) => onAddressSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}
    </div>
  );
};

export default StatusFilter;
