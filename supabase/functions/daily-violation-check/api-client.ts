
import { ViolationRecord, ApiResponse } from "./types.ts";

export class PropertyApiClient {
  private readonly apiUrl = 'https://data.wprdc.org/api/3/action/datastore_search_sql?sql=SELECT%20%2A%20FROM%20%2270c06278-92c5-4040-ab28-17671866f81c%22%20WHERE%20%28address%20ILIKE%20%2710%20Edith%20Place%25%27%20OR%20address%20ILIKE%20%2712%20Edith%20Place%25%27%20OR%20address%20ILIKE%20%273210%20Dawson%20St%25%27%20OR%20address%20ILIKE%20%273220%20Dawson%20St%25%27%20OR%20address%20ILIKE%20%273227%20Dawson%20St%20Units%201%262%25%27%20OR%20address%20ILIKE%20%273228%20Dawson%20St%25%27%20OR%20address%20ILIKE%20%273230%20Dawson%20St%25%27%20OR%20address%20ILIKE%20%273232%20Dawson%20St%25%27%20OR%20address%20ILIKE%20%27109%20Oakland%20Ct%25%27%20OR%20address%20ILIKE%20%2725%20Edith%20Pl%25%27%20OR%20address%20ILIKE%20%273206%20Dawson%20St%20Units%201-3%25%27%20OR%20address%20ILIKE%20%273208%20Dawson%20St%20Units%201%262%25%27%20OR%20address%20ILIKE%20%273431%20Parkview%20Ave%25%27%20OR%20address%20ILIKE%20%273433%20Parkview%20Ave%20Units%201%262%25%27%20OR%20address%20ILIKE%20%275419%20Potter%20St%25%27%20OR%20address%20ILIKE%20%2719%20Edith%20Pl%25%27%20OR%20address%20ILIKE%20%2720%20Edith%20Pl%25%27%20OR%20address%20ILIKE%20%273341%20Parkview%20Ave%25%27%20OR%20address%20ILIKE%20%273343%20Parkview%20Ave%25%27%20OR%20address%20ILIKE%20%273707%20Orpwood%20St%25%27%20OR%20address%20ILIKE%20%273709%20Orpwood%20St%25%27%20OR%20address%20ILIKE%20%273711%20Orpwood%20St%20Units%201%262%25%27%20OR%20address%20ILIKE%20%273817%20Bates%20St%25%27%29%20ORDER%20BY%20investigation_date%20DESC';

  async fetchPropertyData(): Promise<ApiResponse> {
    console.log("Fetching property data from API...");
    const apiResponse = await fetch(this.apiUrl);
    
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
