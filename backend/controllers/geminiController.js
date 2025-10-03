const geminiService = require('../services/geminiService');
const db = require('../config/db');

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
        const { articleData } = req.body;
        if (!articleData) {
            return res.status(400).json({ message: 'Content to summarize is required.' });
        }
        const summary = await geminiService.summarizeText(articleData);
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
        const userId = req.user.id;
        // FIX: Use favorite categories from the request body if available, otherwise fall back to database query.
        const { favoriteCategories } = req.body;

        let interestProfile;

        if (favoriteCategories && favoriteCategories.length > 0) {
            interestProfile = `a user interested in categories like: ${[...new Set(favoriteCategories)].join(', ')}`;
        } else {
            // Fetch user's interaction history to build an interest profile as a fallback
            const [userInterests] = await db.query(`
                SELECT 
                    a.category,
                    t.name as tagName,
                    COUNT(ua.id) as interaction_count
                FROM user_actions ua
                JOIN articles a ON ua.target_id = a.id
                LEFT JOIN article_tags at ON a.id = at.article_id
                LEFT JOIN tags t ON at.tag_id = t.id
                WHERE ua.user_id = ? AND ua.action_type IN ('view', 'like')
                GROUP BY a.category, t.name
                ORDER BY interaction_count DESC
                LIMIT 20;
            `, [userId]);

            if (userInterests.length > 0) {
                const topCategories = [...new Set(userInterests.map(i => i.category))].slice(0, 5);
                const topTags = [...new Set(userInterests.map(i => i.tagName).filter(Boolean))].slice(0, 5);
                interestProfile = `a user interested in categories like: ${topCategories.join(', ')} and topics like: ${topTags.join(', ')}`;
            } else {
                interestProfile = "general news";
            }
        }

        const articles = await geminiService.getPersonalizedNews(interestProfile);
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