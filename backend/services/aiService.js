const { GoogleGenAI, Type } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

/**
 * Improves the writing of a given text.
 * @param {string} text - The text to improve.
 * @returns {Promise<string>} The improved text.
 */
const improveText = async (text) => {
    const prompt = `You are a professional editor. Review the following text and improve it. Fix any spelling and grammatical errors, enhance clarity and flow, and make the style more engaging for a news article. Return only the improved text, maintaining the original format (e.g., if it's HTML, return valid HTML). Text to improve: "${text}"`;
    
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
};

/**
 * Generates a creative image prompt for an AI image generator based on an article title.
 * @param {string} title - The article title.
 * @returns {Promise<string>} A descriptive image prompt.
 */
const generateImageIdea = async (title) => {
    const prompt = `You are a creative director. Based on the news article title "${title}", generate a short, descriptive, and visually compelling prompt for an AI image generator (like Midjourney or DALL-E). The prompt should describe a single, impactful image. For example, for a title 'Breakthrough in Solar Power', a good prompt would be 'A photorealistic image of a single, glowing solar panel absorbing the light of a dramatic sunrise over a futuristic city skyline.'`;

    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
};


/**
 * Analyzes article content for sentiment, topics, keywords, and readability.
 * @param {string} title - The article title.
 * @param {string} content - The article content (HTML).
 * @returns {Promise<object>} An object containing the analysis.
 */
const analyzeArticle = async (title, content) => {
    // Basic HTML stripping for better analysis
    const textContent = content.replace(/<[^>]*>/g, ' ');

    const prompt = `Analyze the following news article titled "${title}" with the content: "${textContent}". Provide the following analysis in a single, valid JSON object:
    1.  "sentiment": Classify the overall tone as "Positive", "Negative", or "Neutral".
    2.  "keyTopics": An array of 5-7 key topics or entities (people, places, concepts) discussed.
    3.  "seoKeywords": An array of 5-7 relevant SEO keywords for this article.
    4.  "readabilityScore": A brief, human-readable readability score (e.g., "University Level", "Easy to read for most adults").`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    sentiment: { type: Type.STRING },
                    keyTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    seoKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    readabilityScore: { type: Type.STRING }
                },
                required: ["sentiment", "keyTopics", "seoKeywords", "readabilityScore"]
            }
        }
    });

    return JSON.parse(response.text);
};

module.exports = {
    improveText,
    generateImageIdea,
    analyzeArticle
};