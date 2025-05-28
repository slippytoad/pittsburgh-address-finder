
export interface PropertyRecord {
  _id: number;
  address: string;
  investigation_date: string;
  violation_type?: string;
  status?: string;
  inspector?: string;
  casefile_number?: string;
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
