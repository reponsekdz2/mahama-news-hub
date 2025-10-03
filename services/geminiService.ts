import { GoogleGenAI, Type } from "@google/genai";
import type { Article } from '../types.ts';

const API_URL = '/api/gemini';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'An API error occurred');
    }
    return response.json();
}

export const translateArticleContent = async (
  content: { title: string; summary: string }, 
  targetLanguage: string
): Promise<{ title: string; summary: string }> => {
    const response = await fetch(`${API_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, targetLanguage })
    });
    return handleResponse(response);
};

export const summarizeContent = async (content: { title: string; summary: string }): Promise<string> => {
    const response = await fetch(`${API_URL}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });
    const data = await handleResponse(response);
    return data.summary;
};

export const answerQuestionAboutArticle = async (context: { title: string; summary: string }, question: string): Promise<string> => {
    const response = await fetch(`${API_URL}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, question })
    });
    const data = await handleResponse(response);
    return data.answer;
};

export const generateArticleWithAI = async (topic: string, token: string): Promise<{ title: string; summary: string, category: string }> => {
    const response = await fetch(`${API_URL}/generate-article`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic })
    });
    return handleResponse(response);
};

export const fetchPersonalizedNews = async (savedArticleTitles: string[], token: string): Promise<Article[]> => {
    const response = await fetch(`${API_URL}/personalized-news`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ savedArticleTitles })
    });
    return handleResponse(response);
};
