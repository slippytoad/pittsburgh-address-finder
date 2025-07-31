
import React from 'react';

interface CaseCardInstructionsProps {
  formattedInstructions: string | null;
}

export const CaseCardInstructions: React.FC<CaseCardInstructionsProps> = ({
  formattedInstructions
}) => {
  if (!formattedInstructions) return null;

  return null;
};
