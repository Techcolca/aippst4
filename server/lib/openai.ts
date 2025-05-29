import OpenAI from "openai";

// Using "gpt-4o-mini" as explicitly requested by the user
const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "sk-yourkeyhere";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Main chat completion function for conversations
export async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  context?: string,
  language?: string
) {
  try {
    // Determinar en qué idioma responder - USAR EL IDIOMA DETECTADO AUTOMÁTICAMENTE
    const responseLanguage = language || "es"; // Default a español si no se especifica idioma
    
    // Log para debug
    console.log("OpenAI: Idioma recibido del servidor:", language);
    console.log("OpenAI: Respondiendo en idioma:", responseLanguage);
    
    // Adaptar el mensaje del sistema según el idioma
    let systemContent = "";
    
    if (responseLanguage === "fr") {
      // Versión francesa del mensaje del sistema
      systemContent = context 
        ? `Vous êtes AIPPS, un assistant IA intégré au site web d'AIPPS. Votre objectif principal est de fournir des informations utiles, précises et complètes basées spécifiquement sur le contexte fourni concernant les services, caractéristiques et avantages de la plateforme AIPPS.
      
INSTRUCTIONS IMPORTANTES:
1. Concentrez vos réponses sur les informations que vous trouvez dans le contexte fourni ci-dessous.
2. Si la question de l'utilisateur concerne un service, une caractéristique ou une fonctionnalité spécifique d'AIPPS, recherchez minutieusement cette information dans le contexte et répondez avec des détails précis.
3. Soyez particulièrement attentif aux informations sur les prix, les forfaits, les services offerts, les intégrations prises en charge et les caractéristiques de la plateforme.
4. Accordez une attention particulière aux sections "SERVICES ET CARACTÉRISTIQUES DÉTECTÉS" et "NAVIGATION DU SITE" du contexte, qui peuvent contenir des informations clés.
5. Si l'information n'est pas disponible dans le contexte, indiquez clairement que vous n'avez pas d'information spécifique à ce sujet, mais suggérez d'autres caractéristiques ou services que vous connaissez.
6. Vos réponses doivent être professionnelles, informatives et orientées vers la mise en valeur d'AIPPS.
7. N'inventez jamais de caractéristiques, prix ou services qui ne sont pas explicitement mentionnés dans le contexte.
8. Répondez toujours en français.

CONTEXTE DÉTAILLÉ DU SITE: 
${context}`
        : "Vous êtes AIPPS, un assistant IA intégré au site web d'AIPPS. Vous fournissez des informations concises et précises sur la plateforme AIPPS, ses services, caractéristiques et avantages. Soyez amical, professionnel et serviable. Répondez toujours en français.";
    } else if (responseLanguage === "en") {
      // Versión inglesa del mensaje del sistema
      systemContent = context 
        ? `You are AIPPS, an AI assistant integrated into the AIPPS website. Your main goal is to provide useful, accurate, and complete information specifically based on the context provided about the services, features, and benefits of the AIPPS platform.
      
IMPORTANT INSTRUCTIONS:
1. Focus your answers on the information you find in the context provided below.
2. If the user's question refers to a specific AIPPS service, feature, or functionality, thoroughly search for this information in the context and respond with precise details.
3. Be especially attentive to information about prices, plans, services offered, supported integrations, and platform features.
4. Pay special attention to the "DETECTED SERVICES AND FEATURES" and "SITE NAVIGATION" sections of the context, which may contain key information.
5. If the information is not available in the context, clearly indicate that you don't have specific information about that, but suggest other features or services that you do know about.
6. Your responses should be professional, informative, and oriented towards highlighting the value of AIPPS.
7. Never invent features, prices, or services that are not explicitly mentioned in the context.
8. Always respond in English.

DETAILED SITE CONTEXT: 
${context}`
        : "You are AIPPS, an AI assistant integrated into the AIPPS website. You provide concise and accurate information about the AIPPS platform, its services, features, and benefits. Be friendly, professional, and helpful. Always respond in English.";
    } else {
      // Versión española (por defecto) del mensaje del sistema
      systemContent = context 
        ? `Eres AIPPS, un asistente de IA integrado en el sitio web de AIPPS. Tu objetivo principal es proporcionar información útil, precisa y completa basada específicamente en el contexto proporcionado sobre los servicios, características y beneficios de la plataforma AIPPS.
      
INSTRUCCIONES IMPORTANTES:
1. Enfoca tus respuestas en la información que encuentres en el contexto proporcionado a continuación.
2. Si la pregunta del usuario se refiere a un servicio, característica o funcionalidad específica de AIPPS, busca exhaustivamente esta información en el contexto y responde con detalles precisos.
3. Sé especialmente atento a información sobre precios, planes, servicios ofrecidos, integraciones soportadas y características de la plataforma.
4. Presta especial atención a las secciones "SERVICIOS Y CARACTERÍSTICAS DETECTADOS" y "NAVEGACIÓN DEL SITIO" del contexto, que pueden contener información clave.
5. Si la información no está disponible en el contexto, indica claramente que no tienes información específica sobre eso, pero sugiere otras características o servicios que sí conozcas.
6. Tus respuestas deben ser profesionales, informativas y orientadas a destacar el valor de AIPPS.
7. Nunca inventes características, precios o servicios que no estén explícitamente mencionados en el contexto.
8. Responde siempre en español.

CONTEXTO DETALLADO DEL SITIO: 
${context}`
        : "Eres AIPPS, un asistente de IA integrado en el sitio web de AIPPS. Proporcionas información concisa y precisa sobre la plataforma AIPPS, sus servicios, características y beneficios. Sé amigable, profesional y servicial. Responde siempre en español.";
    }
    
    // Crear el objeto de mensaje del sistema
    const systemMessage = { role: "system", content: systemContent };
    
    // Log system message for debugging
    console.log("System message length:", systemMessage.content.length);
    console.log("System message preview:", systemMessage.content.substring(0, 200) + "...");
    
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

    return response.choices[0].message.content;
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

    return response.choices[0].message.content;
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

    return response.choices[0].message.content;
  } catch (error: unknown) {
    console.error("Failed to generate automated response:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate automated response: ${errorMessage}`);
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
