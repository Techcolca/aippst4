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
}

export default function ChatInterface({ demoMode = false, integrationId, context }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { 
          role: 'assistant', 
          content: '👋 ¡Hola! Soy AIPI, tu asistente de IA. ¿En qué puedo ayudarte hoy?' 
        }
      ]);
      
      // If not in demo mode, start conversation with the API
      if (!demoMode) {
        startConversation();
      }
    }
  }, [messages, demoMode]);
  
  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Start a new conversation with the API
  const startConversation = async () => {
    try {
      // Using a default API key for testing within the app itself
      const apiKey = 'aipi_mrPg94zRtTKr31hOY0m8PaPk305PJNVD';
      
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
          // Capturar el contexto de la página actual
          const pageContent = document.querySelector('main')?.textContent?.trim() || '';
          const pageTitle = document.title;
          const pageUrl = window.location.href;
          
          console.log("Usando el modelo OpenAI directamente con contexto de la página");
          
          // En lugar de usar la API del widget, vamos a usar directamente la API de OpenAI
          const allMessages = messages.concat(userMessage);
          
          // Crear contexto con el contenido de la página
          const pageContext = `
Información de la página actual:
URL: ${pageUrl}
Título: ${pageTitle}
Contenido de la página:
${pageContent}

Eres AIPI, un asistente virtual integrado en el sitio web de AIPI.
Tu objetivo es proporcionar información útil sobre la plataforma AIPI, 
sus características y beneficios basándote en el contenido de la página.
Debes ser informativo, profesional y claro en tus respuestas en español.
`;
          
          const openAIResponse = await fetch('/api/openai/completion', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messages: allMessages,
              context: pageContext
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
            "hello": "¡Hola! Soy AIPI, tu asistente virtual. ¿En qué puedo ayudarte hoy?",
            "hola": "¡Hola! Soy AIPI, tu asistente virtual. ¿En qué puedo ayudarte hoy?",
            "ayuda": "Puedo ayudarte con información sobre nuestra plataforma AIPI, sus características, cómo integrarla en tu sitio web y mucho más.",
            "features": "AIPI ofrece IA conversacional, automatización de tareas, asistencia en tiempo real y análisis de contenido de tu sitio web.",
            "precios": "AIPI ofrece planes de precios flexibles que comienzan en $29/mes."
          };
          
          const lowerInput = inputValue.toLowerCase().trim();
          
          // Intentar encontrar respuesta predefinida como fallback
          if (demoResponses[lowerInput]) {
            response = demoResponses[lowerInput];
          } else if (Object.keys(demoResponses).find(key => lowerInput.includes(key))) {
            response = demoResponses[Object.keys(demoResponses).find(key => lowerInput.includes(key)) as string];
          } else if (lowerInput.match(/^(hola|buenos días|buenas tardes|buenas noches)$/)) {
            response = "¡Hola! Soy AIPI, tu asistente virtual. ¿En qué puedo ayudarte hoy?";
          } else {
            response = "Lo siento, estoy teniendo problemas para conectarme al servidor. ¿Puedo ayudarte con información general sobre la plataforma AIPI?";
          }
        }
      } else if (conversationId) {
        // Real API response using the widget API
        const apiKey = 'aipi_mrPg94zRtTKr31hOY0m8PaPk305PJNVD';
        
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
  
  return (
    <div className="flex flex-col h-[450px] max-h-[450px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div 
              className={`rounded-lg py-2 px-4 max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
              }`}
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
