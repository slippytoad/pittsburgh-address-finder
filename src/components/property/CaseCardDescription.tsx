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
      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      <div>
        <span className="font-normal text-muted-foreground">Description:</span>
        <span className="ml-1 font-medium text-foreground break-words">{formattedDescription}</span>
      </div>
    </div>
  );
};