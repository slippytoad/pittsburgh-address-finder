
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getStatusColor } from '@/utils/propertyUtils';
import { supabase } from '@/integrations/supabase/client';
import { GroupedCase } from '@/types/propertyTypes';

interface CaseCardStatusProps {
  currentStatus: string;
  groupedCase: GroupedCase;
  isOpen: boolean;
}

export const CaseCardStatus: React.FC<CaseCardStatusProps> = ({
  currentStatus,
  groupedCase,
  isOpen
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
    <div className="flex items-center justify-between w-full flex-nowrap">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={getStatusColor(currentStatus)} className="flex-shrink-0">
          {currentStatus === 'IN VIOLATION' ? 'Open' : currentStatus}
        </Badge>
        {violationDescriptions.map((description, index) => (
          <Badge key={index} variant="secondary" className="flex-shrink-0 text-xs">
            {description}
          </Badge>
        ))}
      </div>
      <div className="flex items-center text-sm text-gray-500 flex-shrink-0">
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </div>
  );
};
