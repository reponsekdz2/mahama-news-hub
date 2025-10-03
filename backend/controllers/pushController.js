const db = require('../config/db');
const webpush = require('web-push');

// @desc    Subscribe user to push notifications
// @route   POST /api/push/subscribe
// @access  Protected
const subscribe = async (req, res, next) => {
    const subscription = req.body;
    const userId = req.user.id;

    try {
        // Store the subscription object in the database
        // Using ON DUPLICATE KEY UPDATE to prevent multiple entries for the same user
        await db.query(
            `INSERT INTO push_subscriptions (user_id, subscription_object) 
             VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE subscription_object = ?`,
            [userId, JSON.stringify(subscription), JSON.stringify(subscription)]
        );

        res.status(201).json({ message: 'Push subscription saved.' });

    } catch (error) {
        next(error);
    }
};

// @desc    Send a push notification (for admin testing or new article alerts)
// @route   POST /api/push/send-notification
// @access  Admin
const sendNotification = async (req, res, next) => {
    const { title, body, url } = req.body;

    if (!title || !body || !url) {
        return res.status(400).json({ message: 'Title, body, and URL are required.' });
    }

    try {
        const [subscriptions] = await db.query('SELECT subscription_object FROM push_subscriptions');

        if (subscriptions.length === 0) {
            return res.status(404).json({ message: 'No push subscriptions found.' });
        }

        const payload = JSON.stringify({ title, body, url });

        const notificationPromises = subscriptions.map(sub => {
            const subscriptionObject = JSON.parse(sub.subscription_object);
            return webpush.sendNotification(subscriptionObject, payload)
                .catch(error => {
                    console.error('Error sending notification, subscription may be expired:', error.statusCode);
                    // Handle expired subscriptions by removing them
                    if (error.statusCode === 410 || error.statusCode === 404) {
                       // This is a simplified removal. A robust solution would identify the user and delete more precisely.
                       db.query('DELETE FROM push_subscriptions WHERE subscription_object = ?', [sub.subscription_object]);
                    }
                });
        });

        await Promise.all(notificationPromises);

        res.status(200).json({ message: `Notification sent to ${subscriptions.length} subscribers.` });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    subscribe,
    sendNotification
};