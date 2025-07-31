import React from 'react';
import { FileText } from 'lucide-react';

interface CaseCardDescriptionProps {
  formattedDescription: string | null;
}

export const CaseCardDescription: React.FC<CaseCardDescriptionProps> = ({
  formattedDescription
}) => {
  if (!formattedDescription) return null;

  return (
    <div className="flex items-start gap-2 text-sm">
      <FileText className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
      <div>
        <span className="font-normal">Description:</span> 
        <span className="ml-1 font-bold break-words">{formattedDescription}</span>
      </div>
    </div>
  );
};