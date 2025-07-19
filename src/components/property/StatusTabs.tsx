import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface StatusTabsProps {
  availableStatuses: string[];
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
  statusCounts: Record<string, number>;
  onAddressSearch?: (search: string) => void;
  addressSearch?: string;
}

const StatusTabs: React.FC<StatusTabsProps> = ({
  availableStatuses,
  selectedStatuses,
  onStatusChange,
  statusCounts,
  onAddressSearch,
  addressSearch = '',
}) => {
  const totalCases = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
  
  // Define the groups
  const inViolationStatuses = ['IN VIOLATION', 'IN COURT', 'READY TO CLOSE'];
  const closedStatuses = ['CLOSED'];
  
  // Calculate counts for each tab
  const inViolationCount = inViolationStatuses.reduce((sum, status) => sum + (statusCounts[status] || 0), 0);
  const closedCount = closedStatuses.reduce((sum, status) => sum + (statusCounts[status] || 0), 0);
  
  // Determine current tab based on selected statuses
  const getCurrentTab = () => {
    if (selectedStatuses.length === 0) return 'all';
    if (selectedStatuses.length === 1 && closedStatuses.includes(selectedStatuses[0])) return 'closed';
    if (selectedStatuses.every(status => inViolationStatuses.includes(status))) return 'in-violation';
    return 'all';
  };

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'all':
        onStatusChange([]);
        break;
      case 'closed':
        onStatusChange(closedStatuses.filter(status => availableStatuses.includes(status)));
        break;
      case 'in-violation':
        onStatusChange(inViolationStatuses.filter(status => availableStatuses.includes(status)));
        break;
    }
  };

  const handleClearSearch = () => {
    if (onAddressSearch) {
      onAddressSearch('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Tabs */}
      <Tabs value={getCurrentTab()} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({totalCases})</TabsTrigger>
          <TabsTrigger value="in-violation">In Violation ({inViolationCount})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closedCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Address search */}
      {onAddressSearch && (
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by address..."
            value={addressSearch}
            onChange={(e) => onAddressSearch(e.target.value)}
            className="pl-12 pr-10 py-3 rounded-full border-gray-300 focus:border-gray-900 focus:ring-gray-900 text-base"
          />
          {addressSearch && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusTabs;