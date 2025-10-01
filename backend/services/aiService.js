const { GoogleGenAI } = require("@google/genai");

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

module.exports = {
    improveText,
    generateImageIdea
};