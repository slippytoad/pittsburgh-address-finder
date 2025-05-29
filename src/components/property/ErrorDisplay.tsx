
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface ErrorDisplayProps {
  error: Error;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-red-700">
          <FileText className="h-5 w-5" />
          <span className="font-medium">Error fetching data:</span>
        </div>
        <p className="text-red-600 mt-2">{error.message}</p>
      </CardContent>
    </Card>
  );
};

export default ErrorDisplay;
