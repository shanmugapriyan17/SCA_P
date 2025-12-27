const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.SECRET_KEY || 'your-secret-key-change-in-production';

// Middleware that supports both session AND JWT token auth
const requireAuth = (req, res, next) => {
    // First, try to get user from session (for backwards compatibility)
    if (req.session && req.session.userId) {
        req.userId = req.session.userId;
        return next();
    }

    // Second, try to get user from JWT token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.userId = decoded.userId;
            req.session.userId = decoded.userId; // Set session for compatibility
            req.session.username = decoded.username;
            req.session.email = decoded.email;
            return next();
        } catch (err) {
            console.log('JWT verification failed:', err.message);
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    }

    // No authentication found
    return res.status(401).json({ error: 'Not authenticated' });
};

module.exports = { requireAuth };
