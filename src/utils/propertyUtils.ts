
import { formatInTimeZone } from 'date-fns-tz';
import { PropertyRecord, GroupedCase } from '@/types/propertyTypes';

export const formatDate = (dateString: string) => {
  try {
    // Parse the date as if it's already in Eastern Time to avoid timezone shift
    // Add 'T12:00:00' to treat it as noon to avoid day boundary issues
    const dateWithTime = dateString.includes('T') ? dateString : `${dateString}T12:00:00`;
    return formatInTimeZone(new Date(dateWithTime), 'America/New_York', 'MMM d, yyyy');
  } catch {
    return dateString;
  }
};

export const getStatusColor = (status?: string) => {
  if (!status) return 'secondary';
  const statusUpper = status.toUpperCase();
  
  // Specific status color mappings
  if (statusUpper === 'IN COURT') return 'destructive'; // Red
  if (statusUpper === 'READY TO CLOSE') return 'success'; // Green
  if (statusUpper === 'IN VIOLATION') return 'warning'; // Orange
  if (statusUpper === 'CLOSED') return 'closed'; // Black
  
  // Fallback logic for other statuses
  const statusLower = status.toLowerCase();
  if (statusLower.includes('open') || statusLower.includes('pending')) return 'destructive';
  if (statusLower.includes('closed') || statusLower.includes('resolved')) return 'closed';
  return 'secondary';
};

export const groupRecordsByCase = (records: PropertyRecord[]): GroupedCase[] => {
  const grouped = records.reduce((acc, record) => {
    const caseNumber = record.casefile_number || 'Unknown';
    
    if (!acc[caseNumber]) {
      acc[caseNumber] = [];
    }
    acc[caseNumber].push(record);
    
    return acc;
  }, {} as Record<string, PropertyRecord[]>);

  return Object.entries(grouped).map(([caseNumber, caseRecords]) => {
    // Sort records by date (most recent first), then by status (closed first for same date)
    const sortedRecords = caseRecords.sort((a, b) => {
      const dateA = new Date(a.investigation_date);
      const dateB = new Date(b.investigation_date);
      
      // First sort by date (most recent first)
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      
      // If dates are the same, prioritize closed records
      const statusA = (a.status || '').toLowerCase();
      const statusB = (b.status || '').toLowerCase();
      
      const isClosedA = statusA.includes('closed') || statusA.includes('resolved');
      const isClosedB = statusB.includes('closed') || statusB.includes('resolved');
      
      if (isClosedA && !isClosedB) return -1;
      if (!isClosedA && isClosedB) return 1;
      
      return 0;
    });
    
    const latestRecord = sortedRecords[0];
    
    return {
      casefileNumber: caseNumber,
      currentStatus: latestRecord.status || 'Unknown',
      records: sortedRecords,
      latestDate: latestRecord.investigation_date
    };
  }).sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());
};
