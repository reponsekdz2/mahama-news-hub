const db = require('../config/db');
const { logUserAction } = require('../services/logService');

// @desc    Get all collections for a user
const getCollections = async (req, res, next) => {
    try {
        const [collections] = await db.query(`
            SELECT c.id, c.name, COUNT(ca.article_id) as articleCount
            FROM collections c
            LEFT JOIN collection_articles ca ON c.id = ca.collection_id
            WHERE c.user_id = ?
            GROUP BY c.id
            ORDER BY c.name ASC
        `, [req.user.id]);
        
        for(let collection of collections) {
            const [articles] = await db.query(`
                 SELECT 
                    a.id, a.title, a.content, a.category, a.image_url as imageUrl, a.video_url as videoUrl,
                    u.name as authorName,
                    (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) as viewCount,
                    (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as likeCount,
                    (SELECT COUNT(*) > 0 FROM article_likes WHERE article_id = a.id AND user_id = ?) as isLiked
                FROM collection_articles ca
                JOIN articles a ON ca.article_id = a.id
                JOIN users u ON a.author_id = u.id
                WHERE ca.collection_id = ?
            `, [req.user.id, collection.id]);
            collection.articles = articles;
        }

        res.json(collections);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new collection
const createCollection = async (req, res, next) => {
    const { name } = req.body;
    if(!name) {
        return res.status(400).json({ message: 'Collection name is required.' });
    }
    try {
        const [result] = await db.query('INSERT INTO collections (user_id, name) VALUES (?, ?)', [req.user.id, name]);
        const newCollection = { id: result.insertId, name, articles: [], articleCount: 0 };
        logUserAction(req.user.id, 'save_article', null, { action: 'create_collection', collectionId: newCollection.id, collectionName: name });
        res.status(201).json(newCollection);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a collection's name
const updateCollection = async (req, res, next) => {
    const { name } = req.body;
    const { id } = req.params;
    if(!name) {
        return res.status(400).json({ message: 'New collection name is required.' });
    }
    try {
        await db.query('UPDATE collections SET name = ? WHERE id = ? AND user_id = ?', [name, id, req.user.id]);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a collection
const deleteCollection = async (req, res, next) => {
    try {
        // The database schema is set to ON DELETE CASCADE, so collection_articles will be cleaned up automatically.
        await db.query('DELETE FROM collections WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// @desc    Add an article to a collection
const addArticleToCollection = async (req, res, next) => {
    const { articleId } = req.body;
    const { id: collectionId } = req.params;
    if(!articleId) {
        return res.status(400).json({ message: 'Article ID is required.' });
    }

    try {
        // Verify the collection belongs to the user before adding
        const [collection] = await db.query('SELECT id FROM collections WHERE id = ? AND user_id = ?', [collectionId, req.user.id]);
        if(collection.length === 0) {
            return res.status(403).json({ message: 'User does not own this collection.' });
        }

        await db.query('INSERT IGNORE INTO collection_articles (collection_id, article_id) VALUES (?, ?)', [collectionId, articleId]);
        logUserAction(req.user.id, 'save_article', articleId, { action: 'add_to_collection', collectionId });
        res.status(201).json({ message: 'Article added to collection.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove an article from a collection
const removeArticleFromCollection = async (req, res, next) => {
    const { id: collectionId, articleId } = req.params;
    
    try {
         // Verify the collection belongs to the user before removing
        const [collection] = await db.query('SELECT id FROM collections WHERE id = ? AND user_id = ?', [collectionId, req.user.id]);
        if(collection.length === 0) {
            return res.status(403).json({ message: 'User does not own this collection.' });
        }

        await db.query('DELETE FROM collection_articles WHERE collection_id = ? AND article_id = ?', [collectionId, articleId]);
        logUserAction(req.user.id, 'save_article', articleId, { action: 'remove_from_collection', collectionId });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    addArticleToCollection,
    removeArticleFromCollection
};