import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Eye } from "lucide-react";

interface AutomationCardProps {
  name: string;
  description: string;
  status: "active" | "inactive" | "in_testing";
  lastModified: string;
  processedCount: number;
  onEdit: () => void;
  onViewAnalytics: () => void;
}

export default function AutomationCard({
  name,
  description,
  status,
  lastModified,
  processedCount,
  onEdit,
  onViewAnalytics
}: AutomationCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
            Active
          </span>
        );
      case "inactive":
        return (
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full">
            Inactive
          </span>
        );
      case "in_testing":
        return (
          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
            In Testing
          </span>
        );
    }
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <div className="flex items-center">
          {getStatusBadge()}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Calendar className="w-4 h-4 mr-2" />
          Last modified: {lastModified}
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Eye className="w-4 h-4 mr-2" />
          Processed: {processedCount} {processedCount === 1 ? 'item' : 'items'}
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEdit}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Edit
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onViewAnalytics}
          className="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
        >
          View Analytics
        </Button>
      </div>
    </Card>
  );
}
