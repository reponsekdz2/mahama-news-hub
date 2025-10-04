const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const { logUserAction, logAdminAction } = require('../services/logService');
const { checkUserSubscription } = require('../services/subscriptionHelper');

// Helper function to parse tags
const parseTags = (tagsString) => tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(Boolean) : [];

const getArticles = async (req, res, next) => {
    // This is a complex query builder. We'll add filters based on query params.
    try {
        const { topic, q, dateRange, sortBy } = req.query;
        let query = `
            SELECT 
                a.id, a.title, a.summary, a.category, a.image_url as imageUrl, a.video_url as videoUrl, a.is_premium as isPremium,
                u.name as authorName, a.createdAt,
                (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) as viewCount,
                (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as likeCount,
                (SELECT GROUP_CONCAT(t.name SEPARATOR ', ') FROM tags t JOIN article_tags at ON t.id = at.tag_id WHERE at.article_id = a.id) as tags
        `;
        
        // Add isLiked field if user is logged in
        if (req.user?.id) {
            query += `, (SELECT COUNT(*) > 0 FROM article_likes WHERE article_id = a.id AND user_id = ${db.escape(req.user.id)}) as isLiked`;
        } else {
            query += `, FALSE as isLiked`;
        }
        
        query += ` FROM articles a JOIN users u ON a.author_id = u.id WHERE a.status = 'published'`;
        
        const params = [];

        if (topic && topic !== 'all' && topic !== 'readingHistory') {
            query += ` AND a.category = ?`;
            params.push(topic);
        }
        
        if (topic === 'readingHistory' && req.user?.id) {
             query = query.replace('WHERE a.status = \'published\'', `
                JOIN (
                    SELECT DISTINCT article_id, MAX(createdAt) as last_viewed FROM article_views WHERE user_id = ? GROUP BY article_id
                ) as av ON a.id = av.article_id
                WHERE a.status = 'published'
            `);
            params.unshift(req.user.id);
        }

        if (q) {
            query += ` AND (a.title LIKE ? OR a.summary LIKE ?)`;
            params.push(`%${q}%`, `%${q}%`);
        }
        
        if(dateRange) {
            if (dateRange === '24h') query += ' AND a.createdAt >= NOW() - INTERVAL 1 DAY';
            if (dateRange === '7d') query += ' AND a.createdAt >= NOW() - INTERVAL 7 DAY';
            if (dateRange === '30d') query += ' AND a.createdAt >= NOW() - INTERVAL 1 MONTH';
        }

        if (sortBy === 'oldest') query += ' ORDER BY a.createdAt ASC';
        else if (sortBy === 'views') query += ' ORDER BY viewCount DESC';
        else if (sortBy === 'likes') query += ' ORDER BY likeCount DESC';
        else query += ' ORDER BY a.createdAt DESC'; // Default is newest

        const [articles] = await db.query(query, params);
        res.json(articles);
        
    } catch (error) {
        next(error);
    }
};

