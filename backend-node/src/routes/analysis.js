/**
 * Analysis Routes — Modules 3, 5, 6, 7
 * 
 * POST /api/analysis/full           → Full analysis (predict + explain + skill gap + courses)
 * POST /api/analysis/explain        → Explainability only (SHAP + LIME)
 * POST /api/analysis/skill-gap      → Skill gap analysis only
 * POST /api/analysis/recommend      → Course recommendations only
 * GET  /api/analysis/job-fit        → Job fit percentage
 */

const express = require('express');
const router = express.Router();
const { execFile } = require('child_process');
const path = require('path');
const { analyzeSkillGap, ROLE_REQUIRED_SKILLS } = require('../services/skillGapAnalyzer');
const { extractSkillsWithFrequency } = require('../services/skillExtractor');

const EXPLAIN_SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'explain_service.py');
const RECOMMEND_SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'recommend_courses.py');
const PREDICT_SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'predict_service.py');

/**
 * Run a Python script and parse JSON output
 */
function runPythonScript(scriptPath, args) {
    return new Promise((resolve, reject) => {
        execFile('python', [scriptPath, ...args], {
            timeout: 60000,
            maxBuffer: 5 * 1024 * 1024
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Python script error (${path.basename(scriptPath)}):`, error.message);
                reject(new Error(error.message));
                return;
            }
            try {
                resolve(JSON.parse(stdout.trim()));
            } catch (e) {
                console.error('Failed to parse output:', stdout.substring(0, 200));
                reject(new Error('Failed to parse Python output'));
            }
        });
    });
}

// ================================================================
// POST /api/analysis/full — Complete analysis pipeline
// ================================================================
router.post('/full', async (req, res) => {
    try {
        const { text, skills } = req.body;
        if (!text && (!skills || skills.length === 0)) {
            return res.status(400).json({ error: 'Provide text or skills' });
        }

        let inputText = text || '';
        let userSkills = skills || [];

        // Step 1: NLP Skill Extraction (Module 1)
        if (inputText && userSkills.length === 0) {
            const extraction = extractSkillsWithFrequency(inputText);
            userSkills = extraction.skills.map(s => s.skill);
        }

        const skillText = userSkills.join(', ');

        // Step 2: Career Prediction (Module 2)
        let prediction = null;
        try {
            prediction = await runPythonScript(PREDICT_SCRIPT, [skillText]);
        } catch (err) {
            prediction = { predicted_role: 'Software Engineer', confidence: 0.5, error: err.message };
        }

        const predictedRole = prediction.predicted_role || 'Software Engineer';

        // Step 3: Explainability (Module 5)
        let explanation = null;
        try {
            explanation = await runPythonScript(EXPLAIN_SCRIPT, [skillText]);
        } catch (err) {
            explanation = { error: err.message };
        }

        // Step 4: Extract top 3 predictions FIRST (need them for per-role skill gap)
        const svm_roles = prediction?.svm_prediction?.top_roles || [];
        const rf_roles = prediction?.rf_prediction?.top_roles || [];
        const source_roles = svm_roles.length > 0 ? svm_roles : rf_roles;
        const top_predictions = source_roles.slice(0, 3).map((r, i) => ({
            role: r.role,
            confidence: r.confidence,
            rank: i + 1
        }));
        if (top_predictions.length === 0 && prediction.predicted_role) {
            top_predictions.push({
                role: prediction.predicted_role,
                confidence: prediction.confidence || 0.5,
                rank: 1
            });
        }

        // Step 5: Skill Gap for ALL 3 predictions (Module 6)
        const allSkillGaps = {};
        for (const pred of top_predictions) {
            allSkillGaps[pred.role] = analyzeSkillGap(pred.role, userSkills);
        }
        // Primary skill gap (first prediction)
        const skillGap = allSkillGaps[top_predictions[0]?.role] || analyzeSkillGap(predictedRole, userSkills);

        // Step 5.5: Job Fit Percentage (Module 3) — primary
        const jobFit = {
            percentage: skillGap.fit_percentage || 0,
            formula: 'fit = (matched_skills / required_skills) × 100',
            matched: skillGap.matched_count || 0,
            total_required: skillGap.total_required_skills || 0
        };

        // Step 6: Course Recommendations (Module 7) — primary prediction
        let recommendations = null;
        if (skillGap.missing_skills && skillGap.missing_skills.length > 0) {
            try {
                recommendations = await runPythonScript(RECOMMEND_SCRIPT, [
                    JSON.stringify(skillGap.missing_skills),
                    predictedRole
                ]);
            } catch (err) {
                recommendations = { error: err.message };
            }
        } else {
            recommendations = { message: 'No missing skills — no courses needed!' };
        }

        // Step 6.5: Attach per-prediction skill gap data + combined ranking score
        const enrichedPredictions = top_predictions.map(pred => {
            const sg = allSkillGaps[pred.role] || {};
            const matchedArr = sg.matched_skills || [];
            const missingArr = sg.missing_skills || [];
            const fitPct = Math.round(sg.fit_percentage || 0);
            const confPct = Math.round((pred.confidence || 0) * 100);

            // Combined score: weighs ML confidence, skill fit %, AND absolute matched count
            // Absolute matched count matters: 4/10 matched (40%) > 2/5 matched (40%)
            const matchedBonus = matchedArr.length * 5;  // each matched skill adds 5 points
            const combinedScore = (confPct * 0.2) + (fitPct * 0.3) + matchedBonus;

            // Build a specific, valid explanation
            let why = '';
            if (matchedArr.length > 0) {
                const skillList = matchedArr.slice(0, 5).join(', ');
                why += `Your resume shows skills in ${skillList} which are core requirements for a ${pred.role}. `;
                why += `With ${fitPct}% skill fit and ${confPct}% ML confidence, this role strongly aligns with your profile. `;
            } else {
                // Fallback: use user-extracted skills
                const topUserSkills = userSkills.slice(0, 4).join(', ');
                why += `Based on your skills in ${topUserSkills || 'your domain area'}, the ML model identifies ${pred.role} as a relevant career path (${confPct}% confidence). `;
            }
            if (missingArr.length > 0 && missingArr.length <= 5) {
                why += `To strengthen your fit, consider learning ${missingArr.slice(0, 3).join(', ')}.`;
            } else if (missingArr.length > 5) {
                why += `There are ${missingArr.length} additional skills to develop for full role readiness.`;
            } else {
                why += `Your skill set fully covers this role's requirements.`;
            }

            return {
                ...pred,
                skill_gap: sg,
                combined_score: combinedScore,
                why_recommended: why
            };
        });

        // Re-rank by combined score (higher = better fit)
        enrichedPredictions.sort((a, b) => b.combined_score - a.combined_score);
        enrichedPredictions.forEach((p, i) => { p.rank = i + 1; });

        res.json({
            success: true,
            user_skills: userSkills,
            prediction,
            top_predictions: enrichedPredictions,
            job_fit: jobFit,
            explanation,
            skill_gap: skillGap,
            all_skill_gaps: allSkillGaps,
            course_recommendations: recommendations
        });

    } catch (error) {
        console.error('Full analysis error:', error);
        res.status(500).json({ error: 'Analysis failed', details: error.message });
    }
});

