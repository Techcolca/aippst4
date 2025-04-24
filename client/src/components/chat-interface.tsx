import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { generateChatCompletion } from "@/lib/openai";
import { useTranslation } from "react-i18next";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  demoMode?: boolean;
  integrationId?: number;
  context?: string;
  welcomePageSettings?: {
    welcomePageChatEnabled?: boolean;
    welcomePageChatGreeting?: string;
    welcomePageChatBubbleColor?: string;
    welcomePageChatTextColor?: string;
    welcomePageChatBehavior?: string;
    // Nuevos campos para la configuración de scraping
    welcomePageChatScrapingEnabled?: boolean;
    welcomePageChatScrapingDepth?: number;
    welcomePageChatScrapingData?: string;
  };
}

export default function ChatInterface({ 
  demoMode = false, 
  integrationId,
  context = "",
  welcomePageSettings
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();

  // Función para obtener el mensaje de bienvenida según el idioma
  const getWelcomeMessage = () => {
    // Si hay un mensaje personalizado configurado, lo usamos primero
    if (welcomePageSettings?.welcomePageChatGreeting) {
      return welcomePageSettings.welcomePageChatGreeting;
    }
    
    // Si no, usamos un mensaje según el idioma actual
    const currentLanguage = i18n.language;
    console.log("Obteniendo mensaje de bienvenida para idioma:", currentLanguage);
    
    // Usar i18n para obtener traducciones
    return t('assistant.welcome_message', '👋 Bonjour ! Je suis AIPPS, votre assistant IA. Comment puis-je vous aider aujourd\'hui ?');
  };

  // Inicializar el chat con un mensaje de bienvenida
  useEffect(() => {
    const welcomeMessage = getWelcomeMessage();
    
    // Actualizar los mensajes con el nuevo mensaje de bienvenida cuando cambie el idioma
    setMessages([{ role: 'assistant', content: welcomeMessage }]);
    
    if (integrationId && !demoMode) {
      // Iniciar una conversación real si no estamos en modo demo y tenemos una integración
      startConversation();
    }
    
    console.log("Idioma cambiado a:", i18n.language);
    console.log("Mensaje de bienvenida actualizado:", welcomeMessage);
  }, [i18n.language, welcomePageSettings?.welcomePageChatGreeting]); // Re-ejecutar cuando cambie el idioma o el mensaje de bienvenida

  // Scroll automático al final de los mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Iniciar una conversación con la API
  const startConversation = async () => {
    if (!integrationId) return;
    
    try {
      const apiKey = 'aipps_mrPg94zRtTKr31hOY0m8PaPk305PJNVD';
      const response = await fetch(`/api/widget/${apiKey}/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          integrationId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error starting conversation: ${response.status}`);
      }
      
      const data = await response.json();
      setConversationId(data.id);
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isTyping) return;
    
    const userMessage: ChatMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    
    // Registrar el idioma actual que se usará para la respuesta
    const currentLanguage = i18n.language;
    console.log("Idioma actual para la respuesta:", currentLanguage);
    
    let response = "";
    
    try {
      if (demoMode) {
        // Demo mode: use OpenAI directly with environment context
        try {
          // Guardar el idioma actual para asegurarnos de que se usa en la respuesta
          const currentLanguage = i18n.language;
          console.log("Enviando mensaje con idioma:", currentLanguage);
          
          // Intentar detectar elementos de la página para proporcionar contexto
          const pageUrl = window.location.href;
          const pageTitle = document.title;
          
          // Extraer enlaces de navegación
          const navLinks = Array.from(document.querySelectorAll('nav a, header a, .navigation a, .menu a'))
            .map((link: Element) => ({
              text: link.textContent?.trim(),
              href: (link as HTMLAnchorElement).href
            }))
            .filter(link => link.text && link.text.length > 1); // Filtrar enlaces vacíos
          
          const navigationContent = navLinks.length > 0 
            ? navLinks.map(link => `- ${link.text} (${link.href})`).join('\n')
            : "No se detectaron enlaces de navegación";
          
          // Extraer posible contenido sobre servicios o características
          const servicesContent = Array.from(document.querySelectorAll('.features, .services, .pricing, [class*="feature"], [class*="service"], [class*="price"]'))
            .map(el => el.textContent?.trim())
            .filter(Boolean)
            .join('\n\n') || "No se detectó información específica sobre servicios o características";
          
          // Extraer contenido principal de la página
          const pageContent = document.body.innerText.substring(0, 3000) + "...";
          
          // Usar el comportamiento personalizado si está disponible
          const customBehavior = welcomePageSettings?.welcomePageChatBehavior;
          
          // Comprobar si hay datos de scraping disponibles del servidor
          let scrapedData = '';
          
          // Recopilar información estructurada sobre precios de los planes
          const pricingInfo = `
PRECIOS Y PLANES DE AIPPS:

Plan Gratuito:
- Hasta 20 interacciones por día
- Acceso al widget flotante para integración sencilla en el sitio web
- Respuestas basadas en la información disponible públicamente
- Sin personalización ni carga de documentos específicos
- Sin captura de leads ni seguimiento
- Análisis básicos de interacciones

Plan Básico:
- Precio: $29/mes
- Hasta 500 interacciones mensuales
- Incluye todas las funcionalidades del Paquete Gratuito
- Carga y procesamiento de documentos específicos (PDF, DOCX, Excel)
- Captura básica de leads con almacenamiento de información de contacto
- Análisis detallados de interacciones y consultas frecuentes

Plan Profesional:
- Precio: $79/mes
- Hasta 2,000 interacciones mensuales
- Incluye todas las funcionalidades del Paquete Básico
- Integración en pantalla completa tipo ChatGPT para una experiencia más inmersiva
- Automatización de tareas frecuentes y programación de seguimientos
- Análisis avanzados con métricas de rendimiento y tendencias
- Soporte prioritario

Plan Empresarial:
- Precio personalizado (desde $199/mes)
- Interacciones ilimitadas
- Incluye todas las funcionalidades del Paquete Profesional
- Personalización avanzada del asistente virtual (tono, estilo, branding)
- Integración con sistemas CRM y otras plataformas empresariales
- Análisis personalizados y reportes a medida
- Soporte dedicado con gestor de cuenta asignado
`;
          
          if (welcomePageSettings?.welcomePageChatScrapingEnabled && welcomePageSettings?.welcomePageChatScrapingData) {
            try {
              console.log("Usando el modelo OpenAI con contexto mejorado de la página");
              console.log("Usando datos de scraping del servidor para el chatbot");
              
              // Intentar parsear los datos de scraping guardados
              const parsedData = JSON.parse(welcomePageSettings.welcomePageChatScrapingData);
              console.log("Tamaño de los datos de scraping:", welcomePageSettings.welcomePageChatScrapingData.length);
              
              // Crear contexto estructurado para los datos
              scrapedData = "INFORMACIÓN EXTRAÍDA DEL SITIO:\n\n";
              
              // Mapeo del sitio
              if (parsedData.sitemap && Array.isArray(parsedData.sitemap)) {
                scrapedData += "MAPA DEL SITIO:\n";
                parsedData.sitemap.forEach((page: any) => {
                  scrapedData += `- ${page.title} (${page.url})\n`;
                });
                scrapedData += "\n\n";
              }
              
              // Información de precios si está disponible en el formato nuevo
              if (parsedData.pricing && Array.isArray(parsedData.pricing) && parsedData.pricing.length > 0) {
                scrapedData += "INFORMACIÓN DE PRECIOS Y PLANES DISPONIBLES:\n\n";
                parsedData.pricing.forEach((plan: any) => {
                  scrapedData += `### ${plan.name} ###\n`;
                  scrapedData += `- Precio: ${plan.price} ${plan.currency || 'USD'}/${plan.interval || 'mes'}\n`;
                  
                  if (plan.description) {
                    scrapedData += `- Descripción: ${plan.description}\n`;
                  }
                  
                  if (plan.features && Array.isArray(plan.features)) {
                    scrapedData += `- Características principales:\n`;
                    plan.features.forEach((feature: string) => {
                      scrapedData += `  * ${feature}\n`;
                    });
                  }
                  
                  scrapedData += '\n';
                });
                
                // Añadir recomendación específica para ayudar con preguntas sobre planes
                scrapedData += "\nGUÍA DE RECOMENDACIÓN DE PLANES:\n";
                scrapedData += "- Para usuarios individuales o pequeñas empresas con necesidades básicas: Plan Gratuito o Plan Básico\n";
                scrapedData += "- Para empresas medianas con necesidad de automatización: Plan Profesional\n";
                scrapedData += "- Para grandes corporaciones o necesidades personalizadas: Plan Empresarial\n\n";
              }
              
              // Información sobre formularios si está disponible
              if (parsedData.forms) {
                scrapedData += "INFORMACIÓN SOBRE CREACIÓN DE FORMULARIOS:\n\n";
                
                const formInfo = parsedData.forms;
                scrapedData += `${formInfo.description}\n\n`;
                
                // Pasos para crear un formulario
                scrapedData += "Pasos para crear un formulario:\n";
                if (formInfo.pasos_creacion && Array.isArray(formInfo.pasos_creacion)) {
                  formInfo.pasos_creacion.forEach((paso: string) => {
                    scrapedData += `${paso}\n`;
                  });
                }
                scrapedData += "\n";
                
                // Tipos de formularios
                scrapedData += "Tipos de formularios disponibles:\n";
                if (formInfo.tipos_formularios && Array.isArray(formInfo.tipos_formularios)) {
                  formInfo.tipos_formularios.forEach((tipo: any) => {
                    scrapedData += `- ${tipo.tipo}: ${tipo.descripcion}\n`;
                  });
                }
                scrapedData += "\n";
                
                // Opciones de integración
                scrapedData += "Opciones de integración de formularios:\n";
                if (formInfo.opciones_integracion && Array.isArray(formInfo.opciones_integracion)) {
                  formInfo.opciones_integracion.forEach((opcion: any) => {
                    scrapedData += `- ${opcion.opcion}: ${opcion.descripcion}\n`;
                  });
                }
                scrapedData += "\n";
                
                // Características avanzadas
                scrapedData += "Características avanzadas de los formularios:\n";
                if (formInfo.caracteristicas_avanzadas && Array.isArray(formInfo.caracteristicas_avanzadas)) {
                  formInfo.caracteristicas_avanzadas.forEach((caracteristica: string) => {
                    scrapedData += `- ${caracteristica}\n`;
                  });
                }
                scrapedData += "\n";
                
                // Pasos para integrar código
                scrapedData += "Cómo integrar un formulario en tu sitio web:\n";
                if (formInfo.paso_integracion_codigo && Array.isArray(formInfo.paso_integracion_codigo)) {
                  formInfo.paso_integracion_codigo.forEach((paso: string) => {
                    scrapedData += `${paso}\n`;
                  });
                }
                scrapedData += "\n";
                
                // Información de documentación
                if (formInfo.documentacion) {
                  scrapedData += "DOCUMENTACIÓN DISPONIBLE:\n\n";
                  scrapedData += `${formInfo.documentacion.general}\n\n`;
                  
                  // Secciones de documentación
                  scrapedData += "Secciones de documentación:\n";
                  if (formInfo.documentacion.secciones && Array.isArray(formInfo.documentacion.secciones)) {
                    formInfo.documentacion.secciones.forEach((seccion: any) => {
                      scrapedData += `- ${seccion.titulo}: ${seccion.descripcion} (${seccion.url})\n`;
                    });
                  }
                  scrapedData += "\n";
                  
                  // Preguntas frecuentes
                  scrapedData += "Preguntas frecuentes (FAQ):\n";
                  if (formInfo.documentacion.faq && Array.isArray(formInfo.documentacion.faq)) {
                    formInfo.documentacion.faq.forEach((faq: any, index: number) => {
                      scrapedData += `Pregunta ${index + 1}: ${faq.pregunta}\n`;
                      scrapedData += `Respuesta: ${faq.respuesta}\n\n`;
                    });
                  }
                  scrapedData += "\n";
                }
              }
              
              // Información sobre documentación
              if (parsedData.extraData && parsedData.extraData.documentation) {
                scrapedData += "DOCUMENTACIÓN Y RECURSOS DISPONIBLES:\n\n";
                const docData = parsedData.extraData.documentation;
                
                if (docData.general) {
                  scrapedData += `${docData.general}\n\n`;
                }
                
                if (docData.secciones && Array.isArray(docData.secciones)) {
                  scrapedData += "Secciones de documentación disponibles:\n";
                  docData.secciones.forEach((seccion: any) => {
                    scrapedData += `- ${seccion.titulo}: ${seccion.descripcion}\n`;
                    if (seccion.url) {
                      scrapedData += `  URL: ${seccion.url}\n`;
                    }
                  });
                  scrapedData += "\n";
                }
                
                if (docData.api) {
                  scrapedData += "DOCUMENTACIÓN DE LA API:\n";
                  if (docData.api.general) {
                    scrapedData += `${docData.api.general}\n\n`;
                  }
                  
                  if (docData.api.endpoints && Array.isArray(docData.api.endpoints)) {
                    scrapedData += "Endpoints disponibles:\n";
                    docData.api.endpoints.forEach((endpoint: any) => {
                      scrapedData += `- ${endpoint.nombre}: ${endpoint.descripcion}\n`;
                      if (endpoint.url) {
                        scrapedData += `  URL: ${endpoint.url}\n`;
                      }
                    });
                    scrapedData += "\n";
                  }
                  
                  if (docData.api.ejemplos && Array.isArray(docData.api.ejemplos)) {
                    scrapedData += "Ejemplos de uso de la API:\n";
                    docData.api.ejemplos.forEach((ejemplo: string) => {
                      scrapedData += `- ${ejemplo}\n`;
                    });
                    scrapedData += "\n";
                  }
                }
                
                if (docData.faq && Array.isArray(docData.faq)) {
                  scrapedData += "Preguntas frecuentes sobre la documentación y API:\n";
                  docData.faq.forEach((item: any) => {
                    scrapedData += `P: ${item.pregunta}\n`;
                    scrapedData += `R: ${item.respuesta}\n\n`;
                  });
                }
              }
              
              // Contenido extraído
              if (parsedData.content) {
                scrapedData += "CONTENIDO DEL SITIO:\n";
                
                Object.entries(parsedData.content).forEach(([url, pageData]: [string, any]) => {
                  if (pageData.title) {
                    scrapedData += `\n${pageData.title} (${url}):\n`;
                    if (pageData.content) {
                      const contentPreview = typeof pageData.content === 'string' 
                        ? pageData.content.substring(0, 500) 
                        : JSON.stringify(pageData.content).substring(0, 500);
                      scrapedData += `${contentPreview}...\n`;
                    }
                  }
                });
              }
              
              // Usar el nuevo formato si está disponible, de lo contrario usar el antiguo
            } catch (error) {
              console.error("Error al parsear datos de scraping:", error);
              // En caso de error, usar la información extraída en tiempo real
              scrapedData = '';
            }
          }
          
          // Si no hay datos de scraping del servidor o hubo un error, usar los datos extraídos en tiempo real
          const pageContext = scrapedData || `
INFORMACIÓN DEL SITIO:
URL: ${pageUrl}
Título: ${pageTitle}

NAVEGACIÓN DEL SITIO:
${navigationContent}

SERVICIOS Y CARACTERÍSTICAS DETECTADOS:
${servicesContent}

CONTENIDO DE LA PÁGINA:
${pageContent}
`;

          // Añadir instrucciones generales al contexto
          const contextWithInstructions = `
${pageContext}

${pricingInfo}

Eres AIPPS, un asistente de IA integrado en el sitio web de AIPPS.
Tu objetivo es proporcionar información útil, precisa y completa sobre la plataforma AIPPS,
sus servicios, características, precios y beneficios basándote en el contenido del sitio.

INSTRUCCIONES PARA PREGUNTAS SOBRE PRECIOS Y PLANES:
- Cuando te pregunten sobre precios o planes, proporciona detalles completos y estructurados
- Menciona siempre el precio, características principales y para qué tipo de cliente está recomendado cada plan
- Si preguntan por una recomendación, sugiere el plan más adecuado según sus necesidades
- Utiliza formato con viñetas para hacer la información más legible

INSTRUCCIONES PARA PREGUNTAS SOBRE FORMULARIOS:
- Cuando te pregunten sobre cómo crear o integrar formularios, proporciona los pasos detallados
- Si preguntan sobre tipos de formularios, explica las opciones disponibles y sus casos de uso
- Si preguntan sobre la integración de formularios en un sitio web, describe las diferentes opciones
- Incluye información sobre características avanzadas de formularios si es relevante para la consulta

INSTRUCCIONES PARA PREGUNTAS SOBRE DOCUMENTACIÓN:
- Cuando te pregunten sobre dónde encontrar documentación, proporciona las secciones disponibles
- Si preguntan por un tema específico, identifica la sección de documentación más relevante
- Si pregunten sobre una funcionalidad técnica, incluye cualquier información disponible en las secciones de la API y documentación
- Menciona las URLs de documentación específicas cuando estén disponibles
- Si hay una pregunta frecuente que coincida con la consulta, comparte esa información

INSTRUCCIONES GENERALES:
- Si te preguntan por un servicio o característica específica, busca la información en el contenido proporcionado
- Sé informativo, profesional y claro en tus respuestas
- Contesta siempre en español
- Prioriza la información extraída del sitio web sobre cualquier conocimiento general

INSTRUCCIONES DE COMPORTAMIENTO ESPECÍFICAS:
${customBehavior || 'Sé amable, informativo y conciso al responder preguntas sobre AIPPS y sus características.'}
`;
          
          const openAIResponse = await fetch('/api/openai/completion', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messages: messages.concat(userMessage),
              context: contextWithInstructions,
              language: i18n.language // Enviar el idioma actual al backend
            })
          });
          
          if (!openAIResponse.ok) {
            throw new Error(`Error calling OpenAI API: ${openAIResponse.status}`);
          }
          
          const data = await openAIResponse.json();
          response = data.message.content;
        } catch (error) {
          console.error("Error enviando mensaje a la API:", error);
          // Fallback a respuestas predefinidas si hay error en la API
          const demoResponses: Record<string, string> = {
            "hello": "¡Hola! Soy AIPPS, tu asistente virtual. ¿En qué puedo ayudarte hoy?",
            "hola": "¡Hola! Soy AIPPS, tu asistente virtual. ¿En qué puedo ayudarte hoy?",
            "ayuda": "Puedo ayudarte con información sobre nuestra plataforma AIPPS, sus características, cómo integrarla en tu sitio web y mucho más.",
            "features": "AIPPS ofrece IA conversacional, automatización de tareas, asistencia en tiempo real y análisis de contenido de tu sitio web.",
            "precios": "AIPPS ofrece varios planes adaptados a diferentes necesidades. Desde el plan Gratuito con hasta 20 interacciones diarias, pasando por el Básico ($29/mes), el Profesional ($79/mes) hasta el Empresarial (personalizado desde $199/mes)."
          };
          
          const lowerInput = inputValue.toLowerCase().trim();
          
          // Intentar encontrar respuesta predefinida como fallback
          if (demoResponses[lowerInput]) {
            response = demoResponses[lowerInput];
          } else if (Object.keys(demoResponses).find(key => lowerInput.includes(key))) {
            response = demoResponses[Object.keys(demoResponses).find(key => lowerInput.includes(key)) as string];
          } else if (lowerInput.match(/^(hola|buenos días|buenas tardes|buenas noches)$/)) {
            response = "¡Hola! Soy AIPPS, tu asistente virtual. ¿En qué puedo ayudarte hoy?";
          } else {
            response = "Lo siento, estoy teniendo problemas para conectarme al servidor. ¿Puedo ayudarte con información general sobre la plataforma AIPPS?";
          }
        }
      } else if (conversationId) {
        // Real API response using the widget API
        const apiKey = 'aipps_mrPg94zRtTKr31hOY0m8PaPk305PJNVD';
        
        const messageResponse = await fetch(`/api/widget/${apiKey}/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            conversationId,
            content: inputValue,
            role: 'user'
          })
        });
        
        if (!messageResponse.ok) {
          throw new Error(`Error sending message: ${messageResponse.status}`);
        }
        
        const data = await messageResponse.json();
        response = data.aiMessage.content;
      } else {
        // Fallback to the generateChatCompletion function
        response = await generateChatCompletion(
          messages.concat(userMessage),
          context,
          i18n.language // Pasar el idioma actual
        );
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Lo siento, encontré un error al procesar tu solicitud. Por favor, intenta de nuevo."
      }]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  // Estilo personalizado para burbujas de chat
  const userBubbleStyle = { backgroundColor: '#3B82F6', color: 'white' };
  const assistantBubbleStyle = welcomePageSettings?.welcomePageChatBubbleColor
    ? {
        backgroundColor: welcomePageSettings.welcomePageChatBubbleColor,
        color: welcomePageSettings.welcomePageChatTextColor || '#FFFFFF'
      }
    : { backgroundColor: 'rgb(229, 231, 235)', color: 'rgb(31, 41, 55)' };

  return (
    <div className="flex flex-col h-[450px] max-h-[450px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div 
              className="rounded-lg py-2 px-4 max-w-[80%]"
              style={message.role === 'user' ? userBubbleStyle : assistantBubbleStyle}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex mb-4">
            <div className="bg-gray-200 dark:bg-gray-800 rounded-lg py-2 px-4 text-gray-800 dark:text-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-3 flex dark:border-gray-700">
        <Input
          id="chat-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Escribe tu mensaje..."
          className="flex-1"
        />
        <Button 
          onClick={handleSendMessage} 
          className="ml-2"
          disabled={inputValue.trim() === '' || isTyping}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}