const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { logAdminAction } = require('../services/logService');

// @desc    Get all users
const getAllUsers = async (req, res, next) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, createdAt, last_login FROM users');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Update user role
const updateUserRole = async (req, res, next) => {
    const targetUserId = req.params.id;
    const { role } = req.body;
    try {
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, targetUserId]);
        logAdminAction(req.user.id, 'update', 'user', targetUserId, { newRole: role });
        res.json({ message: 'User role updated' });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a user
const deleteUser = async (req, res, next) => {
    const targetUserId = req.params.id;
    try {
        await db.query('DELETE FROM users WHERE id = ?', [targetUserId]);
        logAdminAction(req.user.id, 'delete', 'user', targetUserId, {});
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// @desc    Update current user's profile
const updateMyProfile = async (req, res, next) => {
    const { name, email, password } = req.body;
    const userId = req.user.id;
    try {
        let query = 'UPDATE users SET';
        const params = [];
        if (name) { query += ' name = ?,'; params.push(name); }
        if (email) { query += ' email = ?,'; params.push(email); }
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            query += ' password = ?,';
            params.push(hashedPassword);
        }
        query = query.slice(0, -1) + ' WHERE id = ?';
        params.push(userId);
        
        await db.query(query, params);
        
        const [updatedUser] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);
        res.json(updatedUser[0]);

    } catch (error) {
        next(error);
    }
};

// @desc    Delete current user's account
const deleteMyAccount = async (req, res, next) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.user.id]);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};


// @desc    Get current user's preferences
const getUserPreferences = async (req, res, next) => {
    try {
        const [prefs] = await db.query('SELECT * FROM user_preferences WHERE user_id = ?', [req.user.id]);
        if (prefs.length === 0) {
            // Return default preferences if none are found
            return res.json({ 
                theme: 'dark', 
                accentColor: 'red', 
                language: 'en', 
                fontSize: 'base',
                lineHeight: 'normal',
                content_preferences: [], 
                newsletter_subscribed: false, 
                comment_notifications_enabled: true 
            });
        }
        res.json({
            ...prefs[0],
            contentPreferences: prefs[0].content_preferences,
            newsletter: !!prefs[0].newsletter_subscribed,
            commentNotificationsEnabled: !!prefs[0].comment_notifications_enabled,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update current user's preferences
const updateUserPreferences = async (req, res, next) => {
    const userId = req.user.id;
    const { theme, accentColor, language, contentPreferences, newsletter, commentNotificationsEnabled, fontSize, lineHeight } = req.body;
    let query = 'UPDATE user_preferences SET';
    const params = [];
    if (theme) { query += ' theme = ?,'; params.push(theme); }
    if (accentColor) { query += ' accentColor = ?,'; params.push(accentColor); }
    if (language) { query += ' language = ?,'; params.push(language); }
    if (fontSize) { query += ' fontSize = ?,'; params.push(fontSize); }
    if (lineHeight) { query += ' lineHeight = ?,'; params.push(lineHeight); }
    if (contentPreferences) { query += ' content_preferences = ?,'; params.push(JSON.stringify(contentPreferences)); }
    if (typeof newsletter === 'boolean') { query += ' newsletter_subscribed = ?,'; params.push(newsletter); }
    if (typeof commentNotificationsEnabled === 'boolean') { query += ' comment_notifications_enabled = ?,'; params.push(commentNotificationsEnabled); }
    
    query = query.slice(0, -1) + ' WHERE user_id = ?';
    params.push(userId);

    try {
        await db.query(query, params);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's reading history
const getReadingHistory = async (req, res, next) => {
    try {
        const [articles] = await db.query(`
            SELECT DISTINCT
                a.id, a.title, a.content, a.category, a.image_url as imageUrl, a.video_url as videoUrl,
                u.name as authorName,
                (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) as viewCount,
                (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as likeCount
            FROM article_views av
            JOIN articles a ON av.article_id = a.id
            JOIN users u ON a.author_id = u.id
            WHERE av.user_id = ? ORDER BY av.createdAt DESC
        `, [req.user.id]);
        res.json(articles);
    } catch (error) {
        next(error);
    }
};

// @desc    Clear user's reading history
const clearReadingHistory = async (req, res, next) => {
    try {
        await db.query('DELETE FROM article_views WHERE user_id = ?', [req.user.id]);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// @desc    Subscribe an email to the newsletter
const subscribeToNewsletter = async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email address is required.' });
    }
    try {
        await db.query('INSERT IGNORE INTO newsletter_subscriptions (email) VALUES (?)', [email]);
        if (req.user?.id) {
            await db.query('UPDATE user_preferences SET newsletter_subscribed = 1 WHERE user_id = ?', [req.user.id]);
        }
        res.status(201).json({ message: 'Successfully subscribed!' });
    } catch (error) {
        next(error);
    }
};

// @desc Get user's notifications
const getNotifications = async (req, res, next) => {
    try {
        const [notifications] = await db.query(`
            SELECT n.id, n.type, n.actor_name as actorName, n.is_read as isRead, n.createdAt,
                   n.related_article_id as relatedArticleId, a.title as relatedArticleTitle
            FROM notifications n
            JOIN articles a ON n.related_article_id = a.id
            WHERE n.user_id = ? ORDER BY n.createdAt DESC LIMIT 20
        `, [req.user.id]);
        res.json(notifications);
    } catch (error) {
        next(error);
    }
}

// @desc Mark notifications as read
const markNotificationsAsRead = async (req, res, next) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Notification IDs array is required.' });
    }
    try {
        await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id IN (?)', [req.user.id, ids]);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllUsers, updateUserRole, deleteUser, updateMyProfile, deleteMyAccount,
    getUserPreferences, updateUserPreferences, getReadingHistory, clearReadingHistory,
    subscribeToNewsletter, getNotifications, markNotificationsAsRead,
};