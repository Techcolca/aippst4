import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { generateChatCompletion } from "@/lib/openai";

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
  context,
  welcomePageSettings
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Usar configuración personalizada o predeterminada
  const defaultGreeting = '👋 ¡Hola! Soy AIPPS, tu asistente de IA. ¿En qué puedo ayudarte hoy?';
  const greeting = welcomePageSettings?.welcomePageChatGreeting || defaultGreeting;
  
  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { 
          role: 'assistant', 
          content: greeting
        }
      ]);
      
      // If not in demo mode, start conversation with the API
      if (!demoMode) {
        startConversation();
      }
    }
  }, [messages, demoMode, greeting]);
  
  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Start a new conversation with the API
  const startConversation = async () => {
    try {
      // Using a default API key for testing within the app itself
      const apiKey = 'aipps_mrPg94zRtTKr31hOY0m8PaPk305PJNVD';
      
      // Create a visitor ID (could be more sophisticated in a real app)
      const visitorId = 'visitor_' + Math.random().toString(36).substring(2, 15);
      
      const response = await fetch(`/api/widget/${apiKey}/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ visitorId })
      });
      
      if (!response.ok) {
        throw new Error(`Error starting conversation: ${response.status}`);
      }
      
      const data = await response.json();
      setConversationId(data.id);
      console.log('Conversation started:', data.id);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    
    const userMessage = { role: 'user' as const, content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    
    try {
      let response: string;
      
      // En modo demo, usamos la API de OpenAI directamente en lugar de la API del widget
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 600)); // Pequeña espera para simular procesamiento
        
        try {
          // Capturar el contexto de la página actual de forma exhaustiva
          let pageContent = '';
          
          // Extraer contenido de varias secciones principales
          const mainContentSelectors = [
            'main', 'article', '.main-content', '#main-content', 
            '.content', '#content', '.page-content', '.container', 
            '.page', '.services', '.features', '.pricing', '.about'
          ];
          
          // Intentar extraer contenido de diferentes partes de la página
          for (const selector of mainContentSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent) {
              pageContent += element.textContent.trim() + '\n\n';
            }
          }
          
          // Si no se encontró contenido con los selectores, usar todo el body
          if (!pageContent) {
            // Crear una copia del body para manipular
            const bodyClone = document.body.cloneNode(true) as HTMLElement;
            
            // Eliminar elementos que típicamente no tienen contenido relevante
            const elementsToRemove = bodyClone.querySelectorAll(
              'script, style, noscript, iframe, svg'
            );
            elementsToRemove.forEach(el => el.remove());
            
            pageContent = bodyClone.textContent?.trim() || '';
          }
          
          // Extraer información de navegación (puede contener enlaces a servicios)
          let navigationContent = '';
          const navElements = document.querySelectorAll('nav, header, .navigation, .navbar, .menu');
          navElements.forEach(nav => {
            // Extraer enlaces y textos
            const links = nav.querySelectorAll('a');
            links.forEach(link => {
              if (link.textContent && link.textContent.trim()) {
                navigationContent += `${link.textContent.trim()} (${link.getAttribute('href') || '#'})\n`;
              }
            });
          });
          
          // Extraer información específica sobre servicios/características
          let servicesContent = '';
          const serviceSelectors = [
            '.services', '.features', '.pricing', '.plans', 
            '.product', '.cards', '.service-item', '.feature-item'
          ];
          
          for (const selector of serviceSelectors) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              // Buscar títulos dentro de los elementos de servicio
              const titles = el.querySelectorAll('h1, h2, h3, h4, h5, h6');
              titles.forEach(title => {
                if (title.textContent && title.textContent.trim()) {
                  servicesContent += `SERVICIO/CARACTERÍSTICA: ${title.textContent.trim()}\n`;
                  
                  // Buscar descripciones cerca del título
                  let nextEl = title.nextElementSibling;
                  while (nextEl && !nextEl.tagName.startsWith('H')) {
                    if (nextEl.textContent && nextEl.textContent.trim()) {
                      servicesContent += `${nextEl.textContent.trim()}\n`;
                    }
                    nextEl = nextEl.nextElementSibling;
                  }
                  servicesContent += '\n';
                }
              });
            });
          }
          
          const pageTitle = document.title;
          const pageUrl = window.location.href;
          
          console.log("Usando el modelo OpenAI con contexto mejorado de la página");
          
          // En lugar de usar la API del widget, vamos a usar directamente la API de OpenAI
          const allMessages = messages.concat(userMessage);
          
          // Usar el comportamiento personalizado si está disponible
          const customBehavior = welcomePageSettings?.welcomePageChatBehavior;
          
          // Comprobar si hay datos de scraping disponibles del servidor
          let scrapedData = '';
          if (welcomePageSettings?.welcomePageChatScrapingEnabled && welcomePageSettings?.welcomePageChatScrapingData) {
            try {
              // Intentar parsear los datos de scraping guardados
              const parsedData = JSON.parse(welcomePageSettings.welcomePageChatScrapingData);
              
              // Crear contenido estructurado a partir de los datos parseados
              scrapedData = `
INFORMACIÓN EXTRAÍDA DE LAS PÁGINAS DEL SITIO (${parsedData.pageCount || 0} páginas analizadas):
`;
              
              // PRIMER NIVEL: Recopilamos todos los títulos y URLs para crear un mapa
              let pagesOverview = "MAPA DEL SITIO:\n";
              if (parsedData.pages && Array.isArray(parsedData.pages)) {
                parsedData.pages.forEach((page: any, index: number) => {
                  if (page.url && page.title) {
                    pagesOverview += `- ${page.title} (${page.url})\n`;
                  }
                });
              }
              scrapedData += pagesOverview + "\n\n";
              
              // SEGUNDO NIVEL: Procesar los encabezados y secciones importantes
              let headings = "SECCIONES DEL SITIO:\n";
              let servicesContent = "SERVICIOS Y PLANES:\n";
              let navigationLinks = "ENLACES IMPORTANTES:\n";
              let pricingContent = "INFORMACIÓN DE PRECIOS:\n";
              let hasFoundPricing = false;
              
              // Agregar información de cada página
              if (parsedData.pages && Array.isArray(parsedData.pages)) {
                parsedData.pages.forEach((page: any, index: number) => {
                  if (page.content) {
                    const content = page.content.toString();
                    
                    // Extraer enlaces y navegación
                    const navigationMatches = content.match(/NAVEGACIÓN:[\s\S]*?Enlace: ([^\n]+)/g);
                    if (navigationMatches) {
                      navigationMatches.forEach(match => {
                        navigationLinks += `- ${match.replace('NAVEGACIÓN:', '').trim()}\n`;
                      });
                    }
                    
                    // Extraer secciones importantes
                    const estructuraMatch = content.match(/ESTRUCTURA:[\s\S]*?(?=\n\nNAVEGACIÓN:|$)/);
                    if (estructuraMatch && estructuraMatch[0]) {
                      const estructuraContent = estructuraMatch[0].replace('ESTRUCTURA:', '').trim();
                      headings += estructuraContent + '\n';
                    }
                    
                    // Buscar explícitamente menciones a precios o planes
                    if (
                      page.title.toLowerCase().includes('precio') ||
                      page.title.toLowerCase().includes('plan') ||
                      page.title.toLowerCase().includes('tarifa') ||
                      page.url.toLowerCase().includes('precio') ||
                      page.url.toLowerCase().includes('plan') ||
                      page.url.toLowerCase().includes('tarifa') ||
                      content.toLowerCase().includes('precio') ||
                      content.toLowerCase().includes('plan') ||
                      content.toLowerCase().includes('tarifa') ||
                      content.toLowerCase().includes('€') ||
                      content.toLowerCase().includes('$')
                    ) {
                      pricingContent += `\nDE LA PÁGINA "${page.title}":\n`;
                      
                      // Extraer el contenido principal
                      const mainContentMatch = content.match(/CONTENIDO PRINCIPAL:([\s\S]*?)$/);
                      if (mainContentMatch && mainContentMatch[1]) {
                        // Extraer párrafos completos que contengan información de precios
                        const paragraphs = mainContentMatch[1].split('\n\n');
                        paragraphs.forEach(paragraph => {
                          if (
                            paragraph.toLowerCase().includes('precio') ||
                            paragraph.toLowerCase().includes('plan') ||
                            paragraph.toLowerCase().includes('tarifa') ||
                            paragraph.toLowerCase().includes('€') ||
                            paragraph.toLowerCase().includes('$') ||
                            paragraph.toLowerCase().includes('mes') ||
                            paragraph.toLowerCase().includes('anual') ||
                            paragraph.toLowerCase().includes('pago') ||
                            paragraph.toLowerCase().includes('suscripción')
                          ) {
                            pricingContent += paragraph.trim() + '\n\n';
                            hasFoundPricing = true;
                          }
                        });
                      }
                    }
                    
                    // Buscar información sobre servicios
                    if (
                      page.title.toLowerCase().includes('servicio') ||
                      page.title.toLowerCase().includes('función') ||
                      page.title.toLowerCase().includes('característica') ||
                      page.title.toLowerCase().includes('feature') ||
                      page.url.toLowerCase().includes('servicio') ||
                      page.url.toLowerCase().includes('función') ||
                      page.url.toLowerCase().includes('feature')
                    ) {
                      servicesContent += `\nDE LA PÁGINA "${page.title}":\n`;
                      
                      // Extraer el contenido principal
                      const mainContentMatch = content.match(/CONTENIDO PRINCIPAL:([\s\S]*?)$/);
                      if (mainContentMatch && mainContentMatch[1]) {
                        // Extraer 1000 caracteres para servicios
                        const serviceSummary = mainContentMatch[1].trim().substring(0, 1000) + 
                          (mainContentMatch[1].length > 1000 ? '...' : '');
                        servicesContent += serviceSummary + '\n\n';
                      }
                    }
                  }
                });
              }
              
              // Agregar secciones al contenido general
              scrapedData += navigationLinks + "\n\n";
              scrapedData += headings + "\n\n";
              
              // Solo incluir la sección de precios si se encontró contenido relevante
              if (hasFoundPricing) {
                scrapedData += pricingContent + "\n\n";
              }
              
              scrapedData += servicesContent + "\n\n";
              
              // TERCER NIVEL: Agregar contenido completo de páginas importantes
              // Buscar páginas específicas de precios, documentación, etc.
              if (parsedData.pages && Array.isArray(parsedData.pages)) {
                for (const page of parsedData.pages) {
                  const isKeyPage = page.title.toLowerCase().includes('precio') || 
                                    page.url.toLowerCase().includes('precio') || 
                                    page.title.toLowerCase().includes('documentación') || 
                                    page.url.toLowerCase().includes('documentación') ||
                                    page.title.toLowerCase().includes('plan') ||
                                    page.url.toLowerCase().includes('plan');
                  
                  if (isKeyPage && page.content) {
                    // Para páginas importantes, incluir todo el contenido
                    scrapedData += `\nCONTENIDO COMPLETO DE LA PÁGINA "${page.title}":\n`;
                    
                    // Extraer el contenido principal
                    const mainContentMatch = page.content.toString().match(/CONTENIDO PRINCIPAL:([\s\S]*?)$/);
                    if (mainContentMatch && mainContentMatch[1]) {
                      // Incluir todo el contenido para páginas clave
                      scrapedData += mainContentMatch[1].trim() + '\n\n';
                    }
                  }
                }
              }
              
              // Habilitar los logs para facilitar la depuración
              console.log("Usando datos de scraping del servidor para el chatbot");
              console.log("Tamaño de los datos de scraping:", scrapedData.length);
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

Eres AIPPS, un asistente virtual integrado en el sitio web de AIPPS.
Tu objetivo es proporcionar información útil, precisa y completa sobre la plataforma AIPPS,
sus servicios, características, precios y beneficios basándote en el contenido del sitio.
Si te preguntan por un servicio o característica específica, busca la información en el contenido proporcionado.
Debes ser informativo, profesional y claro en tus respuestas. Contesta siempre en español.

INSTRUCCIONES DE COMPORTAMIENTO ESPECÍFICAS:
${customBehavior || 'Sé amable, informativo y conciso al responder preguntas sobre AIPPS y sus características.'}
`;
          
          const openAIResponse = await fetch('/api/openai/completion', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messages: allMessages,
              context: contextWithInstructions
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
            "precios": "AIPPS ofrece planes de precios flexibles que comienzan en $29/mes."
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
          context
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
