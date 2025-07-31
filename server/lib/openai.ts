import OpenAI from "openai";

// Using "gpt-4o-mini" as explicitly requested by the user
const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "sk-yourkeyhere";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Bot configuration interface
interface BotConfig {
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

// Main chat completion function for conversations
export async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  context?: string,
  language?: string,
  botConfig?: BotConfig
) {
  try {
    // Determinar en qué idioma responder - USAR EL IDIOMA DETECTADO AUTOMÁTICAMENTE
    const responseLanguage = language || "es"; // Default a español si no se especifica idioma
    
    // Log para debug
    console.log("OpenAI: Idioma recibido del servidor:", language);
    console.log("OpenAI: Respondiendo en idioma:", responseLanguage);
    console.log("OpenAI: Contexto recibido longitud:", context?.length || 0);
    console.log("OpenAI: Contexto preview:", context?.substring(0, 200) + "...");
    
    // Crear configuración personalizada del bot
    const getBotPersonality = (config?: BotConfig) => {
      if (!config) return "";
      
      const name = config.assistantName || "AIPPS";
      const style = config.conversationStyle || "helpful";
      
      if (responseLanguage === "fr") {
        return `CONFIGURATION DU BOT PERSONNALISÉ:
- Vous êtes ${name}
- Votre style de conversation doit être: ${style}
- Maintenez toujours cette personnalité dans toutes vos réponses
- Adaptez votre ton et votre approche selon ce style configuré

`;
      } else if (responseLanguage === "en") {
        return `CUSTOM BOT CONFIGURATION:
- You are ${name}
- Your conversation style must be: ${style}
- Always maintain this personality in all your responses
- Adapt your tone and approach according to this configured style

`;
      } else {
        return `CONFIGURACIÓN PERSONALIZADA DEL BOT:
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
    if (botConfig?.isWidget) {
      const assistantName = botConfig.assistantName || "Asistente";
      const description = botConfig.description || "un chatbot de ayuda";
      const greeting = botConfig.defaultGreeting || "¡Hola! ¿Cómo puedo ayudarte?";
      const behavior = botConfig.conversationStyle || "servicial";
      
      if (responseLanguage === "fr") {
        // Pour widgets en français, utiliser le contexte complet du site web
        systemContent = context 
          ? `Vous êtes ${assistantName}, un assistant IA intégré spécifiquement pour ce site web. Votre objectif principal est de fournir des informations utiles, précises et complètes basées sur le contexte du site web et les documents fournis.

INSTRUCTIONS IMPORTANTES:
1. VOUS AVEZ UN ACCÈS COMPLET à toutes les informations du contexte du site web. Utilisez-les pour répondre aux questions spécifiques.
2. Pour les questions de CONTACT (téléphone, email, adresse) : Cherchez dans le contexte les informations de contact, données de l'entreprise, formulaires de contact.
3. Pour les questions sur les SERVICES : Cherchez des informations sur l'IA locale, la sécurité, les dispositifs, l'analyse de données, etc.
4. NE DITES JAMAIS que vous n'avez pas accès à des informations spécifiques - vous avez un accès complet au contexte du site.
5. Vos réponses doivent être professionnelles, informatives et orientées vers l'aide aux visiteurs du site.
6. N'inventez jamais d'informations qui ne sont pas explicitement mentionnées dans le contexte.
7. Votre comportement doit être: ${behavior}
8. Répondez toujours en français.

FORMAT DE RÉPONSE REQUIS:
- Utilisez # pour les titres principaux
- Utilisez ## pour les sous-titres
- Utilisez **texte** pour mettre en évidence les informations importantes
- Utilisez *texte* pour l'emphase
- Utilisez - pour les listes à puces
- Utilisez 1. 2. 3. pour les listes numérotées
- Structurez vos réponses de manière claire et organisée
- Incluez des titres descriptifs lorsque approprié

CONTEXTE DÉTAILLÉ DU SITE WEB: 
${context}`
          : `Vous êtes ${assistantName}, un chatbot intégré spécifiquement pour ce site web.

VOTRE DESCRIPTION: "${description}"
VOTRE MESSAGE D'ACCUEIL: "${greeting}"
VOTRE COMPORTEMENT CONFIGURÉ: "${behavior}"

Vous pouvez aider avec des questions sur ce site web spécifique. Votre comportement doit être: ${behavior}. Répondez toujours en français.`;
      } else if (responseLanguage === "en") {
        // For English widgets, use the full website context
        systemContent = context 
          ? `You are ${assistantName}, an AI assistant integrated specifically for this website. Your main goal is to provide useful, accurate, and complete information based on the website context and provided documents.

IMPORTANT INSTRUCTIONS:
1. YOU HAVE COMPLETE ACCESS to all website context information. Use it to answer specific questions.
2. For CONTACT questions (phone, email, address): Search context for contact info, company data, contact forms.
3. For SERVICES questions: Look for information about local AI, security, devices, data analysis, etc.
4. NEVER say you don't have access to specific information - you have full access to the site context.
5. Your responses should be professional, informative, and oriented towards helping site visitors.
6. Never invent information that is not explicitly mentioned in the context.
7. Your behavior should be: ${behavior}
8. Always respond in English.

REQUIRED RESPONSE FORMAT:
- Use # for main titles
- Use ## for subtitles  
- Use **text** to highlight important information
- Use *text* for emphasis
- Use - for bullet lists
- Use 1. 2. 3. for numbered lists
- Structure your responses clearly and organized
- Include descriptive titles when appropriate

DETAILED WEBSITE CONTEXT: 
${context}`
          : `You are ${assistantName}, a chatbot specifically integrated for this website.

YOUR DESCRIPTION: "${description}"
YOUR WELCOME MESSAGE: "${greeting}"
YOUR CONFIGURED BEHAVIOR: "${behavior}"

You can help with questions about this specific website. Your behavior should be: ${behavior}. Always respond in English.`;
      } else {
        // Para widgets en español, usar el contexto completo del sitio web
        systemContent = context 
          ? `Eres ${assistantName}, un asistente de IA integrado específicamente para este sitio web. Tu objetivo principal es proporcionar información útil, precisa y completa basada en el contexto del sitio web y los documentos proporcionados.

INSTRUCCIONES IMPORTANTES:
1. TIENES ACCESO COMPLETO a toda la información del contexto del sitio web. Úsala para responder preguntas específicas.
2. Para preguntas sobre CONTACTO (teléfono, email, dirección): Busca en el contexto información de contacto, datos de la empresa, formularios de contacto.
3. Para preguntas sobre SERVICIOS: Busca información sobre IA local, seguridad, dispositivos, análisis de datos, etc.
4. NUNCA digas que no tienes acceso a información específica - tienes acceso completo al contexto del sitio.
5. Tus respuestas deben ser profesionales, informativas y orientadas a ser útil para los visitantes del sitio.
6. Nunca inventes información que no esté explícitamente mencionada en el contexto.
7. Tu comportamiento debe ser: ${behavior}
8. Responde siempre en español.

FORMATO DE RESPUESTAS REQUERIDO:
- Usa # para títulos principales
- Usa ## para subtítulos
- Usa **texto** para resaltar información importante
- Usa *texto* para énfasis
- Usa - para listas con viñetas
- Usa 1. 2. 3. para listas numeradas
- Estructura tus respuestas de manera clara y organizada
- Incluye títulos descriptivos cuando sea apropiado

CONTEXTO DETALLADO DEL SITIO WEB: 
${context}`
          : `Eres ${assistantName}, un chatbot integrado específicamente para este sitio web.

TU DESCRIPCIÓN: "${description}"
TU MENSAJE DE BIENVENIDA: "${greeting}"
TU COMPORTAMIENTO CONFIGURADO: "${behavior}"

Puedes ayudar con preguntas sobre este sitio web específico. Tu comportamiento debe ser: ${behavior}. Responde siempre en español.`;
      }
    } else {
      // Para la aplicación AIPPS principal (no widgets), usar personalidad + contexto
      systemContent = getBotPersonality(botConfig);
      
      // Prompt original para el dashboard principal de AIPPS
      if (responseLanguage === "fr") {
        systemContent += context 
          ? `Vous êtes un assistant IA intégré au site web d'AIPPS. Votre objectif principal est de fournir des informations utiles, précises et complètes basées spécifiquement sur le contexte fourni concernant les services, caractéristiques et avantages de la plateforme AIPPS.
        
INSTRUCTIONS IMPORTANTES:
1. Concentrez vos réponses sur les informations que vous trouvez dans le contexte fourni ci-dessous.
2. Si la question de l'utilisateur concerne un service, une caractéristique ou une fonctionnalité spécifique d'AIPPS, recherchez minutieusement cette information dans le contexte et répondez avec des détails précis.
3. Soyez particulièrement attentif aux informations sur les prix, les forfaits, les services offerts, les intégrations prises en charge et les caractéristiques de la plateforme.
4. Accordez une attention particulière aux sections "SERVICES ET CARACTÉRISTIQUES DÉTECTÉS" et "NAVIGATION DU SITE" du contexte, qui peuvent contenir des informations clés.
5. Si l'information n'est pas disponible dans le contexte, indiquez clairement que vous n'avez pas d'information spécifique à ce sujet, mais suggérez d'autres caractéristiques ou services que vous connaissez.
6. Vos réponses doivent être professionnelles, informatives et orientées vers la mise en valeur d'AIPPS.
7. N'inventez jamais de caractéristiques, prix ou services qui ne sont pas explicitement mentionnés dans le contexte.
8. Répondez toujours en français.

FORMAT DE RÉPONSE REQUIS:
- Utilisez # pour les titres principaux
- Utilisez ## pour les sous-titres
- Utilisez **texte** pour mettre en évidence les informations importantes
- Utilisez *texte* pour l'emphase
- Utilisez - pour les listes à puces
- Utilisez 1. 2. 3. pour les listes numérotées
- Structurez vos réponses de manière claire et organisée
- Incluez des titres descriptifs lorsque approprié

CONTEXTE DÉTAILLÉ DU SITE: 
${context}`
          : "Vous êtes AIPPS, un assistant IA intégré au site web d'AIPPS. Vous fournissez des informations concises et précises sur la plateforme AIPPS, ses services, caractéristiques et avantages. Soyez amical, professionnel et serviable. Répondez toujours en français.";
      } else if (responseLanguage === "en") {
        systemContent += context 
          ? `You are an AI assistant integrated into the AIPPS website. Your main goal is to provide useful, accurate, and complete information specifically based on the context provided about the services, features, and benefits of the AIPPS platform.
        
IMPORTANT INSTRUCTIONS:
1. Focus your answers on the information you find in the context provided below.
2. If the user's question refers to a specific AIPPS service, feature, or functionality, thoroughly search for this information in the context and respond with precise details.
3. Be especially attentive to information about prices, plans, services offered, supported integrations, and platform features.
4. Pay special attention to the "DETECTED SERVICES AND FEATURES" and "SITE NAVIGATION" sections of the context, which may contain key information.
5. If the information is not available in the context, clearly indicate that you don't have specific information about that, but suggest other features or services that you do know about.
6. Your responses should be professional, informative, and oriented towards highlighting the value of AIPPS.
7. Never invent features, prices, or services that are not explicitly mentioned in the context.
8. Always respond in English.

REQUIRED RESPONSE FORMAT:
- Use # for main titles
- Use ## for subtitles
- Use **text** to highlight important information
- Use *text* for emphasis
- Use - for bullet lists
- Use 1. 2. 3. for numbered lists
- Structure your responses clearly and organized
- Include descriptive titles when appropriate

DETAILED SITE CONTEXT: 
${context}`
          : "You are AIPPS, an AI assistant integrated into the AIPPS website. You provide concise and accurate information about the AIPPS platform, its services, features, and benefits. Be friendly, professional, and helpful. Always respond in English.";
      } else {
        systemContent += context 
          ? `Eres un asistente de IA integrado en el sitio web de AIPPS. Tu objetivo principal es proporcionar información útil, precisa y completa basada específicamente en el contexto proporcionado sobre los servicios, características y beneficios de la plataforma AIPPS.
        
INSTRUCCIONES IMPORTANTES:
1. Enfoca tus respuestas en la información que encuentres en el contexto proporcionado a continuación.
2. Si la pregunta del usuario se refiere a un servicio, característica o funcionalidad específica de AIPPS, busca exhaustivamente esta información en el contexto y responde con detalles precisos.
3. Sé especialmente atento a información sobre precios, planes, servicios ofrecidos, integraciones soportadas y características de la plataforma.
4. Presta especial atención a las secciones "SERVICIOS Y CARACTERÍSTICAS DETECTADOS" y "NAVEGACIÓN DEL SITIO" del contexto, que pueden contener información clave.
5. Si la información no está disponible en el contexto, indica claramente que no tienes información específica sobre eso, pero sugiere otras características o servicios que sí conozcas.
6. Tus respuestas deben ser profesionales, informativas y orientadas a destacar el valor de AIPPS.
7. Nunca inventes características, precios o servicios que no estén explícitamente mencionados en el contexto.
8. Responde siempre en español.

FORMATO DE RESPUESTAS REQUERIDO:
- Usa # para títulos principales
- Usa ## para subtítulos
- Usa **texto** para resaltar información importante
- Usa *texto* para énfasis
- Usa - para listas con viñetas
- Usa 1. 2. 3. para listas numeradas
- Estructura tus respuestas de manera clara y organizada
- Incluye títulos descriptivos cuando sea apropiado

CONTEXTO DETALLADO DEL SITIO: 
${context}`
          : "Eres AIPPS, un asistente de IA integrado en el sitio web de AIPPS. Proporcionas información concisa y precisa sobre la plataforma AIPPS, sus servicios, características y beneficios. Sé amigable, profesional y servicial. Responde siempre en español.";
      }
    }
    
    // Crear el objeto de mensaje del sistema
    const systemMessage = { role: "system", content: systemContent };
    
    // Log system message for debugging
    console.log("System message length:", systemMessage.content.length);
    console.log("System message preview:", systemMessage.content.substring(0, 200) + "...");
    
    // Log bot configuration details
    if (botConfig) {
      console.log("AIPPS Debug: Bot personality applied to system message:", {
        name: botConfig.assistantName,
        style: botConfig.conversationStyle,
        systemMessageIncludesBotConfig: systemMessage.content.includes("CONFIGURACIÓN PERSONALIZADA DEL BOT")
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

    // Make request to OpenAI
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: formattedMessages as any, // Type assertion to avoid TypeScript errors
      temperature: 0.5, // Reduced temperature for more factual responses
      max_tokens: 800  // Increased max tokens for more complete responses
    });

    return {
      message: {
        role: "assistant",
        content: response.choices[0].message.content
      }
    };
  } catch (error: unknown) {
    console.error("Error generating chat completion:", error);
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
      Générez exactement 7 messages promotionnels uniques et attrayants pour AIPPS, une plateforme de chatbots avec IA.
      
      Les messages doivent:
      - Être accrocheurs et commerciaux
      - Mettre en évidence différents avantages d'AIPPS
      - Être variés dans l'approche (automatisation, prospects, ventes, support, etc.)
      - Avoir entre 8-15 mots chacun
      - Inclure des emojis pertinents
      - Créer de l'urgence ou de l'intérêt
      
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
        { message_text: "🚀 Automatisez votre service client avec IA avancée!", message_type: 'ai_generated', display_order: 1 },
        { message_text: "💬 Chatbots intelligents qui convertissent visiteurs en clients", message_type: 'ai_generated', display_order: 2 },
        { message_text: "⚡ Réponses instantanées 24/7 pour votre entreprise", message_type: 'ai_generated', display_order: 3 },
        { message_text: "📈 Augmentez vos ventes pendant que vous dormez", message_type: 'ai_generated', display_order: 4 },
        { message_text: "🎯 Capturez des prospects automatiquement et intelligemment", message_type: 'ai_generated', display_order: 5 },
        { message_text: "🔧 Intégration facile sur n'importe quel site web", message_type: 'ai_generated', display_order: 6 },
        { message_text: "💡 IA qui comprend vos clients mieux que jamais", message_type: 'ai_generated', display_order: 7 }
      ];
    } else if (language === 'en') {
      systemPrompt = `You are a digital marketing expert specialized in conversational AI platforms. 
      Generate exactly 7 unique and engaging promotional messages for AIPPS, an AI chatbot platform.
      
      The messages should:
      - Be catchy and commercial
      - Highlight different benefits of AIPPS
      - Be varied in approach (automation, leads, sales, support, etc.)
      - Have between 8-15 words each
      - Include relevant emojis
      - Create urgency or interest
      
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
        { message_text: "🚀 Automate your customer service with advanced AI!", message_type: 'ai_generated', display_order: 1 },
        { message_text: "💬 Smart chatbots that convert visitors into customers", message_type: 'ai_generated', display_order: 2 },
        { message_text: "⚡ Instant responses 24/7 for your business", message_type: 'ai_generated', display_order: 3 },
        { message_text: "📈 Increase your sales while you sleep", message_type: 'ai_generated', display_order: 4 },
        { message_text: "🎯 Capture leads automatically and intelligently", message_type: 'ai_generated', display_order: 5 },
        { message_text: "🔧 Easy integration on any website", message_type: 'ai_generated', display_order: 6 },
        { message_text: "💡 AI that understands your customers better than ever", message_type: 'ai_generated', display_order: 7 }
      ];
    } else {
      systemPrompt = `Eres un experto en marketing digital especializado en plataformas de IA conversacional. 
      Genera exactamente 7 mensajes promocionales únicos y atractivos para AIPPS, una plataforma de chatbots con IA.
      
      Los mensajes deben:
      - Ser llamativos y comerciales
      - Destacar diferentes beneficios de AIPPS
      - Ser variados en enfoque (automatización, leads, ventas, soporte, etc.)
      - Tener entre 8-15 palabras cada uno
      - Incluir emojis relevantes
      - Crear urgencia o interés
      
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
        { message_text: "🚀 ¡Automatiza tu atención al cliente con IA avanzada!", message_type: 'ai_generated', display_order: 1 },
        { message_text: "💬 Chatbots inteligentes que convierten visitantes en clientes", message_type: 'ai_generated', display_order: 2 },
        { message_text: "⚡ Respuestas instantáneas 24/7 para tu negocio", message_type: 'ai_generated', display_order: 3 },
        { message_text: "📈 Aumenta tus ventas mientras duermes", message_type: 'ai_generated', display_order: 4 },
        { message_text: "🎯 Captura leads de forma automática e inteligente", message_type: 'ai_generated', display_order: 5 },
        { message_text: "🔧 Integración fácil en cualquier sitio web", message_type: 'ai_generated', display_order: 6 },
        { message_text: "💡 IA que entiende a tus clientes mejor que nunca", message_type: 'ai_generated', display_order: 7 }
      ];
    }

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 800
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
