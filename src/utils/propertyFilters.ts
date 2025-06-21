import { PropertyRecord } from '@/types/propertyTypes';

export interface GroupedCase {
  casefileNumber: string;
  currentStatus: string;
  records: PropertyRecord[];
  latestDate: string;
}

export const filterCasesByStatus = (
  cases: GroupedCase[],
  selectedStatuses: string[]
): GroupedCase[] => {
  if (selectedStatuses.length === 0) {
    return cases;
  }
  
  return cases.filter(caseGroup => 
    selectedStatuses.includes(caseGroup.currentStatus)
  );
};

export const filterCasesByAddress = (
  cases: GroupedCase[],
  addressSearch: string
): GroupedCase[] => {
  if (!addressSearch || !addressSearch.trim()) {
    return cases;
  }
  
  const searchTerm = addressSearch.toLowerCase().trim();
  return cases.filter(caseGroup => 
    caseGroup.records.some(record => 
      record.address?.toLowerCase().includes(searchTerm)
    )
  );
};

export const getStatusCounts = (cases: GroupedCase[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  cases.forEach(caseGroup => {
    const status = caseGroup.currentStatus;
    counts[status] = (counts[status] || 0) + 1;
  });
  return counts;
};

export const getAvailableStatuses = (cases: GroupedCase[]): string[] => {
  return Array.from(new Set(cases.map(c => c.currentStatus)));
};

export const formatLastApiCheckTime = (timestamp: string | null): string | undefined => {
  if (!timestamp) return undefined;
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return undefined;
  }
}; 