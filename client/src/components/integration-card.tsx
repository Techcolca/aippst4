import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Eye } from "lucide-react";

interface IntegrationCardProps {
  name: string;
  url: string;
  active: boolean;
  visitorCount: number;
  installedDate: string;
  onEdit: () => void;
  onViewAnalytics: () => void;
}

export default function IntegrationCard({
  name,
  url,
  active,
  visitorCount,
  installedDate,
  onEdit,
  onViewAnalytics
}: IntegrationCardProps) {
  return (
    <Card className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium">{name}</h3>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            {url}
          </a>
        </div>
        <div className="flex items-center">
          <span className={`px-2 py-1 text-xs ${
            active 
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
          } rounded-full`}>
            {active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Eye className="w-4 h-4 mr-2" />
          Visitors helped: {visitorCount.toLocaleString()}
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4 mr-2" />
          Installed: {installedDate}
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
