import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
  color: "primary" | "secondary" | "accent";
}

export default function StatCard({ title, value, change, icon, color }: StatCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case "secondary":
        return "bg-green-100 dark:bg-green-900 text-green-500";
      case "accent":
        return "bg-purple-100 dark:bg-purple-900 text-purple-500";
      case "primary":
      default:
        return "bg-primary-100 dark:bg-primary-900 text-primary-500";
    }
  };
  
  const getChangeColor = () => {
    if (!change) return "";
    return change > 0 ? "text-green-500" : "text-red-500";
  };
  
  const changeIcon = change && change > 0 ? (
    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
    </svg>
  ) : (
    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
    </svg>
  );
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${getColorClasses()}`}>
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          </div>
        </div>
        
        {change && (
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className={`flex items-center ${getChangeColor()}`}>
                {changeIcon}
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
