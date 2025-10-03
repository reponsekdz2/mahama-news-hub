const { GoogleGenAI, Type } = require("@google/ai");

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

const summarizeText = async (articleData) => {
    const { title, content } = articleData;
    const prompt = `Summarize the following article content into a concise paragraph (around 100-120 words). The article title is "${title}". The content is: "${content}". Return only the summary paragraph.`;
    
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
    const prompt = `Generate a short news article about "${topic}". The article should have a "title", a "summary" (around 150 words), and a "category" from this list: World, Technology, Science, Politics, Sport, Health. Return the result as a single JSON object.`;

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


const getPersonalizedNews = async (interestProfile) => {
    const prompt = `Based on a user's interest profile: "${interestProfile}".
    Generate 3 new, fake but realistic news article objects. Each object must have an id (a new uuid), title, summary (a concise paragraph of about 100 words), content (HTML format, ~150 words), category from this list (World, Technology, Science, Politics, Sport, Health), imageUrl (use picsum.photos with a unique seed like https://picsum.photos/seed/yourseed/800/600), authorName, viewCount (random number between 100 and 10000), and likeCount (random number between 10 and 1000).
    Return a valid JSON array of these 3 article objects.`;
    
    const response = await ai.models.generateContent({ 
        model, 
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        content: { type: Type.STRING },
                        category: { type: Type.STRING },
                        imageUrl: { type: Type.STRING },
                        authorName: { type: Type.STRING },
                        viewCount: { type: Type.NUMBER },
                        likeCount: { type: Type.NUMBER },
                    },
                    required: ["id", "title", "summary", "content", "category", "imageUrl", "authorName", "viewCount", "likeCount"]
                }
            }
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
