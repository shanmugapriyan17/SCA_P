const express = require('express');
const router = express.Router();
const { execFile } = require('child_process');
const path = require('path');

// Path to Python prediction script
const PREDICT_SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'predict_service.py');

// All 97 career roles
const CAREER_ROLES = [
    'AI/ML Engineer', 'Data Scientist', 'Data Analyst', 'Data Engineer',
    'Machine Learning Engineer', 'NLP Engineer', 'Computer Vision Engineer',
    'AI Research Scientist', 'Prompt Engineer', 'LLM Engineer',
    'Generative AI Engineer', 'AI Product Manager', 'MLOps Engineer',
    'Big Data Engineer', 'Business Intelligence Developer',
    'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
    'Software Engineer', 'Senior Software Engineer', 'Junior Developer',
    'Web Developer', 'API Developer', 'Tech Lead', 'Software Architect',
    'Mobile Developer', 'iOS Developer', 'Android Developer',
    'React Native Developer', 'Flutter Developer',
    'DevOps Engineer', 'Cloud Engineer', 'Cloud Architect',
    'Site Reliability Engineer', 'Platform Engineer',
    'Systems Administrator', 'Network Engineer',
    'Infrastructure Engineer', 'Release Engineer',
    'Security Engineer', 'Cybersecurity Analyst',
    'Application Security Engineer', 'Information Security Analyst',
    'Penetration Tester',
    'Database Administrator', 'Database Developer', 'Database Architect',
    'QA Engineer', 'QA Lead', 'SDET', 'Manual Tester', 'Performance Engineer',
    'UI/UX Designer', 'Product Designer', 'Graphic Designer',
    'UX Researcher', 'Visual Designer', 'Interaction Designer',
    'Product Manager', 'Technical Product Manager', 'Product Owner',
    'Project Manager', 'Program Manager', 'Scrum Master', 'Agile Coach',
    'Business Analyst', 'Business Intelligence Analyst',
    'Systems Analyst', 'Operations Analyst',
    'Technical Writer', 'Technical Support Engineer',
    'Customer Success Engineer', 'Support Engineer',
    'Help Desk Technician', 'Desktop Support Engineer',
    'Solutions Architect', 'Enterprise Architect',
    'Data Architect', 'Integration Architect',
    'Blockchain Developer', 'AR/VR Developer', 'Game Developer',
    'IoT Developer', 'Robotics Engineer',
    'Engineering Manager', 'Director of Engineering',
    'VP of Engineering', 'CTO', 'IT Manager',
    'Sales Engineer', 'Solutions Engineer',
    'IT Consultant', 'Technology Consultant',
    'Growth Engineer', 'Marketing Technologist', 'SEO Specialist',
    'IT Administrator'
];

/**
 * Call Python predict_service.py to get ML predictions
 * @param {string} text - Skill text to predict from
 * @returns {Promise<Object>} Prediction result
 */
function callPythonPredictor(text) {
    return new Promise((resolve, reject) => {
        execFile('python', [PREDICT_SCRIPT, text], {
            timeout: 30000,  // 30s timeout
            maxBuffer: 1024 * 1024
        }, (error, stdout, stderr) => {
            if (error) {
                console.error('Python prediction error:', error.message);
                if (stderr) console.error('stderr:', stderr);
                reject(new Error('ML prediction service unavailable'));
                return;
            }
            try {
                const result = JSON.parse(stdout.trim());
                if (result.error) {
                    reject(new Error(result.error));
                } else {
                    resolve(result);
                }
            } catch (parseError) {
                console.error('Failed to parse Python output:', stdout);
                reject(new Error('Failed to parse prediction result'));
            }
        });
    });
}

