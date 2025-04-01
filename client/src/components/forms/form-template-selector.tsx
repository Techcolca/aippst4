import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ArrowRight, FileText, Users, BarChart4, Eye, X, ClipboardList, Star, User, ShoppingCart, MessageSquare, Briefcase, Bell, Mail } from "lucide-react";

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
  const [previewTemplate, setPreviewTemplate] = useState<FormTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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
        <div>
          <h2 className="text-2xl font-bold">Selecciona una plantilla</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Pasa el cursor sobre la plantilla y haz clic en el ícono del <Eye className="w-3 h-3 inline mx-1" /> para previsualizarla antes de usar.
          </p>
        </div>
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
                ? "border-2 border-primary ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/10" 
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
            <CardContent className="flex flex-col items-center justify-center py-4">
              <div className="w-full aspect-video bg-slate-100 dark:bg-gray-800 rounded-md mb-3 overflow-hidden relative group">
                {/* Botón de vista previa */}
                <button 
                  className="absolute right-2 top-2 bg-primary/90 text-white p-1.5 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewTemplate(template);
                    setShowPreview(true);
                  }}
                  title="Vista previa"
                >
                  <Eye className="h-4 w-4" />
                </button>
                
                {/* Miniatura de ejemplo - normalmente sería una imagen real almacenada en el servidor */}
                <div className={`w-full h-full flex flex-col p-4 border ${
                  selectedTemplate === template.id ? "border-primary" : "border-gray-200 dark:border-gray-700"
                } rounded-md`}>
                  {/* Encabezado del formulario de muestra */}
                  <div className="w-full mb-3">
                    <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                    <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  
                  {/* Simulación de campos según el tipo de formulario */}
                  <div className="space-y-2 w-full">
                    {template.type === 'contact' && (
                      <>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </>
                    )}
                    
                    {template.type === 'waitlist' && (
                      <>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="flex space-x-2">
                            <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {template.type === 'survey' && (
                      <>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <div key={n} className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </>
                    )}
                    
                    {template.type === 'lead' && (
                      <>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </>
                    )}
                    
                    {template.type === 'registration' && (
                      <>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="h-8 w-full bg-gray-300 dark:bg-gray-600 rounded mt-3"></div>
                      </>
                    )}
                    
                    {template.type === 'order' && (
                      <>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="flex flex-col space-y-1 w-2/3">
                            <div className="h-3 w-1/3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div>
                          <div className="flex flex-col space-y-1 w-1/3">
                            <div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div>
                        </div>
                        <div className="h-8 w-full bg-gray-300 dark:bg-gray-600 rounded mt-3"></div>
                      </>
                    )}
                    
                    {template.type === 'feedback' && (
                      <>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <div key={n} className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="flex space-x-1">
                            {[1, 2, 3].map((n) => (
                              <div key={n} className="flex items-center space-x-1">
                                <div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </>
                    )}
                    
                    {template.type === 'application' && (
                      <>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded-sm mt-2 mx-auto"></div>
                      </>
                    )}
                    
                    {template.type === 'subscription' && (
                      <>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="h-8 w-1/3 bg-gray-300 dark:bg-gray-600 rounded mt-2 mx-auto"></div>
                      </>
                    )}
                    
                    {/* Fallback para otros tipos */}
                    {!['contact', 'waitlist', 'survey', 'lead', 'registration', 'order', 'feedback', 'application', 'subscription'].includes(template.type) && (
                      <>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Botón de muestra */}
                  <div className="mt-auto pt-3">
                    <div className="h-7 w-1/3 bg-primary/30 rounded-sm mx-auto"></div>
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-center text-muted-foreground">
                {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
              </p>
            </CardContent>
            <CardFooter className="bg-muted/50 p-3">
              <Button 
                variant={selectedTemplate === template.id ? "default" : "ghost"}
                className={`w-full text-xs justify-between ${selectedTemplate === template.id ? "bg-primary text-primary-foreground" : "text-primary hover:bg-primary/10 hover:text-primary"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTemplate(template.id);
                  createFormMutation.mutate(template.id);
                }}
              >
                <span>{selectedTemplate === template.id ? "Crear con esta plantilla" : "Usar esta plantilla"}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Modal de Vista Previa */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {previewTemplate?.name || "Vista previa de la plantilla"}
            </DialogTitle>
            <DialogDescription>
              {previewTemplate?.description || "Vista previa detallada de los campos y estructura del formulario."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-white dark:bg-slate-900 border rounded-lg p-6 max-h-[70vh] overflow-y-auto">
            {previewTemplate && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">{previewTemplate.name}</h2>
                  <p className="text-muted-foreground">{previewTemplate.description}</p>
                </div>
                
                {/* Aquí renderizamos una versión más detallada del formulario según el tipo */}
                {previewTemplate.type === 'contact' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nombre <span className="text-red-500">*</span></label>
                      <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-md border"></div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                      <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-md border"></div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Asunto</label>
                      <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-md border"></div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mensaje <span className="text-red-500">*</span></label>
                      <div className="h-32 w-full bg-gray-100 dark:bg-gray-800 rounded-md border"></div>
                    </div>
                    <div className="pt-4">
                      <div className="h-10 w-full md:w-1/3 bg-primary/80 rounded-md mx-auto"></div>
                    </div>
                  </div>
                )}
                
                {previewTemplate.type === 'waitlist' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nombre <span className="text-red-500">*</span></label>
                      <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-md border"></div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                      <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-md border"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded border"></div>
                        <span className="text-sm">Quiero recibir actualizaciones por email</span>
                      </div>
                    </div>
                    <div className="pt-4">
                      <div className="h-10 w-full md:w-1/2 bg-primary/80 rounded-md mx-auto"></div>
                    </div>
                  </div>
                )}
                
                {previewTemplate.type === 'survey' && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">¿Cómo calificaría nuestro servicio? <span className="text-red-500">*</span></label>
                      <div className="flex justify-between">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div key={n} className="flex flex-col items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 border"></div>
                            <span className="text-xs mt-1">{n}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">¿Qué aspecto le gustó más?</label>
                      <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-md border"></div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">¿Tiene alguna sugerencia para mejorar?</label>
                      <div className="h-24 w-full bg-gray-100 dark:bg-gray-800 rounded-md border"></div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email (opcional)</label>
                      <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-md border"></div>
                    </div>
                    <div className="pt-4">
                      <div className="h-10 w-full md:w-1/3 bg-primary/80 rounded-md mx-auto"></div>
                    </div>
                  </div>
                )}
                
                {/* Formulario genérico para otros tipos */}
                {!['contact', 'waitlist', 'survey'].includes(previewTemplate.type) && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nombre <span className="text-red-500">*</span></label>
                      <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-md border"></div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                      <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-md border"></div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mensaje</label>
                      <div className="h-24 w-full bg-gray-100 dark:bg-gray-800 rounded-md border"></div>
                    </div>
                    <div className="pt-4">
                      <div className="h-10 w-full md:w-1/3 bg-primary/80 rounded-md mx-auto"></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline">Cerrar vista previa</Button>
            </DialogClose>
            
            <Button
              disabled={!previewTemplate || createFormMutation.isPending}
              onClick={() => {
                if (previewTemplate) {
                  setSelectedTemplate(previewTemplate.id);
                  createFormMutation.mutate(previewTemplate.id);
                  setShowPreview(false);
                }
              }}
            >
              {createFormMutation.isPending ? "Creando..." : "Usar esta plantilla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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