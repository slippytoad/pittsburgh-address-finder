
import { ViolationRecord } from "./types.ts";

export class ViolationProcessor {
  static filterNewRecords(allRecords: ViolationRecord[], existingIds: Set<number>): ViolationRecord[] {
    const newRecords = allRecords.filter(record => !existingIds.has(record._id));
    console.log('Found', newRecords.length, 'new records');
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
