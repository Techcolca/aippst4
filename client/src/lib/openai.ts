import { apiRequest } from "./queryClient";

interface ChatCompletionRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
  context?: string;
}

interface ChatCompletionResponse {
  message: {
    role: string;
    content: string;
  };
}

export const generateChatCompletion = async (
  messages: Array<{ role: string; content: string }>,
  context?: string
): Promise<string> => {
  try {
    const response = await apiRequest("POST", "/api/openai/completion", {
      messages,
      context
    });

    const result: ChatCompletionResponse = await response.json();
    return result.message.content;
  } catch (error) {
    console.error("Error generating chat completion:", error);
    throw error;
  }
};

export const analyzeSentiment = async (text: string): Promise<{
  rating: number;
  confidence: number;
}> => {
  try {
    const response = await apiRequest("POST", "/api/openai/sentiment", {
      text
    });

    return await response.json();
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    throw error;
  }
};

export const summarizeText = async (text: string): Promise<string> => {
  try {
    const response = await apiRequest("POST", "/api/openai/summarize", {
      text
    });

    const result = await response.json();
    return result.summary;
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw error;
  }
};
