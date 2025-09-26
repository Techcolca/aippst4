import OpenAI from "openai";

// Using "gpt-4o-mini" as explicitly requested by the user
const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "sk-yourkeyhere";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Agent configuration interface
interface AgentConfig {
  assistantName?: string;
  defaultGreeting?: string;
  conversationStyle?: string | null;
  description?: string | null;
  isWidget?: boolean;
}

// Function to generate conversation title based on first messages
export async function generateConversationTitle(
  firstMessage: string,
  secondMessage?: string,
  language: string = "es"
): Promise<string> {
  try {
    const messages = secondMessage 
      ? `Primera pregunta: "${firstMessage}"\nSegunda pregunta: "${secondMessage}"`
      : `Pregunta inicial: "${firstMessage}"`;

    const systemPrompt = language === "es" 
      ? "Genera un título breve y descriptivo (máximo 5 palabras) para esta conversación basándote en las preguntas del usuario. El título debe ser claro y específico sobre el tema principal."
      : language === "en"
      ? "Generate a brief and descriptive title (maximum 5 words) for this conversation based on the user's questions. The title should be clear and specific about the main topic."
      : "Générez un titre bref et descriptif (maximum 5 mots) pour cette conversation basé sur les questions de l'utilisateur. Le titre doit être clair et spécifique sur le sujet principal.";

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: messages }
      ],
      max_tokens: 50,
      temperature: 0.3
    });

    const title = completion.choices[0]?.message?.content?.trim();
    return title || (language === "es" ? "Nueva conversación" : language === "en" ? "New conversation" : "Nouvelle conversation");
  } catch (error) {
    console.error("Error generating conversation title:", error);
    return language === "es" ? "Nueva conversación" : language === "en" ? "New conversation" : "Nouvelle conversation";
  }
}

