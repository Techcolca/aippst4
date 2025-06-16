import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  ChevronLeft,
  Copy,
  Code,
  ExternalLink,
  Loader2,
  Check,
  Save,
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";

// Interfaces para el tipo de formulario
interface FormField {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: Array<string | { label: string; value?: string }>;
  defaultValue?: string;
}

interface FormStructure {
  fields: FormField[];
  submitButtonText: string;
}

interface FormStyling {
  theme?: 'light' | 'dark' | 'auto';
  fontFamily?: string;
  primaryColor?: string;
  borderRadius?: string;
  spacing?: string;
}

interface FormSettings {
  redirectUrl?: string;
  sendEmailNotification?: boolean;
  emailRecipients?: string;
  successMessage?: string;
  captcha?: boolean;
  storeResponses?: boolean;
  buttonColor?: string;
  submitButtonText?: string;
  buttonConfig?: {
    text: string;
    position: string;
    color: string;
    textColor: string;
    displayType: string;
    icon: string;
    size: string;
    borderRadius: string;
  };
}

interface Form {
  id: number;
  title: string;
  description?: string;
  type?: string;
  slug: string;
  published?: boolean;
  structure: FormStructure;
  styling: FormStyling;
  settings: FormSettings;
  responseCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Colores disponibles para el botón
const COLORS = [
  { value: "#4a90e2", label: "Azul" },
  { value: "#50e3c2", label: "Turquesa" },
  { value: "#b8e986", label: "Verde" },
  { value: "#f8e71c", label: "Amarillo" },
  { value: "#f5a623", label: "Naranja" },
  { value: "#d0021b", label: "Rojo" },
  { value: "#9013fe", label: "Púrpura" },
  { value: "#000000", label: "Negro" },
];

// Posiciones disponibles para el botón
const POSITIONS = [
  { value: "bottom-center", label: "Inferior centro" },
  { value: "top-center", label: "Superior centro" },
  { value: "bottom-right", label: "Inferior derecha" },
  { value: "bottom-left", label: "Inferior izquierda" },
  { value: "top-right", label: "Superior derecha" },
  { value: "top-left", label: "Superior izquierda" },
];

// Íconos disponibles para el botón
const ICONS = [
  { value: "form", label: "Formulario" },
  { value: "contact", label: "Contacto" },
  { value: "order", label: "Pedido" },
  { value: "survey", label: "Encuesta" },
  { value: "none", label: "Sin ícono" },
];

// Tipos de visualización del formulario
const DISPLAY_TYPES = [
  { value: "modal", label: "Ventana modal" },
  { value: "slidein", label: "Panel deslizante" },
  { value: "redirect", label: "Redirección" },
];

// Tamaños del botón
const SIZES = [
  { value: "small", label: "Pequeño" },
  { value: "medium", label: "Mediano" },
  { value: "large", label: "Grande" },
];

export default function FormIntegration() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  
  // Obtener detalles del formulario
  const { data: form = {} as Form, isLoading: isLoadingForm } = useQuery<Form>({
    queryKey: [`/api/forms/${id}`],
  });

  // Estado para configurar el botón
  const [buttonConfig, setButtonConfig] = useState({
    text: "Abrir formulario",
    position: "bottom-right",
    color: "#4a90e2",
    textColor: "#ffffff", // Color del texto, por defecto blanco
    displayType: "modal",
    icon: "form",
    size: "medium",
    borderRadius: "4",
  });
  
