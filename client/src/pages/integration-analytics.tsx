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
import { ChevronLeft, BarChart2, PieChart, LineChart, Users, MessageSquare, CheckCircle } from "lucide-react";
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
    if (!conversations) return [];
    
    // Agrupar conversaciones por día
    const lastDays = 7; // Últimos 7 días
    const groupedByDay: {[key: string]: number} = {};
    
    // Inicializar los últimos días con 0 conversaciones
    for (let i = 0; i < lastDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      groupedByDay[dateStr] = 0;
    }
    
    // Contar conversaciones por día
    conversations.forEach((conv: any) => {
      const dateStr = new Date(conv.createdAt).toISOString().split('T')[0];
      // Solo contar si está dentro de los últimos días
      if (groupedByDay[dateStr] !== undefined) {
        groupedByDay[dateStr]++;
      }
    });
    
    // Convertir a formato para gráfico
    return Object.entries(groupedByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  // Función para preparar datos para el gráfico de resolución
  const prepareResolutionData = () => {
    if (!conversations) return [];
    
    const resolved = conversations.filter((conv: any) => conv.resolved).length;
    const active = conversations.length - resolved;
    
    return [
      { name: t('resolved'), value: resolved },
      { name: t('active'), value: active }
    ];
  };

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center mb-6">
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

        <div className="flex gap-4 mb-6">
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
                    {conversations?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {conversations && conversations.length > 0 
                      ? t('since_first_conversation', {
                          date: new Date(
                            Math.min(...conversations.map((c: any) => new Date(c.createdAt).getTime()))
                          ).toLocaleDateString()
                        })
                      : t('no_conversations_yet')}
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
                    {conversations && conversations.length > 0 
                      ? `${Math.round((conversations.filter((c: any) => c.resolved).length / conversations.length) * 100)}%`
                      : '0%'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {conversations && conversations.length > 0 
                      ? t('resolved_conversations_count', { 
                          count: conversations.filter((c: any) => c.resolved).length,
                          total: conversations.length
                        })
                      : t('no_conversations_to_resolve')}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('unique_visitors')}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {conversations 
                      ? new Set(conversations.map((c: any) => c.visitorId).filter(Boolean)).size
                      : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {conversations && conversations.length > 0
                      ? t('unique_visitors_percentage', {
                          percentage: Math.round(
                            (new Set(conversations.map((c: any) => c.visitorId).filter(Boolean)).size / 
                            conversations.length) * 100
                          )
                        })
                      : t('no_visitor_data')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                      <ReLineChart
                        data={prepareConversationTrendData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          name={t('conversations')}
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                      </ReLineChart>
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}