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
                
                <div className="bg-primary-50 dark:bg-gray-800 rounded-lg p-6 border border-primary-100 dark:border-gray-700">
                  <h3 className="text-xl font-bold mb-4 text-primary-900 dark:text-primary-400">Previsualización del widget</h3>
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      Para previsualizar cómo se verá el widget en tu sitio web, ingresa la URL de tu sitio:
                    </p>
                    
                    <div className="flex gap-2">
                      <input 
                        type="url" 
                        placeholder="https://tusitio.com" 
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <Button>
                        Previsualizar
                      </Button>
                    </div>
                    
                    <div className="aspect-video bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center relative overflow-hidden">
                      <div className="w-full h-full relative">
                        <div className="w-full h-full absolute inset-0 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-6">
                          <div className="text-center mb-6">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Vista previa de tu sitio con AIPI</h4>
                            <p className="text-gray-700 dark:text-gray-300">
                              Ingresa la URL de tu sitio web y haz clic en "Previsualizar" para ver cómo se integraría el widget de AIPI en tu página.
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6 mt-4 w-full max-w-3xl">
                            <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                              <h5 className="font-medium text-lg mb-2">Sin AIPI</h5>
                              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center">
                                <span className="text-gray-500 dark:text-gray-400">Tu sitio web actual</span>
                              </div>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                              <h5 className="font-medium text-lg mb-2">Con AIPI</h5>
                              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center relative">
                                <span className="text-gray-500 dark:text-gray-400">Tu sitio web con AIPI</span>
                                <div className="absolute bottom-4 right-4 w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Nota: Esta vista previa es una simulación. Para una integración real, deberás agregar el código del widget a tu sitio web.
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
                
                <div className="bg-primary-50 dark:bg-gray-800 rounded-lg p-6 border border-primary-100 dark:border-gray-700">
                  <h3 className="text-xl font-bold mb-4 text-primary-900 dark:text-primary-400">Previsualización de pantalla completa</h3>
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      Para previsualizar cómo se verá la interfaz de pantalla completa en tu sitio web, ingresa la URL de tu sitio:
                    </p>
                    
                    <div className="flex gap-2">
                      <input 
                        type="url" 
                        placeholder="https://tusitio.com" 
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <Button>
                        Previsualizar
                      </Button>
                    </div>
                    
                    <div className="aspect-video bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center relative overflow-hidden">
                      <div className="w-full h-full relative">
                        <div className="w-full h-full absolute inset-0 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-6">
                          <div className="text-center mb-6">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Vista previa de tu sitio con AIPI (Pantalla completa)</h4>
                            <p className="text-gray-700 dark:text-gray-300">
                              Ingresa la URL de tu sitio web y haz clic en "Previsualizar" para ver cómo se integraría la interfaz de pantalla completa de AIPI en tu página.
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-6 mt-4 w-full max-w-3xl">
                            <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                              <h5 className="font-medium text-lg mb-2">Simulación del chat de pantalla completa</h5>
                              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded flex flex-col items-stretch">
                                <div className="bg-primary-600 text-white py-2 px-4 flex items-center">
                                  <span className="font-medium">Chat AIPI</span>
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
                                      <p className="text-sm text-gray-700 dark:text-gray-200">Hola, soy AIPI. ¿En qué puedo ayudarte hoy?</p>
                                    </div>
                                    <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-lg max-w-[80%] self-end">
                                      <p className="text-sm text-primary-800 dark:text-primary-100">¿Cuáles son tus servicios principales?</p>
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg max-w-[80%]">
                                      <p className="text-sm text-gray-700 dark:text-gray-200">Ofrecemos [servicios basados en tu sitio web]...</p>
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
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Nota: Esta vista previa es una simulación. Para una integración real, deberás agregar el código a tu sitio web.
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