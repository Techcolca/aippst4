import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LabelList } from "recharts";
import { TopTopic } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface TopicSentimentChartProps {
  data: TopTopic[];
  loading?: boolean;
}

export default function TopicSentimentChart({ data, loading = false }: TopicSentimentChartProps) {
  // Función para determinar el color basado en el sentimiento
  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 70) return "#10b981"; // verde - positivo
    if (sentiment >= 50) return "#22c55e"; // verde claro
    if (sentiment >= 40) return "#facc15"; // amarillo - neutro
    if (sentiment >= 30) return "#f59e0b"; // naranja
    return "#ef4444"; // rojo - negativo
  };

  // Componente de tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-900 p-3 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg">
          <p className="font-medium">{item.topic}</p>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-primary">{item.count}</span> menciones
          </p>
          <p className="text-sm">
            Sentimiento: 
            <span 
              className="ml-1 font-semibold"
              style={{ color: getSentimentColor(item.sentiment) }}
            >
              {item.sentiment}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Temas y Sentimiento</CardTitle>
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
        <CardTitle className="text-lg">Temas y Sentimiento</CardTitle>
        <p className="text-sm text-gray-500">
          Análisis de los temas más discutidos y el sentimiento asociado
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
              <XAxis type="number" domain={[0, 'dataMax']} />
              <YAxis 
                dataKey="topic" 
                type="category" 
                width={120}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getSentimentColor(entry.sentiment)} 
                    fillOpacity={0.8}
                  />
                ))}
                <LabelList 
                  dataKey="sentiment" 
                  position="right" 
                  formatter={(value: number) => `${value}%`}
                  style={{ fontSize: '11px' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}