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
  Tag,
  Download
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
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import KeywordCloud from "@/components/analytics/keyword-cloud";

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
  
  // Función para generar y descargar el informe PDF
  const downloadPdfReport = async () => {
    if (!integration || !stats) return;
    
    try {
      // Capturar gráficos como imágenes
      const trendChartElement = document.getElementById('trend-chart');
      const resolutionChartElement = document.getElementById('resolution-chart');
      const productsChartElement = document.getElementById('products-chart');
      const topicsChartElement = document.getElementById('topics-chart');
      
      // Crear nuevo documento PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const date = new Date().toLocaleDateString();
      
      // Título y metadatos del informe
      doc.setFontSize(18);
      doc.text(`Reporte de Analíticas: ${integration.name}`, pageWidth / 2, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Generado: ${date}`, pageWidth / 2, 28, { align: 'center' });
      doc.setLineWidth(0.5);
      doc.line(15, 35, pageWidth - 15, 35);
      
      // Resumen de estadísticas
      doc.setFontSize(14);
      doc.text('Resumen', 15, 45);
      
      const summaryData = [
        ['Conversaciones Totales', stats.totalConversations || 0],
        ['Conversaciones Resueltas', stats.resolvedConversations || 0],
        ['Tasa de Resolución', stats.totalConversations 
          ? `${Math.round((stats.resolvedConversations / stats.totalConversations) * 100)}%`
          : '0%'],
        ['Mensajes Totales', stats.messageCount || 0],
        ['Mensajes de Usuario', stats.userMessageCount || 0],
        ['Mensajes del Asistente', stats.assistantMessageCount || 0],
        ['Visitantes Únicos', stats.uniqueVisitors || 0],
      ];
      
      // Añadir tabla de resumen
      autoTable(doc, {
        head: [['Métrica', 'Valor']],
        body: summaryData,
        startY: 50,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 66, 66] }
      });
      
      // Obtener posición después de la tabla
      let lastY = 130;
      
      // Añadir tendencia de conversaciones (gráfico)
      if (trendChartElement) {
        try {
          doc.setFontSize(14);
          doc.text('Tendencia de Conversaciones', 15, lastY);
          
          const trendCanvas = await html2canvas(trendChartElement);
          const trendImgData = trendCanvas.toDataURL('image/png');
          
          // Ajustar tamaño para que quepa en la página
          const imgWidth = 180;
          const imgHeight = 100;
          
          doc.addImage(
            trendImgData, 
            'PNG', 
            15, // x
            lastY + 5, // y
            imgWidth, 
            imgHeight
          );
          
          lastY += imgHeight + 15;
        } catch (error) {
          console.error('Error al capturar gráfico de tendencias:', error);
          doc.setFontSize(10);
          doc.text('Error al generar gráfico de tendencias', 15, lastY + 5);
          lastY += 10;
        }
      }
      
      // Añadir detalles de resolución (gráfico)
      if (resolutionChartElement && lastY < pageHeight - 30) {
        try {
          // Si no hay espacio suficiente, nueva página
          if (lastY > pageHeight - 120) {
            doc.addPage();
            lastY = 20;
          }
          
          doc.setFontSize(14);
          doc.text('Estado de Resolución', 15, lastY);
          
          const resolutionCanvas = await html2canvas(resolutionChartElement);
          const resolutionImgData = resolutionCanvas.toDataURL('image/png');
          
          // Ajustar tamaño para que quepa en la página
          const imgWidth = 180;
          const imgHeight = 100;
          
          doc.addImage(
            resolutionImgData, 
            'PNG', 
            15, // x
            lastY + 5, // y
            imgWidth, 
            imgHeight
          );
          
          lastY += imgHeight + 15;
        } catch (error) {
          console.error('Error al capturar gráfico de resolución:', error);
        }
      }
      
      // Nueva página para productos y temas
      doc.addPage();
      lastY = 20;
      
      // Añadir productos más mencionados (gráfico)
      if (productsChartElement) {
        try {
          doc.setFontSize(14);
          doc.text('Productos más Mencionados', 15, lastY);
          
          const productsCanvas = await html2canvas(productsChartElement);
          const productsImgData = productsCanvas.toDataURL('image/png');
          
          // Ajustar tamaño para que quepa en la página
          const imgWidth = 180;
          const imgHeight = 100;
          
          doc.addImage(
            productsImgData, 
            'PNG', 
            15, // x
            lastY + 5, // y
            imgWidth, 
            imgHeight
          );
          
          lastY += imgHeight + 15;
        } catch (error) {
          console.error('Error al capturar gráfico de productos:', error);
          
          // Mostrar datos en forma de tabla si falla la captura del gráfico
          if (stats.topProducts && stats.topProducts.length > 0) {
            const productsData = stats.topProducts.map(item => [item.name, item.frequency]);
            
            autoTable(doc, {
              head: [['Producto', 'Menciones']],
              body: productsData,
              startY: lastY + 5,
              theme: 'grid',
              styles: { fontSize: 10 },
              headStyles: { fillColor: [66, 66, 66] }
            });
            lastY += 50; // Estimación después de tabla
          } else {
            doc.setFontSize(10);
            doc.text('No hay datos de productos disponibles.', 15, lastY + 5);
            lastY += 10;
          }
        }
      }
      
      // Añadir temas más discutidos (gráfico)
      if (topicsChartElement && lastY < pageHeight - 30) {
        try {
          // Si no hay espacio suficiente, nueva página
          if (lastY > pageHeight - 120) {
            doc.addPage();
            lastY = 20;
          }
          
          doc.setFontSize(14);
          doc.text('Temas más Discutidos', 15, lastY);
          
          const topicsCanvas = await html2canvas(topicsChartElement);
          const topicsImgData = topicsCanvas.toDataURL('image/png');
          
          // Ajustar tamaño para que quepa en la página
          const imgWidth = 180;
          const imgHeight = 100;
          
          doc.addImage(
            topicsImgData, 
            'PNG', 
            15, // x
            lastY + 5, // y
            imgWidth, 
            imgHeight
          );
        } catch (error) {
          console.error('Error al capturar gráfico de temas:', error);
          
          // Mostrar datos en forma de tabla si falla la captura del gráfico
          if (stats.topTopics && stats.topTopics.length > 0) {
            const topicsData = stats.topTopics.map(item => [item.topic, item.frequency]);
            
            autoTable(doc, {
              head: [['Tema', 'Menciones']],
              body: topicsData,
              startY: lastY + 5,
              theme: 'grid',
              styles: { fontSize: 10 },
              headStyles: { fillColor: [66, 66, 66] }
            });
          } else {
            doc.setFontSize(10);
            doc.text('No hay datos de temas disponibles.', 15, lastY + 5);
          }
        }
      }
      
      // Añadir pie de página
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount} - AIPI Analytics`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }
      
      // Guardar el PDF
      doc.save(`analytics_${integration.name.replace(/\s+/g, '_')}_${date.replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor intente de nuevo.');
    }
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
            <Button 
              onClick={downloadPdfReport}
              variant="default"
              className="flex items-center gap-2"
              disabled={isLoadingStats || isLoadingIntegration}
            >
              <Download className="h-4 w-4" />
              {t('download_pdf') || "Descargar PDF"}
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
                  <div className="h-80" id="trend-chart">
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
                  <div className="h-80" id="resolution-chart">
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
                  <div className="h-80" id="products-chart">
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
                  <div className="h-80" id="topics-chart">
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

            {/* Keywords Cloud Section */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center">
                  <div className="grid gap-2">
                    <CardTitle>{t('keyword_cloud')}</CardTitle>
                    <CardDescription>
                      {t('frequently_mentioned_keywords')}
                    </CardDescription>
                  </div>
                  <Tag className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <KeywordCloud 
                    data={stats?.keywordFrequency || []} 
                    loading={isLoadingStats}
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}