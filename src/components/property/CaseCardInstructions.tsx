
import React from 'react';
import { Calendar } from 'lucide-react';
import { formatDate } from '@/utils/propertyUtils';

interface CaseCardInstructionsProps {
  formattedInstructions: string | null;
  latestDate: string;
}

export const CaseCardInstructions: React.FC<CaseCardInstructionsProps> = ({
  formattedInstructions,
  latestDate
}) => {
  if (!formattedInstructions) return null;

  return (
    <div className="flex flex-col gap-3 text-sm">
      {/* Instructions with FileText icon */}
      <div className="flex items-start gap-2 text-gray-700">
        <div className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        </div>
        <div>
          <span className="font-normal">Instructions:</span> 
          <span className="ml-1 font-bold break-words">{formattedInstructions}</span>
        </div>
      </div>
      
      {/* Last update with Calendar icon */}
      <div className="flex items-start gap-2 text-gray-500">
        <Calendar className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>Last update: {formatDate(latestDate)}</span>
      </div>
    </div>
  );
};
