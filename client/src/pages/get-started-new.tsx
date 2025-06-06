import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Copy, Check } from "lucide-react";

export default function GetStarted() {
  const [location, setLocation] = useLocation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [copiedBubble, setCopiedBubble] = useState(false);
  const [copiedFullscreen, setCopiedFullscreen] = useState(false);
  
  // Estado para las pestañas personalizadas
  const [tabValue, setTabValue] = useState("bubble");
  
  // URLs para los scripts de integración - USANDO EMBED.JS PARA AMBOS TIPOS
  const baseUrl = window.location.origin;
  const bubbleWidgetCode = `<script src="${baseUrl}/embed.js?key=aipi_web_internal" data-widget-type="bubble"></script>`;
  const fullscreenWidgetCode = `<script src="${baseUrl}/embed.js?key=aipi_web_internal" data-widget-type="fullscreen"></script>`;
  
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
            <div className="mb-8">
              {/* Pestañas personalizadas para la selección de tipo de widget */}
              <div className="flex w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                <button 
                  onClick={() => setTabValue("bubble")}
                  className={`flex-1 text-center text-lg py-4 font-medium transition-colors ${
                    tabValue === "bubble" 
                      ? "bg-primary-600 text-white" 
                      : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  Widget flotante (burbuja)
                </button>
                <button 
                  onClick={() => setTabValue("fullscreen")}
                  className={`flex-1 text-center text-lg py-4 font-medium transition-colors ${
                    tabValue === "fullscreen" 
                      ? "bg-primary-600 text-white" 
                      : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  Pantalla completa (estilo ChatGPT)
                </button>
              </div>
              
              {/* Contenido para el tab de widget flotante */}
              {tabValue === "bubble" && (
                <div className="space-y-8 mt-6">
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
                </div>
              )}
              
              {/* Contenido para el tab de pantalla completa */}
              {tabValue === "fullscreen" && (
                <div className="space-y-8 mt-6">
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
                      <h2 className="text-2xl font-bold">Paso 2: Personaliza la experiencia de chatbot</h2>
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-900">
                      <p className="mb-4 text-gray-700 dark:text-gray-300">
                        Personaliza cómo funciona el chatbot de pantalla completa desde tu panel de control:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                        <li>Configurar colores y tema visual del chat</li>
                        <li>Personalizar el nombre y avatar del asistente</li>
                        <li>Definir mensajes de bienvenida y sugerencias iniciales</li>
                        <li>Configurar idiomas y tono de conversación</li>
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
                      <h2 className="text-2xl font-bold">Paso 3: Entrena a tu asistente con tu contenido</h2>
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-900">
                      <p className="mb-4 text-gray-700 dark:text-gray-300">
                        Para que tu asistente de pantalla completa sea más útil, puedes entrenarlo con:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                        <li>Documentación de productos y manuales en formato PDF</li>
                        <li>Preguntas frecuentes y sus respuestas en documentos DOCX</li>
                        <li>Catálogos de productos en hojas de cálculo Excel</li>
                        <li>Instrucciones personalizadas sobre cómo responder a preguntas específicas</li>
                      </ul>
                      {user ? (
                        <Button size="lg" onClick={() => setLocation("/dashboard?tab=content")}>
                          Gestionar Documentos
                        </Button>
                      ) : (
                        <Button size="lg" onClick={() => setLocation("/register")}>
                          Crear Cuenta
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
