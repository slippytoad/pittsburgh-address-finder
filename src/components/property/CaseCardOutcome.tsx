
import React from 'react';
import { Scale, Calendar } from 'lucide-react';
import { formatDate } from '@/utils/propertyUtils';

interface CaseCardOutcomeProps {
  formattedOutcome: string;
  latestDate: string;
}

export const CaseCardOutcome: React.FC<CaseCardOutcomeProps> = ({
  formattedOutcome,
  latestDate
}) => {
  return (
    <div className="flex flex-col gap-3 text-sm">
      {/* Outcome with Scale icon */}
      <div className="flex items-start gap-2 text-gray-700">
        <Scale className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-normal">Outcome:</span> 
          <span className="ml-1 font-bold break-words">{formattedOutcome}</span>
        </div>
      </div>
      
      {/* Last update with Calendar icon */}
      <div className="flex items-start gap-2 text-gray-500">
        <Calendar className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span className="font-bold">Last update: {formatDate(latestDate)}</span>
      </div>
    </div>
  );
};