  // Mutación para guardar la configuración del botón
  const saveConfigMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/forms/${id}`, {
        settings: {
          ...(form.settings || {}),
          buttonConfig: buttonConfig
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "La configuración del botón ha sido guardada correctamente",
      });
      // Actualizar los datos del formulario en caché
      queryClient.invalidateQueries({ queryKey: [`/api/forms/${id}`] });
    },
    onError: (error) => {
      console.error("Error al guardar la configuración:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSaving(false);
    }
  });
  
  // Función para guardar la configuración
  const saveButtonConfig = () => {
    setIsSaving(true);
    saveConfigMutation.mutate();
  };
  
  // Cargar configuración guardada y actualizar texto e ícono según el tipo de formulario
  useEffect(() => {
    if (form?.title) {
      // Si hay una configuración guardada, cárgala
      if (form.settings?.buttonConfig) {
        setButtonConfig(form.settings.buttonConfig);
      } else {
        // Configuración predeterminada según el tipo de formulario
        const buttonText = form.type === 'contact' ? 'Contactar' : 
                          form.type === 'order' ? 'Hacer pedido' : 
                          form.type === 'survey' ? 'Responder encuesta' : 
                          'Abrir formulario';
        
        const iconType = form.type === 'contact' ? 'contact' : 
                        form.type === 'order' ? 'order' : 
                        form.type === 'survey' ? 'survey' : 
                        'form';
                        
        setButtonConfig(prev => ({ 
          ...prev, 
          text: buttonText,
          icon: iconType
        }));
      }
    }
  }, [form]);
  
  // Generar el código para incrustar el botón con la configuración actual
  const generateButtonCode = () => {
    return `<script src="${window.location.origin}/static/form-button.js" 
  id="aipi-form-button" 
  data-form-id="${id}" 
  data-text="${buttonConfig.text}" 
  data-position="${buttonConfig.position}"
  data-color="${buttonConfig.color}"
  data-text-color="${buttonConfig.textColor}"
  data-type="${buttonConfig.displayType}"
  data-icon="${buttonConfig.icon}"
  data-size="${buttonConfig.size}"
  data-radius="${buttonConfig.borderRadius}px"
  data-modal-width="600px"
  data-modal-height="800px">
</script>`;
  };
  
  // Generar el código para incrustar directamente el formulario
  const generateEmbedCode = () => {
    const timestamp = Date.now();
    return `<!-- Contenedor para el formulario -->
<div id="aipi-form-container"></div>

<!-- Script del formulario AIPI con cache busting -->
<script src="${window.location.origin}/static/form-embed.js?id=${form?.slug}&v=${timestamp}"></script>`;
  };
  
  // Copiar el código al portapapeles
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast({
        title: "Código copiado",
        description: "El código ha sido copiado al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Vista previa del botón flotante
  const ButtonPreview = () => (
    <div className="relative h-[300px] w-full border rounded-md bg-gray-50 dark:bg-gray-800 overflow-hidden">
      <div className="absolute w-full h-full flex items-center justify-center text-gray-400">
        <p>Vista previa de tu página web</p>
      </div>
      
      <button 
        className={`absolute 
          ${buttonConfig.position.includes('top') ? 'top-4' : 'bottom-4'} 
          ${buttonConfig.position.includes('center') 
            ? 'left-1/2 transform -translate-x-1/2' 
            : buttonConfig.position.includes('right') 
              ? 'right-4' 
              : 'left-4'
          }
          flex items-center justify-center px-4 py-2 rounded-md`}
        style={{ 
          backgroundColor: buttonConfig.color,
          color: buttonConfig.textColor, // Aplicamos el color de texto seleccionado
          fontSize: buttonConfig.size === 'small' ? '14px' : buttonConfig.size === 'large' ? '18px' : '16px',
          padding: buttonConfig.size === 'small' ? '6px 12px' : buttonConfig.size === 'large' ? '12px 24px' : '8px 16px',
          borderRadius: `${buttonConfig.borderRadius}px`
        }}
      >
        {buttonConfig.icon !== 'none' && (
          <span className="mr-2">
            {buttonConfig.icon === 'form' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="9"></line>
                <line x1="9" y1="13" x2="15" y2="13"></line>
                <line x1="9" y1="17" x2="13" y2="17"></line>
              </svg>
            )}
            {buttonConfig.icon === 'contact' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            )}
            {buttonConfig.icon === 'order' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            )}
            {buttonConfig.icon === 'survey' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polygon points="10 9 9 9 8 9 9 9"></polygon>
              </svg>
            )}
          </span>
        )}
        {buttonConfig.text}
      </button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="w-full max-w-full px-6 py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            className="mr-2" 
            onClick={() => navigate(`/forms/${id}/edit`)}
            title={t('back')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isLoadingForm 
                ? t('loading') 
                : `${t('integrate_form')}: ${form?.title || id}`}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {t('add_form_to_website')}
            </p>
          </div>
        </div>

        {isLoadingForm ? (
          <div className="w-full py-20 flex justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">{t('direct_embed')}</h2>
            
            {/* Solo mostramos la opción de incrustación directa */}
            <Card>
              <CardHeader>
                <CardTitle>{t('embed_form')}</CardTitle>
                <CardDescription>
                  {t('embed_form_description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 relative">
                  <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                    <code>{generateEmbedCode()}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generateEmbedCode())}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('paste_embed_code_anywhere')}
                </p>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}