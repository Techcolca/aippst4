import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, Copy, SendHorizonal, Bot, ArrowDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function FormsGuide() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<{content: string, role: 'user' | 'assistant'}[]>([
    {
      role: 'assistant',
      content: 'Hola, soy tu asistente de AIPI. Estoy aquí para responder cualquier pregunta sobre la personalización de formularios y la integración con tu sitio web. ¿En qué puedo ayudarte?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // URL para el script de integración
  // Usar window.location.origin para obtener la URL base del sitio
  const formEmbedCode = `<!-- Código de ejemplo para integrar un formulario de AIPI -->
<script src="${window.location.origin}/static/form-embed.js?id=tu_id_de_formulario"></script>
<div id="aipi-form-container"></div>`;
  
  // Función para copiar código al portapapeles
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Función para enviar mensaje al asistente
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // Añadir mensaje del usuario
    const userMessage = { content: inputValue, role: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Simulamos una respuesta del asistente (en producción, esto llamaría a una API)
      setTimeout(() => {
        let botResponse = '';
        
        if (inputValue.toLowerCase().includes('personalizar') || inputValue.toLowerCase().includes('personalización')) {
          botResponse = 'Puedes personalizar tus formularios de varias maneras:\n\n1. Cambia los colores para que coincidan con tu marca\n2. Modifica el estilo y tamaño de fuente\n3. Ajusta el espaciado y bordes\n4. Personaliza los textos de los botones y mensajes\n5. Añade tu logotipo\n\nTodo esto lo puedes hacer desde el editor de formularios en tu dashboard.';
        } else if (inputValue.toLowerCase().includes('integrar') || inputValue.toLowerCase().includes('integración')) {
          botResponse = `Para integrar un formulario en tu sitio web, debes:\n\n1. Crear y publicar tu formulario desde el dashboard\n2. Copiar el código de integración que se proporciona\n3. Pegar este código en tu sitio web donde quieras que aparezca el formulario\n\nEl código se verá así:\n\`\`\`html\n${formEmbedCode}\n\`\`\`\n\nDonde "tu_id_de_formulario" será reemplazado por el ID único de tu formulario.`;
        } else if (inputValue.toLowerCase().includes('campos') || inputValue.toLowerCase().includes('field')) {
          botResponse = 'AIPI soporta diversos tipos de campos para tus formularios:\n\n• Texto corto\n• Texto largo (área de texto)\n• Email\n• Número\n• Teléfono\n• Fecha\n• Hora\n• Selección (dropdown)\n• Botones de radio\n• Casillas de verificación\n• Archivos\n• Dirección\n• URL\n• Consentimiento\n\nPuedes añadir, eliminar y reordenar estos campos según tus necesidades.';
        } else if (inputValue.toLowerCase().includes('url') || inputValue.toLowerCase().includes('link')) {
          botResponse = `La URL correcta para el script de integración de formularios es:\n\n\`\`\`html\n<script src="${window.location.origin}/static/form-embed.js?id=tu_id_de_formulario"></script>\n\`\`\`\n\nDonde "tu_id_de_formulario" debe ser reemplazado por el slug o ID específico de tu formulario. Este ID lo puedes encontrar en la página de detalles del formulario en tu dashboard.`;
        } else if (inputValue.toLowerCase().includes('respuestas') || inputValue.toLowerCase().includes('datos')) {
          botResponse = 'Las respuestas de tus formularios se almacenan de forma segura en tu cuenta de AIPI. Puedes:\n\n• Verlas en tiempo real desde el dashboard\n• Exportarlas en formato CSV\n• Configurar notificaciones por email cuando recibas nuevas respuestas\n• Analizar tendencias y patrones en los datos recibidos\n\nTodas las respuestas están protegidas y solo tú puedes acceder a ellas.';
        } else {
          botResponse = 'Gracias por tu pregunta. Puedo ayudarte con la personalización de formularios, tipos de campos disponibles, cómo integrar formularios en tu sitio web, y cómo administrar las respuestas. Si tienes preguntas específicas sobre alguno de estos temas, no dudes en preguntar.';
        }
        
        setMessages(prev => [...prev, { content: botResponse, role: 'assistant' }]);
        setIsLoading(false);
        scrollToBottom();
      }, 1000);
      
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      toast({
        title: 'Error al enviar mensaje',
        description: 'Hubo un problema al comunicarse con el asistente. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  // Función para desplazarse al último mensaje
  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Formularios Personalizables
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Crea, personaliza e integra formularios en tu sitio web para capturar información de tus visitantes.
            </p>
          </div>
        </section>
        
        <section className="py-12 bg-white dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold">Formularios Personalizables</h2>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  AIPI te permite crear y gestionar formularios personalizados para capturar información de tus visitantes de manera eficiente. Utiliza esta funcionalidad para generar leads, encuestas o registros de usuarios.
                </p>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Tipos de formularios disponibles</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                  <li><strong>Formularios de contacto:</strong> Para capturar información básica de visitantes interesados</li>
                  <li><strong>Formularios de lista de espera:</strong> Ideales para proyectos próximos a lanzarse</li>
                  <li><strong>Encuestas:</strong> Para recabar opiniones y feedback de tus usuarios</li>
                  <li><strong>Formularios de registro:</strong> Para crear cuentas de usuario o suscripciones</li>
                </ul>
                {user ? (
                  <Button size="lg" onClick={() => setLocation("/dashboard/forms")}>
                    Ir a Gestión de Formularios
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
                <h2 className="text-2xl font-bold">Crear tu Primer Formulario</h2>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  Sigue estos sencillos pasos para crear y publicar tu primer formulario:
                </p>
                <ol className="list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300 mb-6">
                  <li className="pl-2">
                    <strong className="text-primary-600 dark:text-primary-400">Accede al Panel de Formularios</strong>
                    <p className="mt-2 ml-6">Ve a la sección "Forms" en tu dashboard para comenzar a crear un nuevo formulario.</p>
                  </li>
                  <li className="pl-2">
                    <strong className="text-primary-600 dark:text-primary-400">Elige una Plantilla</strong>
                    <p className="mt-2 ml-6">Selecciona entre nuestras plantillas prediseñadas o comienza desde cero. Cada plantilla está optimizada para diferentes casos de uso.</p>
                  </li>
                  <li className="pl-2">
                    <strong className="text-primary-600 dark:text-primary-400">Personaliza los Campos</strong>
                    <p className="mt-2 ml-6">Añade, elimina o modifica campos según tus necesidades. Puedes crear campos de texto, selección, fecha, archivos y más.</p>
                  </li>
                  <li className="pl-2">
                    <strong className="text-primary-600 dark:text-primary-400">Configura la Apariencia</strong>
                    <p className="mt-2 ml-6">Ajusta los colores, fuentes y estilos para que coincidan con tu marca. Personaliza el texto de los botones y mensajes.</p>
                  </li>
                  <li className="pl-2">
                    <strong className="text-primary-600 dark:text-primary-400">Publica y Comparte</strong>
                    <p className="mt-2 ml-6">Una vez listo, haz clic en "Publicar" y obtén el código de integración para insertarlo en tu sitio web.</p>
                  </li>
                </ol>
                {user ? (
                  <Button size="lg" onClick={() => setLocation("/dashboard/forms/new")}>
                    Crear Nuevo Formulario
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
                <h2 className="text-2xl font-bold">Gestión de Respuestas</h2>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  Todas las respuestas de tus formularios son capturadas y almacenadas de forma segura en tu cuenta de AIPI. Puedes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                  <li>Ver todas las respuestas en tiempo real desde tu panel de control</li>
                  <li>Exportar los datos a CSV para análisis o integración con otras herramientas</li>
                  <li>Configurar notificaciones por email cuando recibas nuevas respuestas</li>
                  <li>Integrar con otros sistemas a través de webhooks</li>
                  <li>Analizar tendencias y patrones en las respuestas recibidas</li>
                </ul>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Consejo:</strong> Utiliza las respuestas de tus formularios para entrenar tu asistente AI, permitiéndole responder preguntas frecuentes basadas en la información recopilada.
                  </p>
                </div>
                {user ? (
                  <Button size="lg" onClick={() => setLocation("/dashboard/forms")}>
                    Ver Mis Formularios
                  </Button>
                ) : (
                  <Button size="lg" onClick={() => setLocation("/pricing")}>
                    Ver Planes
                  </Button>
                )}
              </div>
            </div>
            
            <div className="bg-primary-50 dark:bg-gray-800 rounded-lg p-6 border border-primary-100 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-primary-900 dark:text-primary-400">Integración en tu Sitio Web</h3>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Una vez creado tu formulario, podrás obtener el código de integración para insertarlo en tu sitio web. Este código generará un formulario con todos los campos y estilos que hayas configurado.
                </p>
                
                <div className="relative">
                  <pre className="bg-gray-900 text-white p-6 rounded-md overflow-x-auto text-sm">
                    {formEmbedCode}
                  </pre>
                  <button 
                    onClick={() => copyToClipboard(formEmbedCode)}
                    className="absolute top-3 right-3 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md"
                  >
                    {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-4">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Vista previa de un formulario</h4>
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center p-6 max-w-md">
                      <h5 className="font-medium text-xl mb-4 text-gray-900 dark:text-white">Formulario de Contacto</h5>
                      <div className="space-y-4 text-left">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre completo</label>
                          <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md" disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                          <input type="email" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md" disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensaje</label>
                          <textarea className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md" rows={3} disabled></textarea>
                        </div>
                        <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-md font-medium" disabled>Enviar mensaje</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Nota: Crear tu primer formulario es gratuito. Para formularios adicionales y funcionalidades avanzadas, consulta nuestros planes de precios.
                </p>
              </div>
            </div>
            

            
            <div className="flex justify-center mt-8">
              <Button asChild variant="outline" className="mr-4">
                <Link href="/get-started">
                  Volver a Guía de Inicio
                </Link>
              </Button>
              {user ? (
                <Button asChild>
                  <Link href="/dashboard/forms">
                    Ir a Mis Formularios
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/register">
                    Crear Cuenta
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}