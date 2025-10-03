const aiService = require('../services/aiService');
const db = require('../config/db');

const handleImproveWriting = async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Text to improve is required.' });
        }
        const improvedText = await aiService.improveText(text);
        res.json({ improvedText });
    } catch (error) {
        next(error);
    }
};

const handleGenerateImageIdea = async (req, res, next) => {
    try {
        const { title } = req.body;
         if (!title) {
            return res.status(400).json({ message: 'Article title is required.' });
        }
        const idea = await aiService.generateImageIdea(title);
        res.json({ idea });
    } catch (error) {
        next(error);
    }
};

const handleAnalyzeArticle = async (req, res, next) => {
    try {
        const { articleId } = req.body;
        if (!articleId) {
            return res.status(400).json({ message: 'Article ID is required for analysis.' });
        }
        
        // Check for cached analysis first
        const [cached] = await db.query('SELECT * FROM article_analysis WHERE article_id = ?', [articleId]);
        if (cached.length > 0) {
            return res.json({
                sentiment: cached[0].sentiment,
                keyTopics: JSON.parse(cached[0].key_topics),
                seoKeywords: JSON.parse(cached[0].seo_keywords),
                readabilityScore: cached[0].readability_score
            });
        }

        // Fetch article content if not cached
        const [articles] = await db.query('SELECT title, content FROM articles WHERE id = ?', [articleId]);
        if (articles.length === 0) {
            return res.status(404).json({ message: 'Article not found.' });
        }
        const article = articles[0];

        const analysis = await aiService.analyzeArticle(article.title, article.content);
        
        // Cache the new analysis
        await db.query(`
            INSERT INTO article_analysis (article_id, sentiment, key_topics, seo_keywords, readability_score) 
            VALUES (?, ?, ?, ?, ?)
        `, [articleId, analysis.sentiment, JSON.stringify(analysis.keyTopics), JSON.stringify(analysis.seoKeywords), analysis.readabilityScore]);

        res.json(analysis);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    handleImproveWriting,
    handleGenerateImageIdea,
    handleAnalyzeArticle
};