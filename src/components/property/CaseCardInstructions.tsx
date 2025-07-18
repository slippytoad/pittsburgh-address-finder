
import React from 'react';

interface CaseCardInstructionsProps {
  formattedInstructions: string | null;
}

export const CaseCardInstructions: React.FC<CaseCardInstructionsProps> = ({
  formattedInstructions
}) => {
  if (!formattedInstructions) return null;

  return (
    <div className="pt-3">
      <div className="text-sm text-gray-700 bg-amber-50 p-3 rounded-md border border-amber-200">
        <span className="font-medium">Instructions:</span>
        <span className="ml-1 break-words">{formattedInstructions}</span>
      </div>
    </div>
  );
};