// Main chat completion function for conversations with timeout and performance optimizations
export async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  context?: string,
  language?: string,
  agentConfig?: AgentConfig
) {
  // Performance optimization: Limit context length to prevent excessive token usage
  const maxContextLength = 8000; // Reduced from unlimited
  const truncatedContext = context && context.length > maxContextLength 
    ? context.substring(0, maxContextLength) + "\n\n[Content truncated for performance]"
    : context;
  
  try {
    // Determinar en qué idioma responder - USAR EL IDIOMA DETECTADO AUTOMÁTICAMENTE
    const responseLanguage = language || "es"; // Default a español si no se especifica idioma
    
    // Log para debug
    console.log("OpenAI: Idioma recibido del servidor:", language);
    console.log("OpenAI: Respondiendo en idioma:", responseLanguage);
    console.log("OpenAI: Contexto recibido longitud:", context?.length || 0);
    console.log("OpenAI: Contexto preview:", context?.substring(0, 200) + "...");
    
    // Crear configuración personalizada del agente
    const getAgentPersonality = (config?: AgentConfig) => {
      if (!config) return "";
      
      const name = config.assistantName || "AIPPS";
      const style = config.conversationStyle || "helpful";
      
      if (responseLanguage === "fr") {
        return `CONFIGURATION DE L'AGENT PERSONNALISÉ:
- Vous êtes ${name}
- Votre style de conversation doit être: ${style}
- Maintenez toujours cette personnalité dans toutes vos réponses
- Adaptez votre ton et votre approche selon ce style configuré

`;
      } else if (responseLanguage === "en") {
        return `CUSTOM AGENT CONFIGURATION:
- You are ${name}
- Your conversation style must be: ${style}
- Always maintain this personality in all your responses
- Adapt your tone and approach according to this configured style

`;
      } else {
        return `CONFIGURACIÓN PERSONALIZADA DEL AGENTE:
- Eres ${name}
- Tu estilo de conversación debe ser: ${style}
- Mantén siempre esta personalidad en todas tus respuestas
- Adapta tu tono y enfoque según este estilo configurado

`;
      }
    };

    // Crear mensaje del sistema específico para widgets con restricciones estrictas
    let systemContent = "";
    
    // Si es un widget, usar el contexto completo sin restricciones
    if (agentConfig?.isWidget) {
      const assistantName = agentConfig.assistantName || "Asistente";
      const description = agentConfig.description || "un agente de IA de ayuda";
      const greeting = agentConfig.defaultGreeting || "¡Hola! ¿Cómo puedo ayudarte?";
      const behavior = agentConfig.conversationStyle || "servicial";
      
      if (responseLanguage === "fr") {
        // Simplified French widget prompt for better performance
        systemContent = truncatedContext 
          ? `Vous êtes ${assistantName}, un assistant IA pour ce site web. Fournissez des réponses utiles basées sur le contexte disponible.

Votre comportement doit être: ${behavior}
Répondez toujours clairement et de manière concise en français.

Contexte du site: ${truncatedContext}`
          : `Vous êtes ${assistantName}, un agent IA pour ce site web. Votre comportement: ${behavior}. Répondez en français.`;
      } else if (responseLanguage === "en") {
        // Simplified English widget prompt for better performance
        systemContent = truncatedContext 
          ? `You are ${assistantName}, an AI assistant for this website. Provide helpful responses based on available context.

Your behavior should be: ${behavior}
Always respond clearly and concisely in English.

Website context: ${truncatedContext}`
          : `You are ${assistantName}, an AI agent for this website. Your behavior: ${behavior}. Respond in English.`;
      } else {
        // Simplified Spanish widget prompt for better performance
        systemContent = truncatedContext 
          ? `Eres ${assistantName}, un asistente de IA para este sitio web. Proporciona respuestas útiles basadas en el contexto disponible.

Tu comportamiento debe ser: ${behavior}
Responde siempre en español de forma clara y concisa.

Contexto del sitio: ${truncatedContext}`
          : `Eres ${assistantName}, un agente de IA para este sitio web. Tu comportamiento: ${behavior}. Responde en español.`;
      }
    } else {
      // Para la aplicación AIPPS principal (no widgets), usar personalidad + contexto
      systemContent = getAgentPersonality(agentConfig);
      
      // Prompt original para el dashboard principal de AIPPS
      if (responseLanguage === "fr") {
        systemContent += truncatedContext 
          ? `Vous êtes un assistant IA d'AIPPS. Fournissez des informations précises basées sur le contexte concernant les services et caractéristiques de la plateforme. Répondez de manière professionnelle en français.

Contexte d'AIPPS: ${truncatedContext}`
          : "Vous êtes AIPPS, un assistant IA. Fournissez des informations sur la plateforme AIPPS de manière professionnelle en français.";
      } else if (responseLanguage === "en") {
        systemContent += truncatedContext 
          ? `You are an AIPPS AI assistant. Provide accurate information based on context about platform services and features. Respond professionally in English.

AIPPS Context: ${truncatedContext}`
          : "You are AIPPS, an AI assistant. Provide information about the AIPPS platform professionally in English.";
      } else {
        systemContent += truncatedContext 
          ? `Eres un asistente de IA de AIPPS. Proporciona información precisa basada en el contexto sobre servicios y características de la plataforma. Responde de manera profesional en español.

Contexto de AIPPS: ${truncatedContext}`
          : "Eres AIPPS, un asistente de IA. Proporciona información sobre la plataforma AIPPS de manera profesional en español.";
      }
    }
    
    // Crear el objeto de mensaje del sistema
    const systemMessage = { role: "system", content: systemContent };
    
    // Performance logging (using truncated context)
    console.log("System message length:", systemMessage.content.length);
    console.log("Context was truncated:", context && context.length > maxContextLength);
    console.log("Truncated context length:", truncatedContext?.length || 0);
    console.log("System message preview:", systemMessage.content.substring(0, 200) + "...");
    
    // Log agent configuration details
    if (agentConfig) {
      console.log("AIPPS Debug: Agent personality applied to system message:", {
        name: agentConfig.assistantName,
        style: agentConfig.conversationStyle,
        systemMessageIncludesBotConfig: systemMessage.content.includes("CONFIGURACIÓN PERSONALIZADA DEL AGENTE")
      });
    }
    
    // Prepare the messages array with the system message first
    const formattedMessages = [
      {
        role: systemMessage.role as "system",
        content: systemMessage.content
      },
      ...messages.map(m => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content
      }))
    ];

    // Create AbortController for real timeout functionality
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 15000); // 15 second timeout
    
    try {
      // Make request to OpenAI with real timeout protection using AbortController
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: formattedMessages as any,
        temperature: 0.5,
        max_tokens: 600, // Reduced from 800 for faster responses
      }, {
        signal: abortController.signal,
      });
      
      clearTimeout(timeoutId);
      
      return {
        message: {
          role: "assistant",
          content: response.choices[0].message.content
        }
      };
    } catch (openaiError: unknown) {
      clearTimeout(timeoutId);
      
      // Handle AbortController timeout specifically
      if (openaiError instanceof Error && openaiError.name === 'AbortError') {
        throw new Error('OpenAI request timed out after 15 seconds');
      }
      
      console.error("Error generating chat completion:", openaiError);
      const errorMessage = openaiError instanceof Error ? openaiError.message : String(openaiError);
      throw new Error(`Failed to generate chat completion: ${errorMessage}`);
    }
  } catch (error: unknown) {
    console.error("Error in generateChatCompletion:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate chat completion: ${errorMessage}`);
  }
}

