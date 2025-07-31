
import React from 'react';

interface CaseCardInstructionsProps {
  formattedInstructions: string | null;
}

export const CaseCardInstructions: React.FC<CaseCardInstructionsProps> = ({
  formattedInstructions
}) => {
  if (!formattedInstructions) return null;

  return (
    <div className="flex gap-2 text-sm text-gray-600 lg:text-right max-w-full">
      <div className="flex flex-col items-start gap-3">
        <div className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        </div>
      </div>
      <div className="flex flex-col gap-3 min-w-0 flex-1">
        <div className="flex flex-col text-sm text-gray-700">
          <span className="font-medium mb-1">Instructions:</span> 
          <span className="break-words whitespace-pre-wrap text-wrap overflow-wrap-anywhere">{formattedInstructions}</span>
        </div>
      </div>
    </div>
  );
};
