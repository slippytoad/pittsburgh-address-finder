
import { ViolationRecord } from "./types.ts";

export class ViolationProcessor {
  static filterNewRecords(
    allRecords: ViolationRecord[], 
    existingIds: Set<number>, 
    latestDate: string | null
  ): ViolationRecord[] {
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
    
    console.log('Filtered records: Found', newRecords.length, 'new records out of', allRecords.length, 'total records');
    return newRecords;
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
