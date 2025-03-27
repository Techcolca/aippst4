import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader, CheckCircle, AlertCircle, Trash2, RefreshCw } from "lucide-react";

// Definición de interfaces
interface Integration {
  id: number;
  userId: number;
  name: string;
  url: string;
  apiKey: string;
  themeColor: string;
  position: string;
  active: boolean;
  createdAt: string;
  visitorCount: number;
}

interface SiteContent {
  id: number;
  integrationId: number;
  url: string;
  title: string | null;
  content: string;
  lastUpdated: string | null;
}

export default function EditIntegration() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    themeColor: "#3B82F6",
    position: "bottom-right",
    active: true
  });
  const [scriptExample, setScriptExample] = useState('');
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContent[]>([]);
  
  // Obtener datos de la integración
  const { data: integration, isLoading, error } = useQuery<Integration>({
    queryKey: [`/api/integrations/${id}`],
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minuto
  });
  
  // Mutación para actualizar la integración
  const updateIntegrationMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest("PATCH", `/api/integrations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/integrations/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Integración actualizada",
        description: "La integración ha sido actualizada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la integración. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    },
  });
  
  // Cargar datos en el formulario cuando estén disponibles
  useEffect(() => {
    if (integration) {
      setFormData({
        name: integration.name || "",
        url: integration.url || "",
        themeColor: integration.themeColor || "#3B82F6",
        position: integration.position || "bottom-right",
        active: integration.active
      });
      
      // Actualizar el script de ejemplo con la API Key
      setScriptExample(`<script src="https://api.aipi.example.com/widget.js?key=${integration.apiKey}"></script>`);
      
      // Cargar el contenido del sitio
      loadSiteContent();
    }
  }, [integration]);
  
  // Función para cargar el contenido del sitio
  const loadSiteContent = async () => {
    if (!integration) return;
    
    try {
      const response = await fetch(`/api/site-content/${integration.id}`);
      if (!response.ok) {
        throw new Error("Error al cargar el contenido del sitio");
      }
      
      const data = await response.json();
      setSiteContent(data);
    } catch (error) {
      console.error("Error cargando contenido:", error);
      // No mostrar toast de error aquí para no interrumpir la experiencia del usuario
    }
  };
  
  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePositionChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      position: value
    }));
  };
  
  const handleActiveChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      active: checked
    }));
  };
  
  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que se hayan ingresado los campos requeridos
    if (!formData.name || !formData.url) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }
    
    updateIntegrationMutation.mutate(formData);
  };
  
  const handleCancel = () => {
    navigate("/dashboard");
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Cargando información de la integración...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col justify-center items-center min-h-[400px]">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error al cargar la integración</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">No se pudo cargar la información de la integración. Por favor, intenta de nuevo.</p>
          <Button onClick={handleCancel}>Volver al Dashboard</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Editar Integración</h1>
      
      <Card className="mb-8 p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre de la integración</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="Mi sitio web" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="url">URL del sitio web</Label>
                <Input 
                  id="url" 
                  name="url" 
                  placeholder="https://ejemplo.com" 
                  value={formData.url} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="themeColor">Color del tema</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    id="themeColor" 
                    name="themeColor" 
                    type="color" 
                    value={formData.themeColor} 
                    onChange={handleInputChange} 
                    className="w-12 h-10 p-1" 
                  />
                  <Input 
                    name="themeColor" 
                    value={formData.themeColor} 
                    onChange={handleInputChange} 
                    className="flex-1" 
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="position">Posición del widget</Label>
                <Select
                  value={formData.position}
                  onValueChange={handlePositionChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la posición" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Abajo a la derecha</SelectItem>
                    <SelectItem value="bottom-left">Abajo a la izquierda</SelectItem>
                    <SelectItem value="top-right">Arriba a la derecha</SelectItem>
                    <SelectItem value="top-left">Arriba a la izquierda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="active" 
                  checked={formData.active} 
                  onCheckedChange={handleActiveChange} 
                />
                <Label htmlFor="active">Integración activa</Label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <div className="relative">
                  <Input 
                    id="apiKey" 
                    value={integration?.apiKey || ""} 
                    readOnly 
                    className="pr-10" 
                  />
                  <Button 
                    type="button" 
                    className="absolute right-1 top-1 h-8 px-2"
                    onClick={() => {
                      navigator.clipboard.writeText(integration?.apiKey || "");
                      toast({
                        title: "API Key copiada",
                        description: "La API Key ha sido copiada al portapapeles",
                      });
                    }}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="scriptExample">Código de integración</Label>
                <div className="relative mt-1">
                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                    {scriptExample}
                  </pre>
                  <Button 
                    type="button" 
                    className="absolute right-1 top-1 h-8 px-2"
                    onClick={() => {
                      navigator.clipboard.writeText(scriptExample);
                      toast({
                        title: "Código copiado",
                        description: "El código de integración ha sido copiado al portapapeles",
                      });
                    }}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mt-4">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Instrucciones de integración</h3>
                <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <li>Copia el código de integración mostrado arriba.</li>
                  <li>Pega el código justo antes de la etiqueta de cierre <code>&lt;/body&gt;</code> en tu sitio web.</li>
                  <li>Guarda los cambios y actualiza tu sitio web.</li>
                  <li>El widget de chat aparecerá en la posición seleccionada.</li>
                </ol>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Entrenamiento con contenido del sitio</h3>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="websiteUrl">URL del sitio web para extraer contenido</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="websiteUrl"
                      placeholder="https://ejemplo.com"
                      className="flex-grow"
                      defaultValue={formData.url}
                    />
                    <Button 
                      type="button" 
                      variant="secondary"
                      disabled={isScrapingLoading}
                      onClick={async () => {
                        const urlInput = document.getElementById('websiteUrl') as HTMLInputElement;
                        const url = urlInput.value.trim();
                        if (!url) {
                          toast({
                            title: "URL vacía",
                            description: "Por favor, introduce una URL válida",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        if (!url.startsWith('http')) {
                          toast({
                            title: "URL inválida",
                            description: "La URL debe comenzar con http:// o https://",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        try {
                          setIsScrapingLoading(true);
                          toast({
                            title: "Iniciando extracción...",
                            description: "El proceso puede tardar unos minutos",
                          });
                          
                          const response = await fetch('/api/scrape', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              url,
                              integrationId: integration?.id,
                              maxPages: 5,
                            }),
                          });
                          
                          if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.message || 'Error al hacer extracción');
                          }
                          
                          const data = await response.json();
                          toast({
                            title: "Extracción completada",
                            description: `Se procesaron ${data.pagesProcessed} páginas y se guardó el contenido.`,
                          });
                          
                          // Refrescar la lista de contenido
                          loadSiteContent();
                        } catch (error) {
                          console.error("Error en extracción:", error);
                          toast({
                            title: "Error en extracción",
                            description: error.message || "Ocurrió un error al procesar el sitio",
                            variant: "destructive",
                          });
                        } finally {
                          setIsScrapingLoading(false);
                        }
                      }}
                    >
                      {isScrapingLoading ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Extrayendo...
                        </>
                      ) : "Extraer contenido"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Esta función analiza el contenido de tu sitio web para que el chat pueda responder preguntas sobre él.
                  </p>
                </div>
                
                <Separator className="my-2" />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Contenido extraído</h4>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={loadSiteContent}
                      className="flex items-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Actualizar
                    </Button>
                  </div>
                  <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                    {siteContent && siteContent.length > 0 ? (
                      <ul className="space-y-2">
                        {siteContent.map((content) => (
                          <li key={content.id} className="px-3 py-2 bg-background rounded-md shadow-sm">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 pr-2 overflow-hidden">
                                <p className="font-medium truncate">{content.title || "Sin título"}</p>
                                <a 
                                  href={content.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 hover:underline truncate block"
                                >
                                  {content.url}
                                </a>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-red-500 hover:text-red-700 flex-shrink-0"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(`/api/site-content/${content.id}`, {
                                      method: 'DELETE',
                                    });
                                    
                                    if (!response.ok) {
                                      throw new Error('Error al eliminar el contenido');
                                    }
                                    
                                    toast({
                                      title: "Contenido eliminado",
                                      description: "El contenido se ha eliminado correctamente",
                                    });
                                    
                                    // Refrescar la lista
                                    loadSiteContent();
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "No se pudo eliminar el contenido",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No hay contenido extraído. Utiliza el botón "Extraer contenido" para analizar tu sitio web.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 mt-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={updateIntegrationMutation.isPending}
              className="flex items-center"
            >
              {updateIntegrationMutation.isPending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Guardar cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}