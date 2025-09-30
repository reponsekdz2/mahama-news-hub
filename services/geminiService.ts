import { GoogleGenAI, Type } from "@google/genai";
import type { Article } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const isSearchQuery = (topic: string, translatedCategories: string[]): boolean => {
  return !translatedCategories.some(cat => cat.toLowerCase() === topic.toLowerCase());
};

const generateArticlesFromPrompt = async (prompt: string): Promise<Article[]> => {
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

  const parsedArticles: Omit<Article, 'imageUrl' | 'id'>[] = JSON.parse(response.text);

  return parsedArticles.map((article) => ({
    ...article,
    id: article.title.replace(/\s+/g, '-').toLowerCase(), // Generate a simple unique ID
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(article.title)}/800/450`,
  }));
};

export const fetchNews = async (topic: string, languageName: string, translatedCategories: string[]): Promise<Article[]> => {
  try {
    const isSearch = isSearchQuery(topic, translatedCategories);
    const prompt = `
      You are a world-class news editor.
      Generate a list of the top 5 trending news articles for ${isSearch ? `the search query: "${topic}"` : `the category: "${topic}"`} in ${languageName}.
      For each article, provide a concise 'title', a 'summary' of about 2-3 sentences, the 'category' which should be "${topic}", and a list of relevant 'sources' with their 'title' and 'uri'.
    `;
    return await generateArticlesFromPrompt(prompt);
  } catch (error) {
    console.error("Error fetching news from Gemini API:", error);
    throw new Error("Failed to fetch news. Please check your connection or try again later.");
  }
};

export const fetchPersonalizedNews = async (savedArticleTitles: string[], languageName: string): Promise<Article[]> => {
    if (savedArticleTitles.length === 0) {
        return fetchNews('Top Stories', languageName, []);
    }
    try {
        const prompt = `
            You are a personalized news curator. Based on the user's interest in these articles: "${savedArticleTitles.join('", "')}", generate a new list of 5 news articles in ${languageName} that they would likely enjoy.
            For each article, provide a concise 'title', a 'summary' of about 2-3 sentences, a relevant 'category', and a list of 'sources' with their 'title' and 'uri'.
        `;
        return await generateArticlesFromPrompt(prompt);
    } catch (error) {
        console.error("Error fetching personalized news:", error);
        throw new Error("Failed to fetch your personalized news feed.");
    }
};

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