// ================================================================
// POST /api/analysis/explain — Explainability only (Module 5)
// ================================================================
router.post('/explain', async (req, res) => {
    try {
        const { text, skills } = req.body;
        const inputText = text || (skills ? skills.join(', ') : '');

        if (!inputText) {
            return res.status(400).json({ error: 'Provide text or skills' });
        }

        const result = await runPythonScript(EXPLAIN_SCRIPT, [inputText]);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ error: 'Explainability analysis failed', details: error.message });
    }
});

// ================================================================
// POST /api/analysis/skill-gap — Skill Gap Analysis (Module 6)
// ================================================================
router.post('/skill-gap', (req, res) => {
    try {
        const { predicted_role, user_skills, text } = req.body;

        let skills = user_skills || [];
        if (text && skills.length === 0) {
            const extraction = extractSkillsWithFrequency(text);
            skills = extraction.skills.map(s => s.skill);
        }

        if (!predicted_role) {
            return res.status(400).json({ error: 'predicted_role is required' });
        }

        const result = analyzeSkillGap(predicted_role, skills);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Skill gap analysis failed', details: error.message });
    }
});

// ================================================================
// POST /api/analysis/recommend — Course Recommendations (Module 7)
// ================================================================
router.post('/recommend', async (req, res) => {
    try {
        const { missing_skills, target_role } = req.body;

        if (!missing_skills || missing_skills.length === 0) {
            return res.status(400).json({ error: 'missing_skills array is required' });
        }

        const result = await runPythonScript(RECOMMEND_SCRIPT, [
            JSON.stringify(missing_skills),
            target_role || 'General'
        ]);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ error: 'Course recommendation failed', details: error.message });
    }
});

// ================================================================
// POST /api/analysis/job-fit — Job Fit Percentage (Module 3)
// ================================================================
router.post('/job-fit', (req, res) => {
    try {
        const { predicted_role, user_skills, text } = req.body;

        let skills = user_skills || [];
        if (text && skills.length === 0) {
            const extraction = extractSkillsWithFrequency(text);
            skills = extraction.skills.map(s => s.skill);
        }

        if (!predicted_role) {
            return res.status(400).json({ error: 'predicted_role is required' });
        }

        const requiredSkills = ROLE_REQUIRED_SKILLS[predicted_role] ||
            Object.values(ROLE_REQUIRED_SKILLS).find((_, i) =>
                Object.keys(ROLE_REQUIRED_SKILLS)[i].toLowerCase() === predicted_role.toLowerCase()
            ) || [];

        const normalizedUser = skills.map(s => s.toLowerCase().trim());
        const matched = requiredSkills.filter(r =>
            normalizedUser.some(u => u === r.toLowerCase() || u.includes(r.toLowerCase()) || r.toLowerCase().includes(u))
        );

        const fitPercentage = requiredSkills.length > 0
            ? Math.round((matched.length / requiredSkills.length) * 10000) / 100
            : 0;

        res.json({
            success: true,
            predicted_role,
            job_fit_percentage: fitPercentage,
            formula: 'Job Fit % = (matched_skills / required_skills) × 100',
            matched_skills: matched,
            matched_count: matched.length,
            total_required: requiredSkills.length,
            user_skills_count: skills.length,
            rating: fitPercentage >= 80 ? 'Excellent' :
                fitPercentage >= 60 ? 'Good' :
                    fitPercentage >= 40 ? 'Moderate' :
                        fitPercentage >= 20 ? 'Developing' : 'Beginner'
        });
    } catch (error) {
        res.status(500).json({ error: 'Job fit calculation failed', details: error.message });
    }
});

