const db = require('../config/db');
const { logAdminAction } = require('../services/logService');

// @desc    Get all ad campaigns
const getCampaigns = async (req, res, next) => {
    try {
        const [campaigns] = await db.query('SELECT * FROM ad_campaigns ORDER BY start_date DESC');
        res.json(campaigns.map(c => ({
            ...c,
            startDate: c.start_date,
            endDate: c.end_date,
            targetCategories: JSON.parse(c.target_categories || '[]')
        })));
    } catch (error) {
        next(error);
    }
};

// @desc    Create an ad campaign
const createCampaign = async (req, res, next) => {
    const { name, startDate, endDate, budget, status, targetCategories } = req.body;
    if (!name || !startDate || !endDate || !budget) {
        return res.status(400).json({ message: 'Name, start/end dates, and budget are required.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO ad_campaigns (name, start_date, end_date, budget, status, target_categories) VALUES (?, ?, ?, ?, ?, ?)',
            [name, startDate, endDate, budget, status || 'active', JSON.stringify(targetCategories || [])]
        );
        logAdminAction(req.user.id, 'create', 'ad_campaign', result.insertId, { name });
        res.status(201).json({ id: result.insertId, message: 'Campaign created.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Update an ad campaign
const updateCampaign = async (req, res, next) => {
    const { id } = req.params;
    const { name, startDate, endDate, budget, status, targetCategories } = req.body;
     try {
        await db.query(
            'UPDATE ad_campaigns SET name = ?, start_date = ?, end_date = ?, budget = ?, status = ?, target_categories = ? WHERE id = ?',
            [name, startDate, endDate, budget, status, JSON.stringify(targetCategories || []), id]
        );
        logAdminAction(req.user.id, 'update', 'ad_campaign', id, { name });
        res.json({ message: 'Campaign updated.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an ad campaign
const deleteCampaign = async (req, res, next) => {
    try {
        // ON DELETE CASCADE in schema will handle removing associated ads
        await db.query('DELETE FROM ad_campaigns WHERE id = ?', [req.params.id]);
        logAdminAction(req.user.id, 'delete', 'ad_campaign', req.params.id, {});
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const sendNewsletterCampaign = async (req, res, next) => {
    const { subject, content } = req.body;
    if (!subject || !content) {
        return res.status(400).json({ message: 'Subject and content are required.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [subscribers] = await connection.query('SELECT email FROM newsletter_subscriptions');
        
        if (subscribers.length === 0) {
            return res.status(404).json({ message: 'No subscribers to send to.' });
        }
        
        // Save the campaign to the database
        await connection.query(
            'INSERT INTO newsletter_campaigns (subject, content, sent_by_admin_id) VALUES (?, ?, ?)',
            [subject, content, req.user.id]
        );

        // In a real application, you would integrate an email service. Here we simulate it.
        console.log(`SIMULATING NEWSLETTER SEND: Subject "${subject}" to ${subscribers.length} subscribers.`);
        
        logAdminAction(req.user.id, 'create', 'newsletter_campaign', null, { subject, recipients: subscribers.length });
        
        await connection.commit();
        res.json({ message: `Newsletter campaign saved and simulated for ${subscribers.length} subscribers.` });

    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

const getNewsletterCampaigns = async (req, res, next) => {
    try {
        const [campaigns] = await db.query(`
            SELECT nc.id, nc.subject, nc.sent_at as sentAt, u.name as adminName
            FROM newsletter_campaigns nc
            JOIN users u ON nc.sent_by_admin_id = u.id
            ORDER BY nc.sent_at DESC
        `);
        res.json(campaigns);
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendNewsletterCampaign,
    getNewsletterCampaigns,
};
