const db = require('../config/db');

/**
 * Checks a user's subscription status.
 * @param {number} userId The ID of the user to check.
 * @param {boolean} [returnData=false] If true, returns status and end date. Otherwise, returns boolean.
 * @returns {Promise<boolean|{status: string, endDate: Date|null}>}
 */
const checkUserSubscription = async (userId, returnData = false) => {
    try {
        const [subs] = await db.query('SELECT status, end_date FROM subscriptions WHERE user_id = ?', [userId]);

        if (subs.length === 0) {
            return returnData ? { status: 'free', endDate: null } : false;
        }

        const sub = subs[0];
        const now = new Date();
        const endDate = sub.end_date ? new Date(sub.end_date) : null;

        if (endDate && endDate > now) {
            return returnData ? { status: sub.status, endDate } : true;
        } else {
             // Subscription expired, downgrade to free
             if(sub.status !== 'free') {
                 await db.query("UPDATE subscriptions SET status = 'free' WHERE user_id = ?", [userId]);
             }
            return returnData ? { status: 'free', endDate: null } : false;
        }
    } catch (error) {
        console.error("Subscription check error:", error);
        return returnData ? { status: 'free', endDate: null } : false;
    }
};

module.exports = { checkUserSubscription };