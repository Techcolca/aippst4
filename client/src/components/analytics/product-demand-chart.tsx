import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { TopProduct } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from 'react-i18next';

interface ProductDemandChartProps {
  data: TopProduct[];
  loading?: boolean;
}

export default function ProductDemandChart({ data, loading = false }: ProductDemandChartProps) {
  const { t } = useTranslation();
  const colors = [
    "#2563eb", // primary blue
    "#3b82f6",
    "#60a5fa",
    "#93c5fd",
    "#bfdbfe"
  ];

  // Función para formatear porcentajes en el tooltip
  const formatPercent = (value: number) => `${value}%`;

  // Componente de tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 p-3 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-primary">{payload[0].payload.count}</span> {t("queries")}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-primary">{payload[0].payload.percentage}%</span> {t("of_total")}
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
          <CardTitle className="text-lg">{t("products_services_most_demanded")}</CardTitle>
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
        <CardTitle className="text-lg">{t("products_services_most_demanded")}</CardTitle>
        <p className="text-sm text-gray-500">
          {t("products_analysis_description")}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          <strong>{t("what_does_it_mean")}</strong> {t("products_bars_explanation")}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]" id="products-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
              <XAxis type="number" tickFormatter={(value) => `${value}`} />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}