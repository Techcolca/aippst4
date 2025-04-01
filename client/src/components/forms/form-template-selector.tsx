import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, FileText, Users, BarChart4 } from "lucide-react";

type FormTemplate = {
  id: number;
  name: string;
  description: string;
  type: string;
  thumbnail?: string;
  structure: any;
  styling?: any;
  settings?: any;
  is_default: boolean;
};

const iconMap = {
  contact: <FileText className="w-8 h-8 mb-2 text-primary" />,
  waitlist: <Users className="w-8 h-8 mb-2 text-primary" />,
  survey: <BarChart4 className="w-8 h-8 mb-2 text-primary" />,
};

export function FormTemplateSelector() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  // Fetch available templates
  const { data: templates, isLoading } = useQuery<FormTemplate[]>({
    queryKey: ['/api/form-templates'],
  });

  // Create new form based on template
  const createFormMutation = useMutation({
    mutationFn: async (templateId: number) => {
      return await apiRequest('POST', '/api/forms', { templateId });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
      toast({
        title: "Formulario creado",
        description: "Se ha creado un nuevo formulario basado en la plantilla seleccionada.",
      });
      // Redireccionar a dashboard con la pestaña forms activada
      setLocation(`/dashboard?tab=forms`);
      toast({
        title: "¡Formulario listo para editar!",
        description: "Puedes encontrar tu nuevo formulario en la lista de formularios",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo crear el formulario: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleTemplateSelect = (templateId: number) => {
    setSelectedTemplate(templateId);
  };

  const handleCreateForm = () => {
    if (selectedTemplate) {
      createFormMutation.mutate(selectedTemplate);
    } else {
      toast({
        title: "Selección requerida",
        description: "Por favor, selecciona una plantilla para continuar.",
        variant: "destructive",
      });
    }
  };

  const handleCreateBlankForm = () => {
    // También redirigir al dashboard con un mensaje
    toast({
      title: "Función en desarrollo",
      description: "La creación de formularios desde cero estará disponible próximamente",
    });
    setLocation('/dashboard?tab=forms');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Selecciona una plantilla</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="cursor-pointer hover:border-primary/50">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Selecciona una plantilla</h2>
        <Button variant="outline" onClick={handleCreateBlankForm}>
          Crear desde cero
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id 
                ? "border-2 border-primary ring-2 ring-primary/20" 
                : "hover:border-primary/30"
            }`}
            onClick={() => handleTemplateSelect(template.id)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                {template.name}
              </CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              {template.type && iconMap[template.type as keyof typeof iconMap] || 
                <FileText className="w-8 h-8 mb-2 text-primary" />}
              <p className="text-sm text-center text-muted-foreground">{template.type.charAt(0).toUpperCase() + template.type.slice(1)}</p>
            </CardContent>
            <CardFooter className="bg-muted/50 p-3">
              <Button 
                variant="ghost" 
                className="w-full text-xs justify-between"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTemplate(template.id);
                  createFormMutation.mutate(template.id);
                }}
              >
                <span>Usar esta plantilla</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <Button 
          onClick={handleCreateForm}
          disabled={!selectedTemplate || createFormMutation.isPending}
        >
          {createFormMutation.isPending ? "Creando..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
}