const geminiService = require('../services/geminiService');

const handleTranslation = async (req, res, next) => {
    try {
        const { content, targetLanguage } = req.body;
        if (!content || !targetLanguage) {
            return res.status(400).json({ message: 'Content and target language are required.' });
        }
        const translated = await geminiService.translateContent(content, targetLanguage);
        res.json(translated);
    } catch (error) {
        next(error);
    }
};

const handleSummarization = async (req, res, next) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'Content to summarize is required.' });
        }
        const summary = await geminiService.summarizeText(content);
        res.json({ summary });
    } catch (error) {
        next(error);
    }
};

const handleAnswerQuestion = async (req, res, next) => {
    try {
        const { context, question } = req.body;
        if (!context || !question) {
            return res.status(400).json({ message: 'Context and question are required.' });
        }
        const answer = await geminiService.answerQuestion(context, question);
        res.json({ answer });
    } catch (error) {
        next(error);
    }
};

const handleGenerateArticle = async (req, res, next) => {
    try {
        const { topic } = req.body;
        if (!topic) {
            return res.status(400).json({ message: 'Topic is required to generate an article.' });
        }
        const article = await geminiService.generateArticle(topic);
        res.json(article);
    } catch (error) {
        next(error);
    }
};

const handlePersonalizedNews = async (req, res, next) => {
     try {
        const { savedArticleTitles } = req.body;
        if (!savedArticleTitles) {
            return res.status(400).json({ message: 'Article titles are required for personalization.' });
        }
        const articles = await geminiService.getPersonalizedNews(savedArticleTitles);
        res.json(articles);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    handleTranslation,
    handleSummarization,
    handleAnswerQuestion,
    handleGenerateArticle,
    handlePersonalizedNews
};
