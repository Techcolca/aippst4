import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader, CheckCircle, AlertCircle, Trash2, RefreshCw, Upload, File, ArrowLeft } from "lucide-react";

// Esquema de validación para el formulario (igual que en create-integration.tsx)
const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  url: z.string().url({ message: "Debe ser una URL válida" }),
  themeColor: z.string().default("#3B82F6"),
  position: z.enum(["bottom-right", "bottom-left", "top-right", "top-left"], {
    required_error: "Debes seleccionar una posición"
  }).default("bottom-right"),
  active: z.boolean().default(true),
  botBehavior: z.string().optional(),
  widgetType: z.enum(["bubble", "fullscreen"], {
    required_error: "Debes seleccionar un tipo de widget"
  }).default("bubble"),
  ignoredSections: z.array(z.string()).default([]),
  ignoredSectionsText: z.string().optional(),
  description: z.string().optional(),
  // Campos de personalización del chatbot
  customization: z.object({
    assistantName: z.string().optional(),
    defaultGreeting: z.string().optional(),
    showAvailability: z.boolean().optional(),
    userBubbleColor: z.string().optional(),
    assistantBubbleColor: z.string().optional(),
    font: z.string().optional(),
    conversationStyle: z.string().optional(),
  }).optional(),
});

// Tipo derivado del esquema Zod
type FormValues = z.infer<typeof formSchema>;

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
  botBehavior?: string;
  documentsData?: any[];
  widgetType?: string;
  ignoredSections?: string[];
  description?: string;
  ignoredSectionsText?: string;
  customization?: {
    assistantName?: string;
    defaultGreeting?: string;
    showAvailability?: boolean;
    userBubbleColor?: string;
    assistantBubbleColor?: string;
    font?: string;
    conversationStyle?: string;
  };
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
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [scriptExample, setScriptExample] = useState('');
  const [scriptExampleFullscreen, setScriptExampleFullscreen] = useState('');
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContent[]>([]);

  // Inicializar el formulario con react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
      themeColor: "#3B82F6",
      position: "bottom-right",
      active: true,
      botBehavior: "",
      widgetType: "bubble",
      ignoredSections: [],
      ignoredSectionsText: "",
      description: "",
      customization: {
        assistantName: "AIPI Assistant",
        defaultGreeting: "¡Hola! ¿En qué puedo ayudarte hoy?",
        showAvailability: true,
        userBubbleColor: "#1e88e5",
        assistantBubbleColor: "#f5f5f5", 
        font: "Inter",
        conversationStyle: "modern",
      },
    },
  });
  
  // Obtener datos de la integración
  const { data: integration, isLoading, error } = useQuery<Integration>({
    queryKey: [`/api/integrations/${id}`],
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minuto
  });

  // Manejar errores y restricciones de acceso
  useEffect(() => {
    if (error) {
      console.error("Error fetching integration:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      
      toast({
        title: "Error",
        description: errorMessage === "Solo Pablo puede configurar el chat principal del sitio web" 
          ? "Solo el usuario Pablo puede editar esta integración."
          : "Error al cargar la integración. Verifica tus permisos.",
        variant: "destructive"
      });
      
      navigate("/dashboard");
    }
  }, [error, navigate, toast]);
  
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
      form.reset({
        name: integration.name || "",
        url: integration.url || "",
        themeColor: integration.themeColor || "#3B82F6",
        position: integration.position as any || "bottom-right",
        active: integration.active,
        botBehavior: integration.botBehavior || "",
        widgetType: integration.widgetType as any || "bubble",
        ignoredSections: integration.ignoredSections || [],
        ignoredSectionsText: integration.ignoredSectionsText || "",
        description: integration.description || "",
        customization: integration.customization || {
          assistantName: "AIPI Assistant",
          defaultGreeting: "¡Hola! ¿En qué puedo ayudarte hoy?",
          showAvailability: true,
          userBubbleColor: "#1e88e5",
          assistantBubbleColor: "#f5f5f5", 
          font: "Inter",
          conversationStyle: "modern",
        },
      });
      
      // Actualizar el script de ejemplo con la API Key
      // El widget puede ser el estándar (embed.js) o el de pantalla completa estilo ChatGPT (chatgpt-embed.js)
      const widgetType = integration.widgetType || "bubble";
      // USANDO EMBED.JS PARA AMBOS TIPOS DE WIDGET
      setScriptExample(`<script src="https://aipps.ca/embed.js?key=${integration.apiKey}" data-widget-type="${widgetType}"></script>`)
      
      // Agregar un ejemplo alternativo para el widget fullscreen
      if (widgetType === "fullscreen") {
        setScriptExampleFullscreen(`<!-- Widget pantalla completa usando embed.js -->
<script src="${window.location.origin}/embed.js?key=${integration.apiKey}" 
  data-widget-type="fullscreen"
  data-theme-color="${integration.themeColor || '#4f46e5'}"
  data-position="${integration.position || 'bottom-right'}"
  data-title="AIPI Asistente"
></script>`);
      }
      
      // Cargar el contenido del sitio
      loadSiteContent();
    }
  }, [integration]);
  
  // Función para cargar el contenido del sitio
  const loadSiteContent = async () => {
    if (!integration) return;
    
    try {
      // Obtener el token de autenticación
      const authToken = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {};
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`/api/site-content/${integration.id}`, {
        headers: headers,
        credentials: "include"
      });
      
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    
    // Actualizar el código de integración inmediatamente
    if (integration?.apiKey) {
      const widgetType = form.getValues('widgetType') || "bubble";
      setScriptExample(`<script src="${window.location.origin}/embed.js?key=${integration.apiKey}" data-widget-type="${widgetType}" data-position="${value}:15px"></script>`);
      
      if (widgetType === "fullscreen") {
        setScriptExampleFullscreen(`<!-- Widget pantalla completa usando embed.js -->
<script src="${window.location.origin}/embed.js?key=${integration.apiKey}" 
  data-widget-type="fullscreen"
  data-theme-color="${form.getValues('themeColor') || '#4f46e5'}"
  data-position="${value}:15px"
  data-title="AIPPS Asistente"
></script>`);
      }
    }
  };
  
  const handleWidgetTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      widgetType: value
    }));
    
    // Actualizar el código de integración inmediatamente
    if (integration?.apiKey) {
      setScriptExample(`<script src="${window.location.origin}/embed.js?key=${integration.apiKey}" data-widget-type="${value}"></script>`);
      
      if (value === "fullscreen") {
        setScriptExampleFullscreen(`<!-- Widget pantalla completa usando embed.js -->
<script src="${window.location.origin}/embed.js?key=${integration.apiKey}" 
  data-widget-type="fullscreen"
  data-theme-color="${form.getValues('themeColor') || '#4f46e5'}"
  data-position="${form.getValues('position')}:15px"
  data-title="AIPPS Asistente"
></script>`);
      }
    }
  };
  
  const handleActiveChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      active: checked
    }));
  };
  
  // Manejar envío del formulario usando react-hook-form
  const onSubmit = (data: FormValues) => {
    updateIntegrationMutation.mutate(data);
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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          className="mr-2 p-0 h-auto" 
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
        </Button>
        <h1 className="text-2xl font-bold">Editar Integración</h1>
      </div>
      
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <Label htmlFor="widgetType">Tipo de widget</Label>
                <Select
                  value={formData.widgetType}
                  onValueChange={handleWidgetTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de widget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bubble">Widget flotante (burbuja)</SelectItem>
                    <SelectItem value="fullscreen">Pantalla completa (estilo ChatGPT)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Selecciona el tipo de experiencia de chat que deseas ofrecer a tus usuarios.
                </p>
              </div>
              
              <div>
                <Label htmlFor="position">Posición del widget</Label>
                <Select
                  value={formData.position}
                  onValueChange={handlePositionChange}
                  disabled={formData.widgetType === "fullscreen"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la posición" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Abajo a la derecha</SelectItem>
                    <SelectItem value="bottom-left">Abajo a la izquierda</SelectItem>
                    <SelectItem value="bottom-center">Abajo al centro</SelectItem>
                    <SelectItem value="top-right">Arriba a la derecha</SelectItem>
                    <SelectItem value="top-left">Arriba a la izquierda</SelectItem>
                  </SelectContent>
                </Select>
                {formData.widgetType === "fullscreen" && (
                  <p className="text-sm text-muted-foreground mt-1">
                    La posición no se aplica al modo de pantalla completa.
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="active" 
                  checked={formData.active} 
                  onCheckedChange={handleActiveChange} 
                />
                <Label htmlFor="active">Integración activa</Label>
              </div>
              
              <div>
                <Label htmlFor="botBehavior">Comportamiento del chatbot</Label>
                <Textarea
                  id="botBehavior"
                  name="botBehavior"
                  placeholder="Ejemplo: Sé amable y profesional, responde de manera precisa a las preguntas sobre el sitio web."
                  value={formData.botBehavior}
                  onChange={handleInputChange}
                  className="min-h-24"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Define la personalidad y el comportamiento del chatbot. Sea formal, amigable, profesional, etc.
                </p>
              </div>
              
              <div>
                <Label htmlFor="ignoredSections">Secciones a ignorar</Label>
                <div className="space-y-2 mt-2">
                  {formData.ignoredSections.map((section, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={section}
                        onChange={(e) => {
                          const newSections = [...formData.ignoredSections];
                          newSections[index] = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            ignoredSections: newSections
                          }));
                        }}
                        placeholder="Ej: Nuestros Servicios"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newSections = [...formData.ignoredSections];
                          newSections.splice(index, 1);
                          setFormData(prev => ({
                            ...prev,
                            ignoredSections: newSections
                          }));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        ignoredSections: [...prev.ignoredSections, ""]
                      }));
                    }}
                  >
                    Añadir sección a ignorar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Añade nombres de secciones de tu sitio web que quieres que el chatbot ignore. Por ejemplo: "Nuestros Servicios", "Contacto", etc.
                </p>
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
                  <li>Para cambiar la posición del widget, selecciona una de las opciones comentadas en el código.</li>
                  <li>En tu sitio web, abre el archivo HTML donde deseas que aparezca el chat (por ejemplo, index.html).</li>
                  <li>Localiza la etiqueta de cierre <code>&lt;/body&gt;</code> cerca del final del archivo.</li>
                  <li>Pega el código justo antes de esta etiqueta.</li>
                  <li>Si usas un sistema de gestión de contenido (CMS):
                    <ul className="list-disc list-inside ml-4 mt-2">
                      <li>WordPress: Usa un plugin como "Insert Headers and Footers" o edita footer.php en tu tema</li>
                      <li>Wix: Ve a Configuración del Sitio &gt; Código Personalizado &gt; Agregar Código</li>
                      <li>Shopify: Ve a Tema &gt; Acciones &gt; Editar código &gt; footer.liquid</li>
                    </ul>
                  </li>
                  <li>Guarda los cambios y actualiza tu sitio web.</li>
                  <li>El widget de chat aparecerá automáticamente en la posición seleccionada.</li>
                </ol>
                
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 rounded border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">✨ Código Inteligente y Dinámico</h4>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                    <strong>¡El código se actualiza automáticamente!</strong> Cuando cambies la posición del widget usando el selector de arriba, el código de integración se actualiza instantáneamente para reflejar tu selección.
                  </p>
                  <ul className="text-sm text-green-700 dark:text-green-300 list-disc list-inside space-y-1">
                    <li><strong>Posición actual:</strong> {formData.position || "bottom-right"}</li>
                    <li><strong>Tipo de widget:</strong> {formData.widgetType === "fullscreen" ? "Pantalla completa" : "Flotante"}</li>
                    <li><strong>Distancia del borde:</strong> 15px (puedes cambiar este valor en el código)</li>
                  </ul>
                  <p className="text-sm text-green-800 dark:text-green-200 mt-2">
                    💡 <strong>Tip:</strong> Solo copia y pega el código mostrado arriba - ya está optimizado para la configuración que seleccionaste.
                  </p>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Nota:</strong> Asegúrate de probar el widget en una página de prueba antes de implementarlo en tu sitio web principal.
                  </p>
                </div>
              </div>
              
              {formData.widgetType === "fullscreen" && (
                <div className="mt-6">
                  <Label htmlFor="scriptExampleFullscreen">Código alternativo (recomendado)</Label>
                  <div className="relative mt-1">
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                      {scriptExampleFullscreen}
                    </pre>
                    <Button 
                      type="button" 
                      className="absolute right-1 top-1 h-8 px-2"
                      onClick={() => {
                        navigator.clipboard.writeText(scriptExampleFullscreen);
                        toast({
                          title: "Código copiado",
                          description: "El código alternativo ha sido copiado al portapapeles",
                        });
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Este código actualizado ofrece una interfaz estilo ChatGPT y más opciones de personalización. También debe colocarse justo antes de la etiqueta de cierre <code>&lt;/body&gt;</code> en tu sitio web.
                  </p>
                  
                  <div className="bg-amber-50 dark:bg-amber-900 p-3 rounded-lg mt-3 border border-amber-200 dark:border-amber-700">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400 w-5 h-5 mt-0.5 mr-2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Recomendación:</strong> Este código alternativo proporciona una interfaz estilo ChatGPT para una experiencia más familiar y profesional. Reemplaza completamente al código estándar.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Subir documentos adicionales</h3>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex flex-col space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sube documentos (PDF, DOCX, Excel) para entrenar al chatbot con información adicional que no está en tu sitio web.
                </p>
                
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <h4 className="font-medium">Selecciona archivos para subir</h4>
                    <p className="text-sm text-muted-foreground">
                      Arrastra archivos aquí o haz clic para seleccionarlos
                    </p>
                    <Input
                      type="file"
                      multiple
                      className="hidden"
                      id="document-upload"
                      accept=".pdf,.docx,.xlsx,.xls,.doc,.txt"
                      onChange={(e) => setSelectedFiles(e.target.files)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('document-upload')?.click()}
                    >
                      Seleccionar archivos
                    </Button>
                  </div>
                </div>
                
                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <h4 className="font-medium">Archivos seleccionados:</h4>
                    <ul className="space-y-2">
                      {Array.from(selectedFiles).map((file, index) => (
                        <li key={index} className="flex items-center bg-background p-2 rounded-md">
                          <File className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({Math.round(file.size / 1024)} KB)
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-end mt-2">
                      <Button
                        type="button"
                        onClick={async () => {
                          if (!selectedFiles || !integration) return;
                          
                          const formData = new FormData();
                          Array.from(selectedFiles).forEach(file => {
                            formData.append('documents', file);
                          });
                          formData.append('integrationId', integration.id.toString());
                          
                          try {
                            // Obtener el token de autenticación
                            const authToken = localStorage.getItem('auth_token');
                            const headers: Record<string, string> = {};
                            
                            if (authToken) {
                              headers['Authorization'] = `Bearer ${authToken}`;
                            }
                            
                            const response = await fetch('/api/documents/upload', {
                              method: 'POST',
                              headers: headers,
                              credentials: 'include',
                              body: formData,
                            });
                            
                            if (!response.ok) {
                              throw new Error('Error al subir los documentos');
                            }
                            
                            toast({
                              title: "Documentos subidos",
                              description: "Los documentos se han subido correctamente",
                            });
                            
                            setSelectedFiles(null);
                            
                            // Refrescar los datos de la integración
                            await queryClient.invalidateQueries({ queryKey: [`/api/integrations/${id}`] });
                            
                            // Obtener directamente la integración actualizada mediante una petición fetch
                            try {
                              // Obtener el token de autenticación
                              const authToken = localStorage.getItem('auth_token');
                              const headers: Record<string, string> = {};
                              
                              if (authToken) {
                                headers['Authorization'] = `Bearer ${authToken}`;
                              }
                              
                              const updatedDataResponse = await fetch(`/api/integrations/${integration.id}`, {
                                headers: headers,
                                credentials: "include"
                              });
                              
                              if (updatedDataResponse.ok) {
                                const updatedIntegration = await updatedDataResponse.json();
                                // Recargar la página para mostrar los cambios actualizados
                                window.location.reload();
                              }
                            } catch (error) {
                              console.error("Error al obtener datos actualizados:", error);
                            }
                            
                            // Limpiar archivos seleccionados
                            setSelectedFiles(null);
                          } catch (err) {
                            console.error("Error al subir documentos:", err);
                            toast({
                              title: "Error",
                              description: "No se pudieron subir los documentos. Inténtalo de nuevo.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Subir documentos
                      </Button>
                    </div>
                  </div>
                )}
                
                {integration?.documentsData && integration.documentsData.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <h4 className="font-medium">Documentos subidos:</h4>
                    <ul className="space-y-2">
                      {integration.documentsData.map((doc, index) => (
                        <li key={index} className="flex items-center justify-between bg-background p-2 rounded-md">
                          <div className="flex items-center">
                            <File className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="text-sm truncate">{doc.filename}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({Math.round(doc.size / 1024)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:text-red-700"
                            onClick={async () => {
                              try {
                                // Obtener el token de autenticación
                                const authToken = localStorage.getItem('auth_token');
                                const headers: Record<string, string> = {};
                                
                                if (authToken) {
                                  headers['Authorization'] = `Bearer ${authToken}`;
                                }
                                
                                const response = await fetch(`/api/documents/${doc.id}`, {
                                  method: 'DELETE',
                                  headers: headers,
                                  credentials: 'include'
                                });
                                
                                if (!response.ok) {
                                  throw new Error('Error al eliminar el documento');
                                }
                                
                                toast({
                                  title: "Documento eliminado",
                                  description: "El documento se ha eliminado correctamente",
                                });
                                
                                // Refrescar los datos de la integración
                                await queryClient.invalidateQueries({ queryKey: [`/api/integrations/${id}`] });
                                
                                // Obtener directamente la integración actualizada mediante una petición fetch
                                try {
                                  // Obtener el token de autenticación
                                  const authToken = localStorage.getItem('auth_token');
                                  const headers: Record<string, string> = {};
                                  
                                  if (authToken) {
                                    headers['Authorization'] = `Bearer ${authToken}`;
                                  }
                                  
                                  const updatedDataResponse = await fetch(`/api/integrations/${integration.id}`, {
                                    headers: headers,
                                    credentials: "include"
                                  });
                                  
                                  if (updatedDataResponse.ok) {
                                    // Recargar la página para mostrar los cambios actualizados
                                    window.location.reload();
                                  }
                                } catch (error) {
                                  console.error("Error al obtener datos actualizados:", error);
                                }
                              } catch (err) {
                                console.error("Error al eliminar documento:", err);
                                toast({
                                  title: "Error",
                                  description: "No se pudo eliminar el documento",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
                          
                          // Obtener el token de autenticación
                          const authToken = localStorage.getItem('auth_token');
                          const headers: Record<string, string> = {
                            'Content-Type': 'application/json',
                          };
                          
                          if (authToken) {
                            headers['Authorization'] = `Bearer ${authToken}`;
                          }
                          
                          const response = await fetch('/api/scrape', {
                            method: 'POST',
                            headers: headers,
                            credentials: "include",
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
                        } catch (err: any) {
                          console.error("Error en extracción:", err);
                          toast({
                            title: "Error en extracción",
                            description: err.message || "Ocurrió un error al procesar el sitio",
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
                                    // Obtener el token de autenticación
                                    const authToken = localStorage.getItem('auth_token');
                                    const headers: Record<string, string> = {};
                                    
                                    if (authToken) {
                                      headers['Authorization'] = `Bearer ${authToken}`;
                                    }
                                    
                                    const response = await fetch(`/api/site-content/${content.id}`, {
                                      method: 'DELETE',
                                      headers: headers,
                                      credentials: "include"
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
                                  } catch (err) {
                                    console.error("Error al eliminar contenido:", err);
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
