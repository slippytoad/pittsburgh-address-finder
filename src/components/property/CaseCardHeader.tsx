
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
        <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
        <CardTitle className="text-lg font-bold truncate">
          {formattedStreetAddress}
        </CardTitle>
      </div>
      
      {/* Parcel ID Section with House Icon */}
      {parcelId && (
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <House className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-normal">Parcel ID:</span>
            <span className="font-bold ml-1">{parcelId}</span>
          </div>
        </div>
      )}
      
      {/* Case Number Section */}
      <div className="flex items-start gap-2">
        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
        <span className={`text-sm font-normal ${
          isHighlighted ? 'text-blue-700' : 'text-gray-600'
        }`}>
          Case #<span className="font-bold">{casefileNumber}</span>
        </span>
      </div>
      
      {/* Date Opened Section */}
      {earliestDate && (
        <div className="flex items-start gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span className="font-normal">Opened: <span className="font-bold">{formatDate(earliestDate)}</span></span>
        </div>
      )}
    </div>
  );
};
