
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, FileText, Calendar, MapPin } from 'lucide-react';
import { GroupedCase } from '@/types/propertyTypes';
import { formatDate, getStatusColor } from '@/utils/propertyUtils';

interface CaseCardProps {
  groupedCase: GroupedCase;
}

const CaseCard: React.FC<CaseCardProps> = ({ groupedCase }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get the primary address from the first record
  const primaryAddress = groupedCase.records[0]?.address || 'Unknown Address';

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
                    {primaryAddress}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Case #{groupedCase.casefileNumber}
                    </span>
                    <span className="text-gray-400">•</span>
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Latest: {formatDate(groupedCase.latestDate)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
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
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {groupedCase.records.map((record, index) => (
                <div key={record._id || index} className="border-l-2 border-blue-200 pl-4 py-2">
                  <div className="space-y-3">
                    {Object.entries(record).map(([key, value]) => (
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
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CaseCard;
