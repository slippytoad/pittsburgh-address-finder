
export interface PropertyRecord {
  _id: number;
  address: string;
  investigation_date: string;
  violation_type?: string;
  status?: string;
  inspector?: string;
  [key: string]: any;
}

export interface ApiResponse {
  success: boolean;
  result: {
    records: PropertyRecord[];
    total: number;
  };
}
