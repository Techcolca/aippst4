import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  ChevronLeft, 
  BarChart2, 
  PieChart, 
  LineChart, 
  Users, 
  MessageSquare, 
  CheckCircle,
  ShoppingCart,
  MessageCircle,
  Tag
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart as ReLineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

// Colores para los gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function IntegrationAnalytics() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  
  // Obtener la integración específica
  const { data: integration, isLoading: isLoadingIntegration } = useQuery({
    queryKey: [`/api/integrations/${id}`],
  });

  // Obtener estadísticas específicas de esta integración
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: [`/api/analytics/integration/${id}`],
  });

  // Obtener conversaciones de esta integración para crear gráficos
  const { data: conversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: [`/api/integrations/${id}/conversations`],
  });

  // Función para preparar datos para el gráfico de tendencias (podrían ser por día)
  const prepareConversationTrendData = () => {
    if (!stats?.conversationTrend) return [];
    return stats.conversationTrend;
  };

  // Función para preparar datos para el gráfico de resolución
  const prepareResolutionData = () => {
    if (!stats) return [];
    
    return [
      { name: t('resolved'), value: stats.resolvedConversations || 0 },
      { name: t('active'), value: (stats.totalConversations || 0) - (stats.resolvedConversations || 0) }
    ];
  };

  // Preparar datos para top productos
  const prepareTopProductsData = () => {
    if (!stats?.topProducts) return [];
    return stats.topProducts.slice(0, 5); // Solo los top 5
  };

  // Preparar datos para top temas
  const prepareTopTopicsData = () => {
    if (!stats?.topTopics) return [];
    return stats.topTopics.slice(0, 5); // Solo los top 5
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-full px-6 py-6">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="mr-2" 
              onClick={() => navigate("/dashboard?tab=integrations")}
              title={t('back')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isLoadingIntegration 
                  ? t('loading') 
                  : `${t('analytics_for')} ${integration?.name || id}`}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {t('view_performance_metrics_for_integration')}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={() => navigate(`/integrations/${id}/edit`)}
              variant="outline"
            >
              {t('edit_integration')}
            </Button>
            <Button 
              onClick={() => navigate(`/integrations/${id}/conversations`)}
              variant="outline"
            >
              {t('view_conversations')}
            </Button>
          </div>
        </div>

        {isLoadingStats || isLoadingConversations ? (
          <div className="w-full py-20 flex justify-center">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('total_conversations')}
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalConversations || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.messageCount ? t('total_messages', { count: stats.messageCount }) : t('no_messages')}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('resolution_rate')}
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalConversations 
                      ? `${Math.round((stats.resolvedConversations / stats.totalConversations) * 100)}%`
                      : '0%'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.totalConversations 
                      ? t('resolved_conversations_count', { 
                          count: stats.resolvedConversations,
                          total: stats.totalConversations
                        })
                      : t('no_conversations_to_resolve')}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('message_distribution')}
                  </CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.userMessageCount 
                      ? `${Math.round((stats.userMessageCount / stats.messageCount) * 100)}% / ${Math.round((stats.assistantMessageCount / stats.messageCount) * 100)}%`
                      : '0% / 0%'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('user_vs_assistant_messages')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>{t('conversation_trend')}</CardTitle>
                  <CardDescription>
                    {t('conversations_over_time')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={prepareConversationTrendData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="count"
                          name={t('conversations')}
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('resolution_status')}</CardTitle>
                  <CardDescription>
                    {t('resolved_vs_active_conversations')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={prepareResolutionData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {prepareResolutionData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos de productos y temas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>{t('top_products')}</CardTitle>
                    <CardDescription>
                      {t('most_mentioned_products')}
                    </CardDescription>
                  </div>
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={prepareTopProductsData()}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="frequency" name={t('mentions')} fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>{t('top_topics')}</CardTitle>
                    <CardDescription>
                      {t('most_discussed_topics')}
                    </CardDescription>
                  </div>
                  <Tag className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={prepareTopTopicsData()}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="topic" type="category" width={150} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="frequency" name={t('mentions')} fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}