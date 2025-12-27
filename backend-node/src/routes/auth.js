const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { dbAsync } = require('../services/database');

const router = express.Router();

const JWT_SECRET = process.env.SECRET_KEY || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token valid for 7 days

// Generate JWT token
const generateToken = (userId, username, email) => {
    return jwt.sign(
        { userId, username, email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
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

        // Generate JWT token
        const token = generateToken(result.lastID, username, email.toLowerCase());

        // Also set session for backwards compatibility
        req.session.userId = result.lastID;
        req.session.username = username;
        req.session.email = email.toLowerCase();

        res.json({
            success: true,
            message: 'Account created',
            token: token,
            user: {
                id: result.lastID,
                username: username,
                email: email.toLowerCase()
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
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

        // Generate JWT token
        const token = generateToken(user.id, user.username, user.email);

        // Also set session for backwards compatibility
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.email = user.email;

        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
