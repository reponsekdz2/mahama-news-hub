const aiService = require('../services/aiService');

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

module.exports = {
    handleImproveWriting,
    handleGenerateImageIdea,
};