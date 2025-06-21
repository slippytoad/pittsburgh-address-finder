import React, { useMemo } from 'react';
import { groupRecordsByCase } from '@/utils/propertyUtils';
import { PropertyRecord } from '@/types/propertyTypes';

export const usePropertyCases = (records: PropertyRecord[] | undefined) => {
  const groupedCases = useMemo(() => {
    if (!records) {
      return [];
    }
    return groupRecordsByCase(records);
  }, [records]);

  return groupedCases;
}; 