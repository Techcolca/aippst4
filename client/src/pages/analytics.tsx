import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleX, Clock, MessageSquare, BarChart, ArrowUp, ArrowDown, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/auth-context";
import ProductDemandChart from "@/components/analytics/product-demand-chart";
import TopicSentimentChart from "@/components/analytics/topic-sentiment-chart";
import ConversationTrendChart from "@/components/analytics/conversation-trend-chart";
import KeywordCloud from "@/components/analytics/keyword-cloud";
import IntegrationPerformanceChart from "@/components/analytics/integration-performance-chart";
import { 
  DashboardStats, 
  ConversationAnalytics, 
  IntegrationPerformance 
} from "@shared/schema";

export default function Analytics() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
  });

  // Fetch conversation analytics
  const { 
    data: conversationAnalytics, 
    isLoading: isLoadingConversation,
    error: conversationError
  } = useQuery<ConversationAnalytics>({
    queryKey: ["/api/analytics/conversation"],
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch integration performance
  const { 
    data: integrationPerformance,
    isLoading: isLoadingPerformance,
    error: performanceError
  } = useQuery<IntegrationPerformance[]>({
    queryKey: ["/api/analytics/integration-performance"],
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
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

  // Verifica si hay algún error en las peticiones
  const hasError = statsError || conversationError || performanceError;
  const isLoading = isLoadingStats || isLoadingConversation || isLoadingPerformance;

  return (
    <div className="container px-4 mx-auto py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Dashboard analytics and insights for your integrations and conversations.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="outline" 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>


        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading analytics data...</p>
            </div>
          </div>
        ) : hasError ? (
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

            {/* Conversation Analytics Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Análisis de Conversaciones</h2>
              
              {/* Products and Topics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ProductDemandChart 
                  data={conversationAnalytics?.topProducts || []} 
                  loading={isLoadingConversation}
                />
                
                <TopicSentimentChart 
                  data={conversationAnalytics?.topTopics || []} 
                  loading={isLoadingConversation}
                />
              </div>
              
              {/* Trend and Keywords */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ConversationTrendChart 
                  data={conversationAnalytics?.conversationsByDay || []} 
                  loading={isLoadingConversation}
                />
                
                <KeywordCloud 
                  data={conversationAnalytics?.keywordFrequency || []} 
                  loading={isLoadingConversation}
                />
              </div>
            </div>

            {/* Integration Performance Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Rendimiento de Integraciones</h2>
              
              <IntegrationPerformanceChart 
                data={integrationPerformance || []} 
                loading={isLoadingPerformance}
              />
            </div>
            
            {/* Additional Metrics Section */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Análisis Avanzado</CardTitle>
                  <CardDescription>
                    Métricas adicionales para comprender mejor el comportamiento de tus integraciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Promedio de mensajes</h3>
                      <p className="text-2xl font-bold mt-1">5.3</p>
                      <p className="text-xs text-gray-500 mt-1">mensajes por conversación</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Duración promedio</h3>
                      <p className="text-2xl font-bold mt-1">4m 12s</p>
                      <p className="text-xs text-gray-500 mt-1">tiempo por conversación</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Horario pico</h3>
                      <p className="text-2xl font-bold mt-1">14:00 - 16:00</p>
                      <p className="text-xs text-gray-500 mt-1">mayor actividad</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dispositivos</h3>
                      <p className="text-2xl font-bold mt-1">68% / 32%</p>
                      <p className="text-xs text-gray-500 mt-1">móvil / escritorio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}