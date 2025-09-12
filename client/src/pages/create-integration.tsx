import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context-stub";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import UpgradePlanModal from "@/components/upgrade-plan-modal";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, ArrowLeft, CheckCircle2, Loader, File, RefreshCw, Upload } from "lucide-react";

// Esquema de validación para el formulario
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
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  language: z.enum(["es", "en", "fr"], {
    required_error: "Debes seleccionar un idioma"
  }).default("es"),
  // Mantenemos customization para compatibilidad
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

export default function CreateIntegration() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedContent, setExtractedContent] = useState<Array<{url: string, title: string}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const upgradeModal = useUpgradeModal();
  const { canCreateResource, limits } = usePlanLimits();

  // Inicializamos el formulario
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
      language: "es",
      ignoredSections: [],
      ignoredSectionsText: "",
      description: "Soy un asistente inteligente especializado en ayudar a los usuarios de este sitio web. Estoy aquí para responder preguntas, brindar información y ofrecer soporte personalizado.",
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

  // Función para manejar la selección de archivos
  const handleFileSelection = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Función para manejar el cambio de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  // Función para subir documentos
  const uploadFiles = async (integrationId: number) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      return [];
    }

    setIsUploadingFiles(true);
    
    try {
      const formData = new FormData();
      formData.append("integrationId", integrationId.toString());
      
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("documents", selectedFiles[i]);
      }
      
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Error al subir los documentos");
      }
      
      const data = await response.json();
      
      toast({
        title: "Documentos subidos",
        description: `Se han subido ${data.documents?.length || 0} documentos correctamente`,
      });
      
      return data.documents || [];
    } catch (error) {
      console.error("Error al subir documentos:", error);
      toast({
        title: "Error",
        description: "No se pudieron subir los documentos. Inténtalo de nuevo.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsUploadingFiles(false);
    }
  };

  // Función para extraer contenido del sitio
  const extractSiteContent = async (integrationId: number) => {
    const url = form.getValues("url");
    
    if (!url) {
      toast({
        title: "Error",
        description: "Debes introducir una URL válida",
        variant: "destructive",
      });
      return false;
    }
    
    setIsExtracting(true);
    
    try {
      const response = await fetch("/api/site-content/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          integrationId,
          url,
          maxPages: 5,
        }),
      });
      
      // Verificar content-type para asegurar que es JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // Si no es JSON, leer como texto para debug
        const textResponse = await response.text();
        console.error("Respuesta no-JSON recibida:", textResponse.substring(0, 200));
        throw new Error("El servidor devolvió una respuesta inválida. Verifica la configuración.");
      }
      
      if (!response.ok) {
        let errorMessage = "Error al extraer el contenido";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Si no se puede parsear el error como JSON, usar mensaje genérico
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Error en la extracción del contenido");
      }
      
      setExtractedContent(data.savedContent.map((content: any) => ({
        url: content.url,
        title: content.title,
      })));
      
      toast({
        title: "Extracción completada",
        description: `Se procesaron ${data.pagesProcessed} páginas y se guardó el contenido.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error en extracción:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error al procesar el sitio";
      toast({
        title: "Error en extracción",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsExtracting(false);
    }
  };

  // Mutación para crear la integración
  const createIntegrationMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Primero creamos la integración
      const response = await apiRequest("POST", "/api/integrations", data);
      const integration = await response.json();
      
      // Luego subimos documentos si hay seleccionados
      if (selectedFiles && selectedFiles.length > 0) {
        await uploadFiles(integration.id);
      }
      
      // Y finalmente extraemos el contenido del sitio si hay URL
      if (data.url) {
        await extractSiteContent(integration.id);
      }
      
      return integration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Integración creada",
        description: "La integración se ha creado correctamente",
        variant: "default",
      });
      navigate("/dashboard");
    },
    onError: (error) => {
      setIsSubmitting(false);
      
      // Check if it's a plan limit error (403 status)
      if (error.message && error.message.includes("límite")) {
        upgradeModal.handlePlanLimitError(error.message);
      } else {
        toast({
          title: "Error al crear la integración",
          description: error.message || "Ha ocurrido un error al crear la integración",
          variant: "destructive",
        });
      }
    },
  });

  // Verificar límites antes del envío
  const handleSubmitWithLimitCheck = async (data: FormValues) => {
    try {
      // Verificar si puede crear más integraciones
      const canCreate = await canCreateResource('integrations');
      
      if (!canCreate) {
        // Mostrar modal de upgrade con información específica
        const integrationLimit = limits?.limits?.integrations?.limit || 1;
        const integrationUsed = limits?.limits?.integrations?.used || 0;
        const planName = limits?.planName || "Plan Básico";
        
        upgradeModal.showUpgradeModal('integrations', integrationLimit, planName);
        return;
      }
      
      // Si puede crear, proceder normalmente
      setIsSubmitting(true);
      createIntegrationMutation.mutate(data);
    } catch (error) {
      console.error('Error verificando límites:', error);
      toast({
        title: "Error",
        description: "No se pudo verificar los límites de tu plan. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Manejador de envío del formulario
  const onSubmit = (data: FormValues) => {
    handleSubmitWithLimitCheck(data);
  };

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
        <h1 className="text-2xl font-bold">Crear nueva integración</h1>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la integración</FormLabel>
                    <FormControl>
                      <Input placeholder="Mi sitio web" {...field} />
                    </FormControl>
                    <FormDescription>
                      Un nombre descriptivo para identificar esta integración
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del sitio web</FormLabel>
                    <FormControl>
                      <Input placeholder="https://ejemplo.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      La URL completa de tu sitio web
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="themeColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color del tema</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input {...field} type="color" className="w-10 h-10 p-1" />
                      </FormControl>
                      <Input 
                        value={field.value} 
                        onChange={field.onChange}
                        className="flex-grow"
                      />
                    </div>
                    <FormDescription>
                      El color principal del widget
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posición del widget</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una posición" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bottom-right">Abajo a la derecha</SelectItem>
                        <SelectItem value="bottom-left">Abajo a la izquierda</SelectItem>
                        <SelectItem value="top-right">Arriba a la derecha</SelectItem>
                        <SelectItem value="top-left">Arriba a la izquierda</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Dónde aparecerá el widget en la página
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idioma del widget</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un idioma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      El idioma en que se mostrará el widget a los usuarios
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Integración activa
                    </FormLabel>
                    <FormDescription>
                      Si está desactivada, el widget no se mostrará en tu sitio web
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del asistente</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ejemplo: Soy un asistente especializado en productos de tecnología. Ayudo a los clientes con información sobre nuestros servicios, precios y soporte técnico." 
                      className="resize-none h-24" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Esta descripción se mostrará como mensaje de bienvenida en widgets de pantalla completa. Describe específicamente en qué ayuda tu asistente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="widgetType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de integración</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bubble">Widget flotante (burbuja)</SelectItem>
                      <SelectItem value="fullscreen">Pantalla completa (estilo ChatGPT)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Elige cómo se mostrará el asistente en tu sitio web
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="botBehavior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comportamiento del bot (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Instrucciones específicas para guiar el comportamiento del asistente..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Define cómo debe comportarse el asistente al interactuar con los visitantes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ignoredSectionsText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secciones ignoradas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="footer, #sidebar, .navigation" 
                      className="resize-none" 
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        // Actualizar también ignoredSections como array
                        const sections = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        form.setValue('ignoredSections', sections);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Selectores CSS (separados por comas) de las secciones que quieres que el asistente ignore
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md mb-6">
              <h3 className="font-medium text-lg mb-4">Subir documentos adicionales</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Sube documentos (PDF, DOCX, Excel) para entrenar al chatbot con información adicional que no está en tu sitio web.
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                accept=".pdf,.docx,.xlsx,.xls,.csv,.doc" 
                onChange={handleFileChange}
              />
              
              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6 text-center"
                onClick={handleFileSelection}
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="mb-3">
                    <Upload className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Selecciona archivos para subir
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Arrastra archivos aquí o haz clic para seleccionarlos
                  </p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleFileSelection}
                >
                  {selectedFiles && selectedFiles.length > 0 ? (
                    <span className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      {selectedFiles.length} {selectedFiles.length === 1 ? 'archivo seleccionado' : 'archivos seleccionados'}
                    </span>
                  ) : 'Seleccionar archivos'}
                </Button>
              </div>

              {selectedFiles && selectedFiles.length > 0 && (
                <div className="mt-4 bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                  <h4 className="font-medium mb-2">Archivos seleccionados:</h4>
                  <ul className="space-y-1">
                    {Array.from(selectedFiles).map((file, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <File className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="truncate">{file.name}</span>
                        <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md mb-6">
              <h3 className="font-medium text-lg mb-4">Entrenamiento con contenido del sitio</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                URL del sitio web para extraer contenido
              </div>
              
              <div className="flex gap-2 mb-4">
                <Input 
                  placeholder="localhost" 
                  className="flex-grow"
                  value={form.getValues("url")}
                  readOnly
                />
                <Button 
                  type="button" 
                  variant="outline"
                  disabled={!form.getValues("url") || isExtracting}
                  className="min-w-24"
                  onClick={() => {
                    toast({
                      title: "Información",
                      description: "El contenido se extraerá automáticamente después de crear la integración",
                    });
                  }}
                >
                  {isExtracting ? (
                    <span className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      Extrayendo...
                    </span>
                  ) : "Extraer contenido"}
                </Button>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Esta función analiza el contenido de tu sitio web para que el chat pueda responder preguntas sobre él.
              </div>

              {extractedContent.length > 0 && (
                <div className="mt-4 border rounded-md p-3 max-h-48 overflow-y-auto">
                  <h4 className="font-medium mb-2 text-sm">Contenido extraído:</h4>
                  <ul className="space-y-1">
                    {extractedContent.map((content, index) => (
                      <li key={index} className="flex items-start text-sm p-2 bg-white dark:bg-gray-800 rounded-md">
                        <span className="flex-grow overflow-hidden">
                          <p className="font-medium truncate">{content.title || "Sin título"}</p>
                          <a 
                            href={content.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline truncate block"
                          >
                            {content.url}
                          </a>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
              <h3 className="font-medium text-lg mb-4">Opciones de personalización</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="customization.assistantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del asistente</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customization.defaultGreeting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensaje de bienvenida</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customization.userBubbleColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color de burbuja del usuario</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input {...field} type="color" className="w-10 h-10 p-1" />
                        </FormControl>
                        <Input 
                          value={field.value} 
                          onChange={field.onChange}
                          className="flex-grow"
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customization.assistantBubbleColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color de burbuja del asistente</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input {...field} type="color" className="w-10 h-10 p-1" />
                        </FormControl>
                        <Input 
                          value={field.value} 
                          onChange={field.onChange}
                          className="flex-grow"
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customization.font"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuente</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una fuente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                          <SelectItem value="Lato">Lato</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customization.conversationStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estilo de conversación</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un estilo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="modern">Moderno</SelectItem>
                          <SelectItem value="classic">Clásico</SelectItem>
                          <SelectItem value="minimal">Minimalista</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customization.showAvailability"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Mostrar estado de disponibilidad
                        </FormLabel>
                        <FormDescription>
                          Muestra un indicador de disponibilidad en el widget
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-300">Instrucciones de instalación</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-400">
                Después de crear la integración, recibirás un código que deberás añadir a tu sitio web justo antes del cierre de la etiqueta &lt;/body&gt;.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => navigate("/dashboard")}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || (limits?.limits?.integrations?.remaining === 0)}
                className="gap-2"
                title={limits?.limits?.integrations?.remaining === 0 ? `Has alcanzado el límite de ${limits?.limits?.integrations?.limit} integraciones en tu ${limits?.planName}` : ""}
              >
                {isSubmitting && (
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" aria-hidden="true" />
                )}
                {limits?.limits?.integrations?.remaining === 0 ? "Límite alcanzado" : "Crear integración"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      <UpgradePlanModal
        isOpen={upgradeModal.isOpen}
        onClose={upgradeModal.hideUpgradeModal}
        limitType={upgradeModal.limitType}
        currentLimit={upgradeModal.currentLimit}
        planName={upgradeModal.planName}
      />
    </div>
  );
}