const getArticleById = async (req, res, next) => {
    try {
        const hasSubscription = req.user ? await checkUserSubscription(req.user.id) : false;
        
        let articleQuery = `
            SELECT 
                a.id, a.title, a.summary, a.content, a.category, a.image_url as imageUrl, a.video_url as videoUrl, a.is_premium as isPremium,
                u.name as authorName, a.createdAt, a.meta_title as metaTitle, a.meta_description as metaDescription,
                (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) as viewCount,
                (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as likeCount,
                (SELECT GROUP_CONCAT(t.name SEPARATOR ', ') FROM tags t JOIN article_tags at ON t.id = at.tag_id WHERE at.article_id = a.id) as tags
        `;
        if (req.user?.id) {
            articleQuery += `, (SELECT COUNT(*) > 0 FROM article_likes WHERE article_id = a.id AND user_id = ?) as isLiked`;
        } else {
             articleQuery += `, FALSE as isLiked`;
        }
        articleQuery += ` FROM articles a JOIN users u ON a.author_id = u.id WHERE a.id = ?`;

        const [articles] = await db.query(articleQuery, [req.user?.id, req.params.id]);

        if (articles.length === 0) {
            return res.status(404).json({ message: 'Article not found' });
        }
        
        let article = articles[0];
        
        // Handle premium content
        if (article.isPremium && !hasSubscription) {
            article.content = `<div class="paywall-blocker"><p>This is premium content. Please subscribe to read the full article.</p></div>`;
        }

        // Fetch poll data if it exists
        const [polls] = await db.query('SELECT id, question FROM polls WHERE article_id = ?', [req.params.id]);
        if (polls.length > 0) {
            const poll = polls[0];
            const [options] = await db.query('SELECT id, option_text FROM poll_options WHERE poll_id = ?', [poll.id]);
            
            let totalVotes = 0;
            let userVote = null;

            for (const option of options) {
                const [votes] = await db.query('SELECT COUNT(*) as count FROM poll_votes WHERE poll_option_id = ?', [option.id]);
                option.voteCount = votes[0].count;
                totalVotes += option.voteCount;
                
                if(req.user?.id) {
                    const [userHasVoted] = await db.query('SELECT id FROM poll_votes WHERE poll_option_id = ? AND user_id = ?', [option.id, req.user.id]);
                    if (userHasVoted.length > 0) {
                        userVote = option.id;
                    }
                }
            }
            article.poll = {
                ...poll,
                options,
                totalVotes,
                userVote
            };
        }


        res.json(article);

    } catch (error) {
        next(error);
    }
};

