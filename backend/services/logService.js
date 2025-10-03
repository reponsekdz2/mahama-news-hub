const db = require('../config/db');

/**
 * Logs an administrative action.
 * @param {number} adminId - The ID of the admin performing the action.
 * @param {'create'|'update'|'delete'} actionType - The type of action.
 * @param {string} targetType - The type of entity being affected (e.g., 'article', 'user').
 * @param {number} targetId - The ID of the entity.
 * @param {object} details - Additional JSON data about the action.
 */
const logAdminAction = async (adminId, actionType, targetType, targetId, details = {}) => {
    try {
        const sanitizedDetails = { ...details };
        // Remove sensitive information before logging
        if (sanitizedDetails.password) delete sanitizedDetails.password;
        if (sanitizedDetails.confirmPassword) delete sanitizedDetails.confirmPassword;
        
        await db.query(
            'INSERT INTO admin_logs (admin_user_id, action_type, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [adminId, actionType, targetType, targetId, JSON.stringify(sanitizedDetails)]
        );
    } catch (error) {
        console.error('Failed to log admin action:', error);
        // We don't throw here to avoid breaking the main request flow
    }
};

/**
 * Logs a user action.
 * @param {number} userId - The ID of the user performing the action.
 * @param {'view'|'like'|'unlike'|'comment'|'save_article'|'share_article'} actionType - The type of action.
 * @param {number} targetId - The ID of the target entity (e.g., article ID).
 * @param {object} details - Additional JSON data.
 */
const logUserAction = async (userId, actionType, targetId, details = {}) => {
    try {
        await db.query(
            'INSERT INTO user_actions (user_id, action_type, target_id, details) VALUES (?, ?, ?, ?)',
            [userId, actionType, targetId, JSON.stringify(details)]
        );
    } catch (error) {
        console.error('Failed to log user action:', error);
    }
};

module.exports = {
    logAdminAction,
    logUserAction,
};