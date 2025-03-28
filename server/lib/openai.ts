import OpenAI from "openai";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";
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
      ? { role: "system", content: `You are AIPI, an AI assistant embedded on a website. Your primary goal is to provide helpful, accurate information based specifically on the context provided. 
      
IMPORTANT INSTRUCTIONS:
1. Focus your responses on the information found in the context below.
2. If the user's question can be answered using the context, always respond with information from the context.
3. If information to answer the question is present in a document, cite the document name in your response.
4. If the information is not available in the context, clearly state that you don't have specific information about that, and provide a general response.
5. Your answers should be concise but complete.
6. Never make up information that isn't in the context.

CONTEXT: ${context}` }
      : { role: "system", content: "You are AIPI, a helpful AI assistant that provides concise, accurate information to website visitors. Be friendly, professional, and helpful." };
    
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

    const result = JSON.parse(response.choices[0].message.content);

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
  } catch (error) {
    console.error("Failed to summarize text:", error);
    throw new Error(`Failed to summarize text: ${error.message}`);
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
  } catch (error) {
    console.error("Failed to extract key information:", error);
    throw new Error(`Failed to extract key information: ${error.message}`);
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
        { role: "system", content: "You are AIPI, an AI assistant embedded on a website. You help visitors by providing accurate, helpful information based on the website's content." },
        { role: "user", content: prompt }
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Failed to generate automated response:", error);
    throw new Error(`Failed to generate automated response: ${error.message}`);
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
