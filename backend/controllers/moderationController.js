const db = require('../config/db');
const { logAdminAction } = require('../services/logService');

// @desc    Get all pending comments
// @route   GET /api/moderation/comments
// @access  Admin
const getPendingComments = async (req, res, next) => {
    try {
        const [comments] = await db.query(`
            SELECT 
                c.id, c.content, c.createdAt, 
                u.name as userName, 
                a.title as articleTitle 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            JOIN articles a ON c.article_id = a.id
            WHERE c.status = 'pending'
            ORDER BY c.createdAt ASC
        `);
        res.json(comments);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a comment's status
// @route   PUT /api/moderation/comments/:id
// @access  Admin
const updateCommentStatus = async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'A valid status ("approved" or "rejected") is required.' });
    }

    try {
        const [result] = await db.query('UPDATE comments SET status = ? WHERE id = ?', [status, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Comment not found.' });
        }
        
        logAdminAction(req.user.id, 'update', 'comment', id, { newStatus: status });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPendingComments,
    updateCommentStatus,
};