const createArticle = async (req, res, next) => {
    const { title, summary, content, category, status, isPremium, tags, metaTitle, metaDescription } = req.body;
    const authorId = req.user.id;
    
    // Check for files
    const imageUrl = req.files?.image ? `/uploads/${req.files.image[0].filename}` : null;
    const videoUrl = req.files?.video ? `/uploads/${req.files.video[0].filename}` : null;

    if (!title || !content || !category || !imageUrl) {
         // Cleanup uploaded files if validation fails
        if(req.files?.image) fs.unlinkSync(path.join(__dirname, '..', req.files.image[0].path));
        if(req.files?.video) fs.unlinkSync(path.join(__dirname, '..', req.files.video[0].path));
        return res.status(400).json({ message: 'Title, content, category, and an image are required.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO articles (title, summary, content, category, image_url, video_url, author_id, status, is_premium, meta_title, meta_description) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, summary, content, category, imageUrl, videoUrl, authorId, status, isPremium === 'true', metaTitle, metaDescription]
        );
        const articleId = result.insertId;

        // Handle tags
        const tagNames = parseTags(tags);
        if (tagNames.length > 0) {
            for (const tagName of tagNames) {
                let [tagResult] = await connection.query('SELECT id FROM tags WHERE name = ?', [tagName]);
                let tagId;
                if (tagResult.length === 0) {
                    [tagResult] = await connection.query('INSERT INTO tags (name) VALUES (?)', [tagName]);
                    tagId = tagResult.insertId;
                } else {
                    tagId = tagResult[0].id;
                }
                await connection.query('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)', [articleId, tagId]);
            }
        }

        await connection.commit();
        logAdminAction(req.user.id, 'create', 'article', articleId, { title });
        res.status(201).json({ id: articleId, message: 'Article created' });
    } catch (error) {
        await connection.rollback();
         // Cleanup uploaded files on error
        if(req.files?.image) fs.unlinkSync(path.join(__dirname, '..', req.files.image[0].path));
        if(req.files?.video) fs.unlinkSync(path.join(__dirname, '..', req.files.video[0].path));
        next(error);
    } finally {
        connection.release();
    }
};

const updateArticle = async (req, res, next) => {
    const { id } = req.params;
    const { title, summary, content, category, status, isPremium, tags, metaTitle, metaDescription, imageUrl: existingImageUrl, videoUrl: existingVideoUrl } = req.body;
    
    // Get new file paths if they exist
    const newImageUrl = req.files?.image ? `/uploads/${req.files.image[0].filename}` : null;
    const newVideoUrl = req.files?.video ? `/uploads/${req.files.video[0].filename}` : null;
    
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        // Fetch old article to get file paths for deletion
        const [oldArticleResult] = await connection.query('SELECT image_url, video_url FROM articles WHERE id = ?', [id]);
        if (oldArticleResult.length === 0) {
            return res.status(404).json({ message: 'Article not found' });
        }
        const oldArticle = oldArticleResult[0];

        // If a new image was uploaded, delete the old one
        if (newImageUrl && oldArticle.image_url) {
            fs.unlink(path.join(__dirname, '..', oldArticle.image_url), err => {
                if(err) console.error("Failed to delete old image:", err);
            });
        }
        // If a new video was uploaded, delete the old one
        if (newVideoUrl && oldArticle.video_url) {
             fs.unlink(path.join(__dirname, '..', oldArticle.video_url), err => {
                if(err) console.error("Failed to delete old video:", err);
            });
        }

        await connection.query(
            `UPDATE articles SET title = ?, summary = ?, content = ?, category = ?, status = ?, is_premium = ?, 
            image_url = ?, video_url = ?, meta_title = ?, meta_description = ? WHERE id = ?`,
            [title, summary, content, category, status, isPremium === 'true', newImageUrl || existingImageUrl, newVideoUrl || existingVideoUrl, metaTitle, metaDescription, id]
        );

        // Handle tags - simple approach: delete all and re-add
        await connection.query('DELETE FROM article_tags WHERE article_id = ?', [id]);
        const tagNames = parseTags(tags);
        if (tagNames.length > 0) {
             for (const tagName of tagNames) {
                let [tagResult] = await connection.query('SELECT id FROM tags WHERE name = ?', [tagName]);
                let tagId;
                if (tagResult.length === 0) {
                    [tagResult] = await connection.query('INSERT INTO tags (name) VALUES (?)', [tagName]);
                    tagId = tagResult.insertId;
                } else {
                    tagId = tagResult[0].id;
                }
                await connection.query('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)', [id, tagId]);
            }
        }
        
        await connection.commit();
        logAdminAction(req.user.id, 'update', 'article', id, { title });
        res.json({ message: 'Article updated' });
    } catch (error) {
        await connection.rollback();
        // Cleanup newly uploaded files on error
        if(newImageUrl) fs.unlink(path.join(__dirname, '..', newImageUrl), err => console.error(err));
        if(newVideoUrl) fs.unlink(path.join(__dirname, '..', newVideoUrl), err => console.error(err));
        next(error);
    } finally {
        connection.release();
    }
};


