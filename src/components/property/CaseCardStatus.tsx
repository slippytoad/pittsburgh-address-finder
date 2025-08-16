
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getStatusColor } from '@/utils/propertyUtils';
import { supabase } from '@/integrations/supabase/client';
import { GroupedCase } from '@/types/propertyTypes';

interface CaseCardStatusProps {
  currentStatus: string;
  groupedCase: GroupedCase;
  isNew?: boolean;
  isUpdated?: boolean;
}

export const CaseCardStatus: React.FC<CaseCardStatusProps> = ({
  currentStatus,
  groupedCase,
  isNew = false,
  isUpdated = false
}) => {
  const [violationDescriptions, setViolationDescriptions] = useState<string[]>([]);

  useEffect(() => {
    // Safety check: ensure groupedCase and records exist
    if (!groupedCase?.records) {
      setViolationDescriptions([]);
      return;
    }

    const fetchViolationDescriptions = async () => {
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

  return (
    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
      {/* New/Updated Badge */}
      {(isNew || isUpdated) && (
        <Badge variant="default" className="bg-blue-600 text-white flex-shrink-0 whitespace-nowrap">
          {isNew ? 'New' : 'Updated'}
        </Badge>
      )}
      <Badge variant={getStatusColor(currentStatus)} className="flex-shrink-0 whitespace-nowrap">
        <span className="truncate max-w-[120px]">{currentStatus}</span>
      </Badge>
      
      {/* Violation descriptions container with overflow handling */}
      {violationDescriptions.length > 0 && (
        <div className="flex gap-1 min-w-0 overflow-hidden">
          {violationDescriptions.slice(0, 3).map((description, index) => (
            <Badge key={index} variant="secondary" className="flex-shrink-0 text-xs whitespace-nowrap">
              <span className="truncate max-w-[100px]" title={description}>
                {description}
              </span>
            </Badge>
          ))}
          {violationDescriptions.length > 3 && (
            <Badge variant="secondary" className="flex-shrink-0 text-xs whitespace-nowrap">
              +{violationDescriptions.length - 3}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
