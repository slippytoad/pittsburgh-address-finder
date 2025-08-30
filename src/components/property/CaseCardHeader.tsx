
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
      <div className="flex items-start gap-2 min-w-0">
        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
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
