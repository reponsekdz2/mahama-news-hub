const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const [userExists] = await db.query('SELECT email FROM users WHERE email = ?', [email]);

        if (userExists.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
        const newUser_id = result.insertId;

        const [newUser] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [newUser_id]);
        
        // Create default preferences for the new user
        await db.query('INSERT INTO user_preferences (user_id) VALUES (?)', [newUser_id]);

        // Grant a 1-month free trial subscription
        const trialEndDate = new Date();
        trialEndDate.setMonth(trialEndDate.getMonth() + 1);
        
        await db.query(
            'INSERT INTO subscriptions (user_id, status, start_date, end_date) VALUES (?, ?, NOW(), ?)',
            [newUser_id, 'trial', trialEndDate]
        );

        const userWithSub = {
            ...newUser[0],
            subscriptionStatus: 'trial',
            subscriptionEndDate: trialEndDate.toISOString()
        }


        if (newUser.length > 0) {
            const token = generateToken(newUser[0].id);
            res.status(201).json({
                user: userWithSub,
                token
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Hardcoded admin check
    if (email === 'reponsekdz0@gmail.com' && password === '2025') {
        try {
            const [admins] = await db.query('SELECT id, name, email, role FROM users WHERE email = ? AND role = "admin"', [email]);
            if (admins.length > 0) {
                const adminUser = admins[0];
                 await db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [adminUser.id]);
                const token = generateToken(adminUser.id);
                return res.json({
                    user: { ...adminUser, subscriptionStatus: 'premium', subscriptionEndDate: null },
                    token
                });
            } else {
                // If the admin account doesn't exist, we can't log them in.
                return res.status(400).json({ message: 'Admin account not found in database.' });
            }
        } catch (error) {
            return next(error);
        }
    }


    try {
        const [users] = await db.query('SELECT id, name, email, role, password FROM users WHERE email = ?', [email]);

        if (users.length > 0) {
            const user = users[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                // Update last_login timestamp
                await db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
                
                // Fetch subscription status
                const [subs] = await db.query('SELECT status, end_date FROM subscriptions WHERE user_id = ?', [user.id]);
                
                let subscriptionStatus = 'free';
                let subscriptionEndDate = null;

                if (subs.length > 0) {
                    const sub = subs[0];
                    if (sub.end_date && new Date(sub.end_date) > new Date()) {
                        subscriptionStatus = sub.status;
                        subscriptionEndDate = sub.end_date;
                    }
                }


                const token = generateToken(user.id);
                res.json({
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        subscriptionStatus,
                        subscriptionEndDate,
                    },
                    token
                });
            } else {
                res.status(400).json({ message: 'Invalid credentials' });
            }
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        next(error);
    }
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
};
