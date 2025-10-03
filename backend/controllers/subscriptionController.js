const db = require('../config/db');
const { checkUserSubscription } = require('../services/subscriptionHelper');

const getSubscriptionStatus = async (req, res, next) => {
    try {
        const { status, endDate } = await checkUserSubscription(req.user.id, true);
        res.json({
            subscriptionStatus: status,
            subscriptionEndDate: endDate
        });
    } catch (error) {
        next(error);
    }
};

const createSubscription = async (req, res, next) => {
    const userId = req.user.id;
    const { planType } = req.body; // 'monthly' or 'yearly'
    if (!planType || !['monthly', 'yearly'].includes(planType)) {
        return res.status(400).json({ message: 'A valid planType is required.' });
    }

    try {
        const premiumEndDate = new Date();
        if (planType === 'yearly') {
            premiumEndDate.setFullYear(premiumEndDate.getFullYear() + 1);
        } else {
            premiumEndDate.setMonth(premiumEndDate.getMonth() + 1);
        }

        // Using ON DUPLICATE KEY UPDATE to handle both new subscriptions and renewals/upgrades
        await db.query(`
            INSERT INTO subscriptions (user_id, status, plan_type, start_date, end_date, stripe_subscription_id)
            VALUES (?, 'premium', ?, NOW(), ?, ?)
            ON DUPLICATE KEY UPDATE
                status = 'premium',
                plan_type = ?,
                start_date = NOW(),
                end_date = ?,
                stripe_subscription_id = ?
        `, [userId, planType, premiumEndDate, `mock_sub_${Date.now()}`, planType, premiumEndDate, `mock_sub_${Date.now()}`]);

        res.status(201).json({ message: 'Subscription successful!' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSubscriptionStatus,
    createSubscription,
};