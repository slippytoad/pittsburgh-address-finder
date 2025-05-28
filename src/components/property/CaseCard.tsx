
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, FileText, MapPin, Calendar } from 'lucide-react';
import { GroupedCase } from '@/types/propertyTypes';
import { formatDate, getStatusColor } from '@/utils/propertyUtils';

interface CaseCardProps {
  groupedCase: GroupedCase;
}

const CaseCard: React.FC<CaseCardProps> = ({ groupedCase }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get the primary address from the first record and extract just the street
  const fullAddress = groupedCase.records[0]?.address || 'Unknown Address';
  const streetAddress = fullAddress.split(',')[0] || fullAddress;

  // Fields to exclude from the expanded view
  const excludedFields = ['_id', 'full_text', '_full_text', 'casefile_number', 'address', 'parcel_id'];

  // Field order for better presentation - moved investigation_outcome to the top
  const getOrderedFields = (record: any) => {
    const orderedKeys = ['investigation_date', 'status', 'violation_type', 'investigation_outcome'];
    const remainingKeys = Object.keys(record).filter(
      key => !excludedFields.includes(key) && !orderedKeys.includes(key)
    );
    return [...orderedKeys, ...remainingKeys].filter(key => record[key] !== undefined);
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <CardTitle className="text-lg">
                    {streetAddress}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Case #{groupedCase.casefileNumber}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-4">
                    <Badge variant={getStatusColor(groupedCase.currentStatus)}>
                      {groupedCase.currentStatus}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">
                        {groupedCase.records.length} record{groupedCase.records.length !== 1 ? 's' : ''}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>Last update: {formatDate(groupedCase.latestDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {groupedCase.records.map((record, index) => (
                <Card key={record._id || index} className="border border-gray-200 bg-gray-50">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {getOrderedFields(record).map((key) => {
                        const value = record[key];
                        return (
                          <div key={key} className="grid grid-cols-3 gap-4">
                            <div className="font-medium text-gray-700 capitalize">
                              {key.replace(/_/g, ' ')}:
                            </div>
                            <div className="col-span-2 text-gray-600">
                              {key === 'investigation_date' ? formatDate(value as string) : 
                               typeof value === 'object' ? JSON.stringify(value) : 
                               String(value)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CaseCard;