// Sentiment analysis
export async function analyzeSentiment(text: string): Promise<{
  rating: number;
  confidence: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1. Respond with JSON in this format: { 'rating': number, 'confidence': number }",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || '{"rating": 3, "confidence": 0.5}';
    const result = JSON.parse(content);

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating))),
      confidence: Math.max(0, Math.min(1, result.confidence)),
    };
  } catch (error: unknown) {
    console.error("Failed to analyze sentiment:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to analyze sentiment: ${errorMessage}`);
  }
}

// Text summarization
export async function summarizeText(text: string): Promise<string> {
  try {
    const prompt = `Please summarize the following text concisely while maintaining key points:\n\n${text}`;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content || "";
  } catch (error: unknown) {
    console.error("Failed to summarize text:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to summarize text: ${errorMessage}`);
  }
}

// Extract key information
export async function extractKeyInformation(text: string, query: string): Promise<string> {
  try {
    const prompt = `Extract the key information from the following text that answers this query: "${query}"\n\nText: ${text}`;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content || "";
  } catch (error: unknown) {
    console.error("Failed to extract key information:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to extract key information: ${errorMessage}`);
  }
}

// Generate automated response based on user query and website context
export async function generateAutomatedResponse(
  userQuery: string, 
  websiteContext: string,
  conversationStyle: string = "professional",
  language?: string
): Promise<string> {
  try {
    const stylePrompt = getStylePrompt(conversationStyle);
    const responseLanguage = language || "fr"; // Default a francés (como ha pedido el usuario)
    
    // Log para debug
    console.log("Generating automated response in language:", responseLanguage);
    
    // Adaptar el mensaje del sistema según el idioma
    let systemContent = "";
    
    if (responseLanguage === "fr") {
      systemContent = "Vous êtes AIPPS, un assistant IA intégré au site web d'AIPPS. Vous aidez les visiteurs en fournissant des informations précises et utiles sur les services, les caractéristiques et les avantages de la plateforme. Répondez toujours en français.";
    } else if (responseLanguage === "en") {
      systemContent = "You are AIPPS, an AI assistant integrated into the AIPPS website. You help visitors by providing accurate and useful information about the platform's services, features, and benefits. Always respond in English.";
    } else {
      systemContent = "Eres AIPPS, un asistente de IA integrado en el sitio web de AIPPS. Ayudas a los visitantes proporcionando información precisa y útil sobre los servicios, características y beneficios de la plataforma. Responde siempre en español.";
    }
    
    const prompt = `
      ${stylePrompt}
      
      Website context information:
      ${websiteContext}
      
      User query:
      ${userQuery}
      
      Generate a helpful response that addresses the user's question using the context information provided. 
      If the information to answer the question is not in the context, provide a general helpful response 
      and suggest where they might find that information.
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: prompt }
      ],
    });

    return response.choices[0].message.content || "";
  } catch (error: unknown) {
    console.error("Failed to generate automated response:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate automated response: ${errorMessage}`);
  }
}

// Generate AI promotional messages for marketing campaigns
export async function generateAIPromotionalMessages(language = 'es'): Promise<Array<{
  message_text: string;
  message_type: string;
  display_order: number;
}>> {
  try {
    let systemPrompt = '';
    let fallbackMessages: Array<{
      message_text: string;
      message_type: string;
      display_order: number;
    }> = [];
    
    if (language === 'fr') {
      systemPrompt = `Vous êtes un expert en marketing numérique spécialisé dans les plateformes d'IA conversationnelle. 
      Générez exactement 7 messages promotionnels uniques et très attrayants pour AIPPS, une plateforme d'agents IA.
      
      Les messages doivent:
      - Être accrocheurs, commerciaux et détaillés
      - Mettre en évidence différents avantages spécifiques d'AIPPS
      - Être variés dans l'approche (automatisation, prospects, ventes, support, productivité, ROI, etc.)
      - Avoir entre 20-35 mots chacun pour être plus descriptifs et engageants
      - Inclure des emojis pertinents
      - Créer de l'urgence, de l'intérêt et montrer la valeur concrète
      - Focus sur les bénéfices business concrets et mesurables
      
      Répondez UNIQUEMENT avec un JSON valide dans ce format:
      {
        "messages": [
          {"text": "🚀 Message 1", "order": 1},
          {"text": "💬 Message 2", "order": 2},
          {"text": "⚡ Message 3", "order": 3},
          {"text": "📈 Message 4", "order": 4},
          {"text": "🎯 Message 5", "order": 5},
          {"text": "🔧 Message 6", "order": 6},
          {"text": "💡 Message 7", "order": 7}
        ]
      }`;
      
      fallbackMessages = [
        { message_text: "🚀 Transformez votre site web en une machine de génération de leads 24/7 avec l'IA conversationnelle AIPPS qui comprend, engage et convertit vos visiteurs automatiquement", message_type: 'ai_generated', display_order: 1 },
        { message_text: "💬 Augmentez votre taux de conversion de 300% avec des agents IA intelligents qui qualifient vos prospects et les dirigent vers vos équipes de vente au moment optimal", message_type: 'ai_generated', display_order: 2 },
        { message_text: "⚡ Réduisez vos coûts de support client de 70% tout en améliorant la satisfaction avec des réponses instantanées et personnalisées disponibles 24h/24 et 7j/7", message_type: 'ai_generated', display_order: 3 },
        { message_text: "📈 Multipliez vos ventes en ligne pendant que vous dormez grâce à l'IA qui engage proactivement vos visiteurs et les guide vers l'achat automatiquement", message_type: 'ai_generated', display_order: 4 },
        { message_text: "🎯 Capturez et qualifiez automatiquement tous vos prospects web avec une IA qui pose les bonnes questions et collecte les informations critiques pour vos équipes", message_type: 'ai_generated', display_order: 5 },
        { message_text: "🔧 Intégrez facilement AIPPS sur n'importe quel site web en 5 minutes et commencez immédiatement à transformer vos visiteurs en clients payants avec zéro configuration technique", message_type: 'ai_generated', display_order: 6 },
        { message_text: "💡 Découvrez les intentions cachées de vos visiteurs avec une IA qui analyse le comportement en temps réel et adapte automatiquement sa stratégie de conversion", message_type: 'ai_generated', display_order: 7 }
      ];
    } else if (language === 'en') {
      systemPrompt = `You are a digital marketing expert specialized in conversational AI platforms. 
      Generate exactly 7 unique and highly engaging promotional messages for AIPPS, an AI agent platform.
      
      The messages should:
      - Be catchy, commercial and detailed
      - Highlight different specific benefits of AIPPS
      - Be varied in approach (automation, leads, sales, support, productivity, ROI, etc.)
      - Have between 20-35 words each to be more descriptive and engaging
      - Include relevant emojis
      - Create urgency, interest and show concrete value
      - Focus on concrete and measurable business benefits
      
      Respond ONLY with a valid JSON in this format:
      {
        "messages": [
          {"text": "🚀 Message 1", "order": 1},
          {"text": "💬 Message 2", "order": 2},
          {"text": "⚡ Message 3", "order": 3},
          {"text": "📈 Message 4", "order": 4},
          {"text": "🎯 Message 5", "order": 5},
          {"text": "🔧 Message 6", "order": 6},
          {"text": "💡 Message 7", "order": 7}
        ]
      }`;
      
      fallbackMessages = [
        { message_text: "🚀 Transform your website into a 24/7 lead generation machine with AIPPS conversational AI that understands, engages, and converts your visitors automatically", message_type: 'ai_generated', display_order: 1 },
        { message_text: "💬 Increase your conversion rate by 300% with intelligent AI agents that qualify your prospects and direct them to your sales teams at the optimal moment", message_type: 'ai_generated', display_order: 2 },
        { message_text: "⚡ Reduce your customer support costs by 70% while improving satisfaction with instant, personalized responses available 24/7 for your customers", message_type: 'ai_generated', display_order: 3 },
        { message_text: "📈 Multiply your online sales while you sleep with AI that proactively engages your visitors and guides them toward purchase automatically", message_type: 'ai_generated', display_order: 4 },
        { message_text: "🎯 Automatically capture and qualify all your web prospects with AI that asks the right questions and collects critical information for your teams", message_type: 'ai_generated', display_order: 5 },
        { message_text: "🔧 Easily integrate AIPPS on any website in 5 minutes and immediately start transforming your visitors into paying customers with zero technical configuration", message_type: 'ai_generated', display_order: 6 },
        { message_text: "💡 Discover the hidden intentions of your visitors with AI that analyzes behavior in real-time and automatically adapts its conversion strategy", message_type: 'ai_generated', display_order: 7 }
      ];
    } else {
      systemPrompt = `Eres un experto en marketing digital especializado en plataformas de IA conversacional. 
      Genera exactamente 7 mensajes promocionales únicos y muy atractivos para AIPPS, una plataforma de agentes de IA.
      
      Los mensajes deben:
      - Ser llamativos, comerciales y detallados
      - Destacar diferentes beneficios específicos de AIPPS
      - Ser variados en enfoque (automatización, leads, ventas, soporte, productividad, ROI, etc.)
      - Tener entre 20-35 palabras cada uno para ser más descriptivos y atractivos
      - Incluir emojis relevantes
      - Crear urgencia, interés y mostrar valor concreto
      - Enfocarse en beneficios empresariales concretos y medibles
      
      Responde SOLO con un JSON válido en este formato:
      {
        "messages": [
          {"text": "🚀 Mensaje 1", "order": 1},
          {"text": "💬 Mensaje 2", "order": 2},
          {"text": "⚡ Mensaje 3", "order": 3},
          {"text": "📈 Mensaje 4", "order": 4},
          {"text": "🎯 Mensaje 5", "order": 5},
          {"text": "🔧 Mensaje 6", "order": 6},
          {"text": "💡 Mensaje 7", "order": 7}
        ]
      }`;
      
      fallbackMessages = [
        { message_text: "🚀 Transforma tu sitio web en una máquina de generación de leads 24/7 con la IA conversacional de AIPPS que entiende, involucra y convierte a tus visitantes automáticamente", message_type: 'ai_generated', display_order: 1 },
        { message_text: "💬 Aumenta tu tasa de conversión un 300% con agentes de IA inteligentes que califican a tus prospectos y los dirigen a tus equipos de ventas en el momento óptimo", message_type: 'ai_generated', display_order: 2 },
        { message_text: "⚡ Reduce tus costos de soporte al cliente un 70% mientras mejoras la satisfacción con respuestas instantáneas y personalizadas disponibles 24/7 para tus clientes", message_type: 'ai_generated', display_order: 3 },
        { message_text: "📈 Multiplica tus ventas en línea mientras duermes con IA que involucra proactivamente a tus visitantes y los guía hacia la compra de forma automática", message_type: 'ai_generated', display_order: 4 },
        { message_text: "🎯 Captura y califica automáticamente todos tus prospectos web con IA que hace las preguntas correctas y recopila información crítica para tus equipos", message_type: 'ai_generated', display_order: 5 },
        { message_text: "🔧 Integra fácilmente AIPPS en cualquier sitio web en 5 minutos y comienza inmediatamente a transformar tus visitantes en clientes pagadores con cero configuración técnica", message_type: 'ai_generated', display_order: 6 },
        { message_text: "💡 Descubre las intenciones ocultas de tus visitantes con IA que analiza el comportamiento en tiempo real y adapta automáticamente su estrategia de conversión", message_type: 'ai_generated', display_order: 7 }
      ];
    }

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 1500
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const parsed = JSON.parse(content);
    
    return parsed.messages.map((msg: any, index: number) => ({
      message_text: msg.text,
      message_type: 'ai_generated',
      display_order: msg.order || (index + 1)
    }));

  } catch (error) {
    console.error("Error generating AI promotional messages:", error);
    return [];
  }
}

// Helper function to get style prompt based on conversation style
function getStylePrompt(style: string): string {
  switch (style.toLowerCase()) {
    case "friendly":
      return "Respond in a warm, friendly tone with conversational language. Use casual expressions and be approachable.";
    case "casual":
      return "Respond in a relaxed, casual tone. Feel free to use contractions and everyday language.";
    case "technical":
      return "Respond with technical precision and detail. Use industry-specific terminology where appropriate.";
    case "professional":
    default:
      return "Respond in a professional, courteous manner. Be clear, concise, and helpful while maintaining a business-appropriate tone.";
  }
}
