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
import { Loader, CheckCircle, AlertCircle, Trash2, RefreshCw, Upload, File, ArrowLeft, Download } from "lucide-react";
import jsPDF from 'jspdf';

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
  language: z.enum(["es", "en", "fr"], {
    required_error: "Debes seleccionar un idioma"
  }).default("es"),
  textColor: z.enum(["auto", "white", "black"], {
    required_error: "Debes seleccionar un color de texto"
  }).default("auto"),
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
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "bottom-center"; // Incluir bottom-center para compatibilidad
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
  language?: string;
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
      language: "es",
      textColor: "auto",
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
        description: `Se han subido ${data.documents?.length || 0} documentos correctamente`,
      });
      
      // Refrescar la integración para mostrar los nuevos documentos
      queryClient.invalidateQueries({ queryKey: [`/api/integrations/${id}`] });
      setSelectedFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
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
      
      // Refrescar el contenido del sitio
      queryClient.invalidateQueries({ queryKey: [`/api/site-content/${id}`] });
      
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

  // Setup widget communication
  useEffect(() => {
    // Listen for widget configuration requests
    const handleWidgetMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'AIPPS_REQUEST_CONFIG') {
        console.log('Dashboard: Recibida solicitud de configuración del widget');
        
        const authToken = localStorage.getItem('auth_token');
        const apiBaseUrl = window.location.origin;
        
        // Send configuration to widget
        event.source?.postMessage({
          type: 'AIPPS_DASHBOARD_CONFIG',
          authToken: authToken,
          apiBaseUrl: apiBaseUrl,
          isDashboard: true
        }, '*');
        
        console.log('Dashboard: Configuración enviada al widget', {
          authToken: authToken ? 'Presente' : 'Ausente',
          apiBaseUrl
        });
      }
    };

    window.addEventListener('message', handleWidgetMessage);
    
    return () => {
      window.removeEventListener('message', handleWidgetMessage);
    };
  }, []);

  // Cargar datos en el formulario cuando estén disponibles
  useEffect(() => {
    if (integration) {
      form.reset({
        name: integration.name || "",
        url: integration.url || "",
        themeColor: integration.themeColor || "#3B82F6",
        position: integration.position === "bottom-center" ? "bottom-right" : integration.position || "bottom-right",
        active: integration.active,
        botBehavior: integration.botBehavior || "",
        widgetType: integration.widgetType as any || "bubble",
        ignoredSections: integration.ignoredSections || [],
        ignoredSectionsText: integration.ignoredSectionsText || "",
        description: integration.description || "",
        language: integration.language || "es",
        textColor: integration.textColor || "auto",
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

      // Actualizar script de ejemplo - USANDO EMBED.JS PARA TODOS LOS TIPOS
      const widgetType = integration.widgetType || "bubble";
      setScriptExample(`<script src="https://aipps.ca/embed.js?key=${integration.apiKey}" data-widget-type="${widgetType}"></script>`);
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

  // Función para generar y descargar la documentación en PDF
  const downloadDocumentationPDF = () => {
    if (!integration) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = 20;

    // Título principal
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Documentación de Integración', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Integración: ${integration.name}`, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    
    // Línea separadora
    yPosition += 10;
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    
    yPosition += 20;

    // Información básica
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Información de la Integración', margin, yPosition);
    
    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const basicInfo = [
      `Nombre: ${integration.name}`,
      `URL del sitio: ${integration.url || 'No especificada'}`,
      `Tipo de widget: ${integration.widgetType === 'bubble' ? 'Widget flotante (burbuja)' : 'Pantalla completa (estilo ChatGPT)'}`,
      `Posición: ${integration.position || 'bottom-right'}`,
      `Estado: ${integration.active ? 'Activa' : 'Inactiva'}`,
      `Color del tema: ${integration.themeColor || '#3B82F6'}`,
    ];

    basicInfo.forEach(info => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(info, margin, yPosition);
      yPosition += 8;
    });

    yPosition += 15;

    // Código de integración
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Código de Integración', margin, yPosition);
    
    yPosition += 15;
    doc.setFontSize(10);
    doc.setFont('courier', 'normal');
    
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Código HTML
    doc.text('Copie y pegue este código en su sitio web:', margin, yPosition);
    yPosition += 10;
    
    const codeLines = scriptExample ? scriptExample.split('\n') : [];
    codeLines.forEach(line => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 6;
    });

    yPosition += 15;

    // Instrucciones de implementación
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Instrucciones de Implementación', margin, yPosition);
    
    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    const instructions = [
      '1. Copie el código de integración mostrado arriba',
      '2. Pegue el código en el <head> o antes del cierre </body> de su sitio web',
      '3. Guarde y publique los cambios en su sitio web',
      '4. El widget aparecerá automáticamente en su sitio',
      '5. Verifique que el widget funciona correctamente visitando su sitio'
    ];

    instructions.forEach(instruction => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(instruction, margin, yPosition);
      yPosition += 8;
    });

    yPosition += 15;

    // Personalización
    if (integration.customization) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('4. Configuración de Personalización', margin, yPosition);
      
      yPosition += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      const customization = integration.customization;
      const customInfo = [
        `Nombre del asistente: ${customization.assistantName || 'AIPI Assistant'}`,
        `Saludo predeterminado: ${customization.defaultGreeting || '¡Hola! ¿En qué puedo ayudarte hoy?'}`,
        `Mostrar disponibilidad: ${customization.showAvailability ? 'Sí' : 'No'}`,
        `Color de burbuja del usuario: ${customization.userBubbleColor || '#1e88e5'}`,
        `Color de burbuja del asistente: ${customization.assistantBubbleColor || '#f5f5f5'}`,
        `Fuente: ${customization.font || 'Inter'}`,
        `Estilo de conversación: ${customization.conversationStyle || 'modern'}`,
      ];

      customInfo.forEach(info => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(info, margin, yPosition);
        yPosition += 8;
      });
    }

    // Documentos adjuntos
    if (integration.documentsData && integration.documentsData.length > 0) {
      yPosition += 15;
      
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('5. Documentos de Entrenamiento', margin, yPosition);
      
      yPosition += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      integration.documentsData.forEach((doc: any, index: number) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`${index + 1}. ${doc.originalName} (${doc.mimetype})`, margin, yPosition);
        yPosition += 8;
      });
    }

    // Pie de página
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, 285, { align: 'right' });
    }

    // Descargar el PDF
    doc.save(`documentacion-${integration.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
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
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Auto-save position changes
                        const currentValues = form.getValues();
                        updateIntegrationMutation.mutate({
                          ...currentValues,
                          position: value
                        });
                      }}
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
                      Dónde aparecerá el widget en la página (se guarda automáticamente)
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
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Auto-save language changes
                        const currentValues = form.getValues();
                        updateIntegrationMutation.mutate({
                          ...currentValues,
                          language: value
                        });
                      }}
                      value={field.value}
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
                      El idioma en que se mostrará el widget a los usuarios (se guarda automáticamente)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="textColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color del texto del asistente</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Auto-save text color changes
                        const currentValues = form.getValues();
                        updateIntegrationMutation.mutate({
                          ...currentValues,
                          textColor: value
                        });
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el color del texto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="auto">🎨 Automático (basado en contraste)</SelectItem>
                        <SelectItem value="white">⚪ Blanco</SelectItem>
                        <SelectItem value="black">⚫ Negro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Color del texto en los mensajes del asistente. "Automático" calcula el mejor contraste según el color de fondo.
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
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Update script example when widget type changes
                      if (integration?.apiKey) {
                        setScriptExample(`<script src="${window.location.origin}/embed.js?key=${integration.apiKey}" data-widget-type="${value}"></script>`);
                      }
                    }}
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Código de integración</h3>
            <Button 
              onClick={downloadDocumentationPDF}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar documentación PDF
            </Button>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <code className="text-sm">{scriptExample}</code>
          </div>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Instrucciones de implementación:</h4>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>1. Copie el código de integración mostrado arriba</li>
              <li>2. Pegue el código en el &lt;head&gt; o antes del cierre &lt;/body&gt; de su sitio web</li>
              <li>3. Guarde y publique los cambios en su sitio web</li>
              <li>4. El widget aparecerá automáticamente en su sitio</li>
              <li>5. Use el botón "Descargar documentación PDF" para obtener una guía completa</li>
            </ol>
          </div>
        </Card>
      )}
    </div>
  );
}
