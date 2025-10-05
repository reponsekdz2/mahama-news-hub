const { GoogleGenAI } = require('@google/genai');

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

module.exports = {
    summarizeArticle,
};