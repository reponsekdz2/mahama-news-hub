
import { GoogleGenAI, Type } from "@google/genai";
import type { Article } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Helper to determine if a topic is a generic search query
const isSearchQuery = (topic: string): boolean => {
  const categories = ['Top Stories', 'World', 'Politics', 'Business', 'Technology', 'Sport', 'Science', 'Health'];
  // If it's not a pre-defined category, treat it as a search query.
  return !categories.some(cat => cat.toLowerCase() === topic.toLowerCase());
};


export const fetchNews = async (topic: string): Promise<Article[]> => {
  try {
    const isSearch = isSearchQuery(topic);
    const prompt = `
      You are a world-class news editor.
      Generate a list of the top 5 trending news articles for ${isSearch ? `the search query: "${topic}"` : `the category: "${topic}"`}.
      For each article, provide a concise 'title', a 'summary' of about 2-3 sentences, the 'category' which should be "${topic}", and a list of relevant 'sources' with their 'title' and 'uri'.
    `;

    // FIX: Replaced unreliable prompt-based JSON formatting with a robust `responseSchema`.
    // This ensures the API returns valid JSON, fixing potential parsing errors.
    // The `googleSearch` tool has been removed as it's incompatible with `responseSchema`.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "The title of the news article." },
              summary: { type: Type.STRING, description: "A concise summary of the article." },
              category: { type: Type.STRING, description: "The category of the news article." },
              sources: {
                type: Type.ARRAY,
                description: "A list of source URLs for the article.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "The title of the source website." },
                    uri: { type: Type.STRING, description: "The URL of the source." }
                  },
                  required: ['title', 'uri']
                }
              }
            },
            required: ['title', 'summary', 'category', 'sources']
          }
        }
      },
    });
    
    // FIX: Simplified JSON parsing and removed brittle cleanup logic.
    // The `responseSchema` guarantees `response.text` is a valid JSON string.
    const parsedArticles: Omit<Article, 'imageUrl'>[] = JSON.parse(response.text);

    // FIX: Removed logic for processing `groundingChunks` as `googleSearch` is no longer used.
    // The `responseSchema` now requests sources directly from the model.
    const articlesWithDetails: Article[] = parsedArticles.map((article) => ({
      ...article,
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(topic + article.title)}/800/450`,
    }));
    
    return articlesWithDetails;
  } catch (error) {
    console.error("Error fetching news from Gemini API:", error);
    // FIX: Simplified error handling as JSON parsing is now reliable.
    throw new Error("Failed to fetch news. Please check your connection or try again later.");
  }
};
