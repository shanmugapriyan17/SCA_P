const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { dbAsync } = require('../services/database');

const router = express.Router();

// POST /api/assessment/submit — save an assessment result
router.post('/submit', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { skill, score, answers } = req.body;

        if (!skill || score === undefined) {
            return res.status(400).json({ error: 'Missing skill or score' });
        }

        await dbAsync.run(
            `INSERT INTO assessment_results (user_id, skill, score, answers_json) VALUES (?, ?, ?, ?)`,
            [userId, skill, score, answers ? JSON.stringify(answers) : null]
        );

        res.json({ success: true, message: 'Assessment saved' });
    } catch (error) {
        console.error('Assessment submit error:', error);
        res.status(500).json({ error: 'Failed to save assessment' });
    }
});

// GET /api/assessment/results — latest score per skill for the user
router.get('/results', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const rows = await dbAsync.all(
            `SELECT skill, score, taken_at FROM assessment_results
             WHERE user_id = ?
             AND id IN (SELECT MAX(id) FROM assessment_results WHERE user_id = ? GROUP BY skill)
             ORDER BY taken_at DESC`,
            [userId, userId]
        );
        const scores = {};
        rows.forEach(r => { scores[r.skill] = r.score; });
        res.json({ success: true, scores, rows });
    } catch (error) {
        console.error('Assessment results error:', error);
        res.status(500).json({ error: 'Failed to get results' });
    }
});

// GET /api/assessment/history — full history for the user
router.get('/history', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const rows = await dbAsync.all(
            `SELECT skill, score, taken_at FROM assessment_results WHERE user_id = ? ORDER BY taken_at DESC LIMIT 50`,
            [userId]
        );
        res.json({ success: true, history: rows });
    } catch (error) {
        console.error('Assessment history error:', error);
        res.status(500).json({ error: 'Failed to get history' });
    }
});

module.exports = router;
