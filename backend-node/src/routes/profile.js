const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { dbAsync } = require('../services/database');

const router = express.Router();

// GET /api/profile - Get user profile
router.get('/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;

        // Get user info
        const user = await dbAsync.get(
            'SELECT username, email FROM users WHERE id = ?',
            [userId]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get profile info - using skills_json column (original schema)
        const profile = await dbAsync.get(
            'SELECT full_name, initials, phone, dob, skills_json, avatar_filename FROM profiles WHERE user_id = ?',
            [userId]
        );

        // Parse skills JSON
        let skills = [];
        if (profile && profile.skills_json) {
            try {
                skills = JSON.parse(profile.skills_json);
            } catch (e) {
                skills = [];
            }
        }

        res.json({
            success: true,
            user: {
                username: user.username,
                email: user.email,
                full_name: profile?.full_name || null,
                initials: profile?.initials || null,
                phone: profile?.phone || null,
                dob: profile?.dob || null,
                skills: skills,
                avatar_filename: profile?.avatar_filename || null
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to retrieve profile' });
    }
});

// POST /api/profile - Update user profile
router.post('/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { full_name, initials, phone, dob, skills } = req.body;

        // Format skills array to JSON string
        let skillsJson = null;
        if (skills) {
            // Handle both array and comma-separated string
            let skillsArray;
            if (Array.isArray(skills)) {
                skillsArray = skills;
            } else if (typeof skills === 'string') {
                skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
            } else {
                skillsArray = [];
            }
            // Limit to 5 skills
            skillsArray = skillsArray.slice(0, 5);
            skillsJson = JSON.stringify(skillsArray);
        }

        // Check if profile exists
        const existingProfile = await dbAsync.get(
            'SELECT id FROM profiles WHERE user_id = ?',
            [userId]
        );

        if (existingProfile) {
            // Update existing profile - using skills_json column
            await dbAsync.run(
                `UPDATE profiles SET 
                    full_name = COALESCE(?, full_name),
                    initials = COALESCE(?, initials),
                    phone = COALESCE(?, phone),
                    dob = COALESCE(?, dob),
                    skills_json = COALESCE(?, skills_json)
                 WHERE user_id = ?`,
                [full_name, initials, phone, dob, skillsJson, userId]
            );
        } else {
            // Create new profile - using skills_json column
            await dbAsync.run(
                `INSERT INTO profiles (user_id, full_name, initials, phone, dob, skills_json)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, full_name, initials, phone, dob, skillsJson]
            );
        }

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// GET /api/profile/resume — get latest resume info for download
router.get('/profile/resume', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        // DB schema uses file_name column
        const resume = await dbAsync.get(
            'SELECT id, file_name as filename, uploaded_at as upload_date FROM resumes WHERE user_id = ? ORDER BY id DESC LIMIT 1',
            [userId]
        );

        if (!resume || !resume.filename) {
            return res.json({ success: true, resume: null });
        }

        res.json({
            success: true,
            resume: {
                id: resume.id,
                filename: resume.filename,
                upload_date: resume.upload_date,
                download_url: `/uploads/resumes/${resume.filename}`
            }
        });
    } catch (error) {
        console.error('Get resume error:', error);
        res.status(500).json({ error: 'Failed to get resume' });
    }
});

module.exports = router;
