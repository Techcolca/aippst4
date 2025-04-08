import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, X, SendHorizonal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  content: string;
  role: "user" | "assistant";
}

export default function CustomizationAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy el Asistente de Personalización de AIPI. Puedo ayudarte con cualquier pregunta sobre cómo personalizar o integrar AIPI con tu sitio web. ¿En qué puedo ayudarte hoy?"
    }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Simula una respuesta del asistente
  const simulateResponse = async (userMessage: string) => {
    // Identificar palabras clave y proporcionar respuestas relevantes
    let response = "";
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes("color") || lowerCaseMessage.includes("tema")) {
      response = "Puedes personalizar los colores y el tema de AIPI desde tu panel de control. Ve a 'Integraciones' -> selecciona tu integración -> 'Personalizar apariencia'. Allí podrás ajustar los colores primarios, fondo, texto y otros elementos visuales para que coincidan con tu marca.";
    } else if (lowerCaseMessage.includes("posición") || lowerCaseMessage.includes("ubicación")) {
      response = "La posición del widget flotante puede configurarse en tu panel de control. Por defecto, aparece en la esquina inferior derecha, pero puedes cambiarlo a la izquierda o ajustar los márgenes según tus preferencias.";
    } else if (lowerCaseMessage.includes("wordpress") || lowerCaseMessage.includes("cms")) {
      response = "Para integrar AIPI en WordPress, puedes agregar el código del script en tu tema (footer.php) o usar un plugin como 'Header and Footer Scripts' para insertar el código sin modificar los archivos del tema directamente.";
    } else if (lowerCaseMessage.includes("mensaje") || lowerCaseMessage.includes("bienvenida")) {
      response = "El mensaje de bienvenida puede personalizarse desde el panel de control en la sección 'Integraciones'. Puedes establecer un mensaje amigable que refleje la personalidad de tu marca y explique a los visitantes cómo puede ayudarles el asistente.";
    } else if (lowerCaseMessage.includes("idioma") || lowerCaseMessage.includes("traducción") || lowerCaseMessage.includes("lenguaje")) {
      response = "AIPI soporta múltiples idiomas. Puedes configurar el idioma principal y los idiomas adicionales en la sección 'Configuración' de tu panel de control. El asistente detectará automáticamente el idioma del usuario o respetará la configuración que establezcas.";
    } else if (lowerCaseMessage.includes("script") && (lowerCaseMessage.includes("formulario") || lowerCaseMessage.includes("form"))) {
      response = "El script para formularios tiene este formato: `<script src=\"https://api.aipi.example.com/form.js?id=ID-DEL-FORMULARIO\"></script>`\n\nDonde la URL completa sería: https://api.aipi.example.com/form/ID-DEL-FORMULARIO\n\nPor ejemplo, con un script como `<script src=\"https://api.aipi.example.com/form.js?id=registro-a-newsletter-242025\"></script>`, la URL del formulario sería: https://api.aipi.example.com/form/registro-a-newsletter-242025\n\nPuedes compartir esta URL directamente o incrustar el script en tu página web para mostrar el formulario.";
    } else if (lowerCaseMessage.includes("url") && (lowerCaseMessage.includes("formulario") || lowerCaseMessage.includes("form"))) {
      response = "Para cada formulario que creas, se genera un ID único (como 'registro-a-newsletter-242025'). La URL del formulario se construye así:\n\nhttps://api.aipi.example.com/form/[ID-DEL-FORMULARIO]\n\nEsta URL es directamente accesible y puedes compartirla con tus usuarios. También puedes obtener un código de incrustación desde el panel de control para mostrar el formulario dentro de tu sitio web.";
    } else if (lowerCaseMessage.includes("formulario") || lowerCaseMessage.includes("form")) {
      response = "Puedes crear y personalizar formularios en la sección 'Formularios' de tu panel de control. Tenemos varios tipos prediseñados (contacto, encuesta, registro) que puedes adaptar a tus necesidades. Para cada formulario, se genera un código de incrustación y una URL única. El código tiene el formato: `<script src=\"https://api.aipi.example.com/form.js?id=ID-DEL-FORMULARIO\"></script>` y la URL sería: https://api.aipi.example.com/form/ID-DEL-FORMULARIO";
    } else if (lowerCaseMessage.includes("error") || lowerCaseMessage.includes("no funciona")) {
      response = "Si estás experimentando problemas con la integración, verifica: 1) Que el código esté correctamente insertado antes del cierre de </body>, 2) Que tu suscripción esté activa, 3) Que no haya bloqueadores de scripts en el navegador. Si el problema persiste, contacta a nuestro soporte técnico.";
    } else if (lowerCaseMessage.includes("precio") || lowerCaseMessage.includes("costo") || lowerCaseMessage.includes("plan")) {
      response = "AIPI ofrece diferentes planes según tus necesidades: Free (limitado), Basic, Professional y Enterprise. Puedes ver los detalles de cada plan y sus precios en la página de Precios. También ofrecemos descuentos para suscripciones anuales.";
    } else if (lowerCaseMessage.includes("id") && lowerCaseMessage.includes("formulario")) {
      response = "El ID de un formulario es una cadena única que identifica tu formulario en nuestro sistema. Por ejemplo, 'registro-a-newsletter-242025'. Este ID se genera automáticamente cuando creas un formulario y aparece en el código de incrustación: `<script src=\"https://api.aipi.example.com/form.js?id=ID-DEL-FORMULARIO\"></script>`. También puedes encontrar el ID en tu panel de control, en la sección 'Formularios'.";
    } else {
      response = "Gracias por tu pregunta. Para personalizar cualquier aspecto de AIPI, generalmente necesitarás acceder a tu panel de control. Allí encontrarás opciones para cambiar la apariencia, comportamiento, mensajes y mucho más. ¿Hay algo específico que te gustaría saber?";
    }
    
    // Simula un retraso para que parezca que está pensando
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return response;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Añade el mensaje del usuario
    const userMessage = { role: "user" as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsSending(true);
    
    try {
      // Simula respuesta de IA
      const response = await simulateResponse(input);
      
      // Añade la respuesta del asistente
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      toast({
        title: "Error al procesar la solicitud",
        description: "No se pudo obtener una respuesta. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  // Scroll al fondo cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Enfocar el input cuando se abre el chat
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Manejar envío con Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Formatear el contenido del mensaje con código
  const formatMessageContent = (content: string): React.ReactNode => {
    if (!content.includes('`')) return content;
    
    // Dividir el contenido en segmentos de código y texto regular
    const segments = content.split(/(`[^`]+`)/);
    
    return segments.map((segment, i) => {
      if (segment.startsWith('`') && segment.endsWith('`')) {
        // Es un segmento de código, lo formateamos especialmente
        const code = segment.substring(1, segment.length - 1);
        return (
          <code key={i} className="bg-gray-200 dark:bg-gray-700 px-1 rounded font-mono text-sm">
            {code}
          </code>
        );
      }
      // Es texto regular
      return <span key={i}>{segment}</span>;
    });
  };

  return (
    <>
      {/* Botón flotante para abrir el chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all z-50"
          aria-label="Abrir asistente de personalización"
        >
          <Bot size={24} />
        </button>
      )}

      {/* Ventana de chat */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[350px] md:w-[400px] h-[500px] shadow-xl z-50 flex flex-col">
          <div className="bg-primary text-white p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-medium">Asistente de Personalización</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
              aria-label="Cerrar asistente"
            >
              <X size={20} />
            </button>
          </div>
          
          <CardContent className="flex-grow overflow-auto p-4 flex flex-col gap-3">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {msg.role === "assistant" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-white">AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div 
                    className={`py-2 px-3 rounded-lg whitespace-pre-wrap ${
                      msg.role === "user" 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-gray-100 dark:bg-gray-800 rounded-tl-none"
                    }`}
                  >
                    {formatMessageContent(msg.content)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>
          
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta aquí..."
              disabled={isSending}
              className="flex-grow"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isSending || !input.trim()}
              size="icon"
            >
              <SendHorizonal size={18} />
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}