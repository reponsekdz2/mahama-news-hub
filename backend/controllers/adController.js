const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const { logAdminAction } = require('../services/logService');

const getAds = async (req, res, next) => {
    try {
        const [ads] = await db.query('SELECT * FROM advertisements');
        res.json(ads);
    } catch (error) {
        next(error);
    }
};

const getSidebarAds = async (req, res, next) => {
    const { category } = req.query;
    try {
        // This query is more complex now. It finds active ads from active, in-budget campaigns.
        // If a category is provided, it prioritizes ads targeted to that category.
        const query = `
            SELECT a.* FROM advertisements a
            JOIN ad_campaigns c ON a.campaign_id = c.id
            WHERE a.status = 'active'
              AND c.status = 'active'
              AND CURDATE() BETWEEN c.start_date AND c.end_date
              AND c.budget > (SELECT COUNT(*) FROM ad_impressions WHERE ad_id = a.id) -- Simple budget check
            ORDER BY 
              CASE WHEN ? IS NOT NULL AND JSON_CONTAINS(c.target_categories, JSON_QUOTE(?)) THEN 0 ELSE 1 END,
              RAND()
            LIMIT 2
        `;
        const [ads] = await db.query(query, [category, category]);
        res.json(ads.map(ad => ({...ad, assetUrl: ad.asset_url, adType: ad.ad_type, linkUrl: ad.link_url, campaignId: ad.campaign_id})));
    } catch (error) {
        next(error);
    }
};

const createAd = async (req, res, next) => {
    const { title, linkUrl, campaignId, adType, status } = req.body;
    const assetUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !linkUrl || !campaignId || !assetUrl) {
        if (req.file) fs.unlinkSync(path.join(__dirname, '..', req.file.path));
        return res.status(400).json({ message: 'All fields and an asset are required.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO advertisements (title, link_url, campaign_id, ad_type, status, asset_url) VALUES (?, ?, ?, ?, ?, ?)',
            [title, linkUrl, campaignId, adType, status, assetUrl]
        );
        logAdminAction(req.user.id, 'create', 'advertisement', result.insertId, { title, campaignId });
        res.status(201).json({ id: result.insertId, message: 'Ad created' });
    } catch (error) {
        if (req.file) fs.unlinkSync(path.join(__dirname, '..', req.file.path));
        next(error);
    }
};

const updateAd = async (req, res, next) => {
    const { id } = req.params;
    const { title, linkUrl, campaignId, adType, status, assetUrl: existingAssetUrl } = req.body;
    const newAssetUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    try {
        const [oldAdResult] = await db.query('SELECT asset_url FROM advertisements WHERE id = ?', [id]);
        if (oldAdResult.length === 0) {
            return res.status(404).json({ message: 'Ad not found' });
        }
        if (newAssetUrl && oldAdResult[0].asset_url) {
            fs.unlink(path.join(__dirname, '..', oldAdResult[0].asset_url), err => {
                if(err) console.error("Failed to delete old ad asset:", err);
            });
        }
        
        await db.query(
            'UPDATE advertisements SET title = ?, link_url = ?, campaign_id = ?, ad_type = ?, status = ?, asset_url = ? WHERE id = ?',
            [title, linkUrl, campaignId, adType, status, newAssetUrl || existingAssetUrl, id]
        );
        logAdminAction(req.user.id, 'update', 'advertisement', id, { title });
        res.json({ message: 'Ad updated' });
    } catch (error) {
        if (req.file) fs.unlinkSync(path.join(__dirname, '..', req.file.path));
        next(error);
    }
};

const deleteAd = async (req, res, next) => {
    try {
        const [ad] = await db.query('SELECT asset_url FROM advertisements WHERE id = ?', [req.params.id]);
        if (ad.length > 0 && ad[0].asset_url) {
            fs.unlink(path.join(__dirname, '..', ad[0].asset_url), err => {
                if(err) console.error("Failed to delete ad asset:", err);
            });
        }
        await db.query('DELETE FROM advertisements WHERE id = ?', [req.params.id]);
        logAdminAction(req.user.id, 'delete', 'advertisement', req.params.id, {});
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const trackAdImpression = async (req, res, next) => {
    try {
        await db.query('UPDATE advertisements SET impressions = impressions + 1 WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        console.error('Failed to track ad impression:', error);
        res.status(204).send();
    }
};

const trackAdClick = async (req, res, next) => {
    try {
        await db.query('UPDATE advertisements SET clicks = clicks + 1 WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        console.error('Failed to track ad click:', error);
        res.status(204).send();
    }
};

module.exports = { getAds, getSidebarAds, createAd, updateAd, deleteAd, trackAdImpression, trackAdClick };