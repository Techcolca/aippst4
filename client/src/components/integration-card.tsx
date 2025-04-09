import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, Filter } from "lucide-react";

interface IntegrationCardProps {
  name: string;
  url: string;
  active: boolean;
  visitorCount: number;
  installedDate: string;
  ignoredSections?: string[];
  onEdit: () => void;
  onViewAnalytics: () => void;
  onViewConversations?: () => void;
}

export default function IntegrationCard({
  name,
  url,
  active,
  visitorCount,
  installedDate,
  ignoredSections = [],
  onEdit,
  onViewAnalytics,
  onViewConversations
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
          Visitors helped: {visitorCount ? visitorCount.toLocaleString() : '0'}
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Calendar className="w-4 h-4 mr-2" />
          Installed: {installedDate}
        </div>
        {ignoredSections && ignoredSections.length > 0 && (
          <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
            <Filter className="w-4 h-4 mr-2 mt-0.5" />
            <div>
              <span>Ignored sections: </span>
              <span className="text-primary-600 dark:text-primary-400">{ignoredSections.length}</span>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {ignoredSections.slice(0, 2).map((section, index) => (
                  <span key={index} className="inline-block bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded mr-1 mb-1">
                    {section}
                  </span>
                ))}
                {ignoredSections.length > 2 && (
                  <span className="inline-block bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                    +{ignoredSections.length - 2} more
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEdit}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Edit
        </Button>
        
        <div className="flex gap-2">
          {onViewConversations && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewConversations}
              className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              Conversations
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onViewAnalytics}
            className="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
          >
            Analytics
          </Button>
        </div>
      </div>
    </Card>
  );
}
