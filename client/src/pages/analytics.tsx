import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardTabs from "@/components/dashboard-tabs";
import { CircleX, Clock, MessageSquare, BarChart, ArrowUp, ArrowDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/auth-context";

interface DashboardStats {
  totalConversations: number;
  resolutionRate: number;
  averageResponseTime: number;
}

export default function Analytics() {
  const { user } = useAuth();
  
  // Fetch dashboard stats
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
  });

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  // Format time in seconds to minutes and seconds
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Default stats when loading or no data
  const dashboardStats = stats || {
    totalConversations: 0,
    resolutionRate: 0,
    averageResponseTime: 0
  };

  return (
    <div className="container px-4 mx-auto py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Dashboard analytics and insights for your integrations and conversations.
          </p>
        </div>

        <DashboardTabs />

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading analytics data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <CircleX className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Failed to load analytics</h2>
            <p className="text-gray-600 dark:text-gray-400">There was an error loading the analytics data. Please try again later.</p>
          </div>
        ) : (
          <div>
            {/* Analytics Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.totalConversations.toLocaleString()}</div>
                  <p className="text-sm text-gray-500 mt-1">
                    Across all integrations
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                  <BarChart className="w-4 h-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatPercentage(dashboardStats.resolutionRate)}</div>
                  <div className="mt-2">
                    <Progress value={dashboardStats.resolutionRate} className="h-2" />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {dashboardStats.resolutionRate >= 70 ? (
                      <span className="text-green-500 flex items-center gap-1">
                        <ArrowUp className="w-3 h-3" /> Good performance
                      </span>
                    ) : dashboardStats.resolutionRate >= 40 ? (
                      <span className="text-yellow-500">Average performance</span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1">
                        <ArrowDown className="w-3 h-3" /> Needs improvement
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
                  <Clock className="w-4 h-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatTime(dashboardStats.averageResponseTime)}</div>
                  <p className="text-sm text-gray-500 mt-1">
                    {dashboardStats.averageResponseTime <= 30 ? (
                      <span className="text-green-500 flex items-center gap-1">
                        <ArrowUp className="w-3 h-3" /> Fast responses
                      </span>
                    ) : dashboardStats.averageResponseTime <= 60 ? (
                      <span className="text-yellow-500">Average speed</span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1">
                        <ArrowDown className="w-3 h-3" /> Slower than average
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional stats sections could be added here */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Conversation Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <p className="text-gray-500">Detailed conversation analytics are coming soon.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Integration Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <p className="text-gray-500">Integration performance data is coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}