// ================================================================
// GET /api/analysis/supported-roles — List roles with required skills
// ================================================================
router.get('/supported-roles', (req, res) => {
    const roles = Object.entries(ROLE_REQUIRED_SKILLS).map(([role, skills]) => ({
        role,
        required_skills: skills,
        skill_count: skills.length
    }));

    res.json({
        success: true,
        total_roles: roles.length,
        roles
    });
});

// ================================================================
// Levenshtein distance for fuzzy matching
// ================================================================
function levenshtein(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
        Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            matrix[i][j] = a[i - 1] === b[j - 1]
                ? matrix[i - 1][j - 1]
                : 1 + Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]);
        }
    }
    return matrix[a.length][b.length];
}

// ================================================================
// POST /api/analysis/search-role — Fuzzy role search + skill gap
// ================================================================
router.post('/search-role', async (req, res) => {
    try {
        const { query, user_skills } = req.body;
        if (!query || query.trim().length === 0) {
            return res.status(400).json({ error: 'Please provide a role query' });
        }

        const queryLower = query.toLowerCase().trim();
        const allRoles = Object.keys(ROLE_REQUIRED_SKILLS);

        // Score each role: combine substring match + Levenshtein distance
        const scored = allRoles.map(role => {
            const roleLower = role.toLowerCase();
            // Also match against role without special chars (e.g. "ai/ml" -> "ai ml")
            const roleClean = roleLower.replace(/[\/\-_]/g, ' ');
            const lev = Math.min(levenshtein(queryLower, roleLower), levenshtein(queryLower, roleClean));
            // Bonus for substring match
            const containsBonus = (roleLower.includes(queryLower) || roleClean.includes(queryLower) || queryLower.includes(roleLower)) ? -50 : 0;
            // Bonus for word-level matches
            const queryWords = queryLower.split(/[\s\-_/]+/).filter(w => w.length >= 2);
            const roleWords = roleClean.split(/[\s\-_/]+/).filter(w => w.length >= 1);
            let wordScore = 0;
            for (const qw of queryWords) {
                for (const rw of roleWords) {
                    if (rw === qw) {
                        wordScore -= 35; // exact word match
                        break;
                    } else if (rw.startsWith(qw) || qw.startsWith(rw)) {
                        wordScore -= 25; // prefix match
                        break;
                    } else if (levenshtein(qw, rw) <= 2) {
                        wordScore -= 15; // fuzzy word match (typos)
                        break;
                    }
                }
            }
            // Bonus if first word of query matches first word of role
            if (queryWords.length > 0 && roleWords.length > 0) {
                if (roleWords[0].startsWith(queryWords[0]) || queryWords[0].startsWith(roleWords[0])) {
                    wordScore -= 20;
                }
            }
            return { role, score: lev + containsBonus + wordScore };
        });

        scored.sort((a, b) => a.score - b.score);
        const bestMatch = scored[0];
        const topMatches = scored.slice(0, 5).map(s => ({
            role: s.role,
            similarity: Math.max(0, Math.round((1 - s.score / Math.max(queryLower.length, s.role.length)) * 100))
        }));

        // Skill gap analysis for best match
        const skills = user_skills || [];
        const skillGap = analyzeSkillGap(bestMatch.role, skills);

        // Course recommendations for missing skills
        let recommendations = null;
        if (skillGap.missing_skills && skillGap.missing_skills.length > 0) {
            try {
                recommendations = await runPythonScript(RECOMMEND_SCRIPT, [
                    JSON.stringify(skillGap.missing_skills),
                    bestMatch.role
                ]);
            } catch (err) {
                recommendations = { error: err.message };
            }
        } else {
            recommendations = { message: 'No missing skills — you already qualify!' };
        }

        res.json({
            success: true,
            query,
            matched_role: bestMatch.role,
            did_you_mean: queryLower !== bestMatch.role.toLowerCase() ? bestMatch.role : null,
            suggestions: topMatches,
            skill_gap: skillGap,
            course_recommendations: recommendations
        });
    } catch (error) {
        console.error('Search role error:', error);
        res.status(500).json({ error: 'Role search failed', details: error.message });
    }
});

// ================================================================
// GET /api/analysis/roles-list — Simple list of all role names
// ================================================================
router.get('/roles-list', (req, res) => {
    res.json({
        success: true,
        roles: Object.keys(ROLE_REQUIRED_SKILLS)
    });
});

module.exports = router;
