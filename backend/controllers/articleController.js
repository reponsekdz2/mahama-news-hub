let articles = require('../data/articles');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc    Get all articles
 * @route   GET /api/articles
 */
const getArticles = (req, res) => {
    const { category } = req.query;
    if (category && category.toLowerCase() !== 'top stories') {
        const filteredArticles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
        return res.json(filteredArticles);
    }
    res.json(articles);
};

/**
 * @desc    Create an article
 * @route   POST /api/articles
 */
const createArticle = (req, res) => {
    const { title, summary, category, imageUrl, sources } = req.body;
    if (!title || !summary || !category) {
        return res.status(400).json({ message: 'Please provide title, summary, and category' });
    }

    const newArticle = {
        id: uuidv4(),
        title,
        summary,
        category,
        imageUrl: imageUrl || `https://picsum.photos/seed/${encodeURIComponent(title)}/800/450`,
        sources: sources || []
    };

    articles.unshift(newArticle); // Add to the beginning of the array
    res.status(201).json(newArticle);
};

/**
 * @desc    Update an article
 * @route   PUT /api/articles/:id
 */
const updateArticle = (req, res) => {
    const { id } = req.params;
    const { title, summary, category, imageUrl, sources } = req.body;
    
    const articleIndex = articles.findIndex(a => a.id === id);

    if (articleIndex === -1) {
        return res.status(404).json({ message: 'Article not found' });
    }

    const updatedArticle = {
        ...articles[articleIndex],
        title: title || articles[articleIndex].title,
        summary: summary || articles[articleIndex].summary,
        category: category || articles[articleIndex].category,
        imageUrl: imageUrl || articles[articleIndex].imageUrl,
        sources: sources || articles[articleIndex].sources,
    };
    
    articles[articleIndex] = updatedArticle;
    res.json(updatedArticle);
};

/**
 * @desc    Delete an article
 * @route   DELETE /api/articles/:id
 */
const deleteArticle = (req, res) => {
    const { id } = req.params;
    const initialLength = articles.length;
    articles = articles.filter(a => a.id !== id);

    if (articles.length === initialLength) {
        return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ message: 'Article removed successfully' });
};

module.exports = {
    getArticles,
    createArticle,
    updateArticle,
    deleteArticle
};
