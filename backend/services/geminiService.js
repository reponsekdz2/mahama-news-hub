const { GoogleGenAI, Type } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

const translateContent = async (content, targetLanguage) => {
    const { title, summary } = content;
    const prompt = `Translate the following JSON object values into ${targetLanguage}. Return a JSON object with the same structure. Do not translate the keys.
    Input:
    {
        "title": "${title}",
        "summary": "${summary}"
    }
    
    Output:`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    
    return JSON.parse(response.text);
};

const summarizeText = async (content) => {
    const { title, summary } = content;
    const prompt = `Summarize the following article content into 3-5 key bullet points. The article title is "${title}". The content is: "${summary}". Return only the bullet points.`;
    
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
};

const answerQuestion = async (context, question) => {
    const { title, summary } = context;
    const prompt = `Based on the article titled "${title}" with the content "${summary}", answer the following question: "${question}". Provide a concise answer.`;

    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
};

const generateArticle = async (topic) => {
    const prompt = `Generate a short news article about "${topic}". The article should have a "title", a "summary" (around 150 words, in HTML format with paragraphs), and a suitable "category" from this list: World, Technology, Science, Politics, Sport, Health. Return the result as a single JSON object.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    category: { type: Type.STRING }
                }
            }
        }
    });
    return JSON.parse(response.text);
};


const getPersonalizedNews = async (savedArticleTitles) => {
    const prompt = `Based on a user's interest in these articles: ${savedArticleTitles.join(', ')}.
    Generate 3 new, fake but realistic news article objects. Each object must have an id (a new uuid), title, content (HTML format, ~150 words), category, imageUrl (use picsum.photos with a unique seed), authorName, viewCount (random number), and likeCount (random number).
    Return a valid JSON array of these 3 article objects.`;
    
    const response = await ai.models.generateContent({ 
        model, 
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });

    try {
        // Gemini's response may include markdown characters for a JSON block.
        const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (e) {
        console.error("Failed to parse personalized news JSON:", e);
        console.error("Original response text:", response.text);
        // Fallback to empty array if parsing fails
        return [];
    }
}


module.exports = {
    translateContent,
    summarizeText,
    answerQuestion,
    generateArticle,
    getPersonalizedNews
};
