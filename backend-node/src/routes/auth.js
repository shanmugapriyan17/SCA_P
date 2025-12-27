const express = require('express');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { dbAsync } = require('../services/database');

const router = express.Router();

// Rate limiting for auth endpoints: 5 requests per hour
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { error: 'Too many requests' },
    standardHeaders: true,
    legacyHeaders: false
});

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if user already exists
        const existingUser = await dbAsync.get(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email.toLowerCase(), username.toLowerCase()]
        );

        if (existingUser) {
            return res.status(409).json({ error: 'Email or username already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const result = await dbAsync.run(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email.toLowerCase(), passwordHash]
        );

        // Create empty profile
        await dbAsync.run(
            'INSERT INTO profiles (user_id) VALUES (?)',
            [result.lastID]
        );

        // Set session
        req.session.userId = result.lastID;
        req.session.username = username;
        req.session.email = email.toLowerCase();

        res.json({ success: true, message: 'Account created' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Find user by email
        const user = await dbAsync.get(
            'SELECT * FROM users WHERE email = ?',
            [email.toLowerCase()]
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set session
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.email = user.email;

        res.json({ success: true, message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
