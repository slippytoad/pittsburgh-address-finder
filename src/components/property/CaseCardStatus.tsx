
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getStatusColor } from '@/utils/propertyUtils';

interface CaseCardStatusProps {
  currentStatus: string;
  recordCount: number;
  isOpen: boolean;
}

export const CaseCardStatus: React.FC<CaseCardStatusProps> = ({
  currentStatus,
  recordCount,
  isOpen
}) => {
  return (
    <div className="flex items-center justify-between w-full">
      {/* Status Badge */}
      <Badge variant={getStatusColor(currentStatus)} className="flex-shrink-0">
        {currentStatus}
      </Badge>
      
      {/* Record Count with Toggle */}
      <div className="flex items-center gap-1 text-sm text-gray-500 ml-2">
        <span>
          {recordCount} record{recordCount !== 1 ? 's' : ''}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </div>
  );
};
