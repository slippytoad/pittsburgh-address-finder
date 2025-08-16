import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { GroupedCase } from '@/types/propertyTypes';
import { getStatusColor, formatDate } from '@/utils/propertyUtils';
import { supabase } from '@/integrations/supabase/client';
import { CaseHistoryDialog } from './CaseHistoryDialog';

interface CaseItemProps {
  groupedCase: GroupedCase;
  isHighlighted?: boolean;
}

export const CaseItem: React.FC<CaseItemProps> = ({ 
  groupedCase, 
  isHighlighted = false 
}) => {
  const [violationDescriptions, setViolationDescriptions] = useState<string[]>([]);
  const [showCaseHistory, setShowCaseHistory] = useState(false);

  useEffect(() => {
    const fetchViolationDescriptions = async () => {
      if (!groupedCase?.records) {
        setViolationDescriptions([]);
        return;
      }

      const uniqueCodeSections = new Set(
        groupedCase.records
          .map(r => r.violation_code_section)
          .filter(Boolean)
      );

      if (uniqueCodeSections.size === 0) {
        setViolationDescriptions([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('violation_code_sections')
          .select('short_definition')
          .in('violation_code_section', Array.from(uniqueCodeSections));

        if (error) {
          console.error('Error fetching violation descriptions:', error);
          setViolationDescriptions([]);
          return;
        }

        const descriptions = data
          ?.map(item => item.short_definition)
          .filter(Boolean) || [];
        
        setViolationDescriptions(descriptions);
      } catch (error) {
        console.error('Error fetching violation descriptions:', error);
        setViolationDescriptions([]);
      }
    };

    fetchViolationDescriptions();
  }, [groupedCase?.records]);

  const handleClick = () => {
    setShowCaseHistory(true);
  };

  // Check if case is new or updated
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const earliestDate = groupedCase.records.reduce((earliest, record) => {
    if (!record.investigation_date) return earliest;
    if (!earliest) return record.investigation_date;
    return new Date(record.investigation_date) < new Date(earliest) ? record.investigation_date : earliest;
  }, '');
  
  const isNew = earliestDate && new Date(earliestDate) > oneWeekAgo;
  const isUpdated = !isNew && groupedCase.latestDate && new Date(groupedCase.latestDate) > oneWeekAgo;

  return (
    <>
      <div 
        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
          isHighlighted ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300' : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={handleClick}
      >
        {/* First line: Date and Status */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            {formatDate(groupedCase.latestDate)}
          </span>
          <div className="flex items-center gap-2">
            {/* New/Updated Badge */}
            {(isNew || isUpdated) && (
              <Badge variant="default" className="bg-blue-600 text-white">
                {isNew ? 'New' : 'Updated'}
              </Badge>
            )}
            <Badge variant={getStatusColor(groupedCase.currentStatus)} className="flex-shrink-0">
              {groupedCase.currentStatus}
            </Badge>
          </div>
        </div>
        
        {/* Second line: Violation pills */}
        {violationDescriptions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {violationDescriptions.map((description, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {description}
              </Badge>
            ))}
          </div>
        )}
        
      </div>

      {/* Case History Dialog */}
      <CaseHistoryDialog
        isOpen={showCaseHistory}
        onOpenChange={setShowCaseHistory}
        groupedCase={groupedCase}
      />
    </>
  );
};

export default CaseItem;