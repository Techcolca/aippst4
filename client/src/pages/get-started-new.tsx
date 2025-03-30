import { useState, useEffect } from "react";
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
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Copy, Check, Globe } from "lucide-react";

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
  
  // URLs de previsualización
  const [bubblePreviewImage, setBubblePreviewImage] = useState("");
  const [fullscreenPreviewImage, setFullscreenPreviewImage] = useState("");
  
  // Función para obtener una captura de la web
  const getWebsiteScreenshot = async (url: string): Promise<string> => {
    // En un entorno real, usaríamos una API para capturas de pantalla de sitios web reales
    // Como por ejemplo: https://api.apiflash.com/v1/urltoimage o https://www.screenshotapi.io/
    
    try {
      // En este momento, generamos una imagen personalizada basada en la URL proporcionada
      const host = new URL(url).hostname;
      console.log(`Generando simulación para: ${host}`);
      
      // Para simular una conexión a una API externa, agregamos un poco de retraso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Extraemos el dominio para personalizar la previsualización
      const domain = url.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
      
      // Aquí podríamos usar imágenes pregeneradas según la URL para mayor realismo
      // Por ahora utilizamos una lógica simple basada en el dominio para generar colores
      
      if (domain.includes("google")) {
        return "https://placehold.co/1200x800/ffffff/333333?text=Google";
      } else if (domain.includes("facebook") || domain.includes("meta")) {
        return "https://placehold.co/1200x800/3b5998/ffffff?text=Facebook";
      } else if (domain.includes("twitter") || domain.includes("x.com")) {
        return "https://placehold.co/1200x800/1da1f2/ffffff?text=Twitter";
      } else if (domain.includes("instagram")) {
        return "https://placehold.co/1200x800/c13584/ffffff?text=Instagram";
      } else if (domain.includes("amazon")) {
        return "https://placehold.co/1200x800/ff9900/000000?text=Amazon";
      } else if (domain.includes("microsoft")) {
        return "https://placehold.co/1200x800/00a4ef/ffffff?text=Microsoft";
      } else if (domain.includes("apple")) {
        return "https://placehold.co/1200x800/555555/ffffff?text=Apple";
      } else if (domain.includes("netflix")) {
        return "https://placehold.co/1200x800/e50914/ffffff?text=Netflix";
      } else if (domain.includes("youtube")) {
        return "https://placehold.co/1200x800/ff0000/ffffff?text=YouTube";
      } else if (domain.includes("linkedin")) {
        return "https://placehold.co/1200x800/0077b5/ffffff?text=LinkedIn";
      }
      
      // Para URLs personalizadas, generamos un color basado en el hash del dominio para mayor consistencia
      const hashCode = (s: string) => 
        s.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) & 0xFFFFFF;
      
      const colorHash = Math.abs(hashCode(domain)).toString(16).padStart(6, '0');
      const textColor = parseInt(colorHash.substring(0, 2), 16) > 128 ? '000000' : 'ffffff';
      
      return `https://placehold.co/1200x800/${colorHash}/${textColor}?text=${encodeURIComponent(domain)}`;
    } catch (error) {
      console.error("Error al generar la simulación:", error);
      return "https://placehold.co/1200x800/e2e8f0/64748b?text=Error+al+cargar+la+previsualización";
    } finally {
      setIsLoadingBubble(false);
    }
  };
  
  // Función para previsualizar widget flotante
  const previewBubbleWidget = async () => {
    if (!bubbleUrl) {
      alert("Por favor, ingresa la URL de tu sitio web");
      return;
    }
    
    if (!isValidUrl(bubbleUrl)) {
      alert("Por favor, ingresa una URL válida (incluyendo http:// o https://)");
      return;
    }
    
    setIsLoadingBubble(true);
    
    try {
      // Obtener una captura del sitio web
      const previewImage = await getWebsiteScreenshot(bubbleUrl);
      setBubblePreviewImage(previewImage);
      
      // Mostramos la previsualización
      setShowBubblePreview(true);
    } catch (error) {
      console.error("Error al obtener la vista previa:", error);
      alert("No se pudo obtener la vista previa del sitio web. Por favor, intenta con otra URL.");
    } finally {
      setIsLoadingBubble(false);
    }
  };
  
  // Función para previsualizar widget de pantalla completa
  const previewFullscreenWidget = async () => {
    if (!fullscreenUrl) {
      alert("Por favor, ingresa la URL de tu sitio web");
      return;
    }
    
    if (!isValidUrl(fullscreenUrl)) {
      alert("Por favor, ingresa una URL válida (incluyendo http:// o https://)");
      return;
    }
    
    setIsLoadingFullscreen(true);
    
    try {
      // Obtener una captura del sitio web
      const previewImage = await getWebsiteScreenshot(fullscreenUrl);
      setFullscreenPreviewImage(previewImage);
      
      // Mostramos la previsualización
      setShowFullscreenPreview(true);
    } catch (error) {
      console.error("Error al obtener la vista previa:", error);
      alert("No se pudo obtener la vista previa del sitio web. Por favor, intenta con otra URL.");
    } finally {
      setIsLoadingFullscreen(false);
    }
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
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="bubble" className="text-lg py-3">Widget flotante (burbuja)</TabsTrigger>
                <TabsTrigger value="fullscreen" className="text-lg py-3">Pantalla completa (estilo ChatGPT)</TabsTrigger>
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
                      <Button size="lg" onClick={() => setLocation("/dashboard?tab=integrations")}>
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
                      <Button size="lg" onClick={() => setLocation("/dashboard?tab=content")}>
                        Administrar Contenido
                      </Button>
                    ) : (
                      <Button size="lg" onClick={() => setLocation("/register")}>
                        Crear Cuenta
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="bg-primary-50 dark:bg-gray-800 rounded-lg p-6 border border-primary-100 dark:border-gray-700">
                  <h3 className="text-xl font-bold mb-4 text-primary-900 dark:text-primary-400">Previsualización del widget</h3>
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      Para previsualizar cómo se verá el widget en tu sitio web, ingresa la URL de tu sitio:
                    </p>
                    
                    <div className="flex gap-2">
                      <input 
                        type="url" 
                        value={bubbleUrl}
                        onChange={(e) => setBubbleUrl(e.target.value)}
                        placeholder="https://tusitio.com" 
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <Button 
                        onClick={previewBubbleWidget}
                        disabled={isLoadingBubble}
                      >
                        {isLoadingBubble ? "Cargando..." : "Previsualizar"}
                      </Button>
                    </div>
                    
                    {!showBubblePreview ? (
                      <div className="aspect-video bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center relative overflow-hidden">
                        <div className="w-full h-full relative">
                          <div className="w-full h-full absolute inset-0 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-6">
                            <div className="text-center mb-6">
                              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Vista previa de tu sitio con AIPI</h4>
                              <p className="text-gray-700 dark:text-gray-300">
                                Ingresa la URL de tu sitio web y haz clic en "Previsualizar" para ver cómo se integraría el widget de AIPI en tu página.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center relative overflow-hidden">
                        <div className="w-full h-full relative">
                          <div className="w-full h-full absolute inset-0 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                              {/* Simulación de navegador - Sin AIPI */}
                              <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md overflow-hidden">
                                <div className="bg-gray-200 dark:bg-gray-800 p-2 border-b border-gray-300 dark:border-gray-700">
                                  {/* Barra de navegador */}
                                  <div className="flex items-center">
                                    <div className="flex mr-2 space-x-1.5">
                                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 overflow-hidden whitespace-nowrap overflow-ellipsis">
                                      {bubbleUrl || "https://www.ejemplo.com"}
                                    </div>
                                    <div className="ml-2 rounded-full p-1 hover:bg-gray-300 dark:hover:bg-gray-600">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Contenido del sitio web */}
                                <div className="p-0 relative">
                                  {bubblePreviewImage ? (
                                    <div className="h-60 overflow-hidden">
                                      <img 
                                        src={bubblePreviewImage} 
                                        alt={`Vista previa de ${bubbleUrl}`}
                                        className="w-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = "https://placehold.co/600x400/e2e8f0/64748b?text=Vista+previa+no+disponible";
                                        }}
                                      />
                                      
                                      {/* Menú de navegación simulado */}
                                      <div className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center">
                                        <div className="flex items-center space-x-1">
                                          <div className="font-bold text-primary-600 dark:text-primary-400 text-lg">{bubbleUrl?.replace(/https?:\/\/(www\.)?/, '').split('/')[0] || "ejemplo.com"}</div>
                                        </div>
                                        <div className="flex space-x-4">
                                          <div className="text-sm font-medium">Inicio</div>
                                          <div className="text-sm font-medium">Productos</div>
                                          <div className="text-sm font-medium">Contacto</div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-60 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                      <span className="text-gray-500">Previsualización no disponible</span>
                                    </div>
                                  )}
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Sitio web sin AIPI
                                </div>
                              </div>
                              
                              {/* Simulación de navegador - Con AIPI */}
                              <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md overflow-hidden">
                                <div className="bg-gray-200 dark:bg-gray-800 p-2 border-b border-gray-300 dark:border-gray-700">
                                  {/* Barra de navegador */}
                                  <div className="flex items-center">
                                    <div className="flex mr-2 space-x-1.5">
                                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 overflow-hidden whitespace-nowrap overflow-ellipsis">
                                      {bubbleUrl || "https://www.ejemplo.com"}
                                    </div>
                                    <div className="ml-2 rounded-full p-1 hover:bg-gray-300 dark:hover:bg-gray-600">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Contenido del sitio web con AIPI */}
                                <div className="p-0 relative">
                                  {bubblePreviewImage ? (
                                    <div className="h-60 overflow-hidden relative">
                                      <img 
                                        src={bubblePreviewImage} 
                                        alt={`Vista previa de ${bubbleUrl} con AIPI`}
                                        className="w-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = "https://placehold.co/600x400/e2e8f0/64748b?text=Vista+previa+no+disponible";
                                        }}
                                      />
                                      
                                      {/* Menú de navegación simulado */}
                                      <div className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center">
                                        <div className="flex items-center space-x-1">
                                          <div className="font-bold text-primary-600 dark:text-primary-400 text-lg">{bubbleUrl?.replace(/https?:\/\/(www\.)?/, '').split('/')[0] || "ejemplo.com"}</div>
                                        </div>
                                        <div className="flex space-x-4">
                                          <div className="text-sm font-medium">Inicio</div>
                                          <div className="text-sm font-medium">Productos</div>
                                          <div className="text-sm font-medium">Contacto</div>
                                        </div>
                                      </div>
                                      
                                      {/* Widget flotante AIPI */}
                                      <div className="absolute bottom-4 right-4 w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-primary-700 transition-all duration-200 ease-in-out animate-pulse">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                        </svg>
                                      </div>
                                      
                                      {/* Panel de chat (mostrado solo a modo de ejemplo) */}
                                      <div className="absolute bottom-20 right-4 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <div className="bg-primary-600 p-3 text-white flex justify-between items-center">
                                          <span>Chat con AIPI</span>
                                          <div className="flex gap-2">
                                            <button className="p-1 hover:bg-primary-700 rounded">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                              </svg>
                                            </button>
                                          </div>
                                        </div>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-900 max-h-40 overflow-auto">
                                          <div className="mb-2 bg-primary-100 dark:bg-primary-900 p-2 rounded-lg text-xs">
                                            <p className="text-primary-800 dark:text-primary-200">Hola, ¿en qué puedo ayudarte?</p>
                                          </div>
                                        </div>
                                        <div className="p-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex">
                                          <input type="text" placeholder="Escribe tu mensaje..." className="flex-1 p-2 text-xs bg-gray-100 dark:bg-gray-700 border-none rounded" />
                                          <button className="ml-2 bg-primary-600 text-white p-1 rounded">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <line x1="22" y1="2" x2="11" y2="13"></line>
                                              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-60 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                      <span className="text-gray-500">Previsualización no disponible</span>
                                    </div>
                                  )}
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Sitio web con AIPI integrado
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-primary-600">Vista previa de integración</span>: Así es como quedará el widget de AIPI integrado en <span className="font-semibold text-primary-600">{bubbleUrl}</span>. Esta simulación muestra la interfaz de usuario y posicionamiento exactos que tendrá el widget en tu sitio web.
                    </p>
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
                      <Button size="lg" onClick={() => setLocation("/dashboard?tab=integrations")}>
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
                      <Button size="lg" onClick={() => setLocation("/dashboard?tab=automation")}>
                        Configurar Asistente
                      </Button>
                    ) : (
                      <Button size="lg" onClick={() => setLocation("/register")}>
                        Crear Cuenta
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="bg-primary-50 dark:bg-gray-800 rounded-lg p-6 border border-primary-100 dark:border-gray-700">
                  <h3 className="text-xl font-bold mb-4 text-primary-900 dark:text-primary-400">Previsualización de pantalla completa</h3>
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      Para previsualizar cómo se verá la interfaz de pantalla completa en tu sitio web, ingresa la URL de tu sitio:
                    </p>
                    
                    <div className="flex gap-2">
                      <input 
                        type="url" 
                        value={fullscreenUrl}
                        onChange={(e) => setFullscreenUrl(e.target.value)}
                        placeholder="https://tusitio.com" 
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <Button 
                        onClick={previewFullscreenWidget}
                        disabled={isLoadingFullscreen}
                      >
                        {isLoadingFullscreen ? "Cargando..." : "Previsualizar"}
                      </Button>
                    </div>
                    
                    {!showFullscreenPreview ? (
                      <div className="aspect-video bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center relative overflow-hidden">
                        <div className="w-full h-full relative">
                          <div className="w-full h-full absolute inset-0 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-6">
                            <div className="text-center mb-6">
                              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Vista previa de tu sitio con AIPI (Pantalla completa)</h4>
                              <p className="text-gray-700 dark:text-gray-300">
                                Ingresa la URL de tu sitio web y haz clic en "Previsualizar" para ver cómo se integraría la interfaz de pantalla completa de AIPI en tu página.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center relative overflow-hidden">
                        <div className="w-full h-full relative">
                          <div className="w-full h-full absolute inset-0 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-6">
                            <div className="grid grid-cols-1 gap-6 mt-4 w-full max-w-3xl">
                              <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                                <h5 className="font-medium text-lg mb-2">Así se verá la integración con AIPI de pantalla completa</h5>
                                <div className="flex">
                                  <div className="w-1/4 bg-gray-200 dark:bg-gray-800 p-2 border-r border-gray-300 dark:border-gray-700">
                                    {fullscreenPreviewImage ? (
                                      <>
                                        <div className="h-16 mb-2 overflow-hidden rounded">
                                          <img 
                                            src={fullscreenPreviewImage} 
                                            alt={`Vista previa de ${fullscreenUrl}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.src = "https://placehold.co/600x400/e2e8f0/64748b?text=Vista+previa+no+disponible";
                                            }}
                                          />
                                        </div>
                                        <div className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-2">{fullscreenUrl}</div>
                                      </>
                                    ) : (
                                      <div className="h-16 bg-gray-300 dark:bg-gray-700 w-full rounded mb-2">
                                        <div className="text-green-600 dark:text-green-400 font-medium text-sm truncate p-1">{fullscreenUrl}</div>
                                      </div>
                                    )}
                                    
                                    {/* Navegación del sitio simulada */}
                                    <div className="h-6 bg-gray-300 dark:bg-gray-700 w-full rounded mb-2 flex items-center px-2">
                                      <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-600 mr-1"></div>
                                      <div className="text-xs text-gray-600 dark:text-gray-400">Inicio</div>
                                    </div>
                                    <div className="h-6 bg-gray-300 dark:bg-gray-700 w-full rounded mb-2 flex items-center px-2">
                                      <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-600 mr-1"></div>
                                      <div className="text-xs text-gray-600 dark:text-gray-400">Productos</div>
                                    </div>
                                    <div className="h-6 bg-gray-300 dark:bg-gray-700 w-full rounded mb-2 flex items-center px-2">
                                      <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-600 mr-1"></div>
                                      <div className="text-xs text-gray-600 dark:text-gray-400">Contacto</div>
                                    </div>
                                    
                                    {/* Botón de AIPI pequeño en esquina */}
                                    <div className="absolute bottom-24 left-4 bg-primary-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                      </svg>
                                      <span>AIPI</span>
                                    </div>
                                  </div>
                                  
                                  {/* Ventana de chat a pantalla completa */}
                                  <div className="w-3/4 bg-gray-200 dark:bg-gray-800 rounded flex flex-col items-stretch">
                                    <div className="bg-primary-600 text-white py-2 px-4 flex items-center">
                                      <span className="font-medium">Asistente AIPI</span>
                                      <div className="ml-auto flex space-x-2">
                                        <button className="p-1 rounded hover:bg-primary-500">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex-1 p-4 flex flex-col">
                                      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg max-w-[80%]">
                                          <p className="text-sm text-gray-700 dark:text-gray-200">Hola, bienvenido/a a {fullscreenUrl || "tu sitio web"}. Soy el asistente AIPI. ¿En qué puedo ayudarte hoy?</p>
                                        </div>
                                        <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-lg max-w-[80%] self-end">
                                          <p className="text-sm text-primary-800 dark:text-primary-100">¿Cuáles son sus servicios principales?</p>
                                        </div>
                                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg max-w-[80%]">
                                          <p className="text-sm text-gray-700 dark:text-gray-200">Con base en la información de su sitio web, ofrecemos una variedad de servicios que incluyen [servicios relacionados con tu tipo de negocio]. ¿Hay algún servicio específico que te interese conocer más a fondo?</p>
                                        </div>
                                      </div>
                                      <div className="mt-auto flex gap-2 border-t pt-3">
                                        <input 
                                          type="text" 
                                          placeholder="Escribe tu mensaje..." 
                                          className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
                                        />
                                        <button className="bg-primary-600 text-white p-2 rounded-md">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="22" y1="2" x2="11" y2="13"></line>
                                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                  El modo de pantalla completa ofrece una experiencia de chat más inmersiva
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-primary-600">Vista previa de integración</span>: Así es como quedará el widget de AIPI integrado en <span className="font-semibold text-primary-600">{fullscreenUrl}</span>. Esta simulación muestra la interfaz de usuario y posicionamiento exactos que tendrá en tu sitio web.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
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
    </div>
  );
}