import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Home } from 'lucide-react';

interface ViewToggleProps {
  isPropertyView: boolean;
  onToggle: (isPropertyView: boolean) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  isPropertyView,
  onToggle
}) => {
  return (
    <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
      <Button
        variant={!isPropertyView ? "default" : "ghost"}
        size="sm"
        onClick={() => onToggle(false)}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs ${
          !isPropertyView 
            ? "bg-blue-600 text-white hover:bg-blue-700" 
            : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
        }`}
      >
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Cases</span>
      </Button>
      <Button
        variant={isPropertyView ? "default" : "ghost"}
        size="sm"
        onClick={() => onToggle(true)}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs ${
          isPropertyView 
            ? "bg-blue-600 text-white hover:bg-blue-700" 
            : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
        }`}
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Properties</span>
      </Button>
    </div>
  );
};

export default ViewToggle;