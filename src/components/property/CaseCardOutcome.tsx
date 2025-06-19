
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
    <div className="flex items-start gap-2 text-sm text-gray-600 lg:text-right">
      <Scale className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1">
        <div>
          <span className="font-medium">Outcome:</span> 
          <span className="ml-1 break-words">{formattedOutcome}</span>
        </div>
        <div className="flex items-start gap-2 text-gray-500">
          <Calendar className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <span>Last update: {formatDate(latestDate)}</span>
        </div>
      </div>
    </div>
  );
};
