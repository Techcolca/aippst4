import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend,
  Cell
} from "recharts";
import { IntegrationPerformance } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface IntegrationPerformanceChartProps {
  data: IntegrationPerformance[];
  loading?: boolean;
}

export default function IntegrationPerformanceChart({ data, loading = false }: IntegrationPerformanceChartProps) {
  // Componente de tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 p-3 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span style={{ color: "#3b82f6" }}>●</span>
              <span className="ml-1">Tiempo de respuesta: </span>
              <span className="font-semibold">{payload[0].value}s</span>
            </p>
            <p className="text-sm">
              <span style={{ color: "#10b981" }}>●</span>
              <span className="ml-1">Tasa de resolución: </span>
              <span className="font-semibold">{payload[1].value}%</span>
            </p>
            <p className="text-sm">
              <span style={{ color: "#f59e0b" }}>●</span>
              <span className="ml-1">Satisfacción: </span>
              <span className="font-semibold">{payload[2].value}%</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Conversaciones: {payload[3].payload.conversationCount}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Preprocesar datos para mostrar
  const processedData = data.map(item => ({
    name: item.integrationName.length > 15 
      ? `${item.integrationName.substring(0, 15)}...` 
      : item.integrationName,
    responseTime: item.responseTime,
    resolutionRate: item.resolutionRate,
    satisfaction: item.userSatisfaction,
    conversationCount: item.conversationCount,
    originalName: item.integrationName // Para mostrar nombre completo en tooltip
  }));
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rendimiento de Integraciones</CardTitle>
          <Skeleton className="h-4 w-[250px] mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Rendimiento de Integraciones</CardTitle>
        <p className="text-sm text-gray-500">
          Comparativa de las métricas de rendimiento entre tus integraciones
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No hay datos suficientes para mostrar</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={processedData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  label={{ 
                    value: 'Segundos', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: 12, fill: '#3b82f6' }
                  }}
                  tick={{ fontSize: 12 }}
                  stroke="#3b82f6"
                  domain={[0, 'dataMax']}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  label={{ 
                    value: 'Porcentaje', 
                    angle: 90, 
                    position: 'insideRight',
                    style: { textAnchor: 'middle', fontSize: 12, fill: '#888' }
                  }}
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="responseTime" 
                  name="Tiempo de respuesta" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="resolutionRate" 
                  name="Tasa de resolución" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="satisfaction" 
                  name="Satisfacción" 
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}