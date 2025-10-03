const db = require('../config/db');

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
const getAllTags = async (req, res, next) => {
    try {
        const [tags] = await db.query('SELECT * FROM tags ORDER BY name ASC');
        res.json(tags);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new tag
// @route   POST /api/tags
// @access  Admin
const createTag = async (req, res, next) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Tag name is required.' });
    }
    try {
        const [result] = await db.query('INSERT INTO tags (name) VALUES (?)', [name.trim().toLowerCase()]);
        res.status(201).json({ id: result.insertId, name });
    } catch (error) {
        // Handle unique constraint violation
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Tag already exists.' });
        }
        next(error);
    }
};

// @desc    Delete a tag
// @route   DELETE /api/tags/:id
// @access  Admin
const deleteTag = async (req, res, next) => {
    try {
        // The database will cascade delete entries in article_tags
        await db.query('DELETE FROM tags WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllTags,
    createTag,
    deleteTag,
};
