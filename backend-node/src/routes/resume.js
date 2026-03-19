const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { requireAuth } = require('../middleware/auth');
const { dbAsync } = require('../services/database');
const { extractSkills, extractSkillsWithFrequency } = require('../services/skillExtractor');

const router = express.Router();

// Configure multer for resume uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'resumes');
        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const userId = req.session?.userId || 'anonymous';
        const filename = `${userId}_${Date.now()}_${file.originalname}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.txt'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Allowed: PDF, TXT'));
        }
    }
});

/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('PDF parsing error:', error);
        throw new Error('Failed to parse PDF file');
    }
}

/**
 * Extract text from TXT file
 */
function extractTextFromTXT(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        console.error('TXT reading error:', error);
        throw new Error('Failed to read TXT file');
    }
}

// POST /api/upload-resume - Upload and analyze resume
router.post('/upload-resume', (req, res, next) => {
    // Populate session from JWT so the upload is associated with the user
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.SECRET_KEY || 'your-secret-key-change-in-production';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET);
            req.session.userId = decoded.userId;
            req.session.username = decoded.username;
        } catch (e) { /* ignore - upload anonymously */ }
    }
    next();
}, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.session?.userId || null; // Allow anonymous uploads
        const filePath = req.file.path;
        const filename = req.file.filename;
        const ext = path.extname(filename).toLowerCase();

        // Extract text based on file type
        let text = '';
        try {
            if (ext === '.pdf') {
                text = await extractTextFromPDF(filePath);
            } else if (ext === '.txt') {
                text = extractTextFromTXT(filePath);
            }
        } catch (error) {
            // Clean up file on error
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            return res.status(400).json({ error: error.message });
        }

        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                error: 'Could not extract text from file. Make sure the file is a valid PDF or TXT file.'
            });
        }

        console.log('=== RESUME UPLOAD DEBUG ===');
        console.log('Text extracted, length:', text.length);
        console.log('First 200 chars:', text.substring(0, 200));
        console.log('User ID:', userId);

        // Extract skills from text
        const skills = extractSkills(text);
        console.log('Skills extracted:', skills);

        // Create preview text (first 500 characters)
        const previewText = text.substring(0, 500).trim();

        // Save to database only if user is logged in
        if (userId) {
            try {
                // INSERT using column names from original schema: file_name, extracted_skills_json
                await dbAsync.run(
                    `INSERT INTO resumes (user_id, file_name, extracted_skills_json)
                     VALUES (?, ?, ?)`,
                    [userId, filename, JSON.stringify(skills)]
                );
            } catch (dbError) {
                console.error('Error saving to database:', dbError);
                // Don't fail the entire upload if DB save fails
            }
        }

        res.json({
            success: true,
            text: text,
            file_url: `/uploads/resumes/${filename}`,
            filename: filename,
            skills: skills,
            preview_text: previewText,
            file_type: ext,
            message: skills.length > 0
                ? `Resume uploaded successfully. Extracted ${skills.length} skills.`
                : 'Resume uploaded successfully. No skills detected.'
        });
    } catch (error) {
        console.error('Resume upload error:', error);
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
