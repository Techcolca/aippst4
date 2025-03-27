import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface KeywordCloudProps {
  data: {
    keyword: string;
    frequency: number;
  }[];
  loading?: boolean;
}

export default function KeywordCloud({ data, loading = false }: KeywordCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Función para obtener un color aleatorio para cada palabra
  const getRandomColor = () => {
    const colors = [
      "#2563eb", // blues
      "#3b82f6",
      "#60a5fa",
      "#818cf8", // indigos
      "#6366f1",
      "#a78bfa", // purples
      "#8b5cf6",
      "#ec4899", // pinks
      "#f472b6",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Renderizar la nube de palabras
  useEffect(() => {
    if (loading || !data.length || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Configuración de la nube de palabras
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxFrequency = Math.max(...data.map(item => item.frequency));
    const minFont = 10;
    const maxFont = 38;
    
    // Crear una copia ordenada de los datos por frecuencia (de mayor a menor)
    const sortedData = [...data].sort((a, b) => b.frequency - a.frequency);
    
    // Posiciones ocupadas para evitar solapamientos
    const occupied: { x1: number, y1: number, x2: number, y2: number }[] = [];
    
    // Dibujar cada palabra
    sortedData.forEach((item) => {
      // Calcular el tamaño de la fuente según la frecuencia
      const fontSize = minFont + (item.frequency / maxFrequency) * (maxFont - minFont);
      ctx.font = `${Math.round(fontSize)}px Arial`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      
      // Calcular dimensiones del texto
      const textMetrics = ctx.measureText(item.keyword);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;
      
      // Intentar encontrar una posición libre
      let posX = 0, posY = 0;
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;
      
      while (!placed && attempts < maxAttempts) {
        attempts++;
        
        // Generar posición aleatoria con más probabilidad cerca del centro
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.pow(Math.random(), 0.5) * Math.min(canvas.width, canvas.height) * 0.45;
        
        posX = centerX + Math.cos(angle) * distance;
        posY = centerY + Math.sin(angle) * distance;
        
        // Comprobar si la posición está libre
        const box = {
          x1: posX - textWidth / 2 - 5,
          y1: posY - textHeight / 2 - 5,
          x2: posX + textWidth / 2 + 5,
          y2: posY + textHeight / 2 + 5
        };
        
        const overlaps = occupied.some(occ => 
          box.x1 < occ.x2 && box.x2 > occ.x1 && box.y1 < occ.y2 && box.y2 > occ.y1
        );
        
        if (!overlaps) {
          placed = true;
          occupied.push(box);
        }
      }
      
      // Si no se pudo colocar después de varios intentos, solapar
      if (!placed) {
        posX = centerX + (Math.random() - 0.5) * canvas.width * 0.7;
        posY = centerY + (Math.random() - 0.5) * canvas.height * 0.7;
      }
      
      // Dibujar la palabra
      ctx.fillStyle = getRandomColor();
      ctx.fillText(item.keyword, posX, posY);
    });
    
  }, [data, loading]);
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Palabras Clave</CardTitle>
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
        <CardTitle className="text-lg">Palabras Clave</CardTitle>
        <p className="text-sm text-gray-500">
          Términos más frecuentes en las conversaciones con los visitantes
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full relative">
          <canvas 
            ref={canvasRef} 
            width={500} 
            height={240}
            className="w-full h-full"
          />
          
          {data.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500">No hay suficientes datos para mostrar</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}