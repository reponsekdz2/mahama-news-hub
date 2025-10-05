const { GoogleGenAI, Type } = require('@google/genai');

// @desc    Summarize article content
// @route   POST /api/gemini/summarize
// @access  Protected
const summarizeArticle = async (req, res, next) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Article content is required for summarization.' });
    }

    if (!process.env.API_KEY) {
        return res.status(500).json({ message: 'API key for AI service is not configured.' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const plainTextContent = content.replace(/<[^>]+>/g, ' ');

        const prompt = `Summarize the following news article into 3-5 concise bullet points, capturing the main topics and key takeaways. Here is the article:\n\n${plainTextContent}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const summary = response.text;
        res.json({ summary });

    } catch (error) {
        console.error('Gemini API Error:', error);
        next(new Error('Failed to generate summary from AI service.'));
    }
};


// @desc    Analyze article content for SEO
// @route   POST /api/gemini/analyze-content
// @access  Admin
const analyzeContent = async (req, res, next) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required for analysis.' });
    }
    if (!process.env.API_KEY) {
        return res.status(500).json({ message: 'API key for AI service is not configured.' });
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const plainTextContent = content.replace(/<[^>]+>/g, ' ');

        const prompt = `
            As an expert SEO analyst and content editor, analyze the following news article.
            Provide suggestions to improve its search engine ranking and user engagement.
            
            Article Title: "${title}"
            Article Content: "${plainTextContent.substring(0, 2000)}..."

            Based on the provided title and content, please generate the following in a JSON format:
            1.  'suggestedTitle': A compelling, SEO-friendly meta title, under 60 characters.
            2.  'suggestedDescription': An engaging meta description, under 160 characters.
            3.  'suggestedTags': An array of 5-7 relevant keywords or tags.
            4.  'seoFeedback': A brief paragraph (2-3 sentences) with actionable feedback on the content's SEO quality, tone, and clarity.
        `;

        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            suggestedTitle: { type: Type.STRING, description: 'A compelling, SEO-friendly meta title, under 60 characters.' },
            suggestedDescription: { type: Type.STRING, description: 'An engaging meta description, under 160 characters.' },
            suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of 5-7 relevant keywords or tags.' },
            seoFeedback: { type: Type.STRING, description: "A brief paragraph with actionable feedback on the content's SEO quality." }
          },
          required: ['suggestedTitle', 'suggestedDescription', 'suggestedTags', 'seoFeedback']
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const analysisResult = JSON.parse(response.text);
        res.json(analysisResult);

    } catch (error) {
        console.error('Gemini API Analysis Error:', error);
        next(new Error('Failed to generate content analysis from AI service.'));
    }
};

module.exports = {
    summarizeArticle,
    analyzeContent,
};