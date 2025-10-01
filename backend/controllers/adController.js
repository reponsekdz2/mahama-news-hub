const db = require('../config/db');

// @desc    Get all ads
// @route   GET /api/ads
// @access  Admin
const getAllAds = async (req, res, next) => {
    try {
        const [ads] = await db.query(`
            SELECT 
                a.*,
                (SELECT COUNT(*) FROM ad_impressions WHERE ad_id = a.id) as impressions,
                (SELECT COUNT(*) FROM ad_clicks WHERE ad_id = a.id) as clicks
            FROM advertisements a
            ORDER BY a.createdAt DESC
        `);
        res.json(ads);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new ad
// @route   POST /api/ads
// @access  Admin
const createAd = async (req, res, next) => {
    const { title, linkUrl, status } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !linkUrl || !imageUrl) {
        return res.status(400).json({ message: 'Please provide title, link URL, and an image.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO advertisements (title, link_url, image_url, status) VALUES (?, ?, ?, ?)',
            [title, linkUrl, imageUrl, status]
        );
        res.status(201).json({ id: result.insertId, title, linkUrl, imageUrl, status });
    } catch (error) {
        next(error);
    }
};

// @desc    Update an ad
// @route   PUT /api/ads/:id
// @access  Admin
const updateAd = async (req, res, next) => {
    const { title, linkUrl, status } = req.body;
    const adId = req.params.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;

    try {
        await db.query(
            'UPDATE advertisements SET title = ?, link_url = ?, status = ?, image_url = ? WHERE id = ?',
            [title, linkUrl, status, imageUrl, adId]
        );
        res.json({ message: 'Ad updated successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an ad
// @route   DELETE /api/ads/:id
// @access  Admin
const deleteAd = async (req, res, next) => {
    try {
        await db.query('DELETE FROM advertisements WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// @desc    Record an ad impression
// @route   POST /api/ads/:id/impression
// @access  Public
const recordImpression = async (req, res, next) => {
    try {
        await db.query('INSERT INTO ad_impressions (ad_id) VALUES (?)', [req.params.id]);
        res.status(201).json({ message: 'Impression recorded' });
    } catch (error) {
        // Fail silently on the client, but log it
        console.error("Impression tracking error:", error);
        res.status(500).json({ message: "Error recording impression" });
    }
};

// @desc    Record an ad click
// @route   POST /api/ads/:id/click
// @access  Public
const recordClick = async (req, res, next) => {
    try {
        await db.query('INSERT INTO ad_clicks (ad_id) VALUES (?)', [req.params.id]);
        res.status(201).json({ message: 'Click recorded' });
    } catch (error) {
        console.error("Click tracking error:", error);
        res.status(500).json({ message: "Error recording click" });
    }
};

module.exports = {
    getAllAds,
    createAd,
    updateAd,
    deleteAd,
    recordImpression,
    recordClick,
};
