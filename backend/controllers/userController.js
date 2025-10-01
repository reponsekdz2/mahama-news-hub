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
        const [prefs] = await db.query('SELECT theme, language, accent_color as accentColor FROM user_preferences WHERE user_id = ?', [req.user.id]);
        if (prefs.length === 0) {
            return res.status(404).json({ message: 'Preferences not found.' });
        }
        res.json(prefs[0]);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a user preference
// @route   PUT /api/users/preferences
// @access  Protected
const updateUserPreference = async (req, res, next) => {
    const { key, value } = req.body;
    const validKeys = {
        'theme': 'theme',
        'language': 'language',
        'accentColor': 'accent_color'
    };
    
    if (!validKeys[key]) {
        return res.status(400).json({ message: 'Invalid preference key.' });
    }
    
    const dbKey = validKeys[key];

    try {
        await db.query(`UPDATE user_preferences SET ${dbKey} = ? WHERE user_id = ?`, [value, req.user.id]);
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


module.exports = {
    getAllUsers,
    updateUserRole,
    deleteUser,
    getUserPreferences,
    updateUserPreference,
    updateUserProfile,
    changeUserPassword,
};
