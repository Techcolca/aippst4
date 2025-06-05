import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleX, Clock, MessageSquare, BarChart, ArrowUp, ArrowDown, ArrowLeft, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/auth-context";
import { useTranslation } from "react-i18next";
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
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";

export default function Analytics() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  
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
  
  // Función para generar y descargar el informe PDF
  const downloadPdfReport = async () => {
    if (!stats || !conversationAnalytics || !integrationPerformance) return;
    
    try {
      // Capturar gráficos como imágenes
      const productsChartElement = document.getElementById('products-chart');
      const topicsChartElement = document.getElementById('topics-chart');
      const trendChartElement = document.getElementById('trend-chart');
      const keywordsElement = document.getElementById('keywords-chart');
      const integrationPerformanceElement = document.getElementById('integration-performance-chart');
      
      // Crear nuevo documento PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const date = new Date().toLocaleDateString();
      
      // Título y metadatos del informe
      doc.setFontSize(18);
      doc.text(`Reporte de Analíticas AIPI`, pageWidth / 2, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Generado: ${date}`, pageWidth / 2, 28, { align: 'center' });
      doc.setLineWidth(0.5);
      doc.line(15, 35, pageWidth - 15, 35);
      
      // Resumen de estadísticas
      doc.setFontSize(14);
      doc.text('Resumen', 15, 45);
      
      const summaryData = [
        ['Conversaciones Totales', dashboardStats.totalConversations || 0],
        ['Tasa de Resolución', `${formatPercentage(dashboardStats.resolutionRate)}`],
        ['Tiempo Promedio de Respuesta', formatTime(dashboardStats.averageResponseTime)],
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
      let lastY = 120;
      
      // Añadir gráfico de productos más demandados
      if (productsChartElement) {
        try {
          doc.setFontSize(14);
          doc.text('Productos y Servicios Más Demandados', 15, lastY);
          
          // Añadir descripción explicativa
          doc.setFontSize(9);
          doc.setTextColor(40, 40, 40); // Color más oscuro para mejor visibilidad
          doc.text('Las barras más largas indican productos/servicios mencionados con mayor frecuencia', 15, lastY + 8);
          doc.text('en las conversaciones, lo que sugiere mayor interés o demanda.', 15, lastY + 12);
          
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
          if (conversationAnalytics?.topProducts && conversationAnalytics.topProducts.length > 0) {
            const productsData = conversationAnalytics.topProducts.map(item => [item.name, item.count]);
            
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
      
      // Si no hay espacio suficiente, nueva página
      if (lastY > pageHeight - 100) {
        doc.addPage();
        lastY = 20;
      }
      
      // Añadir gráfico de temas más discutidos
      if (topicsChartElement) {
        try {
          doc.setFontSize(14);
          doc.text('Temas Más Discutidos', 15, lastY);
          
          // Añadir descripción explicativa
          doc.setFontSize(9);
          doc.setTextColor(40, 40, 40); // Color más oscuro para mejor visibilidad
          doc.text('Las barras muestran la frecuencia de cada tema y el color indica el sentimiento asociado.', 15, lastY + 8);
          doc.text('Un mayor porcentaje indica un nivel más alto de satisfacción con ese tema.', 15, lastY + 12);
          
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
          
          lastY += imgHeight + 15;
        } catch (error) {
          console.error('Error al capturar gráfico de temas:', error);
          
          // Mostrar datos en forma de tabla si falla la captura del gráfico
          if (conversationAnalytics?.topTopics && conversationAnalytics.topTopics.length > 0) {
            const topicsData = conversationAnalytics.topTopics.map(item => [item.topic, item.sentiment]);
            
            autoTable(doc, {
              head: [['Tema', 'Sentimiento']],
              body: topicsData,
              startY: lastY + 5,
              theme: 'grid',
              styles: { fontSize: 10 },
              headStyles: { fillColor: [66, 66, 66] }
            });
            lastY += 50;
          } else {
            doc.setFontSize(10);
            doc.text('No hay datos de temas disponibles.', 15, lastY + 5);
            lastY += 10;
          }
        }
      }
      
      // Nueva página para tendencia y palabras clave
      doc.addPage();
      lastY = 20;
      
      // Añadir gráfico de tendencia de conversaciones
      if (trendChartElement) {
        try {
          doc.setFontSize(14);
          doc.text('Tendencia de Conversaciones', 15, lastY);
          
          // Añadir descripción explicativa
          doc.setFontSize(9);
          doc.setTextColor(40, 40, 40); // Color más oscuro para mejor visibilidad
          doc.text('La línea muestra cómo cambia el volumen de conversaciones a lo largo del tiempo.', 15, lastY + 8);
          doc.text('Los picos indican días con mayor actividad, útil para identificar patrones y tendencias.', 15, lastY + 12);
          
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
          console.error('Error al capturar gráfico de tendencia:', error);
          
          // Mostrar datos en forma de tabla si falla la captura del gráfico
          if (conversationAnalytics?.conversationsByDay && conversationAnalytics.conversationsByDay.length > 0) {
            const trendData = conversationAnalytics.conversationsByDay.map(item => [item.date, item.count]);
            
            autoTable(doc, {
              head: [['Fecha', 'Número de Conversaciones']],
              body: trendData,
              startY: lastY + 5,
              theme: 'grid',
              styles: { fontSize: 10 },
              headStyles: { fillColor: [66, 66, 66] }
            });
            lastY += 50;
          } else {
            doc.setFontSize(10);
            doc.text('No hay datos de tendencia disponibles.', 15, lastY + 5);
            lastY += 10;
          }
        }
      }
      
      // Añadir nube de palabras clave
      if (keywordsElement && lastY < pageHeight - 100) {
        try {
          doc.setFontSize(14);
          doc.text('Palabras Clave', 15, lastY);
          
          // Añadir descripción explicativa
          doc.setFontSize(9);
          doc.setTextColor(40, 40, 40); // Color más oscuro para mejor visibilidad
          doc.text('Las palabras más grandes aparecen con mayor frecuencia en las conversaciones.', 15, lastY + 8);
          doc.text('Esto ayuda a identificar los términos e intereses principales de los visitantes.', 15, lastY + 12);
          
          const keywordsCanvas = await html2canvas(keywordsElement);
          const keywordsImgData = keywordsCanvas.toDataURL('image/png');
          
          // Ajustar tamaño para que quepa en la página
          const imgWidth = 180;
          const imgHeight = 100;
          
          doc.addImage(
            keywordsImgData, 
            'PNG', 
            15, // x
            lastY + 16, // y
            imgWidth, 
            imgHeight
          );
          
          lastY += imgHeight + 25;
          
          // Si no hay espacio suficiente, nueva página
          if (lastY > pageHeight - 100) {
            doc.addPage();
            lastY = 20;
          }
        } catch (error) {
          console.error('Error al capturar nube de palabras:', error);
          
          // Mostrar mensaje si falla la captura del gráfico
          doc.setFontSize(10);
          doc.text('No fue posible generar la nube de palabras clave.', 15, lastY + 5);
          lastY += 15;
          
          // Si no hay espacio suficiente, nueva página
          if (lastY > pageHeight - 100) {
            doc.addPage();
            lastY = 20;
          }
        }
      }
      
      // Si hay espacio, añadir rendimiento de integraciones
      if (lastY < pageHeight - 100 && integrationPerformanceElement) {
        try {
          doc.setFontSize(14);
          doc.text('Rendimiento de Integraciones', 15, lastY);
          
          // Añadir descripción explicativa
          doc.setFontSize(9);
          doc.setTextColor(40, 40, 40); // Color más oscuro para mejor visibilidad
          doc.text('Las barras muestran el rendimiento de cada integración en 3 métricas: tiempo de respuesta (azul),', 15, lastY + 8);
          doc.text('tasa de resolución (verde) y satisfacción del usuario (naranja). Valores más altos indican mejor rendimiento.', 15, lastY + 12);
          
          const performanceCanvas = await html2canvas(integrationPerformanceElement);
          const performanceImgData = performanceCanvas.toDataURL('image/png');
          
          // Ajustar tamaño para que quepa en la página
          const imgWidth = 180;
          const imgHeight = 100;
          
          doc.addImage(
            performanceImgData, 
            'PNG', 
            15, // x
            lastY + 5, // y
            imgWidth, 
            imgHeight
          );
          
        } catch (error) {
          console.error('Error al capturar gráfico de rendimiento:', error);
          
          // Mostrar datos en forma de tabla si falla la captura del gráfico
          if (integrationPerformance && integrationPerformance.length > 0) {
            const performanceData = integrationPerformance.map(item => [
              item.integrationName || 'Desconocido',
              item.conversationCount || 0,
              `${Math.round(item.resolutionRate || 0)}%`,
              `${Math.round(item.userSatisfaction || 0)}%`
            ]);
            
            autoTable(doc, {
              head: [['Integración', 'Conversaciones', 'Tasa de Resolución', 'Satisfacción']],
              body: performanceData,
              startY: lastY + 5,
              theme: 'grid',
              styles: { fontSize: 9 },
              headStyles: { fillColor: [66, 66, 66] }
            });
          } else {
            doc.setFontSize(10);
            doc.text('No hay datos de rendimiento disponibles.', 15, lastY + 5);
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
      doc.save(`analytics_report_${date.replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor intente de nuevo.');
    }
  };

  return (
    <div className="container px-4 mx-auto py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("analytics")}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("analytics_description")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={downloadPdfReport}
              variant="default" 
              className="flex items-center gap-2"
              disabled={Boolean(isLoading || hasError)}
            >
              <Download className="w-4 h-4" />
              {t("export_pdf")}
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline" 
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("back_to_dashboard")}
            </Button>
          </div>
        </div>


        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">{t("loading_analytics")}</p>
            </div>
          </div>
        ) : hasError ? (
          <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <CircleX className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t("analytics_error")}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t("analytics_error_description")}</p>
          </div>
        ) : (
          <div>
            {/* Analytics Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{t("total_conversations")}</CardTitle>
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.totalConversations.toLocaleString()}</div>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("all_integrations")}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{t("resolution_rate")}</CardTitle>
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
                        <ArrowUp className="w-3 h-3" /> {t("good_performance")}
                      </span>
                    ) : dashboardStats.resolutionRate >= 40 ? (
                      <span className="text-yellow-500">{t("average_performance")}</span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1">
                        <ArrowDown className="w-3 h-3" /> {t("needs_improvement")}
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{t("avg_response_time")}</CardTitle>
                  <Clock className="w-4 h-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatTime(dashboardStats.averageResponseTime)}</div>
                  <p className="text-sm text-gray-500 mt-1">
                    {dashboardStats.averageResponseTime <= 30 ? (
                      <span className="text-green-500 flex items-center gap-1">
                        <ArrowUp className="w-3 h-3" /> {t("fast_responses")}
                      </span>
                    ) : dashboardStats.averageResponseTime <= 60 ? (
                      <span className="text-yellow-500">{t("average_speed")}</span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1">
                        <ArrowDown className="w-3 h-3" /> {t("slower_than_average")}
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Conversation Analytics Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{t("conversation_analysis")}</h2>
              
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
              <h2 className="text-2xl font-bold mb-4">{t("integration_performance")}</h2>
              
              <IntegrationPerformanceChart 
                data={integrationPerformance || []} 
                loading={isLoadingPerformance}
              />
            </div>
            
            {/* Additional Metrics Section */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>{t("advanced_analysis")}</CardTitle>
                  <CardDescription>
                    {t("advanced_metrics")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-800/30 rounded-lg shadow-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 card-text-enhance">Promedio de mensajes</h3>
                      <p className="text-2xl font-bold mt-1 card-text-enhance">5.3</p>
                      <p className="text-xs text-gray-500 mt-1 card-text-enhance">mensajes por conversación</p>
                    </div>
                    
                    <div className="p-4 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-800/30 rounded-lg shadow-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 card-text-enhance">Duración promedio</h3>
                      <p className="text-2xl font-bold mt-1 card-text-enhance">4m 12s</p>
                      <p className="text-xs text-gray-500 mt-1 card-text-enhance">tiempo por conversación</p>
                    </div>
                    
                    <div className="p-4 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-800/30 rounded-lg shadow-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 card-text-enhance">Horario pico</h3>
                      <p className="text-2xl font-bold mt-1 card-text-enhance">14:00 - 16:00</p>
                      <p className="text-xs text-gray-500 mt-1 card-text-enhance">mayor actividad</p>
                    </div>
                    
                    <div className="p-4 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-800/30 rounded-lg shadow-lg">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 card-text-enhance">Dispositivos</h3>
                      <p className="text-2xl font-bold mt-1 card-text-enhance">68% / 32%</p>
                      <p className="text-xs text-gray-500 mt-1 card-text-enhance">móvil / escritorio</p>
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