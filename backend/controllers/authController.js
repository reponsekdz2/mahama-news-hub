/**
 * @desc    Authenticate a user
 */
const loginUser = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide an email and password' });
    }

    // Check for Admin credentials
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        console.log(`Admin login successful for: ${email}`);
        return res.status(200).json({ 
            message: 'Admin login successful',
            user: { name: 'Admin', email: email, role: 'admin' },
            token: 'sample.admin.jwt.token' 
        });
    }

    // Simulate successful regular user login
    console.log(`Login attempt for: ${email}`);
    res.status(200).json({ 
        message: 'Login successful (simulated)',
        user: { name: 'Test User', email: email, role: 'user' },
        token: 'sample.user.jwt.token' 
    });
};

/**
 * @desc    Register a new user
 */
const registerUser = (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password' });
    }
    console.log(`Registering new user: ${name} (${email})`);
    // Simulate successful registration
    res.status(201).json({ 
        message: 'User registered successfully (simulated)',
        user: { name, email, role: 'user' },
        token: 'sample.user.jwt.token'
    });
};

module.exports = {
    loginUser,
    registerUser,
};
