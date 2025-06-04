
import { ViolationRecord, ApiResponse } from "./types.ts";
import { DatabaseService } from "./database-service.ts";

export class PropertyApiClient {
  private dbService: DatabaseService;

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
  }

  private async getAddressesFromDatabase(): Promise<string[]> {
    const addresses = await this.dbService.getAddresses();
    console.log('Fetched addresses from database:', addresses.length);
    return addresses;
  }

  private buildApiUrl(addresses: string[]): string {
    const baseUrl = 'https://data.wprdc.org/api/3/action/datastore_search_sql?sql=SELECT%20%2A%20FROM%20%2270c06278-92c5-4040-ab28-17671866f81c%22%20WHERE%20';
    
    // Build the address conditions dynamically
    const addressConditions = addresses.map(address => 
      `address%20ILIKE%20%27${encodeURIComponent(address)}%25%27`
    ).join('%20OR%20');
    
    const orderBy = '%20ORDER%20BY%20investigation_date%20DESC';
    
    return baseUrl + '(' + addressConditions + ')' + orderBy;
  }

  async fetchPropertyData(): Promise<ApiResponse> {
    console.log("Fetching addresses from database...");
    const addresses = await this.getAddressesFromDatabase();
    
    if (addresses.length === 0) {
      console.log("No addresses found in database");
      return {
        success: true,
        result: { records: [] }
      };
    }
    
    const apiUrl = this.buildApiUrl(addresses);
    console.log("Fetching property data from API with", addresses.length, "addresses...");
    
    const apiResponse = await fetch(apiUrl);
    
    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }
    
    const apiData = await apiResponse.json();
    console.log("API Response received:", apiData?.result?.records?.length || 0, "records");

    if (!apiData.success || !apiData.result?.records) {
      throw new Error("Invalid API response format");
    }

    return apiData;
  }
}
