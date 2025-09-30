import { GoogleGenAI, Type } from "@google/genai";
import type { Article } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const translateArticleContent = async (
  content: { title: string; summary: string }, 
  targetLanguage: string
): Promise<{ title: string; summary: string }> => {
  try {
    const prompt = `Translate the following JSON object's 'title' and 'summary' fields into ${targetLanguage}. Return ONLY the translated JSON object with the same structure. Original JSON: ${JSON.stringify(content)}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING }
          },
          required: ['title', 'summary']
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error translating content:", error);
    throw new Error("Failed to translate article.");
  }
};

export const summarizeContent = async (content: { title: string; summary: string }): Promise<string> => {
    try {
        const prompt = `Based on the following article title and summary, generate a concise 3-bullet point summary. Use a markdown bullet format (* point).
        Title: ${content.title}
        Summary: ${content.summary}`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error summarizing content:", error);
        throw new Error("Failed to generate summary.");
    }
};

export const answerQuestionAboutArticle = async (context: { title: string; summary: string }, question: string): Promise<string> => {
    try {
        const prompt = `You are a helpful assistant. Based ONLY on the context provided below, answer the user's question. If the answer is not in the context, say that you cannot answer based on the provided information.
        Context:
        Title: ${context.title}
        Summary: ${context.summary}
        
        Question: ${question}`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error answering question:", error);
        throw new Error("Failed to get an answer.");
    }
};
