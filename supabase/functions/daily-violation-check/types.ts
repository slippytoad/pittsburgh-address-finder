
export interface AppSettings {
  id: number;
  email_reports_enabled: boolean;
  email_report_address: string;
  violation_checks_enabled: boolean;
}

export interface ViolationRecord {
  _id: number;
  casefile_number?: string;
  address?: string;
  parcel_id?: string;
  status?: string;
  investigation_date?: string;
  violation_description?: string;
  violation_code_section?: string;
  violation_spec_instructions?: string;
  investigation_outcome?: string;
  investigation_findings?: string;
}

export interface ApiResponse {
  success: boolean;
  result: {
    records: ViolationRecord[];
  };
}
