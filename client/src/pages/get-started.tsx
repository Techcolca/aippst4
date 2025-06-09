import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, X, SendHorizonal, Copy, Check, Globe, CheckCircle2 } from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import CustomizationAssistant from "@/components/customization-assistant";

export default function GetStarted() {
  const [location, setLocation] = useLocation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [copiedBubble, setCopiedBubble] = useState(false);
  const [copiedFullscreen, setCopiedFullscreen] = useState(false);
  const [copiedForm, setCopiedForm] = useState(false);
  
  // Estado para las previsualizaciones
  const [bubbleUrl, setBubbleUrl] = useState("");
  const [fullscreenUrl, setFullscreenUrl] = useState("");
  const [showBubblePreview, setShowBubblePreview] = useState(false);
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);
  const [isLoadingBubble, setIsLoadingBubble] = useState(false);
  const [isLoadingFullscreen, setIsLoadingFullscreen] = useState(false);
  
  // URLs para los scripts de integración - USANDO EMBED.JS Y FORM-BUTTON.JS
  const baseUrl = window.location.origin;
  const bubbleWidgetCode = `<script src="${baseUrl}/embed.js?key=aipi_web_internal" data-widget-type="bubble"></script>`;
  const fullscreenWidgetCode = `<script src="${baseUrl}/embed.js?key=aipi_web_internal" data-widget-type="fullscreen"></script>`;
  const formWidgetCode = `<script src="${baseUrl}/form-button.js?key=aipi_web_internal" data-form-id="1" data-display-type="modal"></script>`;
  
  // Función para copiar código al portapapeles
  const copyToClipboard = (code: string, type: 'bubble' | 'fullscreen' | 'form') => {
    navigator.clipboard.writeText(code);
    if (type === 'bubble') {
      setCopiedBubble(true);
      setTimeout(() => setCopiedBubble(false), 2000);
    } else if (type === 'fullscreen') {
      setCopiedFullscreen(true);
      setTimeout(() => setCopiedFullscreen(false), 2000);
    } else if (type === 'form') {
      setCopiedForm(true);
      setTimeout(() => setCopiedForm(false), 2000);
    }
  };
  
  // Función para validar URL
  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Función para previsualizar widget flotante
  const previewBubbleWidget = () => {
    if (!bubbleUrl) {
      alert("Por favor, ingresa la URL de tu sitio web");
      return;
    }
    
    if (!isValidUrl(bubbleUrl)) {
      alert("Por favor, ingresa una URL válida (incluyendo http:// o https://)");
      return;
    }
    
    setIsLoadingBubble(true);
    // Simulamos una carga para mostrar la previsualización
    setTimeout(() => {
      setShowBubblePreview(true);
      setIsLoadingBubble(false);
    }, 1500);
  };
  
  // Función para previsualizar widget de pantalla completa
  const previewFullscreenWidget = () => {
    if (!fullscreenUrl) {
      alert("Por favor, ingresa la URL de tu sitio web");
      return;
    }
    
    if (!isValidUrl(fullscreenUrl)) {
      alert("Por favor, ingresa una URL válida (incluyendo http:// o https://)");
      return;
    }
    
    setIsLoadingFullscreen(true);
    // Simulamos una carga para mostrar la previsualización
    setTimeout(() => {
      setShowFullscreenPreview(true);
      setIsLoadingFullscreen(false);
    }, 1500);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Comienza con AIPI
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Integra el asistente de AIPI en tu sitio web en minutos con estas sencillas instrucciones.
            </p>
          </div>
        </section>
        
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue="bubble" className="w-full">
              <TabsList className="flex w-full justify-between mb-8">
                <TabsTrigger value="bubble" className="flex-1 text-lg py-3 px-2">Widget</TabsTrigger>
                <TabsTrigger value="fullscreen" className="flex-1 text-lg py-3 px-2">Pantalla</TabsTrigger>
                <TabsTrigger value="form" className="flex-1 text-lg py-3 px-2">Formulario</TabsTrigger>
              </TabsList>
              
              <TabsContent value="bubble" className="space-y-8">
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">Paso 1: Agrega este código a tu sitio web</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      Copia el siguiente código y pégalo justo antes de la etiqueta &lt;/body&gt; en tus páginas HTML:
                    </p>
                    <div className="relative">
                      <pre className="bg-gray-900 text-white p-6 rounded-md overflow-x-auto text-sm">
                        {bubbleWidgetCode}
                      </pre>
                      <button 
                        onClick={() => copyToClipboard(bubbleWidgetCode, 'bubble')}
                        className="absolute top-3 right-3 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md"
                      >
                        {copiedBubble ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    <div className="mt-4">
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>Si usas WordPress:</strong> Puedes agregarlo en el tema en footer.php o instalar un plugin que permita insertar código HTML.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">Paso 2: Personaliza el widget</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      Personaliza la apariencia y comportamiento del widget desde tu panel de control de AIPI:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                      <li>Colores y estilo visual del widget</li>
                      <li>Posición en la pantalla (esquina inferior derecha, izquierda, etc.)</li>
                      <li>Mensaje de bienvenida y comportamiento inicial</li>
                      <li>Idiomas soportados</li>
                    </ul>
                    {user ? (
                      <Button size="lg" onClick={() => setLocation("/dashboard/integrations")}>
                        Ir al Panel de Control
                      </Button>
                    ) : (
                      <Button size="lg" onClick={() => setLocation("/login")}>
                        Iniciar Sesión
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">Paso 3: Entrena tu asistente</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      Para que tu asistente proporcione respuestas útiles y relevantes, puedes entrenarlo con:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                      <li>Documentos PDF con información sobre tus productos o servicios</li>
                      <li>Archivos DOCX con preguntas frecuentes y sus respuestas</li>
                      <li>Archivos Excel con datos estructurados</li>
                      <li>Instrucciones específicas sobre el tono y estilo de las respuestas</li>
                    </ul>
                    {user ? (
                      <Button size="lg" onClick={() => setLocation("/dashboard/content")}>
                        Administrar Contenido
                      </Button>
                    ) : (
                      <Button size="lg" onClick={() => setLocation("/register")}>
                        Crear Cuenta
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">Paso 4: Configura Formularios (Opcional)</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      Potencia tu widget con formularios personalizados para capturar leads y información específica:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                      <li>Formularios de contacto y captura de leads</li>
                      <li>Encuestas de satisfacción y feedback</li>
                      <li>Formularios de registro para eventos</li>
                      <li>Integración automática con tu CRM</li>
                    </ul>
                    {user ? (
                      <Button size="lg" onClick={() => setLocation("/dashboard/forms")}>
                        Crear Formularios
                      </Button>
                    ) : (
                      <Button size="lg" onClick={() => setLocation("/register")}>
                        Crear Cuenta para Formularios
                      </Button>
                    )}
                  </div>
                </div>

              </TabsContent>
              
              <TabsContent value="fullscreen" className="space-y-8">
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">Paso 1: Agrega este código a tu sitio web</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      Copia el siguiente código y pégalo justo antes de la etiqueta &lt;/body&gt; en tus páginas HTML:
                    </p>
                    <div className="relative">
                      <pre className="bg-gray-900 text-white p-6 rounded-md overflow-x-auto text-sm">
                        {fullscreenWidgetCode}
                      </pre>
                      <button 
                        onClick={() => copyToClipboard(fullscreenWidgetCode, 'fullscreen')}
                        className="absolute top-3 right-3 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md"
                      >
                        {copiedFullscreen ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    <div className="mt-4">
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>Si usas WordPress:</strong> Puedes agregarlo en el tema en footer.php o instalar un plugin que permita insertar código HTML.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">Paso 2: Sistema de Autenticación Avanzado</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      El widget de pantalla completa incluye un sistema completo de autenticación que permite:
                    </p>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mb-6">
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
                        ✨ Funcionalidades de Usuario Autenticado
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                        <li><strong>Registro y Login:</strong> Sistema completo de autenticación de usuarios</li>
                        <li><strong>Historial Personal:</strong> Cada usuario mantiene su propio historial de conversaciones</li>
                        <li><strong>Títulos Automáticos:</strong> Generación automática de títulos descriptivos para conversaciones</li>
                        <li><strong>Gestión de Conversaciones:</strong> Crear, eliminar y organizar conversaciones personales</li>
                        <li><strong>Información de Usuario:</strong> Perfil personalizado con timestamps relativos</li>
                        <li><strong>Seguridad JWT:</strong> Autenticación segura con tokens encriptados</li>
                      </ul>
                    </div>
                    
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      Personaliza también la interfaz visual para que coincida con tu marca:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                      <li>Colores y estilo visual que coincida con tu marca</li>
                      <li>Mensajes de bienvenida personalizados para nuevos usuarios</li>
                      <li>Configuración de formularios de registro</li>
                      <li>Ajustes de privacidad y seguridad</li>
                    </ul>
                    {user ? (
                      <Button size="lg" onClick={() => setLocation("/dashboard/integrations")}>
                        Configurar Autenticación
                      </Button>
                    ) : (
                      <Button size="lg" onClick={() => setLocation("/login")}>
                        Iniciar Sesión
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">Paso 3: Configura las secciones ignoradas</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 border border-primary-200 dark:border-primary-800 mb-5">
                      <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-300 mb-2">
                        ¡Novedad! Control preciso del contenido analizado
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        La función "Secciones ignoradas" te permite excluir partes específicas de tu sitio web 
                        del análisis del chatbot, mejorando la precisión y relevancia de las respuestas.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                        <div className="flex items-start">
                          <span className="bg-primary-100 dark:bg-primary-800 rounded-full p-1 mr-2 flex-shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          </span>
                          <p className="text-sm">Excluye menús, pies de página y barras laterales irrelevantes</p>
                        </div>
                        <div className="flex items-start">
                          <span className="bg-primary-100 dark:bg-primary-800 rounded-full p-1 mr-2 flex-shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          </span>
                          <p className="text-sm">Mejora la privacidad excluyendo información sensible</p>
                        </div>
                        <div className="flex items-start">
                          <span className="bg-primary-100 dark:bg-primary-800 rounded-full p-1 mr-2 flex-shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          </span>
                          <p className="text-sm">Reduce costos al optimizar el uso de tokens</p>
                        </div>
                        <div className="flex items-start">
                          <span className="bg-primary-100 dark:bg-primary-800 rounded-full p-1 mr-2 flex-shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          </span>
                          <p className="text-sm">Obtén respuestas más precisas y relevantes</p>
                        </div>
                      </div>
                      <div className="mt-3 bg-gray-50 dark:bg-gray-800 rounded p-3">
                        <p className="text-sm font-medium mb-1">Ejemplo de configuración:</p>
                        <pre className="text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto">
{`aipi('init', {
  apiKey: 'TU_API_KEY',
  // Otras configuraciones...
  ignoredSections: ['Menú principal', 'Footer', 'Sidebar', 'Publicidad'],
});`}
                        </pre>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="mb-4 text-gray-700 dark:text-gray-300">
                        Configura qué secciones ignorar desde el panel de administración:
                      </p>
                      <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                        <li>Accede a la sección "Integraciones" del panel</li>
                        <li>Selecciona la integración que deseas configurar</li>
                        <li>Busca el apartado "Secciones a ignorar"</li>
                        <li>Agrega los nombres de las secciones que quieres excluir</li>
                      </ol>
                      {user ? (
                        <Button size="lg" onClick={() => setLocation("/dashboard/integrations")}>
                          Configurar Secciones
                        </Button>
                      ) : (
                        <Button size="lg" onClick={() => setLocation("/register")}>
                          Crear Cuenta
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">Paso 4: Configura las respuestas</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      Define el comportamiento de tu asistente y entrénalo con documentos específicos de tu negocio:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                      <li>Define instrucciones específicas para el chatbot</li>
                      <li>Sube documentos que contengan información relevante</li>
                      <li>Configura respuestas automáticas para preguntas comunes</li>
                      <li>Establece reglas de derivación a humanos cuando sea necesario</li>
                    </ul>
                    {user ? (
                      <Button size="lg" onClick={() => setLocation("/dashboard/automations")}>
                        Configurar Asistente
                      </Button>
                    ) : (
                      <Button size="lg" onClick={() => setLocation("/register")}>
                        Crear Cuenta
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">Paso 4: Integra Formularios y Autenticación</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      El modo pantalla completa permite integrar formularios avanzados con el sistema de autenticación:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                      <li>Formularios de registro de usuarios integrados</li>
                      <li>Captura de leads con autenticación</li>
                      <li>Seguimiento personalizado por usuario</li>
                      <li>Exportación de datos con información de usuario</li>
                    </ul>
                    {user ? (
                      <Button size="lg" onClick={() => setLocation("/dashboard/forms")}>
                        Configurar Formularios Avanzados
                      </Button>
                    ) : (
                      <Button size="lg" onClick={() => setLocation("/register")}>
                        Crear Cuenta para Funciones Avanzadas
                      </Button>
                    )}
                  </div>
                </div>

              </TabsContent>

              <TabsContent value="form" className="space-y-8">
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">Paso 1: Agrega este código a tu sitio web</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      Copia y pega este código en el HTML de tu sitio web, justo antes de la etiqueta de cierre &lt;/body&gt;:
                    </p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 relative">
                      <code className="text-sm">{formWidgetCode}</code>
                      <Button
                        onClick={() => copyToClipboard(formWidgetCode, 'form')}
                        className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600"
                        size="sm"
                      >
                        {copiedForm ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    {copiedForm && (
                      <p className="text-green-600 dark:text-green-400 text-sm mb-4">
                        ✓ Código copiado al portapapeles
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">Paso 2: Configuración del formulario</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      El botón flotante de formulario puede ser personalizado con los siguientes atributos:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Atributos básicos:</h3>
                        <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                          <li><code>data-form-id</code>: ID del formulario a mostrar</li>
                          <li><code>data-display-type</code>: "modal" o "slide-in"</li>
                          <li><code>data-position</code>: "bottom-right", "bottom-left", etc.</li>
                          <li><code>data-button-text</code>: Texto del botón</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Personalización:</h3>
                        <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                          <li><code>data-theme-color</code>: Color del botón</li>
                          <li><code>data-icon</code>: "form", "message", "help"</li>
                          <li><code>data-button-size</code>: "small", "medium", "large"</li>
                          <li><code>data-auto-show</code>: Mostrar automáticamente</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Ejemplo completo:</strong>
                      </p>
                      <pre className="text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto mt-2">
{`<script src="${baseUrl}/form-button.js?key=TU_API_KEY" 
        data-form-id="1" 
        data-display-type="modal"
        data-position="bottom-right"
        data-button-text="Contactar"
        data-theme-color="#3B82F6"
        data-icon="form">
</script>`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">Paso 3: Gestiona tus formularios</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      Crea y personaliza formularios desde el panel de administración:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                      <li>Accede a la sección "Formularios" en el panel</li>
                      <li>Crea un nuevo formulario con campos personalizados</li>
                      <li>Configura notificaciones por email</li>
                      <li>Personaliza el diseño y los colores</li>
                      <li>Copia el ID del formulario para usarlo en el código</li>
                    </ol>
                    {user ? (
                      <Button 
                        onClick={() => setLocation("/dashboard?tab=forms")}
                        className="bg-primary-600 hover:bg-primary-700"
                      >
                        Ir a Formularios
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setLocation("/login")}
                        className="bg-primary-600 hover:bg-primary-700"
                      >
                        Iniciar Sesión para Gestionar Formularios
                      </Button>
                    )}
                  </div>
                </div>

              </TabsContent>
            </Tabs>
            
            <div className="mt-10 bg-primary-50 dark:bg-gray-800 rounded-lg p-6 border border-primary-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-2 text-primary-900 dark:text-primary-400">Formularios Personalizables</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Crea formularios personalizados para capturar información de tus visitantes, generar leads y aumentar las conversiones.
                  </p>
                </div>
                <Button size="lg" asChild className="whitespace-nowrap">
                  <Link href="/forms-guide">
                    Ver Guía de Formularios
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <h3 className="text-2xl font-bold mb-4">¿Necesitas ayuda con la integración?</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Nuestro equipo de soporte está disponible para ayudarte con cualquier duda sobre la integración de AIPI en tu sitio web.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="outline">
                  Ver Documentación
                </Button>
                <Button size="lg">
                  Contactar Soporte
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* Asistente de personalización flotante */}
      <CustomizationAssistant />
    </div>
  );
}