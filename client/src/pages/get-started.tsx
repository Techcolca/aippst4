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
import { Bot, X, SendHorizonal, Copy, Check, Globe } from "lucide-react";
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
  
  // Estado para las previsualizaciones
  const [bubbleUrl, setBubbleUrl] = useState("");
  const [fullscreenUrl, setFullscreenUrl] = useState("");
  const [showBubblePreview, setShowBubblePreview] = useState(false);
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);
  const [isLoadingBubble, setIsLoadingBubble] = useState(false);
  const [isLoadingFullscreen, setIsLoadingFullscreen] = useState(false);
  
  // URLs para los scripts de integración
  const baseUrl = "https://a82260a7-e706-4639-8a5c-db88f2f26167-00-2a8uzldw0vxo4.picard.replit.dev";
  const bubbleWidgetCode = `<script src="${baseUrl}/static/aipi-web-widget.js?key=aipi_web_internal"></script>`;
  const fullscreenWidgetCode = `<script src="${baseUrl}/static/fullscreen-embed.js?key=aipi_web_internal"></script>`;
  
  // Función para copiar código al portapapeles
  const copyToClipboard = (code: string, type: 'bubble' | 'fullscreen') => {
    navigator.clipboard.writeText(code);
    if (type === 'bubble') {
      setCopiedBubble(true);
      setTimeout(() => setCopiedBubble(false), 2000);
    } else {
      setCopiedFullscreen(true);
      setTimeout(() => setCopiedFullscreen(false), 2000);
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
        <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Comienza con AIPI
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Integra el asistente de AIPI en tu sitio web en minutos con estas sencillas instrucciones.
            </p>
          </div>
        </section>
        
        <section className="py-12 bg-white dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue="bubble" className="w-full">
              <TabsList className="flex w-full justify-between mb-8">
                <TabsTrigger value="bubble" className="flex-1 text-lg py-3 px-2">Widget</TabsTrigger>
                <TabsTrigger value="fullscreen" className="flex-1 text-lg py-3 px-2">Pantalla</TabsTrigger>
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
                    <h2 className="text-2xl font-bold">Paso 2: Personaliza la interfaz</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      Personaliza la interfaz de pantalla completa para que se integre con el diseño de tu sitio web:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                      <li>Colores y estilo visual que coincida con tu marca</li>
                      <li>Tamaño y posición del botón de inicio de chat</li>
                      <li>Configuración de transiciones y animaciones</li>
                      <li>Ajustes de accesibilidad</li>
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
                    <h2 className="text-2xl font-bold">Paso 3: Configura las respuestas</h2>
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