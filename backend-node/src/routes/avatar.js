const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('../middleware/auth');
const { dbAsync } = require('../services/database');

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'avatars');
        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `avatar_${req.session.userId}_${Date.now()}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Allowed: JPG, PNG, WebP'));
        }
    }
});

// POST /api/avatar - Upload avatar
router.post('/avatar', requireAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.session.userId;
        const filename = req.file.filename;

        // Get old avatar to delete
        const oldProfile = await dbAsync.get(
            'SELECT avatar_filename FROM profiles WHERE user_id = ?',
            [userId]
        );

        // Delete old avatar file if exists
        if (oldProfile && oldProfile.avatar_filename) {
            const oldPath = path.join(__dirname, '..', '..', 'uploads', 'avatars', oldProfile.avatar_filename);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Update profile with new avatar
        await dbAsync.run(
            'UPDATE profiles SET avatar_filename = ? WHERE user_id = ?',
            [filename, userId]
        );

        res.json({
            success: true,
            url: `/uploads/avatars/${filename}`,
            filename: filename
        });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handler for multer
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB' });
        }
        return res.status(400).json({ error: err.message });
    }
    if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

module.exports = router;
