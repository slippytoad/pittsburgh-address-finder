
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getStatusColor } from '@/utils/propertyUtils';

interface CaseCardStatusProps {
  currentStatus: string;
  uniqueCodesCount: number;
  isOpen: boolean;
}

export const CaseCardStatus: React.FC<CaseCardStatusProps> = ({
  currentStatus,
  uniqueCodesCount,
  isOpen
}) => {
  return (
    <div className="flex items-center justify-between w-full flex-nowrap">
      <div className="flex items-center gap-2">
        <Badge variant={getStatusColor(currentStatus)} className="flex-shrink-0">
          {currentStatus === 'IN VIOLATION' ? 'Open' : currentStatus}
        </Badge>
        <Badge variant="secondary" className="flex-shrink-0">
          {uniqueCodesCount} {`CODE VIOLATION${uniqueCodesCount === 1 ? '' : 'S'}`}
        </Badge>
      </div>
      <div className="flex items-center text-sm text-gray-500 flex-shrink-0">
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </div>
  );
};
