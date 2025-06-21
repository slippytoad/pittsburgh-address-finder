
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Filter, Search, X } from 'lucide-react';
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

  // Define the desired order of statuses
  const statusOrder = ['IN VIOLATION', 'IN COURT', 'READY TO CLOSE', 'CLOSED'];
  
  // Sort available statuses according to the desired order
  const orderedStatuses = statusOrder.filter(status => availableStatuses.includes(status));

  const handleClearSearch = () => {
    if (onAddressSearch) {
      onAddressSearch('');
    }
  };

  return (
    <div className="mb-4">      
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
        
        {/* Individual status options in specified order */}
        {orderedStatuses.map((status) => {
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

      {/* Address search with search icon inside */}
      {onAddressSearch && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by address..."
            value={addressSearch}
            onChange={(e) => onAddressSearch(e.target.value)}
            className="pl-10 pr-8"
          />
          {addressSearch && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusFilter;