const deleteArticle = async (req, res, next) => {
    try {
        const [article] = await db.query('SELECT image_url, video_url FROM articles WHERE id = ?', [req.params.id]);
        if (article.length > 0) {
            if (article[0].image_url) {
                 fs.unlink(path.join(__dirname, '..', article[0].image_url), err => {
                    if(err) console.error("Failed to delete image on article delete:", err);
                });
            }
            if (article[0].video_url) {
                fs.unlink(path.join(__dirname, '..', article[0].video_url), err => {
                    if(err) console.error("Failed to delete video on article delete:", err);
                });
            }
        }
        
        // ON DELETE CASCADE will handle related tables
        await db.query('DELETE FROM articles WHERE id = ?', [req.params.id]);
        logAdminAction(req.user.id, 'delete', 'article', req.params.id, {});
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const likeArticle = async (req, res, next) => {
    try {
        await db.query('INSERT IGNORE INTO article_likes (user_id, article_id) VALUES (?, ?)', [req.user.id, req.params.id]);
        const [result] = await db.query('SELECT COUNT(*) as likeCount FROM article_likes WHERE article_id = ?', [req.params.id]);
        logUserAction(req.user.id, 'like', req.params.id);
        res.json(result[0]);
    } catch (error) {
        next(error);
    }
};

const unlikeArticle = async (req, res, next) => {
     try {
        await db.query('DELETE FROM article_likes WHERE user_id = ? AND article_id = ?', [req.user.id, req.params.id]);
        const [result] = await db.query('SELECT COUNT(*) as likeCount FROM article_likes WHERE article_id = ?', [req.params.id]);
        logUserAction(req.user.id, 'unlike', req.params.id);
        res.json(result[0]);
    } catch (error) {
        next(error);
    }
};

const recordView = async (req, res, next) => {
    try {
        // We log views for both guests (user_id = NULL) and logged-in users.
        await db.query('INSERT INTO article_views (user_id, article_id) VALUES (?, ?)', [req.user?.id || null, req.params.id]);
        if (req.user?.id) {
            logUserAction(req.user.id, 'view', req.params.id);
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const getCommentsForArticle = async (req, res, next) => {
    try {
        const [comments] = await db.query(
            `SELECT c.id, c.content, c.createdAt, u.name as userName 
             FROM comments c 
             JOIN users u ON c.user_id = u.id 
             WHERE c.article_id = ? AND c.status = 'approved'
             ORDER BY c.createdAt DESC`,
            [req.params.id]
        );
        res.json(comments);
    } catch (error) {
        next(error);
    }
};

const addCommentToArticle = async (req, res, next) => {
    const { content } = req.body;
    try {
        await db.query(
            'INSERT INTO comments (user_id, article_id, content) VALUES (?, ?, ?)',
            [req.user.id, req.params.id, content]
        );
        logUserAction(req.user.id, 'comment', req.params.id);
        res.status(201).json({ message: 'Comment submitted for moderation.' });
    } catch (error) {
        next(error);
    }
};

const getRelatedArticles = async (req, res, next) => {
    try {
        const [currentArticle] = await db.query('SELECT category FROM articles WHERE id = ?', [req.params.id]);
        if (currentArticle.length === 0) {
            return res.status(404).json({ message: 'Article not found' });
        }
        const [related] = await db.query(
            `SELECT id, title, image_url as imageUrl FROM articles WHERE category = ? AND id != ? AND status = 'published' ORDER BY createdAt DESC LIMIT 3`,
            [currentArticle[0].category, req.params.id]
        );
        res.json(related);
    } catch (error) {
        next(error);
    }
};

const recordShare = async (req, res, next) => {
    try {
        const { platform } = req.body;
        // The logUserAction service will handle inserting the record
        logUserAction(req.user.id, 'share_article', req.params.id, { platform: platform || 'unknown' });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};


const getSearchSuggestions = async (req, res, next) => {
    const { q } = req.query;
    if (!q || q.length < 2) {
        return res.json([]);
    }
    try {
        const [articles] = await db.query(
            `SELECT id, title FROM articles WHERE title LIKE ? AND status = 'published' LIMIT 5`,
            [`%${q}%`]
        );
        res.json(articles);
    } catch (error) {
        next(error);
    }
};

const getRandomArticle = async (req, res, next) => {
     try {
        const [articles] = await db.query(
            `SELECT id FROM articles WHERE status = 'published' ORDER BY RAND() LIMIT 1`
        );
        if (articles.length === 0) {
             return res.status(404).json({ message: 'No articles found' });
        }
        // Redirect to getArticleById to avoid duplicating logic
        req.params.id = articles[0].id;
        return getArticleById(req, res, next);
    } catch (error) {
        next(error);
    }
}


module.exports = {
    getArticles, getArticleById, createArticle, updateArticle, deleteArticle,
    likeArticle, unlikeArticle, recordView, getCommentsForArticle, addCommentToArticle,
    getRelatedArticles, recordShare, getSearchSuggestions, getRandomArticle
};