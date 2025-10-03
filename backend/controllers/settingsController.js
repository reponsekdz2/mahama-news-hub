const db = require('../config/db');
const { logAdminAction } = require('../services/logService');

// @desc    Get all site settings
// @route   GET /api/settings/site
// @access  Public
const getSiteSettings = async (req, res, next) => {
    try {
        const [settings] = await db.query('SELECT * FROM site_settings');
        const settingsObject = settings.reduce((acc, setting) => {
            let value = setting.setting_value;
            // Attempt to parse JSON for settings that are stored as strings
            try {
                value = JSON.parse(value);
            } catch (e) {
                // Not JSON, use the raw value
            }
             // Convert '0'/'1' to boolean for allow_registration
            if (setting.setting_key === 'allow_registration') {
                value = value === '1' || value === 1 || value === true;
            }
            acc[setting.setting_key] = value;
            return acc;
        }, {});
        res.json(settingsObject);
    } catch (error) {
        next(error);
    }
};

// @desc    Update site settings
// @route   PUT /api/settings/site
// @access  Admin
const updateSiteSettings = async (req, res, next) => {
    const settings = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        for (const key in settings) {
            if (Object.hasOwnProperty.call(settings, key)) {
                let value = settings[key];
                 // Stringify objects for database storage
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                // Convert boolean to '1' or '0'
                if (typeof value === 'boolean') {
                    value = value ? '1' : '0';
                }

                await connection.query(
                    'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                    [key, value, value]
                );
            }
        }

        await connection.commit();
        logAdminAction(req.user.id, 'update', 'settings', null, settings);
        res.status(204).send();
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

module.exports = {
    getSiteSettings,
    updateSiteSettings,
};