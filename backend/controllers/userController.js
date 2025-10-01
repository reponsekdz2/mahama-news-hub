const db = require('../config/db');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, createdAt FROM users');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Admin
const updateUserRole = async (req, res, next) => {
    const { role } = req.body;
    const userId = req.params.id;

    if (req.user.id.toString() === userId) {
        return res.status(400).json({ message: "Admins cannot change their own role." });
    }

    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified.' });
    }
    
    try {
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
        res.json({ message: 'User role updated successfully.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res, next) => {
    const userId = req.params.id;
    if (req.user.id.toString() === userId) {
        return res.status(400).json({ message: "Admins cannot delete their own account." });
    }
    try {
        // This is a hard delete. In a real app, you might want to soft delete.
        await db.query('DELETE FROM users WHERE id = ?', [userId]);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// @desc    Get user preferences
// @route   GET /api/users/preferences
// @access  Protected
const getUserPreferences = async (req, res, next) => {
    try {
        const [[prefs]] = await db.query('SELECT theme, language, accent_color as accentColor, content_preferences as contentPreferences FROM user_preferences WHERE user_id = ?', [req.user.id]);
        const [[user]] = await db.query('SELECT is_subscribed as newsletter FROM users WHERE id = ?', [req.user.id]);

        if (!prefs) {
            return res.status(404).json({ message: 'Preferences not found.' });
        }
        
        // Combine results and parse JSON string
        const finalPrefs = {
            ...prefs,
            contentPreferences: JSON.parse(prefs.contentPreferences || '[]'),
            newsletter: !!user.newsletter
        }
        
        res.json(finalPrefs);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a user preference
// @route   PUT /api/users/preferences
// @access  Protected
const updateUserPreference = async (req, res, next) => {
    const { key, value } = req.body;
    const validPrefKeys = {
        'theme': 'theme',
        'language': 'language',
        'accentColor': 'accent_color',
        'contentPreferences': 'content_preferences',
    };
    
    const validUserKeys = {
        'newsletter': 'is_subscribed'
    }

    try {
       if (validPrefKeys[key]) {
            const dbKey = validPrefKeys[key];
            const dbValue = typeof value === 'object' ? JSON.stringify(value) : value;
            await db.query(`UPDATE user_preferences SET ${dbKey} = ? WHERE user_id = ?`, [dbValue, req.user.id]);
        } else if (validUserKeys[key]) {
            const dbKey = validUserKeys[key];
            await db.query(`UPDATE users SET ${dbKey} = ? WHERE id = ?`, [value, req.user.id]);
        } else {
            return res.status(400).json({ message: 'Invalid preference key.' });
        }
        res.json({ message: 'Preference updated.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile info
// @route   PUT /api/users/:id/profile
// @access  Protected
const updateUserProfile = async (req, res, next) => {
    const { name, email } = req.body;
    const userId = req.params.id;

    // Ensure users can only update their own profile
    if(req.user.id.toString() !== userId) {
        return res.status(403).json({ message: 'User not authorized to update this profile' });
    }
    
    try {
        await db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, userId]);
        const [updatedUser] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);
        res.json(updatedUser[0]);
    } catch (error) {
        next(error);
    }
}

// @desc    Change user password
// @route   PUT /api/users/:id/password
// @access  Protected
const changeUserPassword = async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    if (req.user.id.toString() !== userId) {
        return res.status(403).json({ message: 'User not authorized' });
    }

    try {
        const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
        const user = users[0];

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if(!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.json({ message: 'Password changed successfully' });

    } catch(error) {
        next(error);
    }
}

// @desc    Get user's reading history
// @route   GET /api/users/history
// @access  Protected
const getUserReadingHistory = async (req, res, next) => {
    try {
        const [articles] = await db.query(`
            SELECT 
                a.id, a.title, a.content, a.category, a.image_url as imageUrl, a.video_url as videoUrl,
                u.name as authorName,
                (SELECT COUNT(*) FROM article_views WHERE article_id = a.id) as viewCount,
                (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as likeCount,
                (SELECT COUNT(*) > 0 FROM article_likes WHERE article_id = a.id AND user_id = ?) as isLiked
            FROM article_views v
            JOIN articles a ON v.article_id = a.id
            JOIN users u ON a.author_id = u.id
            WHERE v.user_id = ?
            ORDER BY v.createdAt DESC
        `, [req.user.id, req.user.id]);
        res.json(articles);
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getAllUsers,
    updateUserRole,
    deleteUser,
    getUserPreferences,
    updateUserPreference,
    updateUserProfile,
    changeUserPassword,
    getUserReadingHistory,
};