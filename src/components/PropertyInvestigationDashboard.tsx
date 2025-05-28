
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, MapPin, Calendar, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface PropertyRecord {
  _id: number;
  address: string;
  investigation_date: string;
  violation_type?: string;
  status?: string;
  inspector?: string;
  [key: string]: any;
}

interface ApiResponse {
  success: boolean;
  result: {
    records: PropertyRecord[];
    total: number;
  };
}

const fetchPropertyData = async (): Promise<ApiResponse> => {
  const apiUrl = 'https://data.wprdc.org/api/3/action/datastore_search_sql?sql=SELECT%20%2A%20FROM%20%2270c06278-92c5-4040-ab28-17671866f81c%22%20WHERE%20%28address%20ILIKE%20%2710%20Edith%20Place%25%27%20OR%20address%20ILIKE%20%2712%20Edith%20Place%25%27%20OR%20address%20ILIKE%20%273210%20Dawson%20St%25%27%20OR%20address%20ILIKE%20%273220%20Dawson%20St%25%27%20OR%20address%20ILIKE%20%273227%20Dawson%20St%20Units%201%262%25%27%20OR%20address%20ILIKE%20%273228%20Dawson%20St%25%27%20OR%20address%20ILIKE%20%273230%20Dawson%20St%25%27%20OR%20address%20ILIKE%20%273232%20Dawson%20St%25%27%20OR%20address%20ILIKE%20%27109%20Oakland%20Ct%25%27%20OR%20address%20ILIKE%20%2725%20Edith%20Pl%25%27%20OR%20address%20ILIKE%20%273206%20Dawson%20St%20Units%201-3%25%27%20OR%20address%20ILIKE%20%273208%20Dawson%20St%20Units%201%262%25%27%20OR%20address%20ILIKE%20%273431%20Parkview%20Ave%25%27%20OR%20address%20ILIKE%20%273433%20Parkview%20Ave%20Units%201%262%25%27%20OR%20address%20ILIKE%20%275419%20Potter%20St%25%27%20OR%20address%20ILIKE%20%2719%20Edith%20Pl%25%27%20OR%20address%20ILIKE%20%2720%20Edith%20Pl%25%27%20OR%20address%20ILIKE%20%273341%20Parkview%20Ave%25%27%20OR%20address%20ILIKE%20%273343%20Parkview%20Ave%25%27%20OR%20address%20ILIKE%20%273707%20Orpwood%20St%25%27%20OR%20address%20ILIKE%20%273709%20Orpwood%20St%25%27%20OR%20address%20ILIKE%20%273711%20Orpwood%20St%20Units%201%262%25%27%20OR%20address%20ILIKE%20%273817%20Bates%20St%25%27%29%20AND%20investigation_date%20%3E%3D%20%272024-01-01%27%20ORDER%20BY%20investigation_date%20DESC';
  
  console.log('Fetching property investigation data...');
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('API Response:', data);
  return data;
};

const PropertyInvestigationDashboard: React.FC = () => {
  const [showResults, setShowResults] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['propertyInvestigations'],
    queryFn: fetchPropertyData,
    enabled: showResults,
  });

  const handleFetchData = () => {
    console.log('Button clicked - fetching data...');
    setShowResults(true);
    if (showResults) {
      refetch();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'secondary';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('open') || statusLower.includes('pending')) return 'destructive';
    if (statusLower.includes('closed') || statusLower.includes('resolved')) return 'default';
    return 'secondary';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Property Investigation Dashboard
          </h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          View property investigation records from Pittsburgh's open data portal for specific addresses since 2024.
        </p>
        
        <Button 
          onClick={handleFetchData}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading Data...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              {showResults ? 'Refresh Data' : 'Fetch Investigation Data'}
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <FileText className="h-5 w-5" />
              <span className="font-medium">Error fetching data:</span>
            </div>
            <p className="text-red-600 mt-2">{error.message}</p>
          </CardContent>
        </Card>
      )}

      {showResults && data && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Investigation Records
            </CardTitle>
            <CardDescription>
              Found {data.result.records.length} investigation records for the specified addresses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.result.records.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No investigation records found for the specified criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {data.result.records.map((record, index) => (
                    <Card key={record._id || index} className="hover:shadow-md transition-shadow duration-200">
                      <CardContent className="pt-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-gray-900">{record.address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {formatDate(record.investigation_date)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {record.violation_type && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">Violation Type:</span>
                                <p className="text-sm text-gray-600">{record.violation_type}</p>
                              </div>
                            )}
                            {record.inspector && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">Inspector:</span>
                                <p className="text-sm text-gray-600">{record.inspector}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end justify-start gap-2">
                            {record.status && (
                              <Badge variant={getStatusColor(record.status)}>
                                {record.status}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">ID: {record._id}</span>
                          </div>
                        </div>
                        
                        {/* Show any additional fields that might be in the record */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <details className="group">
                            <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                              View all record details
                            </summary>
                            <div className="mt-2 p-3 bg-gray-50 rounded-md">
                              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                                {JSON.stringify(record, null, 2)}
                              </pre>
                            </div>
                          </details>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropertyInvestigationDashboard;
