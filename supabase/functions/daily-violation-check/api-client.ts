
import { ViolationRecord, ApiResponse } from "./types.ts";
import { DatabaseService } from "./database-service.ts";

export class PropertyApiClient {
  private dbService: DatabaseService;

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
  }

  private async getParcelIdsFromDatabase(): Promise<string[]> => {
    const parcelIds = await this.dbService.getParcelIds();
    console.log('Fetched parcel IDs from database:', parcelIds.length);
    return parcelIds;
  }

  private buildApiUrl(parcelIds: string[], fullSync: boolean = false): string {
    const baseUrl = 'https://data.wprdc.org/api/3/action/datastore_search_sql?sql=SELECT%20%2A%20FROM%20%2270c06278-92c5-4040-ab28-17671866f81c%22%20WHERE%20';
    
    // Build the parcel_id IN clause
    const parcelIdList = parcelIds.map(id => `%27${encodeURIComponent(id)}%27`).join('%2C');
    const parcelIdCondition = `parcel_id%20IN%20%28${parcelIdList}%29`;
    
    // Use different date filter based on fullSync parameter
    const dateFilter = fullSync 
      ? '%20AND%20investigation_date%20%3E%3D%20%272024-01-01%27'
      : '%20AND%20investigation_date%20%3E%3D%20%272025-01-01%27';
    const orderBy = '%20ORDER%20BY%20investigation_date%20DESC';
    const limit = '%20LIMIT%201000'; // Add limit to fetch more records
    
    const fullUrl = baseUrl + parcelIdCondition + dateFilter + orderBy + limit;
    
    // Log the constructed URL in detail
    console.log('=== EDGE FUNCTION API URL CONSTRUCTION ===');
    console.log('Base URL:', baseUrl);
    console.log('Number of parcel IDs:', parcelIds.length);
    console.log('First few parcel IDs:', parcelIds.slice(0, 3));
    console.log('Parcel ID condition:', parcelIdCondition);
    console.log('Date filter (fullSync=' + fullSync + '):', dateFilter);
    console.log('Order by:', orderBy);
    console.log('Limit:', limit);
    console.log('FULL API URL:', fullUrl);
    console.log('URL Length:', fullUrl.length);
    console.log('=== END EDGE FUNCTION API URL CONSTRUCTION ===');
    
    return fullUrl;
  }

  async fetchPropertyData(fullSync: boolean = false): Promise<ApiResponse> {
    console.log("Fetching parcel IDs from database...");
    const parcelIds = await this.getParcelIdsFromDatabase();
    
    if (parcelIds.length === 0) {
      console.log("No parcel IDs found in database");
      return {
        success: true,
        result: { records: [] }
      };
    }
    
    const apiUrl = this.buildApiUrl(parcelIds, fullSync);
    const yearText = fullSync ? '2024' : '2025';
    console.log(`Fetching property data from API with ${parcelIds.length} parcel IDs from ${yearText} onwards...`);
    console.log('About to make API call to:', apiUrl);
    
    const startTime = Date.now();
    const apiResponse = await fetch(apiUrl);
    const endTime = Date.now();
    
    console.log('API call completed in', (endTime - startTime), 'ms');
    console.log('Response status:', apiResponse.status, apiResponse.statusText);
    
    if (!apiResponse.ok) {
      console.error('API request failed:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        url: apiUrl
      });
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }
    
    const apiData = await apiResponse.json();
    console.log("API Response received:", {
      success: apiData.success,
      recordCount: apiData?.result?.records?.length || 0,
      hasResult: !!apiData.result,
      hasRecords: !!apiData.result?.records
    });

    if (!apiData.success || !apiData.result?.records) {
      console.error("Invalid API response format:", apiData);
      throw new Error("Invalid API response format");
    }

    return apiData;
  }
}
