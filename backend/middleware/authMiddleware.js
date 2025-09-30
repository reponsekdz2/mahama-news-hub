const adminProtect = (req, res, next) => {
    try {
        const { authorization } = req.headers;

        if (authorization && authorization.startsWith('Bearer')) {
            const token = authorization.split(' ')[1];
            
            // This is a simulation. In a real app, you would verify a JWT.
            if (token === 'sample.admin.jwt.token') {
                next();
            } else {
                res.status(401).json({ message: 'Not authorized, token failed' });
            }
        } else {
            res.status(401).json({ message: 'Not authorized, no token' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

module.exports = { adminProtect };
