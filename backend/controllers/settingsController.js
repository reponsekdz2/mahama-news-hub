const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const getSiteSettings = async (req, res, next) => {
    try {
        const [settings] = await db.query('SELECT setting_key, setting_value FROM site_settings');
        const settingsObject = settings.reduce((acc, setting) => {
            acc[setting.setting_key] = setting.setting_value;
            return acc;
        }, {});
        res.json(settingsObject);
    } catch (error) {
        next(error);
    }
};

const updateSiteSettings = async (req, res, next) => {
    const settings = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        for (const key in settings) {
            const value = settings[key];
            await connection.query(
                'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, value, value]
            );
        }
        
        await connection.commit();
        res.json({ message: 'Site settings updated successfully.' });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

const uploadSiteAsset = async (req, res, next) => {
    const { assetType } = req.body; // 'logo' or 'favicon'
    const file = req.file;

    if (!file || !assetType) {
        if (file) fs.unlinkSync(file.path);
        return res.status(400).json({ message: 'Asset file and type are required.' });
    }
    
    const setting_key = assetType === 'logo' ? 'site_logo_url' : 'site_favicon_url';
    const newUrl = `/uploads/${file.filename}`;

    try {
        // Check if there's an old asset to delete
        const [oldSetting] = await db.query('SELECT setting_value FROM site_settings WHERE setting_key = ?', [setting_key]);
        if (oldSetting.length > 0 && oldSetting[0].setting_value) {
            fs.unlink(path.join(__dirname, '..', oldSetting[0].setting_value), err => {
                if (err) console.error(`Failed to delete old ${assetType}:`, err);
            });
        }

        // Save new asset URL to settings
        await db.query(
            'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            [setting_key, newUrl, newUrl]
        );
        
        res.json({ message: `${assetType} uploaded successfully`, url: newUrl });

    } catch (error) {
        fs.unlinkSync(file.path); // Clean up uploaded file on DB error
        next(error);
    }
};


module.exports = {
    getSiteSettings,
    updateSiteSettings,
    uploadSiteAsset,
};