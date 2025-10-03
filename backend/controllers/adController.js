const db = require('../config/db');
const { logAdminAction } = require('../services/logService');

// @desc    Get all ads
const getAllAds = async (req, res, next) => {
    try {
        const [ads] = await db.query(`
            SELECT 
                a.id, a.title, a.image_url as imageUrl, a.link_url as linkUrl, a.status, a.placement,
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
const createAd = async (req, res, next) => {
    const { title, linkUrl, status, placement } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    if (!title || !linkUrl || !imageUrl) {
        return res.status(400).json({ message: 'Title, link URL, and image are required.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO advertisements (title, link_url, image_url, status, placement) VALUES (?, ?, ?, ?, ?)',
            [title, linkUrl, imageUrl, status, placement]
        );
        const adId = result.insertId;
        logAdminAction(req.user.id, 'create', 'ad', adId, { title });
        res.status(201).json({ id: adId, title, linkUrl, imageUrl, status, placement });
    } catch (error) {
        next(error);
    }
};

// @desc    Update an ad
const updateAd = async (req, res, next) => {
    const { title, linkUrl, status, placement } = req.body;
    const adId = req.params.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;

    try {
        await db.query(
            'UPDATE advertisements SET title = ?, link_url = ?, status = ?, placement = ?, image_url = ? WHERE id = ?',
            [title, linkUrl, status, placement, imageUrl, adId]
        );
        logAdminAction(req.user.id, 'update', 'ad', adId, { title });
        res.json({ message: 'Ad updated successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an ad
const deleteAd = async (req, res, next) => {
    try {
        await db.query('DELETE FROM advertisements WHERE id = ?', [req.params.id]);
        logAdminAction(req.user.id, 'delete', 'ad', req.params.id, {});
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// @desc    Record an ad impression
const recordImpression = async (req, res, next) => {
    try {
        await db.query('INSERT INTO ad_impressions (ad_id) VALUES (?)', [req.params.id]);
        res.status(201).json({ message: 'Impression recorded' });
    } catch (error) {
        console.error("Impression tracking error:", error);
        res.status(500).json({ message: "Error recording impression" });
    }
};

// @desc    Record an ad click
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
    getAllAds, createAd, updateAd, deleteAd,
    recordImpression, recordClick,
};