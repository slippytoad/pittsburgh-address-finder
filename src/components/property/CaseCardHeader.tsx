
import React from 'react';
import { MapPin, FileText, Calendar, House } from 'lucide-react';
import { CardTitle } from '@/components/ui/card';
import { formatDate } from '@/utils/propertyUtils';

interface CaseCardHeaderProps {
  formattedStreetAddress: string;
  parcelId: string | null;
  casefileNumber: string;
  earliestDate: string;
  isHighlighted: boolean;
}

export const CaseCardHeader: React.FC<CaseCardHeaderProps> = ({
  formattedStreetAddress,
  parcelId,
  casefileNumber,
  earliestDate,
  isHighlighted
}) => {
  return (
    <div className="flex flex-col gap-3 min-w-0 flex-1">
      {/* Address Section */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="h-5 w-5 flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-brand">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <path d="M12 8v4"/>
            <circle cx="12" cy="15" r="1"/>
          </svg>
        </div>
        <CardTitle className="text-lg font-bold truncate">
          {formattedStreetAddress}
        </CardTitle>
      </div>
      
      {/* Parcel ID Section with House Icon */}
      {parcelId && (
        <div className="flex items-start gap-2 text-sm">
          <House className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-normal text-muted-foreground">Parcel ID:</span>
            <span className="ml-1 font-medium text-foreground">{parcelId}</span>
          </div>
        </div>
      )}
      
      {/* Case Number Section */}
      <div className="flex items-start gap-2 text-sm">
        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-normal text-muted-foreground">Case #</span>
          <span className="ml-1 font-medium text-foreground">{casefileNumber}</span>
        </div>
      </div>
      
      {/* Date Opened Section */}
      {earliestDate && (
        <div className="flex items-start gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-normal text-muted-foreground">First notice:</span>
            <span className="ml-1 font-medium text-foreground">{formatDate(earliestDate)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
