
import React from 'react';
import { ExternalLink } from 'lucide-react';

interface CaseCardCourtLinkProps {
  parcelId: string;
  hasInstructions: boolean;
}

export const CaseCardCourtLink: React.FC<CaseCardCourtLinkProps> = ({
  parcelId,
  hasInstructions
}) => {
  const getCourtFilingUrl = (parcelId: string) => {
    return `https://ujsportal.pacourts.us/CaseSearch?parcel_id=${encodeURIComponent(parcelId)}`;
  };

  return (
    <div className={`${hasInstructions ? 'pt-2' : 'pt-3'}`}>
      <div className="text-sm">
        <a 
          href={getCourtFilingUrl(parcelId)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline font-medium bg-blue-50 px-3 py-2 rounded-md border border-blue-200 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-4 w-4" />
          View Court Filing
        </a>
      </div>
    </div>
  );
};
