import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader, CheckCircle, AlertCircle, Trash2, RefreshCw, Upload, File, ArrowLeft } from "lucide-react";

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
  description: z.string().optional(),
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

type FormValues = z.infer<typeof formSchema>;

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
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContent[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedContent, setExtractedContent] = useState<Array<{url: string, title: string}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    staleTime: 1000 * 60,
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
  const uploadFiles = async () => {
    if (!selectedFiles || selectedFiles.length === 0 || !integration) {
      return [];
    }

    setIsUploadingFiles(true);
    
    try {
      const formData = new FormData();
      formData.append("integrationId", integration.id.toString());
      
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
        description: `Se han subido ${data.uploadedFiles.length} documentos correctamente`,
      });
      
      // Refrescar la integración para mostrar los nuevos documentos
      queryClient.invalidateQueries({ queryKey: [`/api/integrations/${id}`] });
      setSelectedFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      return data.uploadedFiles;
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
  const extractSiteContent = async () => {
    const url = form.getValues("url");
    
    if (!url || !integration) {
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
          integrationId: integration.id,
          url,
          maxPages: 5,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Error al extraer el contenido");
      }
      
      const data = await response.json();
      
      setExtractedContent(data.savedContent.map((content: any) => ({
        url: content.url,
        title: content.title,
      })));
      
      toast({
        title: "Extracción completada",
        description: `Se procesaron ${data.pagesProcessed} páginas y se guardó el contenido.`,
      });
      
      // Refrescar el contenido del sitio
      queryClient.invalidateQueries({ queryKey: [`/api/site-content/${id}`] });
      
      return true;
    } catch (error) {
      console.error("Error en extracción:", error);
      toast({
        title: "Error en extracción",
        description: "Ocurrió un error al procesar el sitio",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsExtracting(false);
    }
  };

  // Función para eliminar un documento
  const deleteDocument = async (documentIndex: number) => {
    if (!integration || !integration.documentsData) return;
    
    try {
      const response = await fetch(`/api/documents/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          integrationId: integration.id,
          documentIndex,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Error al eliminar el documento");
      }
      
      toast({
        title: "Documento eliminado",
        description: "El documento se ha eliminado correctamente",
      });
      
      // Refrescar la integración
      queryClient.invalidateQueries({ queryKey: [`/api/integrations/${id}`] });
    } catch (error) {
      console.error("Error al eliminar documento:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento",
        variant: "destructive",
      });
    }
  };

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

      // Actualizar script de ejemplo
      const widgetType = integration.widgetType || "bubble";
      const scriptFile = widgetType === "fullscreen" ? "static/chatgpt-embed.js" : "embed.js";
      setScriptExample(`<script src="${window.location.origin}/${scriptFile}?key=${integration.apiKey}"></script>`);
    }
  }, [integration, form]);

  // Mutación para actualizar la integración
  const updateIntegrationMutation = useMutation({
    mutationFn: (data: FormValues) => 
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

  // Manejar envío del formulario
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
          <p className="text-gray-600 dark:text-gray-400 mb-4">No se pudo cargar la información de la integración.</p>
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
                      value={field.value}
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
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe el propósito de esta integración..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
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
                    value={field.value}
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
                  <FormLabel>Secciones a ignorar en el scraping (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="footer, .cookie-banner, #ads..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Selectores CSS o nombres de elementos que el scraper debe ignorar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sección de personalización del chatbot */}
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-medium">Personalización del Chatbot</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="customization.assistantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del asistente</FormLabel>
                      <FormControl>
                        <Input placeholder="AIPI Assistant" {...field} />
                      </FormControl>
                      <FormDescription>
                        Como se presentará el asistente a los usuarios
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customization.font"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuente tipográfica</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
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
                      <FormDescription>
                        Fuente que se usará en el chat
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customization.userBubbleColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color de burbujas del usuario</FormLabel>
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
                        Color de fondo de los mensajes del usuario
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customization.assistantBubbleColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color de burbujas del asistente</FormLabel>
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
                        Color de fondo de los mensajes del asistente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="customization.defaultGreeting"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensaje de bienvenida</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="¡Hola! ¿En qué puedo ayudarte hoy?" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Primer mensaje que verá el usuario al abrir el chat
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          Mostrar disponibilidad
                        </FormLabel>
                        <FormDescription>
                          Mostrar estado "en línea" en el chat
                        </FormDescription>
                      </div>
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
                        value={field.value}
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
                      <FormDescription>
                        Estilo visual del chat
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Sección de gestión de documentos */}
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-medium">Gestión de Documentos</h3>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                accept=".pdf,.docx,.xlsx,.xls,.csv,.doc" 
                onChange={handleFileChange}
              />
              
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
                <h4 className="font-medium mb-4">Subir documentos adicionales</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Sube documentos (PDF, DOCX, Excel) para entrenar al chatbot con información adicional.
                </div>
                
                <div 
                  className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6 text-center cursor-pointer"
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
                    <Button 
                      type="button" 
                      onClick={uploadFiles}
                      disabled={isUploadingFiles}
                      className="mt-3"
                      size="sm"
                    >
                      {isUploadingFiles ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Subir archivos
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {integration?.documentsData && integration.documentsData.length > 0 && (
                  <div className="mt-4 border rounded-md p-3">
                    <h4 className="font-medium mb-2">Documentos subidos:</h4>
                    <ul className="space-y-2">
                      {integration.documentsData.map((doc: any, index: number) => (
                        <li key={index} className="flex items-center justify-between text-sm p-2 bg-white dark:bg-gray-800 rounded-md">
                          <div className="flex items-center">
                            <File className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="truncate">{doc.originalName}</span>
                            <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">
                              ({doc.mimetype})
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteDocument(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Sección de scraping */}
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-medium">Entrenamiento con contenido del sitio</h3>
              
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Extrae contenido actualizado de tu sitio web para entrenar el chatbot
                </div>
                
                <div className="flex gap-2 mb-4">
                  <Button 
                    type="button"
                    onClick={extractSiteContent}
                    disabled={isExtracting}
                    variant="outline"
                  >
                    {isExtracting ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Extrayendo...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Re-extraer contenido
                      </>
                    )}
                  </Button>
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
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={updateIntegrationMutation.isPending}
              >
                {updateIntegrationMutation.isPending ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar integración'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      {/* Sección del código de integración */}
      {scriptExample && (
        <Card className="mt-8 p-6">
          <h3 className="text-lg font-semibold mb-4">Código de integración</h3>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <code className="text-sm">{scriptExample}</code>
          </div>
        </Card>
      )}
    </div>
  );
}