// POST /api/predict-role - Predict career role from resume text
router.post('/predict-role', async (req, res) => {
    try {
        const { text, skills } = req.body;

        if (!text && !skills) {
            return res.status(400).json({ error: 'No text or skills provided' });
        }

        // Combine text and skills for prediction

        // Combine text and skills, but prioritize EXTRACTED skills for the model
        // The model was trained on "Skill, Skill, Skill" format, NOT raw sentences.
        // So we must extract skills first to reduce noise.
        const { extractSkills } = require('../services/skillExtractor');

        let skillsForModel = [];

        // 1. If explicit skills provided, use them
        if (skills && Array.isArray(skills) && skills.length > 0) {
            skillsForModel = [...skills];
        }

        // 2. If text provided, extract skills from it
        if (text) {
            const extracted = extractSkills(text);
            // Merge unique
            extracted.forEach(s => {
                if (!skillsForModel.includes(s)) skillsForModel.push(s);
            });
        }

        // 3. Fallback: If no skills found, use raw text (but clean it)
        let modelInput = '';
        if (skillsForModel.length > 0) {
            modelInput = skillsForModel.join(', ');
        } else {
            modelInput = (text || '').replace(/\n/g, ' ').trim();
        }

        if (modelInput.length === 0) {
            return res.status(400).json({ error: 'No content to analyze' });
        }

        console.log(`[Predict] Sending value to ML model: "${modelInput.substring(0, 100)}..."`);

        // Try ML prediction first
        try {
            const mlResult = await callPythonPredictor(modelInput);

            res.json({
                success: true,
                predicted_role: mlResult.predicted_role,
                confidence: mlResult.confidence,
                svm_role: mlResult.svm_prediction?.predicted_role || mlResult.predicted_role,
                svm_confidence: mlResult.svm_prediction?.confidence || mlResult.confidence,
                rf_role: mlResult.rf_prediction?.predicted_role || mlResult.predicted_role,
                rf_confidence: mlResult.rf_prediction?.confidence || mlResult.confidence,
                ensemble_role: mlResult.ensemble_prediction?.predicted_role || mlResult.predicted_role,
                ensemble_confidence: mlResult.ensemble_prediction?.confidence || mlResult.confidence,
                ensemble_method: mlResult.ensemble_prediction?.voting_method || 'hard',
                top_roles: mlResult.svm_prediction?.top_roles || mlResult.rf_prediction?.top_roles || [],
                models_used: mlResult.models_used || [],
                total_supported_roles: mlResult.total_supported_roles || CAREER_ROLES.length,
                prediction_source: 'ml_models'
            });
        } catch (mlError) {
            // Fallback to keyword-based prediction if ML models unavailable
            console.warn('ML prediction failed, using keyword fallback:', mlError.message);
            const fallbackResult = keywordFallbackPredict(modelInput);
            res.json({
                ...fallbackResult,
                prediction_source: 'keyword_fallback',
                ml_error: mlError.message
            });
        }
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ error: 'Failed to predict career role' });
    }
});

// GET /api/predict/roles - Get all supported roles
router.get('/roles', (req, res) => {
    res.json({
        success: true,
        total_roles: CAREER_ROLES.length,
        roles: CAREER_ROLES.sort()
    });
});

/**
 * Keyword-based fallback predictor (used only when ML models are unavailable)
 */
function keywordFallbackPredict(text) {
    const SKILL_ROLE_MAP = {
        'machine learning': 'AI/ML Engineer', 'tensorflow': 'AI/ML Engineer',
        'pytorch': 'AI/ML Engineer', 'deep learning': 'AI/ML Engineer',
        'react': 'Frontend Developer', 'angular': 'Frontend Developer',
        'vue': 'Frontend Developer', 'javascript': 'Frontend Developer',
        'node.js': 'Backend Developer', 'django': 'Backend Developer',
        'flask': 'Backend Developer', 'express': 'Backend Developer',
        'python': 'Data Scientist', 'pandas': 'Data Scientist',
        'docker': 'DevOps Engineer', 'kubernetes': 'DevOps Engineer',
        'aws': 'Cloud Engineer', 'azure': 'Cloud Engineer',
        'sql': 'Database Administrator', 'mongodb': 'Database Administrator',
        'figma': 'UI/UX Designer', 'ui design': 'UI/UX Designer',
        'selenium': 'QA Engineer', 'testing': 'QA Engineer',
        'swift': 'iOS Developer', 'kotlin': 'Android Developer',
        'react native': 'React Native Developer', 'flutter': 'Flutter Developer',
        'security': 'Security Engineer', 'blockchain': 'Blockchain Developer'
    };

    const textLower = text.toLowerCase();
    const roleScores = {};

    Object.entries(SKILL_ROLE_MAP).forEach(([skill, role]) => {
        if (textLower.includes(skill)) {
            roleScores[role] = (roleScores[role] || 0) + 1;
        }
    });

    let predictedRole = 'Software Engineer';
    let maxScore = 0;
    Object.entries(roleScores).forEach(([role, score]) => {
        if (score > maxScore) {
            maxScore = score;
            predictedRole = role;
        }
    });

    const confidence = maxScore > 0 ? Math.min(0.85, 0.5 + maxScore * 0.1) : 0.5;

    return {
        success: true,
        predicted_role: predictedRole,
        confidence,
        svm_role: predictedRole,
        svm_confidence: confidence,
        rf_role: predictedRole,
        rf_confidence: confidence * 0.95,
        ensemble_role: predictedRole,
        ensemble_confidence: confidence,
        ensemble_method: 'keyword_fallback',
        top_roles: [{ role: predictedRole, confidence, rank: 1 }],
        total_supported_roles: CAREER_ROLES.length
    };
}

module.exports = router;
