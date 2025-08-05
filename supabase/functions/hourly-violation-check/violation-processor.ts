
import { ViolationRecord } from "./types.ts";

export interface FilterResult {
  newRecords: ViolationRecord[];
  newRecordsForExistingCases: ViolationRecord[];
  newCasefiles: ViolationRecord[];
}

export class ViolationProcessor {
  static filterNewRecords(
    allRecords: ViolationRecord[], 
    existingIds: Set<number>, 
    existingCaseNumbers: Set<string>,
    latestDate: string | null
  ): FilterResult {
    // First filter out records that already exist in the database
    const nonExistingRecords = allRecords.filter(record => !existingIds.has(record._id));
    
    // If we have a latest date, only include records newer than that date
    let newRecords = nonExistingRecords;
    if (latestDate) {
      newRecords = nonExistingRecords.filter(record => {
        if (!record.investigation_date) return false;
        return record.investigation_date > latestDate;
      });
      console.log('Filtered by date: Found', newRecords.length, 'records newer than', latestDate);
    }
    
    // Separate new records into two categories
    const newRecordsForExistingCases: ViolationRecord[] = [];
    const newCasefiles: ViolationRecord[] = [];
    
    newRecords.forEach(record => {
      if (record.casefile_number && existingCaseNumbers.has(record.casefile_number)) {
        newRecordsForExistingCases.push(record);
      } else {
        newCasefiles.push(record);
      }
    });
    
    console.log('Filtered records: Found', newRecords.length, 'new records out of', allRecords.length, 'total records');
    console.log('New records for existing cases:', newRecordsForExistingCases.length);
    console.log('New casefiles:', newCasefiles.length);
    
    return {
      newRecords,
      newRecordsForExistingCases,
      newCasefiles
    };
  }

  static formatForDatabase(records: ViolationRecord[]): ViolationRecord[] {
    return records.map(record => ({
      _id: record._id,
      casefile_number: record.casefile_number || null,
      address: record.address || null,
      parcel_id: record.parcel_id || null,
      status: record.status || null,
      investigation_date: record.investigation_date || null,
      violation_description: record.violation_description || null,
      violation_code_section: record.violation_code_section || null,
      violation_spec_instructions: record.violation_spec_instructions || null,
      investigation_outcome: record.investigation_outcome || null,
      investigation_findings: record.investigation_findings || null,
    }));
  }
}
