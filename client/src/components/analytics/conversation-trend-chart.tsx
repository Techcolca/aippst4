import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface ConversationTrendChartProps {
  data: {
    date: string;
    count: number;
  }[];
  loading?: boolean;
}

export default function ConversationTrendChart({ data, loading = false }: ConversationTrendChartProps) {
  // Componente de tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      });
      
      return (
        <div className="bg-white dark:bg-gray-900 p-3 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg">
          <p className="font-medium">{formattedDate}</p>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-primary">{payload[0].value}</span> conversaciones
          </p>
        </div>
      );
    }
    return null;
  };

  // Función para formatear la fecha en el eje X
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getDate().toString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tendencia de Conversaciones</CardTitle>
          <Skeleton className="h-4 w-[250px] mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[240px] w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tendencia de Conversaciones</CardTitle>
        <p className="text-sm text-gray-500">
          Evolución del número de conversaciones durante los últimos 30 días
        </p>
        <p className="text-xs text-gray-500 mt-1">
          <strong>¿Qué significa?</strong> La línea muestra cómo cambia el volumen de conversaciones a lo largo del tiempo. Los picos indican días con mayor actividad, útil para identificar patrones y tendencias.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]" id="trend-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis} 
                padding={{ left: 20, right: 20 }}
                tick={{ fontSize: 12 }}
                tickCount={10}
              />
              <YAxis 
                allowDecimals={false}
                tickCount={5}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorCount)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}