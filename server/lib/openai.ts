import OpenAI from "openai";

// Using "gpt-4o-mini" as explicitly requested by the user
const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "sk-yourkeyhere";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Main chat completion function for conversations
export async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  context?: string
) {
  try {
    // Add system message with context if provided
    const systemMessage = context 
      ? { role: "system", content: `Eres AIPPS, un asistente de IA integrado en el sitio web de AIPPS. Tu objetivo principal es proporcionar información útil, precisa y completa basada específicamente en el contexto proporcionado sobre los servicios, características y beneficios de la plataforma AIPPS.
      
INSTRUCCIONES IMPORTANTES:
1. Enfoca tus respuestas en la información que encuentres en el contexto proporcionado a continuación.
2. Si la pregunta del usuario se refiere a un servicio, característica o funcionalidad específica de AIPPS, busca exhaustivamente esta información en el contexto y responde con detalles precisos.
3. Sé especialmente atento a información sobre precios, planes, servicios ofrecidos, integraciones soportadas y características de la plataforma.
4. Presta especial atención a las secciones "SERVICIOS Y CARACTERÍSTICAS DETECTADOS" y "NAVEGACIÓN DEL SITIO" del contexto, que pueden contener información clave.
5. Si la información no está disponible en el contexto, indica claramente que no tienes información específica sobre eso, pero sugiere otras características o servicios que sí conozcas.
6. Tus respuestas deben ser profesionales, informativas y orientadas a destacar el valor de AIPPS.
7. Nunca inventes características, precios o servicios que no estén explícitamente mencionados en el contexto.
8. Responde siempre en español a menos que te pregunten específicamente en otro idioma.

CONTEXTO DETALLADO DEL SITIO: 
${context}` }
      : { role: "system", content: "Eres AIPPS, un asistente de IA integrado en el sitio web de AIPPS. Proporcionas información concisa y precisa sobre la plataforma AIPPS, sus servicios, características y beneficios. Sé amigable, profesional y servicial. Responde siempre en español a menos que te pregunten en otro idioma." };
    
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
  conversationStyle: string = "professional"
): Promise<string> {
  try {
    const stylePrompt = getStylePrompt(conversationStyle);
    
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
        { role: "system", content: "Eres AIPPS, un asistente de IA integrado en el sitio web de AIPPS. Ayudas a los visitantes proporcionando información precisa y útil sobre los servicios, características y beneficios de la plataforma. Responde siempre en español a menos que te pregunten en otro idioma." },
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
