
export interface PropertyRecord {
  _id: number;
  address: string;
  investigation_date: string;
  violation_type?: string;
  status?: string;
  inspector?: string;
  casefile_number?: string;
  parcel_id?: string;
  violation_description?: string;
  violation_code_section?: string;
  violation_spec_instructions?: string;
  investigation_outcome?: string;
  investigation_findings?: string;
  [key: string]: any;
}

export interface ApiResponse {
  success: boolean;
  result: {
    records: PropertyRecord[];
    total: number;
  };
}

export interface GroupedCase {
  casefileNumber: string;
  currentStatus: string;
  records: PropertyRecord[];
  latestDate: string;
}
