
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
    <div className="flex gap-2 text-sm text-gray-600 lg:text-right">
      <div className="flex flex-col items-start gap-6">
        <Scale className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
        <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex items-start text-sm text-gray-700">
          <span className="font-medium">Outcome:</span> 
          <span className="ml-1 break-words">{formattedOutcome}</span>
        </div>
        <div className="text-sm text-gray-500 flex items-start">
          <span>Last update: {formatDate(latestDate)}</span>
        </div>
      </div>
    </div>
  );
};
