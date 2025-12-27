const express = require('express');
const router = express.Router();
const { db } = require('../services/database');

// Schedule meeting endpoint
router.post('/schedule-meeting', async (req, res) => {
    try {
        const { name, email, phone, preferredTime } = req.body;

        // Validation
        if (!name || !email || !phone || !preferredTime) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address'
            });
        }

        // Phone validation
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number. Must be 10 digits.'
            });
        }

        // Insert meeting request into database
        const query = `
            INSERT INTO meeting_requests (name, email, phone, preferred_time, status, created_at)
            VALUES (?, ?, ?, ?, 'pending', datetime('now'))
        `;

        await new Promise((resolve, reject) => {
            db.run(query, [name, email, phone, preferredTime], function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });

        res.json({
            success: true,
            message: 'Meeting request received successfully. We will contact you soon!'
        });
    } catch (error) {
        console.error('Error scheduling meeting:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to schedule meeting. Please try again later.'
        });
    }
});

// Get all meeting requests (admin endpoint)
router.get('/meeting-requests', async (req, res) => {
    try {
        const query = `
            SELECT id, name, email, phone, preferred_time, status, created_at
            FROM meeting_requests
            ORDER BY created_at DESC
        `;

        const meetings = await new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            success: true,
            meetings
        });
    } catch (error) {
        console.error('Error fetching meeting requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch meeting requests'
        });
    }
});

// Train model endpoint - triggers Python training script
router.post('/train-model', async (req, res) => {
    try {
        const { exec } = require('child_process');
        const path = require('path');

        const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'train_and_evaluate.py');

        res.json({
            success: true,
            message: 'Model training started...',
            status: 'running'
        });

    } catch (error) {
        console.error('Error training model:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start model training'
        });
    }
});

// Get model metrics endpoint
router.get('/model-metrics', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');

        const metricsPath = path.join(__dirname, '..', '..', 'models', 'metrics.json');

        if (!fs.existsSync(metricsPath)) {
            return res.json({
                success: false,
                message: 'No metrics found. Please train the model first.',
                metrics: null
            });
        }

        const metricsData = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));

        res.json({
            success: true,
            metrics: metricsData
        });
    } catch (error) {
        console.error('Error fetching model metrics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch model metrics'
        });
    }
});

// Get all supported roles
router.get('/supported-roles', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');

        const metricsPath = path.join(__dirname, '..', '..', 'models', 'metrics.json');

        if (fs.existsSync(metricsPath)) {
            const metricsData = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
            res.json({
                success: true,
                total_roles: metricsData.dataset?.num_roles || 0,
                roles: metricsData.dataset?.roles || []
            });
        } else {
            res.json({
                success: false,
                message: 'No model trained yet',
                roles: []
            });
        }
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch supported roles'
        });
    }
});

module.exports = router;
