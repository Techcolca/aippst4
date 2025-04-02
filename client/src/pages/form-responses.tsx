import React from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, ArrowLeft, Download, Trash2 } from 'lucide-react';
import Header from '@/components/header';

const FormResponses = () => {
  const [, navigate] = useLocation();
  const [match, params] = useRoute<{ id: string }>('/forms/:id/responses');
  const formId = parseInt(params?.id || '0');
  const { toast } = useToast();
  
  // Obtener datos del formulario
  const { data: form, isLoading: isLoadingForm } = useQuery({
    queryKey: [`/api/forms/${formId}`],
    enabled: !!formId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
  
  // Obtener respuestas del formulario
  const { data: responses, isLoading: isLoadingResponses } = useQuery({
    queryKey: [`/api/forms/${formId}/responses`],
    enabled: !!formId,
    staleTime: 1000 * 60, // 1 minuto
  });
  
  // Volver a la lista de formularios
  const handleBack = () => {
    navigate('/dashboard?tab=forms');
  };
  
  // Exportar respuestas a CSV
  const handleExportCSV = () => {
    if (!responses || responses.length === 0) {
      toast({
        title: 'Sin datos',
        description: 'No hay respuestas para exportar',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Obtener las columnas de la primera respuesta
      const firstResponse = responses[0];
      const columns = Object.keys(firstResponse.data || {});
      
      // Crear cabecera CSV
      let csv = ['Fecha', ...columns].join(',') + '\\n';
      
      // Añadir filas
      responses.forEach((response) => {
        const date = new Date(response.submittedAt).toLocaleDateString();
        const values = columns.map((col) => {
          const value = response.data[col] || '';
          // Escapar comas y comillas
          return `"${String(value).replace(/"/g, '""')}"`;
        });
        
        csv += [date, ...values].join(',') + '\\n';
      });
      
      // Crear blob y descargar
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `respuestas-${form?.slug || formId}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Exportación completada',
        description: 'Las respuestas se han exportado correctamente',
      });
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      toast({
        title: 'Error al exportar',
        description: 'No se pudieron exportar las respuestas',
        variant: 'destructive',
      });
    }
  };

  // Renderizar columnas y datos
  const renderResponseTable = () => {
    if (!responses || responses.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No hay respuestas para este formulario</p>
        </div>
      );
    }
    
    // Obtener columnas de la primera respuesta
    const columns = Object.keys(responses[0].data || {});
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Fecha</TableHead>
            {columns.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses.map((response) => (
            <TableRow key={response.id}>
              <TableCell className="font-medium">
                {new Date(response.submittedAt).toLocaleDateString()}
              </TableCell>
              {columns.map((column) => (
                <TableCell key={column}>
                  {String(response.data[column] || '-')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const isLoading = isLoadingForm || isLoadingResponses;

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando respuestas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-[400px]">
            <CardContent className="pt-6">
              <p className="mb-4">El formulario solicitado no existe o no tienes permisos para acceder.</p>
              <Button onClick={handleBack} className="w-full">
                Volver a la lista de formularios
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="container max-w-7xl mx-auto py-6 space-y-6">
        {/* Barra de herramientas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold">{form.title} - Respuestas</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={!responses || responses.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
        
        {/* Panel de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">
                {responses?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                Total de respuestas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">
                {responses && responses.length > 0 
                  ? new Date(responses[0].submittedAt).toLocaleDateString() 
                  : '-'}
              </div>
              <p className="text-sm text-muted-foreground">
                Respuesta más reciente
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">
                {form.type?.charAt(0).toUpperCase() + form.type?.slice(1) || 'Estándar'}
              </div>
              <p className="text-sm text-muted-foreground">
                Tipo de formulario
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabla de respuestas */}
        <Card>
          <CardContent className="pt-6 overflow-auto">
            {renderResponseTable()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormResponses;